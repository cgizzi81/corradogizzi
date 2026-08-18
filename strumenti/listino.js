// ══════════════════════════════════════════════════════════════════════
//  LISTINO PRESTAZIONI — la fonte unica dei prezzi.
//
//  Lo leggono tutti e tre: lo strumento interattivo (preventivo.html), lo
//  script da riga di comando (genera-preventivo.js) e la funzione che manda
//  la risposta automatica (netlify/functions/submission-created.js).
//  Per cambiare un prezzo si modifica QUI e basta.
//
//  ── Regole ──
//
//  · Gli importi sono in euro e sono COMPRENSIVI dei costi di struttura.
//    Se questo cambia, va aggiornato anche il testo `AVVISO` qui sotto.
//
//  · `prezzi` ha una voce per sede. `null` significa "non si esegue in quella
//    sede": il preventivo lo segnala e propone l'altra sede, invece di
//    silenziosamente omettere la riga.
//
//  · I nomi delle prestazioni sono identificatori: se ne cambi uno, aggiorna
//    anche le etichette del modulo in richiedi-preventivo/index.html, che è
//    ciò che i pazienti selezionano.
// ══════════════════════════════════════════════════════════════════════

const SEDI = ['Bologna', 'Faenza'];

const LISTINO = [
  // ── Visite ed esami ──
  { cat: 'Visite ed esami', nome: 'Prima visita glaucoma',              prezzi: { Bologna: 180, Faenza: 150 } },
  { cat: 'Visite ed esami', nome: 'Visita di controllo',                prezzi: { Bologna: 120, Faenza: 100 } },
  { cat: 'Visite ed esami', nome: 'OCT del nervo ottico',               prezzi: { Bologna: 120, Faenza: 100 } },
  { cat: 'Visite ed esami', nome: 'Campo visivo',                       prezzi: { Bologna: 100, Faenza:  80 } },
  { cat: 'Visite ed esami', nome: 'Pachimetria corneale',               prezzi: { Bologna:  50, Faenza:  40 } },

  // ── Trattamenti laser ──
  { cat: 'Trattamenti laser', nome: 'SLT — trabeculoplastica selettiva', prezzi: { Bologna: 700, Faenza: null } },
  { cat: 'Trattamenti laser', nome: 'Iridotomia YAG',                    prezzi: { Bologna: 550, Faenza: null } },
  { cat: 'Trattamenti laser', nome: 'YAG capsulotomia',                  prezzi: { Bologna: 500, Faenza: null } },
  { cat: 'Trattamenti laser', nome: 'Ciclofotocoagulazione a diodo',     prezzi: { Bologna: 1400, Faenza: null } },

  // ── Chirurgia — solo Bologna ──
  { cat: 'Chirurgia', nome: 'Chirurgia della cataratta',  prezzi: { Bologna: 2800, Faenza: null } },
  { cat: 'Chirurgia', nome: 'MIGS',                       prezzi: { Bologna: 3200, Faenza: null } },
  { cat: 'Chirurgia', nome: 'XEN',                        prezzi: { Bologna: 3600, Faenza: null } },
  { cat: 'Chirurgia', nome: 'Preserflo',                  prezzi: { Bologna: 3800, Faenza: null } },
  { cat: 'Chirurgia', nome: 'Trabeculectomia',            prezzi: { Bologna: 3800, Faenza: null } },
  { cat: 'Chirurgia', nome: 'Impianto drenante',          prezzi: { Bologna: 4500, Faenza: null } },
];

// Testo che chiude ogni preventivo. Deve dire due cose: cosa è compreso, e che
// l'importo non è definitivo.
const AVVISO =
  'Gli importi indicati sono comprensivi dei costi di struttura. ' +
  'Si tratta di un preventivo indicativo: l\'importo definitivo può subire ' +
  'variazioni in base a quanto emerge dalla valutazione clinica, che può ' +
  'richiedere prestazioni diverse o aggiuntive rispetto a quelle qui indicate.';

// Formattazione degli importi, definita una volta sola.
//
// useGrouping:'always' è necessario: per l'italiano il CLDR prevede
// minimumGroupingDigits=2, quindi di default 3800 diventa "3800 €" mentre
// 10000 diventa "10.000 €". Chromium usa un CLDR più vecchio e raggruppa
// sempre: senza questa opzione lo stesso preventivo usciva "3.800 €" nel PDF
// e "3800 €" nell'email automatica.
function euro(n) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
    useGrouping: 'always',
  }).format(n);
}

// Funziona sia col tag <script> nel browser sia con require() da Node.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LISTINO, SEDI, AVVISO, euro };
}
