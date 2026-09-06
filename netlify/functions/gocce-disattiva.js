// gocce-disattiva.js — smettere, senza dover cercare nelle impostazioni del
// telefono.
//
// ⚠️ Deve esistere prima che l'app arrivi a un paziente. Finora l'unico modo di
// fermare i promemoria era togliere il permesso alle notifiche dalle
// impostazioni di Android: un percorso che un ottantenne non trova, e che
// lascia comunque il telefono iscritto sul server — cioè continuerebbe a
// ricevere consegne che non vuole più.
//
// Toglie l'iscrizione dall'archivio; la disiscrizione dal servizio di
// notifiche la fa il telefono da solo, dalla pagina.
import { getStore } from '@netlify/blobs'

export default async (req) => {
  if (req.method !== 'POST') return new Response('Metodo non ammesso', { status: 405 })

  let corpo
  try { corpo = await req.json() } catch { return new Response('Corpo illeggibile', { status: 400 }) }
  const endpoint = String(corpo?.endpoint ?? '')
  if (!endpoint) return new Response('Manca l’indirizzo di consegna', { status: 400 })

  const store = getStore('gocce')
  const { blobs } = await store.list()

  for (const voce of blobs) {
    const iscr = await store.get(voce.key, { type: 'json' }).catch(() => null)
    if (iscr?.endpoint !== endpoint) continue
    await store.delete(voce.key)
    return Response.json({ disattivato: true })
  }

  // Nessuna iscrizione trovata: per chi ha premuto il pulsante il risultato è
  // lo stesso — non riceverà più niente — e dirgli «non eri iscritto» sarebbe
  // solo un modo per farlo dubitare.
  return Response.json({ disattivato: true })
}

export const config = { path: '/api/gocce-disattiva' }
