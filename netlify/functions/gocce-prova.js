// gocce-prova.js — «manda adesso», per vedere se la catena regge.
//
// Perché esiste: il mittente a orario di Netlify parte solo sul sito
// pubblicato, non sui rami. Su un ramo si può quindi provare tutto — pagina,
// service worker, chiavi, consegna del telefono — tranne il fatto che qualcuno
// chiami il mittente all'ora giusta. Questa rotta è quella chiamata, fatta a
// mano, così il pezzo grosso della prova si può fare prima di pubblicare.
//
// ⚠️ Manda SOLO al telefono che si presenta con il proprio indirizzo di
// consegna, che è lungo, casuale e conosciuto solo da quel telefono: non è una
// rotta che permette di svegliare i telefoni degli altri. E non più di una
// prova al minuto per telefono, perché un pulsante premuto per curiosità dieci
// volte di fila non deve diventare dieci notifiche.
import { getStore } from '@netlify/blobs'
import webpush from 'web-push'

const ATTESA_MINIMA_MS = 60 * 1000

export default async (req) => {
  if (req.method !== 'POST') return new Response('Metodo non ammesso', { status: 405 })

  const pubblica = process.env.VAPID_PUBLIC_KEY
  const privata = process.env.VAPID_PRIVATE_KEY
  if (!pubblica || !privata) {
    // Detto al telefono, non solo nei log: è esattamente il caso in cui non
    // arriva niente e non si capisce perché.
    return Response.json({ errore: 'chiavi-mancanti' }, { status: 503 })
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:info@corradogizzi.it', pubblica, privata)

  let corpo
  try { corpo = await req.json() } catch { return new Response('Corpo illeggibile', { status: 400 }) }
  const endpoint = String(corpo?.endpoint ?? '')
  if (!endpoint) return new Response('Manca l’indirizzo di consegna', { status: 400 })

  const store = getStore('gocce')
  const { blobs } = await store.list()

  for (const voce of blobs) {
    const iscr = await store.get(voce.key, { type: 'json' }).catch(() => null)
    if (iscr?.endpoint !== endpoint) continue

    const adesso = Date.now()
    if (iscr.ultimaProva && adesso - new Date(iscr.ultimaProva).getTime() < ATTESA_MINIMA_MS) {
      return Response.json({ errore: 'troppo-presto' }, { status: 429 })
    }

    try {
      await webpush.sendNotification(
        { endpoint: iscr.endpoint, keys: iscr.keys },
        JSON.stringify({
          titolo: 'Prova riuscita',
          testo: 'Se legge questo, i promemoria possono arrivare.',
          tag: 'gocce-prova',
          // Anche qui l'ora della partenza: con la prova a mano si vede a
          // colpo d'occhio quanto ci mette il telefono a mostrarla.
          quando: Date.now(),
        }),
        { TTL: 600, urgency: 'high' },
      )
      await store.setJSON(voce.key, { ...iscr, ultimaProva: new Date(adesso).toISOString() })
      return Response.json({ inviata: true })
    } catch (errore) {
      if (errore?.statusCode === 404 || errore?.statusCode === 410) {
        await store.delete(voce.key).catch(() => {})
        return Response.json({ errore: 'iscrizione-scaduta' }, { status: 410 })
      }
      return Response.json({ errore: 'invio-fallito', dettaglio: errore?.statusCode ?? null }, { status: 502 })
    }
  }

  return Response.json({ errore: 'telefono-non-iscritto' }, { status: 404 })
}

export const config = { path: '/api/gocce-prova' }
