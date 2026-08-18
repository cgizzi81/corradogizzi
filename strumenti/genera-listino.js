#!/usr/bin/env node
//
// Genera il listino delle prestazioni in PDF, in due versioni.
//
//   node strumenti/genera-listino.js [cartella-di-uscita]
//
//   listino-segreteria-bologna.pdf
//     Per la segreteria di Life Clinic. Solo le prestazioni che si eseguono a
//     Bologna, con il prezzo che il paziente paga. Nessun riferimento a come
//     l'importo si divide: non è un'informazione che serve allo sportello.
//
//   listino-completo.pdf
//     Per Corrado. Tutte le prestazioni, entrambe le sedi, con la quota
//     trattenuta dalla struttura e l'onorario che ne resta. Da non diffondere.
//
// Entrambi escono dal medesimo `listino.js`: non esiste una versione dei
// prezzi che possa restare indietro rispetto all'altra.

const fs = require('fs');
const path = require('path');

const { LISTINO, euro } = require('./listino.js');

const cartella = process.argv[2] || process.cwd();
fs.mkdirSync(cartella, { recursive: true });

const oggi = new Date();
const dataEstesa = oggi.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
const dataFile = oggi.toISOString().slice(0, 10);

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Impaginazione, condivisa dalle due versioni ──
function pagina({ titolo, sottotitolo, riservato, colonne, righe, chiusura }) {
  const intestazioni = colonne
    .map(c => `<th class="${c.num ? 'num' : ''}">${esc(c.testo)}</th>`).join('');

  const corpo = righe.map(r => {
    if (r.categoria) {
      return `<tr class="cat"><td colspan="${colonne.length}">${esc(r.categoria)}</td></tr>`;
    }
    const celle = r.celle.map((c, i) =>
      `<td class="${colonne[i].num ? 'num' : ''}">${c}</td>`).join('');
    return `<tr>${celle}</tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"><title>${esc(titolo)}</title>
<style>
  :root{
    --navy:#0d1f3c; --gold:#b8962e; --gold-deep:#7f6720; --gold-pale:#f5edcf;
    --cream:#faf8f3; --gray-100:#f4f4f2; --gray-300:#d0cfc9; --gray-500:#8a8880; --text:#1e1c1a;
  }
  *{box-sizing:border-box;}
  body{margin:0;font-family:'Lato',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
    color:var(--text);background:#fff;line-height:1.55;}
  .foglio{width:210mm;min-height:297mm;margin:0 auto;padding:16mm 15mm;display:flex;flex-direction:column;}

  .testata{display:flex;justify-content:space-between;align-items:flex-start;
    border-bottom:2px solid var(--navy);padding-bottom:.9rem;margin-bottom:1.4rem;gap:1.5rem;}
  .testata .nome{font-family:Georgia,'Times New Roman',serif;font-size:1.4rem;color:var(--navy);line-height:1.2;}
  .testata .ruolo{font-size:.76rem;color:var(--gray-500);margin-top:.15rem;}
  .testata .contatti{text-align:right;font-size:.72rem;color:var(--gray-500);line-height:1.6;white-space:nowrap;}

  .etichetta{font-size:.64rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-deep);}
  h1{font-family:Georgia,'Times New Roman',serif;font-size:1.55rem;color:var(--navy);margin:.15rem 0 .3rem;font-weight:600;}
  .sottotitolo{font-size:.88rem;color:var(--gray-500);margin-bottom:1.4rem;}

  .riservato{background:var(--navy);color:#fff;font-size:.68rem;font-weight:700;
    letter-spacing:.12em;text-transform:uppercase;padding:.35rem .8rem;border-radius:2px;
    display:inline-block;margin-bottom:1rem;}

  table{width:100%;border-collapse:collapse;margin-bottom:1.2rem;}
  thead th{font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    color:var(--gray-500);text-align:left;padding:0 0 .45rem;border-bottom:1.5px solid var(--gray-300);}
  thead th.num{text-align:right;}
  tbody td{padding:.5rem 0;border-bottom:1px solid var(--gray-100);font-size:.88rem;vertical-align:top;}
  tbody td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;}
  /* Senza distanza le intestazioni delle colonne numeriche si toccano fra loro
     ("BOLOGNAFAENZASTRUTTURA"): sono corte e allineate a destra. */
  th.num,td.num{padding-left:1.4rem;}
  th:first-child{width:42%;}
  tbody tr.cat td{padding:1rem 0 .3rem;border-bottom:none;font-size:.64rem;font-weight:700;
    letter-spacing:.1em;text-transform:uppercase;color:var(--gold-deep);}
  tbody tr:first-child.cat td{padding-top:.2rem;}
  .nota-voce{display:block;font-size:.75rem;color:var(--gray-500);margin-top:.1rem;line-height:1.45;}
  .assente{color:var(--gray-300);}

  .chiusura{margin-top:auto;padding-top:1.2rem;border-top:1px solid var(--gray-300);
    font-size:.72rem;color:var(--gray-500);line-height:1.6;}

  @media print{ @page{size:A4;margin:0;} .foglio{margin:0;} }
</style></head>
<body>
<div class="foglio">
  <div class="testata">
    <div>
      <div class="nome">Dott. Corrado Gizzi</div>
      <div class="ruolo">Medico Chirurgo &middot; Specialista in Oftalmologia</div>
    </div>
    <div class="contatti">
      corradogizzi.it<br>info@corradogizzi.it<br>349 1908892
    </div>
  </div>

  <div class="etichetta">Listino prestazioni</div>
  <h1>${esc(titolo)}</h1>
  <div class="sottotitolo">${esc(sottotitolo)} &middot; aggiornato al ${dataEstesa}</div>
  ${riservato ? `<div class="riservato">${esc(riservato)}</div>` : ''}

  <table>
    <thead><tr>${intestazioni}</tr></thead>
    <tbody>
${corpo}
    </tbody>
  </table>

  <div class="chiusura">${chiusura}</div>
</div>
</body></html>`;
}

function righePerCategoria(voci, celle) {
  const righe = [];
  let categoria = '';
  voci.forEach(v => {
    if (v.cat !== categoria) { categoria = v.cat; righe.push({ categoria }); }
    righe.push({ celle: celle(v) });
  });
  return righe;
}

const nomeConNota = v =>
  esc(v.nome) + (v.nota ? `<span class="nota-voce">${esc(v.nota)}</span>` : '');

// ══ Versione per la segreteria di Bologna ══
const perBologna = LISTINO.filter(v => typeof v.prezzi.Bologna === 'number');

const segreteria = pagina({
  titolo: 'Sede di Bologna',
  sottotitolo: 'Life Clinic — Via del Lavoro 44',
  riservato: null,
  colonne: [{ testo: 'Prestazione' }, { testo: 'Importo', num: true }],
  righe: righePerCategoria(perBologna, v => [nomeConNota(v), euro(v.prezzi.Bologna)]),
  chiusura:
    'Gli importi sono comprensivi dei costi di struttura e, per gli interventi, dei controlli ' +
    'post-operatori dei primi tre mesi. Prestazioni sanitarie esenti IVA ai sensi dell\'art. 10, ' +
    'n. 18 del D.P.R. 633/1972. Per situazioni non previste in elenco fare riferimento ' +
    'direttamente al Dott. Gizzi.',
});

// ══ Versione completa, per uso interno ══
const completo = pagina({
  titolo: 'Listino completo',
  sottotitolo: 'Entrambe le sedi, con il dettaglio della quota di struttura',
  riservato: 'Documento interno — non diffondere',
  colonne: [
    { testo: 'Prestazione' },
    { testo: 'Bologna', num: true },
    { testo: 'Faenza', num: true },
    { testo: 'Struttura', num: true },
    { testo: 'Onorario', num: true },
  ],
  righe: righePerCategoria(LISTINO, v => {
    const bo = typeof v.prezzi.Bologna === 'number' ? euro(v.prezzi.Bologna) : '<span class="assente">&mdash;</span>';
    const fa = typeof v.prezzi.Faenza === 'number' ? euro(v.prezzi.Faenza) : '<span class="assente">&mdash;</span>';
    const st = typeof v.struttura === 'number' ? euro(v.struttura) : '<span class="assente">&mdash;</span>';
    const on = typeof v.struttura === 'number' && typeof v.prezzi.Bologna === 'number'
      ? euro(v.prezzi.Bologna - v.struttura)
      : '<span class="assente">&mdash;</span>';
    return [
      nomeConNota(v) + (v.soloInterno
        ? '<span class="nota-voce">Non richiedibile dal modulo online</span>' : ''),
      bo, fa, st, on,
    ];
  }),
  chiusura:
    'La colonna <strong>Struttura</strong> è la quota trattenuta da Life Clinic: 1.000 &euro; per gli ' +
    'interventi di glaucoma, 800 &euro; per la cataratta, 250 &euro; a occhio per il laser. ' +
    'L\'<strong>Onorario</strong> è quanto resta. A Faenza gli importi indicati sono quelli richiesti al paziente. ' +
    'Il trattino indica una prestazione non eseguita in quella sede. ' +
    'Fonte: <code>strumenti/listino.js</code>.',
});

// ── Scrittura ──
const usciti = [];
for (const [base, html] of [
  ['listino-segreteria-bologna-' + dataFile, segreteria],
  ['listino-completo-' + dataFile, completo],
]) {
  const p = path.join(cartella, base + '.html');
  fs.writeFileSync(p, html);
  usciti.push({ base, html: p });
  console.log('HTML  ' + p);
}

(async () => {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.log('\nPDF   saltato: Playwright non installato.');
    console.log('      Apri gli HTML nel browser e stampa in PDF.');
    return;
  }
  const browser = await chromium.launch();
  try {
    for (const u of usciti) {
      const pagina = await browser.newPage();
      await pagina.goto('file://' + u.html, { waitUntil: 'networkidle' });
      const pdf = path.join(cartella, u.base + '.pdf');
      await pagina.pdf({ path: pdf, format: 'A4', printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' } });
      console.log('PDF   ' + pdf);
      await pagina.close();
    }
  } finally {
    await browser.close();
  }
})();
