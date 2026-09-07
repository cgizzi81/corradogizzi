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
import { getStore } from '@netlify/blobs'
import webpush from 'web-push'

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
  const { blobs } = await store.list()
  let inviati = 0
  let rimossi = 0

  for (const voce of blobs) {
    const iscr = await store.get(voce.key, { type: 'json' }).catch(() => null)
    if (!iscr?.endpoint) continue

    const adesso = oraLocale(iscr.fuso)
    const dovuti = (iscr.orari ?? []).filter(o => nellaFinestra(o, adesso.minuti))
    if (dovuti.length === 0) continue

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
          await store.delete(voce.key).catch(() => {})
          rimossi += 1
          memoria = null
          break
        }
        console.error('[gocce] invio fallito:', errore?.statusCode ?? errore?.message)
      }
    }

    if (memoria && cambiato) {
      await store.setJSON(voce.key, { ...iscr, inviati: ripulisci(memoria, adesso.giorno) })
    }
  }

  console.log(`[gocce] inviati ${inviati}, iscrizioni rimosse ${rimossi}`)
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
