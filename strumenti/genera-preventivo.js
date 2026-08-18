#!/usr/bin/env node
//
// Genera un preventivo già compilato a partire da un file JSON.
//
//   node strumenti/genera-preventivo.js richiesta.json [cartella-di-uscita]
//
// Produce sempre un HTML autonomo pronto da stampare, e in più un PDF se nel
// sistema è disponibile Playwright (`npx playwright install chromium`).
//
// Non duplica il documento: inietta i dati dentro preventivo.html e lascia che
// sia la pagina a renderizzarli con il proprio codice. Così lo strumento
// interattivo e questo script non possono divergere nell'aspetto.
//
// Formato del JSON — solo `paziente` e `prestazioni` sono obbligatori:
//
//   {
//     "paziente": "Mario Rossi",
//     "numero": "2026-014",
//     "data": "2026-08-18",              // ISO; se manca, oggi
//     "sede": "Bologna",                 // oppure "Faenza" — determina i prezzi
//     "occhio": "Occhio destro",
//     "sconto": 200,
//     "validita": 60,
//     "note": "Comprende i controlli del primo mese.",
//     "prestazioni": [
//       "SLT — trabeculoplastica selettiva",
//       { "nome": "Trabeculectomia", "quantita": 1, "prezzo": 3600 }   // prezzo: forza l'importo
//     ]
//   }
//
// I nomi delle prestazioni devono corrispondere a quelli in listino.js. Un nome
// non riconosciuto viene segnalato e ignorato, non fa fallire la generazione.

const fs = require('fs');
const path = require('path');

const { LISTINO } = require('./listino.js');

const [, , fileRichiesta, cartellaArg] = process.argv;

if (!fileRichiesta) {
  console.error('Uso: node strumenti/genera-preventivo.js richiesta.json [cartella-di-uscita]');
  process.exit(1);
}

const richiesta = JSON.parse(fs.readFileSync(fileRichiesta, 'utf8'));

if (!richiesta.paziente) {
  console.error('Errore: manca il campo "paziente".');
  process.exit(1);
}
if (!Array.isArray(richiesta.prestazioni) || richiesta.prestazioni.length === 0) {
  console.error('Errore: "prestazioni" deve essere un elenco non vuoto.');
  process.exit(1);
}

// Verifica i nomi qui, così l'errore si vede a terminale e non solo in console
// del browser, dove nessuno lo leggerebbe.
const nomiListino = new Set(LISTINO.map(v => v.nome));
const sconosciute = richiesta.prestazioni
  .map(v => (typeof v === 'string' ? v : v.nome))
  .filter(nome => !nomiListino.has(nome));

if (sconosciute.length) {
  console.error('Errore: prestazioni non presenti in listino.js:');
  sconosciute.forEach(n => console.error('  · ' + n));
  console.error('\nVoci disponibili:');
  LISTINO.forEach(v => console.error('  · ' + v.nome));
  process.exit(1);
}

// ── Costruzione del documento ──
const cartellaStrumenti = __dirname;
const modello = fs.readFileSync(path.join(cartellaStrumenti, 'preventivo.html'), 'utf8');

// listino.js è caricato come file esterno: nel documento generato va incorporato,
// altrimenti il file smette di funzionare appena lo si sposta o lo si allega.
// Non serve rimuovere il blocco module.exports: la guardia `typeof module` lo
// rende già inerte nel browser. (Toglierlo con una regex a una riga spezzava il
// file, perché il blocco è su più righe.)
const listinoInline = fs.readFileSync(path.join(cartellaStrumenti, 'listino.js'), 'utf8');

const dati = { ...richiesta };
if (!dati.data) dati.data = new Date().toISOString().slice(0, 10);

const documento = modello
  .replace('<script src="listino.js"></script>',
    '<script>\n' + listinoInline + '\n</script>\n<script>window.PRECOMPILATO = ' +
    JSON.stringify(dati, null, 2) + ';</script>');

const cartella = cartellaArg || process.cwd();
fs.mkdirSync(cartella, { recursive: true });

const base = 'preventivo-' +
  (dati.numero || dati.paziente).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const percorsoHtml = path.join(cartella, base + '.html');
fs.writeFileSync(percorsoHtml, documento);
console.log('HTML  ' + percorsoHtml);

// ── PDF, se Playwright è disponibile ──
(async () => {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.log('\nPDF   saltato: Playwright non installato.');
    console.log('      Apri l\'HTML nel browser e stampa in PDF, oppure installa');
    console.log('      Playwright con:  npx playwright install chromium');
    return;
  }

  const percorsoPdf = path.join(cartella, base + '.pdf');
  const browser = await chromium.launch();
  try {
    const pagina = await browser.newPage();
    await pagina.goto('file://' + percorsoHtml, { waitUntil: 'networkidle' });
    await pagina.waitForSelector('.foglio');
    await pagina.pdf({
      path: percorsoPdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    console.log('PDF   ' + percorsoPdf);
  } finally {
    await browser.close();
  }
})();
