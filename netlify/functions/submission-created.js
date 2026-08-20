// Risposta automatica alle richieste di preventivo.
//
// Netlify invoca questa funzione a ogni invio di un form del sito (evento
// `submission-created`). Qui si filtra sul solo form `richiesta-preventivo`:
// gli altri passano e non fanno nulla.
//
// Flusso:  modulo sul sito → questa funzione → email al paziente da
//          info@corradogizzi.it, con copia a Corrado.
//
// Il preventivo è INDICATIVO e il testo lo dice a chiare lettere: gli importi
// vengono da strumenti/listino.js, la stessa fonte dello strumento interno, ma
// nessuno li ha guardati caso per caso prima dell'invio.
//
// ── Variabili d'ambiente da impostare su Netlify ──
//   SMTP_HOST      es. smtps.aruba.it
//   SMTP_PORT      es. 465
//   SMTP_USER      info@corradogizzi.it
//   SMTP_PASS      password della casella
//   COPIA_A        (facoltativa) indirizzo in copia nascosta; default SMTP_USER.
//                  Va in Bcc, non in Cc: il Cc è visibile al paziente e gli
//                  mostrerebbe l'indirizzo personale di Corrado.
//   PREVENTIVI_OFF (facoltativa) se vale "1" la funzione non invia nulla
//                  e si limita a registrare il log: interruttore di sicurezza.
//
// Senza SMTP_HOST/USER/PASS la funzione non invia e lo scrive nei log, senza
// far fallire l'invio del modulo: il paziente non deve mai vedere un errore
// perché la nostra email non è partita.

const nodemailer = require('nodemailer');
const { LISTINO, AVVISO, euro } = require('../../strumenti/listino.js');

const NAVY = '#0d1f3c';
const ORO_SCURO = '#7f6720';
const ORO_PALE = '#f5edcf';
const CREMA = '#faf8f3';
const GRIGIO = '#8a8880';
const BORDO = '#d0cfc9';

// Il modulo offre questa voce: chi la sceglie non vuole un importo, vuole una
// valutazione. Va riconosciuta, o finirebbe fra le "non riconosciute".
const CHIEDE_CONSIGLIO = 'Non so, vorrei essere consigliato in visita';

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// La sede arriva dal modulo come "Bologna" / "Faenza" / "Indifferente".
function normalizzaSede(valore) {
  const v = String(valore || '').toLowerCase();
  if (v.includes('faenza')) return 'Faenza';
  if (v.includes('bologna')) return 'Bologna';
  return null;   // "Indifferente" o campo mancante
}

// Prezzo nella sede scelta; se lì non si esegue, si ricade sull'altra e lo si
// dichiara, invece di far sparire la riga.
function prezzoPer(voce, sede) {
  const p = voce.prezzi[sede];
  if (p !== null && p !== undefined) return { importo: p, altrove: null };
  const alt = Object.keys(voce.prezzi).find(s => voce.prezzi[s] != null);
  return alt ? { importo: voce.prezzi[alt], altrove: alt } : null;
}

function costruisciEmail({ nome, sedeScelta, sedeUsata, richieste, note, sedeNonSpecificata }) {
  const trovate = [];
  const nonRiconosciute = [];

  let chiedeConsiglio = false;

  richieste.forEach(etichetta => {
    if (etichetta === CHIEDE_CONSIGLIO) { chiedeConsiglio = true; return; }
    const voce = LISTINO.find(v => v.nome === etichetta);
    if (!voce) { nonRiconosciute.push(etichetta); return; }
    const p = prezzoPer(voce, sedeUsata);
    if (p) trovate.push({ voce, ...p });
  });

  const totale = trovate.reduce((s, r) => s + r.importo, 0);

  let categoriaStampata = '';
  const righe = trovate.map(({ voce, importo, altrove }) => {
    const cat = voce.cat !== categoriaStampata
      ? `<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${ORO_SCURO};font-weight:700;padding-bottom:2px;">${esc(voce.cat)}</div>`
      : '';
    categoriaStampata = voce.cat;
    const avvisi = [];
    if (altrove) avvisi.push(`Si esegue presso la sede di ${esc(altrove)}`);
    if (voce.nota) avvisi.push(esc(voce.nota));
    const nota = avvisi.length
      ? `<div style="font-size:12px;color:${GRIGIO};padding-top:2px;line-height:1.5;">${avvisi.join('<br>')}</div>`
      : '';
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f2;font-size:15px;color:#1e1c1a;">${cat}${esc(voce.nome)}${nota}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f2;font-size:15px;color:#1e1c1a;text-align:right;white-space:nowrap;vertical-align:bottom;">${euro(importo)}</td>
    </tr>`;
  }).join('');

  const avvisoSede = sedeNonSpecificata
    ? `<p style="margin:0 0 16px;font-size:14px;color:${GRIGIO};line-height:1.6;">
         Non avendo indicato una sede, gli importi qui sopra si riferiscono a
         <strong>${esc(sedeUsata)}</strong>. Per l'altra sede possono variare: basta segnalarcelo.
       </p>` : '';

  const bloccoNonRiconosciute = nonRiconosciute.length
    ? `<p style="margin:0 0 16px;font-size:14px;color:${GRIGIO};line-height:1.6;">
         Per <strong>${nonRiconosciute.map(esc).join(', ')}</strong> non è possibile indicare un
         importo automatico: ne parliamo direttamente.
       </p>` : '';

  const bloccoNote = note
    ? `<div style="margin:0 0 24px;padding:14px 18px;background:${CREMA};border-radius:3px;">
         <div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${GRIGIO};margin-bottom:6px;">Quanto ci ha scritto</div>
         <div style="font-size:14px;color:#1e1c1a;line-height:1.6;white-space:pre-wrap;">${esc(note)}</div>
       </div>` : '';

  const bloccoConsiglio = chiedeConsiglio
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1e1c1a;">
         Ha indicato di voler essere consigliato in visita: è la scelta giusta quando non è
         chiaro quale prestazione serva. Ne parliamo di persona e decidiamo insieme.
       </p>` : '';

  const corpoTabella = trovate.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:8px;">
         <thead>
           <tr>
             <th style="text-align:left;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${GRIGIO};padding-bottom:8px;border-bottom:1.5px solid ${BORDO};">Prestazione</th>
             <th style="text-align:right;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${GRIGIO};padding-bottom:8px;border-bottom:1.5px solid ${BORDO};">Importo</th>
           </tr>
         </thead>
         <tbody>${righe}</tbody>
         <tfoot>
           <tr>
             <td style="padding-top:14px;border-top:2px solid ${NAVY};font-family:Georgia,serif;font-size:19px;font-weight:700;color:${NAVY};">Totale indicativo</td>
             <td style="padding-top:14px;border-top:2px solid ${NAVY};font-family:Georgia,serif;font-size:19px;font-weight:700;color:${NAVY};text-align:right;white-space:nowrap;">${euro(totale)}</td>
           </tr>
         </tfoot>
       </table>`
    : (chiedeConsiglio
        ? ''
        : `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
             Dalla sua richiesta non è stato possibile ricavare un importo automatico.
             La ricontatto direttamente per capire meglio cosa le serve.
           </p>`);

  const html = `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CREMA};">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${CREMA};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:4px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">

  <tr><td style="background:${NAVY};padding:26px 32px;">
    <div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;">Dott. Corrado Gizzi</div>
    <div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:3px;">Medico Chirurgo &middot; Specialista in Oftalmologia</div>
  </td></tr>

  <tr><td style="padding:32px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${ORO_SCURO};">Preventivo indicativo</div>
    <div style="font-family:Georgia,serif;font-size:26px;color:${NAVY};margin:4px 0 22px;">Grazie della sua richiesta</div>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1e1c1a;">
      Gentile ${esc(nome)},<br>
      ho ricevuto la sua richiesta. Di seguito trova una <strong>stima indicativa</strong>
      per le prestazioni che ha indicato${sedeScelta ? `, presso la sede di <strong>${esc(sedeScelta)}</strong>` : ''}.
    </p>

    ${bloccoConsiglio}
    ${corpoTabella}
    ${avvisoSede}
    ${bloccoNonRiconosciute}
    ${bloccoNote}

    ${trovate.length ? `<div style="margin:22px 0;padding:14px 18px;background:${ORO_PALE};border-left:3px solid #b8962e;border-radius:0 3px 3px 0;font-size:14px;color:${NAVY};line-height:1.6;">
      ${esc(AVVISO)}
    </div>` : ''}

    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#1e1c1a;">
      Per fissare una visita può rispondere a questa email o chiamare il
      <strong>349 1908892</strong>.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#1e1c1a;">Un cordiale saluto,<br>
      <strong>Dott. Corrado Gizzi</strong></p>
  </td></tr>

  <tr><td style="padding:18px 32px 26px;border-top:1px solid #f4f4f2;font-size:12px;color:${GRIGIO};line-height:1.6;">
    Questo messaggio è una risposta automatica alla richiesta inviata da corradogizzi.it.
    Non sostituisce la visita specialistica e non costituisce una diagnosi.
    Prestazioni sanitarie esenti IVA ai sensi dell'art. 10, n. 18 del D.P.R. 633/1972.
  </td></tr>

</table></td></tr></table></body></html>`;

  // Costruita per rami paralleli a quelli dell'HTML qui sopra: un caso mancante
  // qui produceva un messaggio diverso da quello che il paziente vede aprendo
  // l'email in HTML — è già successo con "Non so, vorrei essere consigliato",
  // dove il testo semplice diceva "nessun importo disponibile" invece di
  // spiegare che è la scelta giusta quando non si sa cosa serve.
  const testo = [
    `Gentile ${nome},`,
    '',
    `ho ricevuto la sua richiesta. Di seguito trova una stima indicativa per le ` +
      `prestazioni che ha indicato${sedeScelta ? `, presso la sede di ${sedeScelta}` : ''}.`,
    '',
    ...(chiedeConsiglio ? [
      'Ha indicato di voler essere consigliato in visita: è la scelta giusta quando ' +
        'non è chiaro quale prestazione serva. Ne parliamo di persona e decidiamo insieme.',
      '',
    ] : []),
    ...(trovate.length ? [
      ...trovate.flatMap(r => [
        `  ${r.voce.nome}${r.altrove ? ` (presso ${r.altrove})` : ''}: ${euro(r.importo)}`,
        ...(r.voce.nota ? [`    ${r.voce.nota}`] : []),
      ]),
      '',
      `  Totale indicativo: ${euro(totale)}`,
      '',
      AVVISO,
      '',
    ] : (chiedeConsiglio ? [] : [
      'Dalla sua richiesta non è stato possibile ricavare un importo automatico. ' +
        'La ricontatto direttamente per capire meglio cosa le serve.',
      '',
    ])),
    ...(sedeNonSpecificata ? [
      `Non avendo indicato una sede, gli importi qui sopra si riferiscono a ${sedeUsata}. ` +
        'Per l\'altra sede possono variare: basta segnalarcelo.',
      '',
    ] : []),
    ...(nonRiconosciute.length ? [
      `Per ${nonRiconosciute.join(', ')} non è possibile indicare un importo automatico: ` +
        'ne parliamo direttamente.',
      '',
    ] : []),
    ...(note ? [
      'Quanto ci ha scritto:',
      `  ${note}`,
      '',
    ] : []),
    'Per fissare una visita può rispondere a questa email o chiamare il 349 1908892.',
    '',
    'Un cordiale saluto,',
    'Dott. Corrado Gizzi',
  ].join('\n');

  return { html, testo, totale, trovate, nonRiconosciute };
}

exports.handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch {
    console.error('[preventivo] corpo della richiesta non leggibile');
    return { statusCode: 200, body: 'ignorato' };
  }

  const nomeForm = payload && (payload.form_name || (payload.data && payload.data['form-name']));
  if (nomeForm !== 'richiesta-preventivo') {
    return { statusCode: 200, body: 'form non gestito' };
  }

  const d = payload.data || {};
  const destinatario = (d.email || '').trim();
  const nome = (d.nome || '').trim() || 'paziente';

  if (!destinatario) {
    console.error('[preventivo] richiesta senza email, nessun invio');
    return { statusCode: 200, body: 'email mancante' };
  }

  // I checkbox con lo stesso name arrivano come array; con una sola casella
  // spuntata arrivano come stringa. Non si spezza sulla virgola: alcune
  // etichette la contengono.
  const richieste = []
    .concat(d.prestazioni || [])
    .map(v => String(v).trim())
    .filter(Boolean);

  const sedeScelta = normalizzaSede(d.sede);
  const sedeUsata = sedeScelta || 'Bologna';

  const { html, testo, totale, trovate, nonRiconosciute } = costruisciEmail({
    nome,
    sedeScelta,
    sedeUsata,
    richieste,
    note: (d.note || '').trim(),
    sedeNonSpecificata: !sedeScelta,
  });

  console.log('[preventivo] %s · %s · %d voci · totale %d · non riconosciute: %s',
    destinatario, sedeUsata, trovate.length, totale,
    nonRiconosciute.length ? nonRiconosciute.join('; ') : 'nessuna');

  if (process.env.PREVENTIVI_OFF === '1') {
    console.log('[preventivo] PREVENTIVI_OFF=1 — invio sospeso');
    return { statusCode: 200, body: 'invio sospeso' };
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, COPIA_A } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('[preventivo] SMTP non configurato: nessun invio. ' +
      'Impostare SMTP_HOST, SMTP_USER e SMTP_PASS nelle variabili del sito.');
    return { statusCode: 200, body: 'smtp non configurato' };
  }

  try {
    const porta = Number(SMTP_PORT) || 465;
    const trasporto = nodemailer.createTransport({
      host: SMTP_HOST,
      port: porta,
      secure: porta === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await trasporto.sendMail({
      from: `"Dott. Corrado Gizzi" <${SMTP_USER}>`,
      to: destinatario,
      bcc: COPIA_A || SMTP_USER,
      replyTo: SMTP_USER,
      subject: 'Preventivo indicativo — Dott. Corrado Gizzi',
      text: testo,
      html,
    });

    console.log('[preventivo] inviato a %s', destinatario);
  } catch (errore) {
    // Un errore qui non deve mai risalire al paziente: il modulo è già andato
    // a buon fine e la richiesta è comunque registrata su Netlify.
    console.error('[preventivo] invio fallito:', errore.message);
  }

  return { statusCode: 200, body: 'ok' };
};
