// Genera le card di condivisione (og:image) degli articoli del blog.
//
// Ogni post ha bisogno di una propria anteprima: senza, WhatsApp e Facebook
// mostrano lo stesso ritratto per tutti gli articoli e tre link condivisi in
// una chat risultano indistinguibili. La card non ritrae nulla, compone il
// titolo nell'identità del sito — etichetta, filo dorato, firma, filigrana.
//
// ── Perché NON gira dentro `npm run build` ──
//
// Serve un browser per renderizzare, e installare Playwright nella build di
// Netlify significherebbe scaricare Chromium a ogni deploy. Le card si
// generano quindi in locale e si committano come asset statici: cambiano solo
// quando cambia un titolo, cioè quasi mai.
//
//   node tools/card-condivisione.mjs            genera solo le card mancanti
//   node tools/card-condivisione.mjs --tutte    le rigenera tutte
//
// Un articolo che dichiara `immagine:` nel front matter viene saltato: quando
// le illustrazioni anatomiche saranno pronte, basta indicarle lì e la card
// tipografica si fa da parte.

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(RADICE, '_blog/posts');
const USCITA = path.join(RADICE, 'assets/og');
const TUTTE = process.argv.includes('--tutte');

// Front matter semplice: bastano le quattro chiavi che finiscono sulla card.
function frontMatter(testo) {
  const m = testo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const dati = {};
  for (const riga of m[1].split(/\r?\n/)) {
    const c = riga.match(/^(\w+):\s*(.*)$/);
    if (c) dati[c[1]] = c[2].trim().replace(/^["']|["']$/g, '');
  }
  return dati;
}

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const logo = fs.readFileSync(path.join(RADICE, 'assets/logo-symbol.svg'), 'utf8')
  .replace(/<\?xml[^>]*\?>/, '');

// Il titolo più lungo deve restare su tre righe: si scala il corpo, non il
// riquadro, così tutte le card conservano la stessa impaginazione.
const corpoTitolo = (t) => (t.length > 66 ? 52 : t.length > 48 ? 60 : 68);

const pagina = (art) => `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Lato:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Lato,sans-serif}
.card{width:1200px;height:630px;position:relative;overflow:hidden;color:#fff;
      background:linear-gradient(135deg,#0d1f3c 0%,#1a3458 100%);
      display:flex;flex-direction:column;justify-content:space-between;padding:64px 72px}
.filigrana{position:absolute;right:-110px;top:-70px;width:520px;height:520px;opacity:.06}
.filigrana svg{width:100%;height:100%}
.etichetta{display:inline-block;align-self:flex-start;background:#f5edcf;color:#7f6720;
           font-size:17px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
           padding:9px 20px;border-radius:2px}
.filo{width:96px;height:3px;background:#b8962e;margin-bottom:30px}
h1{font-family:'Playfair Display',Georgia,serif;font-weight:600;color:#fff;
   font-size:${corpoTitolo(art.title)}px;line-height:1.18;max-width:880px}
.firma{display:flex;align-items:center;gap:18px}
.firma svg{width:54px;height:54px}
.nome{font-size:25px;font-weight:700}
.ruolo{font-size:17px;color:#d4af50;letter-spacing:.06em;margin-top:3px}
</style></head><body>
<div class="card">
  <div class="filigrana">${logo}</div>
  ${art.etichetta ? `<span class="etichetta">${esc(art.etichetta)}</span>` : '<span></span>'}
  <div><div class="filo"></div><h1>${esc(art.title)}</h1></div>
  <div class="firma">${logo}
    <div><div class="nome">Dott. Corrado Gizzi</div>
         <div class="ruolo">Oculista · Glaucoma · Bologna e Faenza</div></div></div>
</div></body></html>`;

// createRequire invece di import(): la risoluzione CJS rispetta NODE_PATH, e
// così lo script funziona anche con Playwright installato fuori dal progetto,
// senza doverlo aggiungere alle dipendenze del sito.
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('\n[card] Playwright non è installato: le card non sono state generate.');
  console.error('       Servono solo quando si aggiunge o si rititola un articolo.\n');
  process.exit(1);
}

fs.mkdirSync(USCITA, { recursive: true });

const articoli = fs.readdirSync(POSTS)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.replace(/\.md$/, ''), ...frontMatter(fs.readFileSync(path.join(POSTS, f), 'utf8')) }))
  .filter((a) => {
    if (a.immagine) { console.log(`· ${a.slug}: ha un'immagine propria, salto`); return false; }
    if (!TUTTE && fs.existsSync(path.join(USCITA, a.slug + '.png'))) {
      console.log(`· ${a.slug}: già presente`); return false;
    }
    return true;
  });

if (!articoli.length) {
  console.log('[card] niente da generare.');
  process.exit(0);
}

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const art of articoli) {
  await p.setContent(pagina(art), { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(USCITA, art.slug + '.png') });
  console.log(`✓ assets/og/${art.slug}.png`);
}
await browser.close();
console.log(`[card] ${articoli.length} card generate.`);
