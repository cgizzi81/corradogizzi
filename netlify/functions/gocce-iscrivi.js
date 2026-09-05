// gocce-iscrivi.js — il telefono si presenta e dice a che ora vuole i
// promemoria.
//
// ⚠️ Qui NON arriva nessun dato clinico e nessun nome. Quello che si conserva è
// l'indirizzo di consegna che il telefono si è fatto dare dal produttore
// (Google, per Android), gli orari, e il fuso. Chi leggesse questo archivio
// saprebbe che un telefono vuole una notifica alle otto: non di chi è, non
// perché, non che collirio.
//
// ⚠️ L'indirizzo di consegna È l'identità: non serve login, e non se ne vuole
// uno. Chi possiede quell'indirizzo è quel telefono; se il telefono si
// reiscrive con un indirizzo nuovo, il vecchio smette di funzionare da sé e
// viene tolto alla prima consegna fallita.
import { getStore } from '@netlify/blobs'

const ORARIO_VALIDO = /^([01]\d|2[0-3]):([0-5]\d)$/

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Metodo non ammesso', { status: 405 })
  }

  let corpo
  try { corpo = await req.json() } catch { return new Response('Corpo illeggibile', { status: 400 }) }

  const iscrizione = corpo?.iscrizione
  if (!iscrizione?.endpoint || !iscrizione?.keys?.p256dh || !iscrizione?.keys?.auth) {
    return new Response('Iscrizione incompleta', { status: 400 })
  }

  // Solo orari veri, al massimo sei: un elenco lungo non è una terapia, è un
  // errore di compilazione, e sei notifiche al giorno sono già molte.
  const orari = [...new Set((corpo.orari ?? []).filter(o => ORARIO_VALIDO.test(o)))].sort().slice(0, 6)
  if (orari.length === 0) return new Response('Nessun orario valido', { status: 400 })

  // Il fuso arriva dal telefono. Se è una stringa che Intl non riconosce si
  // torna a Roma invece di fallire: meglio un promemoria nell'ora giusta per
  // l'ambulatorio che nessun promemoria.
  let fuso = String(corpo.fuso ?? 'Europe/Rome')
  try { new Intl.DateTimeFormat('it-IT', { timeZone: fuso }) } catch { fuso = 'Europe/Rome' }

  const store = getStore('gocce')
  const chiave = chiaveDa(iscrizione.endpoint)

  const esistente = await store.get(chiave, { type: 'json' }).catch(() => null)

  await store.setJSON(chiave, {
    endpoint: iscrizione.endpoint,
    keys: iscrizione.keys,
    orari,
    fuso,
    creato: esistente?.creato ?? new Date().toISOString(),
    aggiornato: new Date().toISOString(),
    // Cosa è già stato mandato oggi: serve a non ripetere lo stesso promemoria
    // a ogni giro dello scheduler.
    inviati: esistente?.inviati ?? {},
  })

  return Response.json({ attivo: true, orari, fuso })
}

/** Una chiave di archivio dall'indirizzo di consegna, che è lungo e pieno di
 *  caratteri che un nome di file non ammette. */
function chiaveDa(endpoint) {
  let somma = 0
  for (let i = 0; i < endpoint.length; i += 1) {
    somma = (somma * 31 + endpoint.charCodeAt(i)) % 0xffffffff
  }
  return `iscr-${somma.toString(16)}-${endpoint.slice(-24).replace(/[^a-zA-Z0-9]/g, '')}`
}

export const config = { path: '/api/gocce-iscrivi' }
