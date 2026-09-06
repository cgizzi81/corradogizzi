// sw.js — il pezzo dell'app che resta acceso quando l'app è chiusa.
//
// ⚠️ È l'unico modo perché un promemoria arrivi con l'app chiusa e il telefono
// in tasca: la notifica non parte dal telefono, arriva dal server e questo
// service worker la mostra. Senza, l'app sarebbe un foglio che ricorda le
// gocce solo a chi lo sta già guardando.
//
// ⚠️ Nessuna cache dei dati: qui non si conserva niente di clinico. Il
// service worker serve solo a ricevere e a mostrare.

const VERSIONE = 'gocce-1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (evento) => {
  // Il corpo arriva dal server. Se manca o è illeggibile si mostra comunque
  // qualcosa: una notifica muta sarebbe peggio di una generica, perché il
  // paziente saprebbe solo che «è successo qualcosa».
  let dati = {}
  try { dati = evento.data ? evento.data.json() : {} } catch { dati = {} }

  const titolo = dati.titolo || 'È ora delle gocce'
  const opzioni = {
    body: dati.testo || 'Tocca per aprire Le Mie Gocce.',
    icon: '/app/icona-192.png',
    badge: '/app/icona-192.png',
    lang: 'it',
    tag: dati.tag || 'promemoria',
    // Resta finché non la si tocca: un anziano che sente il telefono in
    // un'altra stanza deve ritrovarla lì quando arriva.
    requireInteraction: true,
    data: { url: '/app/' },
  }
  evento.waitUntil(self.registration.showNotification(titolo, opzioni))
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const destinazione = evento.notification.data?.url || '/app/'
  evento.waitUntil((async () => {
    const finestre = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    // Se l'app è già aperta si porta in primo piano invece di aprirne
    // un'altra: al secondo promemoria si ritroverebbero due copie.
    for (const f of finestre) {
      if (f.url.includes('/app/') && 'focus' in f) return f.focus()
    }
    return self.clients.openWindow(destinazione)
  })())
})

self.addEventListener('pushsubscriptionchange', (evento) => {
  // Il telefono può rinnovare da solo l'iscrizione: senza questo, un giorno le
  // notifiche smetterebbero senza che nessuno se ne accorga.
  evento.waitUntil((async () => {
    const chiave = await (await fetch('/api/gocce-chiave')).text().catch(() => null)
    if (!chiave) return
    const nuova = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: chiave,
    })
    await fetch('/api/gocce-iscrivi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rinnovo: true, iscrizione: nuova }),
    })
  })())
})
