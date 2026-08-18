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
//  · Gli importi in `prezzi` sono quello che il paziente paga: onorario
//    professionale PIÙ costi di struttura. È il numero che finisce nel
//    preventivo.
//
//  · `null` significa "non si esegue in quella sede". Il preventivo non fa
//    sparire la riga: usa il prezzo dell'altra sede e lo dichiara.
//
//  · `nota` (facoltativa) compare sotto la riga nel preventivo. Serve per le
//    voci il cui importo non è completo, es. gli impianti dove il dispositivo
//    si quantifica caso per caso.
//
//  · I `nome` sono identificatori, non etichette: la risposta automatica
//    riconosce le prestazioni confrontandoli con quelli del modulo in
//    richiedi-preventivo/index.html. Se cambi un nome, cambialo anche lì.
//
//  ── Da dove vengono i numeri (agosto 2026) ──
//
//  Dati reali forniti da Corrado:
//    · visita oculistica          Bologna 150 €   Faenza 120 €
//    · sala operatoria Bologna    glaucoma 1.000 €  cataratta 800 €
//    · sala laser Bologna         250 € a occhio
//
//  Il resto è onorario professionale, scelto per stare in proporzione al
//  prezzo della visita e alle ore di lavoro che ogni procedura comporta,
//  post-operatorio compreso.
//
//    prestazione                onorario   struttura   totale
//    SLT                            350        250        600
//    Iridotomia YAG                 300        250        550
//    YAG capsulotomia               250        250        500
//    Ciclofotocoagulazione          650        250        900
//    Cataratta                    1.200        800      2.000
//    Cataratta + MIGS             1.800      1.000      2.800
//    MIGS isolata                 1.500      1.000      2.500
//    XEN                          2.000      1.000      3.000  + dispositivo
//    Preserflo                    2.000      1.000      3.000  + dispositivo
//    Trabeculectomia              2.200      1.000      3.200
//    Impianto drenante (PAUL)     2.400      1.000      3.400  + dispositivo
//
//  Nell'onorario chirurgico sono compresi i controlli post-operatori dei primi
//  tre mesi, che nella trabeculectomia sono la parte più impegnativa del
//  percorso. Per il laser è compreso il controllo a 6-8 settimane.
//  Se questa scelta cambia, aggiornare anche `AVVISO`.
// ══════════════════════════════════════════════════════════════════════

const SEDI = ['Bologna', 'Faenza'];

const DISPOSITIVO = 'Il costo del dispositivo non è compreso e viene quantificato in sede di indicazione chirurgica.';

const LISTINO = [
  // ── Visite ed esami ──
  // A Faenza si eseguono visite, OCT e fotografie del fondo. Campo visivo e
  // pachimetria sono solo a Bologna (vedi ambulatori.html).
  { cat: 'Visite ed esami', nome: 'Prima visita glaucoma',              prezzi: { Bologna: 150, Faenza: 120 } },
  { cat: 'Visite ed esami', nome: 'Visita di controllo',                prezzi: { Bologna: 150, Faenza: 120 } },
  { cat: 'Visite ed esami', nome: 'OCT del nervo ottico',               prezzi: { Bologna: 100, Faenza:  80 } },
  { cat: 'Visite ed esami', nome: 'Campo visivo',                       prezzi: { Bologna:  80, Faenza: null } },
  { cat: 'Visite ed esami', nome: 'Pachimetria corneale',               prezzi: { Bologna:  40, Faenza: null } },

  // ── Trattamenti laser — solo Bologna, struttura 250 € a occhio ──
  { cat: 'Trattamenti laser', nome: 'SLT — trabeculoplastica selettiva', prezzi: { Bologna: 600, Faenza: null } },
  { cat: 'Trattamenti laser', nome: 'Iridotomia YAG',                    prezzi: { Bologna: 550, Faenza: null } },
  { cat: 'Trattamenti laser', nome: 'YAG capsulotomia',                  prezzi: { Bologna: 500, Faenza: null } },
  { cat: 'Trattamenti laser', nome: 'Ciclofotocoagulazione a diodo',     prezzi: { Bologna: 900, Faenza: null } },

  // ── Chirurgia — solo Bologna ──
  { cat: 'Chirurgia', nome: 'Chirurgia della cataratta',
    prezzi: { Bologna: 2000, Faenza: null } },
  { cat: 'Chirurgia', nome: 'Chirurgia della cataratta associata a MIGS',
    prezzi: { Bologna: 2800, Faenza: null } },
  { cat: 'Chirurgia', nome: 'MIGS',
    prezzi: { Bologna: 2500, Faenza: null } },
  { cat: 'Chirurgia', nome: 'XEN',
    prezzi: { Bologna: 3000, Faenza: null }, nota: DISPOSITIVO },
  { cat: 'Chirurgia', nome: 'Preserflo',
    prezzi: { Bologna: 3000, Faenza: null }, nota: DISPOSITIVO },
  { cat: 'Chirurgia', nome: 'Trabeculectomia',
    prezzi: { Bologna: 3200, Faenza: null } },
  { cat: 'Chirurgia', nome: 'Impianto drenante',
    prezzi: { Bologna: 3400, Faenza: null }, nota: DISPOSITIVO },
];

// Testo che chiude ogni preventivo. Deve dire tre cose: cosa è compreso, cosa
// non lo è, e che l'importo non è definitivo.
const AVVISO =
  'Gli importi indicati sono comprensivi dei costi di struttura e, per gli ' +
  'interventi, dei controlli post-operatori dei primi tre mesi. ' +
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
