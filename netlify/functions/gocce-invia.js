// gocce-invia.js — il pezzo che manda i promemoria, a orario, anche con l'app
// chiusa e il telefono in tasca.
//
// Gira ogni quarto d'ora (vedi `schedule` in netlify.toml) e per ogni telefono
// iscritto guarda se in questo momento, NELL'ORA DI QUEL TELEFONO, cade uno
// degli orari che gli sono stati chiesti.
//
// ⚠️ L'ora si calcola nel fuso del telefono, non del server. Netlify gira in
// UTC: senza questa conversione un promemoria delle otto arriverebbe alle sei,
// e d'estate alle cinque — cioè il difetto peggiore possibile per un'app che
// esiste per far mettere le gocce all'ora giusta.
//
// ⚠️ Un promemoria si manda UNA volta. Lo scheduler passa ogni quindici minuti
// e la finestra ne dura venti, quindi senza memoria di ciò che è già uscito lo
// stesso avviso partirebbe due volte: e un paziente che riceve due volte
// «metta le gocce» le mette due volte.
//
// ⚠️ E NON SI RILEGGONO TUTTI GLI ISCRITTI A OGNI GIRO. La prima versione
// faceva `list()` e poi un `get` per ognuno, ogni quindici minuti: con qualche
// decina di pazienti non si nota, con qualche centinaio diventano centinaia di
// letture ogni quarto d'ora per mandare due notifiche. Ora c'è un indice — vedi
// `aggiornaIndice` — che tiene di ciascuno solo quello che serve a decidere SE
// è il suo momento: fuso e orari. Si leggono per intero soltanto quelli a cui
// si sta per mandare qualcosa.
import { getStore } from '@netlify/blobs'
import webpush from 'web-push'

// ⚠️ Le iscrizioni hanno tutte questo prefisso, e l'indice no: così `list()`
// non si ritrova dentro l'indice stesso e non c'è una voce da saltare a mano.
const PREFISSO = 'iscr-'
const CHIAVE_INDICE = 'indice-orari'

// La finestra è più larga del passo dello scheduler: se un giro parte in
// ritardo — succede — il promemoria esce lo stesso, un po' dopo, invece di
// saltare la giornata.
const FINESTRA_MINUTI = 20

export default async () => {
  const pubblica = process.env.VAPID_PUBLIC_KEY
  const privata = process.env.VAPID_PRIVATE_KEY
  if (!pubblica || !privata) {
    // Senza chiavi non si manda niente e lo si scrive: un mittente non
    // configurato che tace assomiglia troppo a un mittente che funziona.
    console.error('[gocce] chiavi VAPID mancanti: nessun promemoria inviato')
    return new Response('chiavi mancanti', { status: 500 })
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:info@corradogizzi.it',
    pubblica, privata,
  )

  const store = getStore('gocce')
  const { blobs } = await store.list({ prefix: PREFISSO })

  // `list()` è UNA chiamata e restituisce anche l'etag di ogni voce: è quello
  // che permette all'indice di accorgersi da solo di cosa è cambiato.
  const { voci, riletti, tolti } = await aggiornaIndice(store, blobs)

  let inviati = 0
  let rimossi = 0

  // L'ora locale si calcola UNA volta per fuso, non una per iscritto: con
  // cinquecento pazienti nello stesso fuso erano cinquecento conversioni
  // identiche a ogni giro.
  const oreDeiFusi = new Map()
  const oraDi = (fuso) => {
    const chiave = fuso || 'Europe/Rome'
    if (!oreDeiFusi.has(chiave)) oreDeiFusi.set(chiave, oraLocale(chiave))
    return oreDeiFusi.get(chiave)
  }

  for (const [chiave, voce] of Object.entries(voci)) {
    const adesso = oraDi(voce.fuso)
    const dovuti = (voce.orari ?? []).filter(o => nellaFinestra(o, adesso.minuti))
    // ⚠️ Qui sta il risparmio: chi non ha niente in scadenza non viene MAI
    // letto per intero. Nel giro tipico sono tutti tranne una manciata.
    if (dovuti.length === 0) continue

    const iscr = await store.get(chiave, { type: 'json' }).catch(() => null)
    if (!iscr?.endpoint) continue

    // ⚠️ La memoria di cosa è già uscito resta sull'ISCRIZIONE, non
    // nell'indice, ed è una scelta deliberata: tenerla nell'indice
    // risparmierebbe una scrittura per invio, ma un solo salvataggio fallito
    // farebbe ripartire i promemoria di TUTTI quelli in scadenza in quella
    // finestra invece che di uno solo. Un paziente che riceve due volte
    // «metta le gocce» le mette due volte: il raggio di quel guasto va tenuto
    // stretto, e vale la lettura in più.
    let memoria = iscr.inviati ?? {}
    let cambiato = false

    for (const orario of dovuti) {
      const segno = `${adesso.giorno} ${orario}`
      if (memoria[segno]) continue

      try {
        await webpush.sendNotification(
          { endpoint: iscr.endpoint, keys: iscr.keys },
          JSON.stringify({
            titolo: 'È ora delle gocce',
            testo: `Promemoria delle ${orario}.`,
            tag: `gocce-${orario}`,
            // ⚠️ L'ora, e SOLO l'ora. È la chiave con cui il telefono ritrova
            // nel proprio deposito quali colliri toccano: il nome del farmaco
            // non passa di qui e non deve passarci mai.
            ora: orario,
            // L'ora della partenza, che il telefono mostra sulla notifica: se
            // dice 8:00 e la si legge alle 8:26, il mittente ha fatto il suo e
            // il ritardo è nella consegna. Senza, si può solo tirare a
            // indovinare di chi sia il ritardo.
            quando: Date.now(),
          }),
          // ⚠️ `urgency: high` non è enfasi: è l'intestazione che dice al
          // servizio di notifiche di consegnare SUBITO invece di aspettare che
          // il telefono si svegli da sé. Su Android, dopo qualche ora di
          // inattività, il sonno profondo ritarda tutto ciò che non è urgente,
          // e un promemoria delle sei che arriva alle sette non serve a niente.
          //
          // TTL di un'ora: se il telefono resta spento più a lungo quel
          // promemoria è passato comunque. Meglio perderlo che vederlo
          // comparire a metà pomeriggio, quando la goccia o è stata messa o
          // non lo sarà.
          { TTL: 3600, urgency: 'high' },
        )
        memoria[segno] = true
        cambiato = true
        inviati += 1
      } catch (errore) {
        // 404 e 410 vogliono dire che quel telefono non esiste più: app
        // disinstallata, permesso revocato, iscrizione rinnovata. Si toglie,
        // altrimenti l'archivio si riempie di destinatari morti e ogni giro
        // spreca tempo su di loro.
        if (errore?.statusCode === 404 || errore?.statusCode === 410) {
          await store.delete(chiave).catch(() => {})
          rimossi += 1
          memoria = null
          break
        }
        console.error('[gocce] invio fallito:', errore?.statusCode ?? errore?.message)
      }
    }

    if (memoria && cambiato) {
      await store.setJSON(chiave, { ...iscr, inviati: ripulisci(memoria, adesso.giorno) })
    }
  }

  console.log(`[gocce] iscritti ${blobs.length}, letti ${riletti + inviati}, inviati ${inviati}, rimossi ${rimossi + tolti}`)
  return new Response(`inviati ${inviati}`)
}

/** Giorno e minuti dall'inizio della giornata, nel fuso del telefono. */
function oraLocale(fuso) {
  const ora = new Date()
  const f = (opzioni) => new Intl.DateTimeFormat('en-CA', { timeZone: fuso || 'Europe/Rome', ...opzioni }).format(ora)
  const giorno = f({ year: 'numeric', month: '2-digit', day: '2-digit' })
  const [h, m] = f({ hour: '2-digit', minute: '2-digit', hour12: false }).split(':').map(Number)
  return { giorno, minuti: h * 60 + m }
}

/** L'orario chiesto cade nella finestra che si sta guardando? */
function nellaFinestra(orario, minutiOra) {
  const [h, m] = orario.split(':').map(Number)
  const previsto = h * 60 + m
  const scarto = minutiOra - previsto
  return scarto >= 0 && scarto < FINESTRA_MINUTI
}

/** Della memoria si tiene solo oggi e ieri: il resto è peso morto. */
function ripulisci(memoria, giornoDiOggi) {
  const ieri = new Date(`${giornoDiOggi}T12:00:00Z`)
  ieri.setUTCDate(ieri.getUTCDate() - 1)
  const giorniBuoni = new Set([giornoDiOggi, ieri.toISOString().slice(0, 10)])
  return Object.fromEntries(
    Object.entries(memoria).filter(([segno]) => giorniBuoni.has(segno.slice(0, 10))),
  )
}

/**
 * L'indice degli orari: di ogni iscritto soltanto quello che serve a decidere
 * SE è il suo momento — il fuso e gli orari — più l'etag con cui l'abbiamo
 * letto l'ultima volta.
 *
 * ⚠️ SI RIPARA DA SOLO, ed è la ragione per cui nessun'altra funzione deve
 * saperne niente. `list()` — una chiamata sola — dà chiavi ED etag: una voce
 * che manca dall'indice, o che ha un etag diverso da quello registrato, viene
 * riletta e reinserita al primo giro utile. Quindi un'iscrizione nuova entra
 * da sé, una terapia cambiata si aggiorna da sé, una cancellata esce da sé.
 *
 * L'alternativa — far aggiornare l'indice a `gocce-iscrivi` e
 * `gocce-disattiva` — sarebbe stata più veloce di una lettura e molto più
 * fragile: tre funzioni che devono ricordarsi di una quarta cosa, e il giorno
 * che una se ne dimentica un paziente smette di ricevere i promemoria senza
 * che niente lo segnali.
 */
async function aggiornaIndice(store, blobs) {
  const vecchio = await store.get(CHIAVE_INDICE, { type: 'json' }).catch(() => null)
  const voci = vecchio?.v === 1 ? { ...vecchio.voci } : {}

  const presenti = new Set()
  let riletti = 0

  for (const { key, etag } of blobs) {
    presenti.add(key)
    // Etag uguale: niente è cambiato da quando l'abbiamo letta, e non la si
    // rilegge. È questo confronto a fare tutto il risparmio.
    if (voci[key]?.etag === etag) continue

    const iscr = await store.get(key, { type: 'json' }).catch(() => null)
    riletti += 1
    if (!iscr?.endpoint) { delete voci[key]; continue }
    voci[key] = {
      etag,
      fuso: iscr.fuso || 'Europe/Rome',
      orari: Array.isArray(iscr.orari) ? iscr.orari : [],
    }
  }

  // Chi non è più nell'archivio esce dall'indice, o l'indice crescerebbe per
  // sempre e ogni giro proverebbe a mandare a destinatari che non esistono.
  let tolti = 0
  for (const key of Object.keys(voci)) {
    if (!presenti.has(key)) { delete voci[key]; tolti += 1 }
  }

  // Si riscrive solo se è cambiato qualcosa: nel giro tipico non cambia
  // niente, e una scrittura a vuoto ogni quindici minuti è la stessa spesa
  // che si sta cercando di togliere.
  if (riletti > 0 || tolti > 0 || vecchio?.v !== 1) {
    await store.setJSON(CHIAVE_INDICE, { v: 1, voci })
  }
  return { voci, riletti, tolti }
}
