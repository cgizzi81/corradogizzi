// Sui deploy che non sono di produzione (rami di revisione, anteprime) il sito
// viene pubblicato per intero su un secondo indirizzo, del tipo
// revisione--corrado-gizzi.netlify.app.
//
// Netlify NON lo protegge da solo: verificato il 12 agosto 2026, quelle pagine
// rispondono 200 senza alcun X-Robots-Tag e con il robots.txt di produzione, che
// dice Allow: /. È quindi una copia integrale e scansionabile del sito su un host
// diverso. I tag canonical puntano a corradogizzi.it e in genere bastano, ma sono
// l'ultima difesa: meglio non far arrivare i crawler fin lì.
//
// Questo script gira prima di Eleventy e, SOLO fuori dalla produzione, scrive:
//   _headers   -> X-Robots-Tag: noindex su tutto
//   robots.txt -> Disallow: /
//
// La guardia è la variabile CONTEXT di Netlify, che vale 'production' sul ramo
// di produzione e 'branch-deploy' / 'deploy-preview' altrove. In locale CONTEXT
// non esiste e lo script non fa nulla.

import { writeFileSync } from 'node:fs';

const contesto = process.env.CONTEXT;

if (!contesto) {
  console.log('[anteprime] CONTEXT assente: build locale, nessuna modifica.');
} else if (contesto === 'production') {
  console.log('[anteprime] contesto "production": il sito resta indicizzabile.');
} else {
  writeFileSync('_headers', '/*\n  X-Robots-Tag: noindex, nofollow\n');
  writeFileSync('robots.txt', [
    '# Deploy di anteprima: copia di lavoro del sito, non deve finire nei motori.',
    '# Il robots.txt vero sta nel repository e viene ripristinato in produzione.',
    'User-agent: *',
    'Disallow: /',
    '',
  ].join('\n'));
  console.log(`[anteprime] contesto "${contesto}": aggiunti noindex e Disallow: /`);
}
