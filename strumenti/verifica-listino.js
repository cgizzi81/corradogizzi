#!/usr/bin/env node
//
// Controlla che il modulo pubblico e il listino parlino la stessa lingua.
//
// Il `value` di ogni checkbox in richiedi-preventivo/index.html è
// l'identificatore che la risposta automatica confronta con i `nome` di
// listino.js. Se i due elenchi divergono il modulo continua a funzionare, la
// richiesta arriva, ma nell'email al paziente quella prestazione sparisce
// senza che nessuno se ne accorga.
//
// È già successo: il modulo diceva "SLT" e "OCT" mentre il listino diceva
// "SLT — trabeculoplastica selettiva" e "OCT del nervo ottico". Quattro delle
// voci più richieste non sarebbero state quotate.
//
// Gira dentro `npm run build`, quindi Netlify se ne accorge prima di
// pubblicare: se fallisce, resta online il deploy precedente.

const fs = require('fs');
const path = require('path');

const RADICE = path.join(__dirname, '..');
const { LISTINO, SEDI } = require('./listino.js');

// Voce del modulo che non è una prestazione: chi la sceglie chiede una
// valutazione, non un importo.
const NON_QUOTABILE = 'Non so, vorrei essere consigliato in visita';

const problemi = [];

// ── 1. Modulo e listino devono coincidere ──
const modulo = fs.readFileSync(path.join(RADICE, 'richiedi-preventivo/index.html'), 'utf8');
const nelModulo = [...modulo.matchAll(/name="prestazioni" value="([^"]+)"/g)].map(m => m[1]);

if (!nelModulo.length) {
  problemi.push('Nessuna prestazione trovata nel modulo: il selettore è cambiato?');
}

const nomiListino = new Set(LISTINO.map(v => v.nome));
nelModulo
  .filter(n => n !== NON_QUOTABILE && !nomiListino.has(n))
  .forEach(n => problemi.push(
    `Il modulo offre "${n}", che non è in listino.js: nel preventivo automatico sparirebbe.`));

const offerte = new Set(nelModulo);
LISTINO
  .filter(v => !offerte.has(v.nome))
  .forEach(v => problemi.push(
    `"${v.nome}" è in listino.js ma non è selezionabile nel modulo.`));

// ── 2. Ogni voce deve avere un prezzo utilizzabile ──
LISTINO.forEach(v => {
  SEDI.forEach(sede => {
    if (!(sede in v.prezzi)) problemi.push(`"${v.nome}" non dichiara un prezzo per ${sede}.`);
  });
  const utilizzabili = SEDI.filter(s => typeof v.prezzi[s] === 'number' && v.prezzi[s] > 0);
  if (!utilizzabili.length) {
    problemi.push(`"${v.nome}" non ha un prezzo valido in nessuna sede.`);
  }
});

// ── 3. Nomi duplicati ──
const visti = new Set();
LISTINO.forEach(v => {
  if (visti.has(v.nome)) problemi.push(`"${v.nome}" compare due volte in listino.js.`);
  visti.add(v.nome);
});

if (problemi.length) {
  console.error('\n[listino] controllo fallito:\n');
  problemi.forEach(p => console.error('  · ' + p));
  console.error('\nCorreggi strumenti/listino.js o richiedi-preventivo/index.html.\n');
  process.exit(1);
}

console.log('[listino] %d prestazioni, modulo allineato.', LISTINO.length);
