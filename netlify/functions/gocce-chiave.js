// gocce-chiave.js — la chiave pubblica del mittente.
//
// Serve al service worker quando il telefono rinnova da solo l'iscrizione: in
// quel momento la pagina non è aperta e la costante scritta nell'HTML non è
// raggiungibile. La chiave pubblica non è un segreto — la privata sta nelle
// variabili di Netlify e non esce mai da lì.
export default async () => new Response(process.env.VAPID_PUBLIC_KEY ?? '', {
  headers: { 'Content-Type': 'text/plain' },
})

export const config = { path: '/api/gocce-chiave' }
