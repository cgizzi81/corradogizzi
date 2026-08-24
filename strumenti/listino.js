// ══════════════════════════════════════════════════════════════════════
//  LISTINO PRESTAZIONI — la fonte unica dei prezzi.
//
//  Lo leggono tutti: lo strumento interattivo (preventivo.html), lo script da
//  riga di comando (genera-preventivo.js), il generatore dei PDF di listino
//  (genera-listino.js) e la funzione che manda la risposta automatica
//  (netlify/functions/submission-created.js).
//  Per cambiare un prezzo si modifica QUI e basta.
//
//  ── Regole ──
//
//  · Gli importi in `prezzi` sono quello che il paziente paga: onorario
//    professionale PIÙ costi di struttura.
//
//  · `null` significa "non si esegue in quella sede". Il preventivo non fa
//    sparire la riga: usa il prezzo dell'altra sede e lo dichiara.
//
//  · `struttura` (facoltativa) è la quota trattenuta da Life Clinic. Non serve
//    al preventivo — il paziente vede solo il totale — ma rende esplicito da
//    dove viene il numero e alimenta la colonna "Onorario" del listino interno.
//
//  · `nota` (facoltativa) compare sotto la riga nel preventivo. Serve per le
//    voci il cui importo non è completo (dispositivi, lente premium).
//
//  · `soloInterno: true` tiene la voce fuori dal modulo pubblico: resta nel
//    listino della segreteria ma il paziente non la seleziona da sé.
//
//  · I `nome` sono identificatori, non etichette: la risposta automatica
//    riconosce le prestazioni confrontandoli con i `value` dei checkbox in
//    richiedi-preventivo/index.html. Se cambi un nome, cambialo anche lì —
//    `npm run verifica` blocca il deploy se i due elenchi divergono.
//
//  ── Tariffe di struttura (Life Clinic Bologna, agosto 2026) ──
//
//    sala glaucoma con mitomicina C .......... 1.000 €
//    sala glaucoma senza mitomicina C ........... 900 €
//    sala cataratta con monofocale .............. 900 €
//    sala cataratta con premium ................. 800 €
//    sala laser ............................. 150 € a occhio
//
//  L'anestesista è compreso nella quota di sala.
//
//  ── Onorario che resta a Corrado ──
//
//    Faco + IOL monofocale        800     Trabeculectomia          2.200
//    Faco + IOL premium         1.200     Impianto drenante        2.400
//    MIGS standalone            1.100     XEN / Preserflo          2.000
//    Faco + MIGS                1.500     Needling in sala           800
//    Faco + premium + MIGS      1.900     Laser (a occhio)           350
//                                         Ciclofotocoagulazione        800
//
//  Negli interventi sono compresi i controlli post-operatori dei primi tre
//  mesi; nel laser il controllo a 6-8 settimane. Se questo cambia, aggiornare
//  anche `AVVISO`.
// ══════════════════════════════════════════════════════════════════════

const SEDI = ['Bologna', 'Faenza'];

// ── Tariffe di struttura ──
const SALA_GLAUCOMA_MMC = 1000;   // trabeculectomia, XEN, Preserflo, impianto, needling
const SALA_GLAUCOMA     = 900;    // MIGS: non usa mitomicina
const SALA_CATARATTA    = 900;    // con lente monofocale
const SALA_PREMIUM      = 800;    // con lente premium: la struttura trattiene meno
const SALA_LASER        = 150;    // a occhio

// ── Note che compaiono sotto la riga nel preventivo ──
const DISPOSITIVO = 'Il costo del dispositivo non è compreso: si aggira orientativamente ' +
  'fra 1.000 e 1.200 € e viene quantificato in sede di indicazione chirurgica.';

const DISPOSITIVO_MIGS = 'Il costo dello stent non è compreso: si aggira orientativamente ' +
  'intorno ai 1.200 € e viene quantificato in sede di indicazione chirurgica.';

// La monofocale costa in media un centinaio di euro — il 6% dell'intervento —
// ed è compresa nel prezzo. La premium pesa il 30% e varia troppo da modello a
// modello per poter essere inglobata.
const LENTE_MONOFOCALE = 'Comprende la lente monofocale.';
const LENTE_PREMIUM = 'Il costo della lente premium non è compreso: varia orientativamente ' +
  'fra 250 e 900 € secondo il modello, che viene scelto insieme in sede di indicazione chirurgica.';

const BEVACIZUMAB = 'Se il caso richiede bevacizumab, il costo aggiuntivo è di 370 €.';

const PER_OCCHIO = 'Prezzo per occhio.';

// La ciclofotocoagulazione si esegue in sala operatoria, non in ambulatorio
// laser: si applica la tariffa della sala glaucoma e la sonda è monouso.
const SONDA_MONOUSO = 'Il costo della sonda monouso non è compreso: si aggira ' +
  'orientativamente intorno ai 1.000 €.';

const unisci = (...note) => note.filter(Boolean).join(' ');

const LISTINO = [
  // ══ Visite ed esami ══
  // A Faenza si eseguono visite, OCT e fotografie del fondo. Campo visivo e
  // topografia sono solo a Bologna (vedi ambulatori.html).
  { cat: 'Visite ed esami', nome: 'Visita oculistica completa',
    prezzi: { Bologna: 150, Faenza: 120 } },
  { cat: 'Visite ed esami', nome: 'Visita di controllo per glaucoma',
    prezzi: { Bologna: 150, Faenza: 120 } },
  { cat: 'Visite ed esami', nome: 'Visita breve',
    prezzi: { Bologna: 80, Faenza: 80 }, soloInterno: true },
  { cat: 'Visite ed esami', nome: 'Misurazione della pressione oculare',
    prezzi: { Bologna: 60, Faenza: 60 }, soloInterno: true },
  { cat: 'Visite ed esami', nome: 'OCT del nervo ottico',
    prezzi: { Bologna: 100, Faenza: 80 } },
  { cat: 'Visite ed esami', nome: 'Campo visivo',
    prezzi: { Bologna: 80, Faenza: null } },
  { cat: 'Visite ed esami', nome: 'Topografia corneale',
    prezzi: { Bologna: 80, Faenza: null } },
  { cat: 'Visite ed esami', nome: 'Fotografia del fondo o del segmento anteriore',
    prezzi: { Bologna: 80, Faenza: 80 } },

  // ══ Trattamenti laser — solo Bologna, prezzo a occhio ══
  { cat: 'Trattamenti laser', nome: 'SLT — trabeculoplastica selettiva',
    prezzi: { Bologna: 500, Faenza: null }, struttura: SALA_LASER, nota: PER_OCCHIO },
  { cat: 'Trattamenti laser', nome: 'Iridotomia YAG',
    prezzi: { Bologna: 500, Faenza: null }, struttura: SALA_LASER, nota: PER_OCCHIO },
  { cat: 'Trattamenti laser', nome: 'YAG capsulotomia',
    prezzi: { Bologna: 500, Faenza: null }, struttura: SALA_LASER, nota: PER_OCCHIO },
  // Si esegue in sala operatoria: tariffa sala glaucoma senza mitomicina, più
  // la sonda monouso a carico del paziente.
  { cat: 'Trattamenti laser', nome: 'Ciclofotocoagulazione a diodo',
    prezzi: { Bologna: 1700, Faenza: null }, struttura: SALA_GLAUCOMA,
    nota: unisci(PER_OCCHIO, SONDA_MONOUSO) },

  // ══ Chirurgia — solo Bologna ══
  { cat: 'Chirurgia', nome: 'Faco + IOL monofocale',
    prezzi: { Bologna: 1700, Faenza: null }, struttura: SALA_CATARATTA,
    nota: LENTE_MONOFOCALE },
  { cat: 'Chirurgia', nome: 'Faco + IOL premium',
    prezzi: { Bologna: 2000, Faenza: null }, struttura: SALA_PREMIUM,
    nota: LENTE_PREMIUM },
  { cat: 'Chirurgia', nome: 'MIGS',
    prezzi: { Bologna: 2000, Faenza: null }, struttura: SALA_GLAUCOMA,
    nota: DISPOSITIVO_MIGS },
  { cat: 'Chirurgia', nome: 'Faco + IOL monofocale + MIGS',
    prezzi: { Bologna: 2400, Faenza: null }, struttura: SALA_GLAUCOMA,
    nota: unisci(LENTE_MONOFOCALE, DISPOSITIVO_MIGS) },
  { cat: 'Chirurgia', nome: 'Faco + IOL premium + MIGS',
    prezzi: { Bologna: 2800, Faenza: null }, struttura: SALA_GLAUCOMA,
    nota: unisci(LENTE_PREMIUM, DISPOSITIVO_MIGS) },
  { cat: 'Chirurgia', nome: 'XEN',
    prezzi: { Bologna: 3000, Faenza: null }, struttura: SALA_GLAUCOMA_MMC,
    nota: unisci(DISPOSITIVO, BEVACIZUMAB) },
  { cat: 'Chirurgia', nome: 'Preserflo',
    prezzi: { Bologna: 3000, Faenza: null }, struttura: SALA_GLAUCOMA_MMC,
    nota: unisci(DISPOSITIVO, BEVACIZUMAB) },
  { cat: 'Chirurgia', nome: 'Trabeculectomia',
    prezzi: { Bologna: 3200, Faenza: null }, struttura: SALA_GLAUCOMA_MMC,
    nota: BEVACIZUMAB },
  { cat: 'Chirurgia', nome: 'Impianto drenante',
    prezzi: { Bologna: 3400, Faenza: null }, struttura: SALA_GLAUCOMA_MMC,
    nota: unisci(DISPOSITIVO, BEVACIZUMAB) },
  { cat: 'Chirurgia', nome: 'Needling in sala operatoria',
    prezzi: { Bologna: 1800, Faenza: null }, struttura: SALA_GLAUCOMA_MMC,
    nota: BEVACIZUMAB, soloInterno: true },
];

// ══════════════════════════════════════════════════════════════════════
//  COMBINAZIONI
//
//  Quando il paziente sceglie tutte le prestazioni di una combinazione, il
//  preventivo sostituisce le righe singole con quella della combinazione e ne
//  applica il prezzo. Vale nel documento PDF e nella risposta automatica.
//
//  `componenti` elenca i nomi richiesti. Un elemento può essere un array di
//  alternative: le due visite sono intercambiabili, perché la combinazione
//  vale sia per la visita completa sia per il controllo del glaucoma.
//
//  Le combinazioni con più componenti hanno la precedenza, altrimenti
//  "visita + OCT + campo visivo" verrebbe spezzata da "visita + OCT".
// ══════════════════════════════════════════════════════════════════════

const VISITA = ['Visita oculistica completa', 'Visita di controllo per glaucoma'];

const COMBINAZIONI = [
  { nome: 'Visita + OCT + campo visivo',
    componenti: [VISITA, 'OCT del nervo ottico', 'Campo visivo'],
    prezzi: { Bologna: 250, Faenza: null } },
  { nome: 'Visita + OCT',
    componenti: [VISITA, 'OCT del nervo ottico'],
    prezzi: { Bologna: 200, Faenza: 160 } },
  { nome: 'Visita + campo visivo',
    componenti: [VISITA, 'Campo visivo'],
    prezzi: { Bologna: 200, Faenza: null } },
  { nome: 'Visita + topografia corneale',
    componenti: [VISITA, 'Topografia corneale'],
    prezzi: { Bologna: 200, Faenza: null } },
  { nome: 'Visita + fotografia del fondo o del segmento anteriore',
    componenti: [VISITA, 'Fotografia del fondo o del segmento anteriore'],
    prezzi: { Bologna: 200, Faenza: 160 } },
];

// Date le prestazioni scelte e la sede, restituisce le combinazioni applicabili
// e le prestazioni che restano singole.
function applicaCombinazioni(nomiScelti, sede) {
  const restanti = [...nomiScelti];
  const combinazioni = [];

  const perAmpiezza = [...COMBINAZIONI]
    .sort((a, b) => b.componenti.length - a.componenti.length);

  for (const combo of perAmpiezza) {
    if (combo.prezzi[sede] == null) continue;   // non disponibile in questa sede

    const daRimuovere = [];
    const completa = combo.componenti.every((componente) => {
      const alternative = Array.isArray(componente) ? componente : [componente];
      const trovato = restanti.find(
        (n) => alternative.includes(n) && !daRimuovere.includes(n));
      if (trovato === undefined) return false;
      daRimuovere.push(trovato);
      return true;
    });

    if (completa) {
      daRimuovere.forEach((n) => restanti.splice(restanti.indexOf(n), 1));
      combinazioni.push(combo);
    }
  }

  return { combinazioni, singole: restanti };
}

// ══════════════════════════════════════════════════════════════════════
//  Cosa è già compreso — serve alla segreteria per non addebitare due volte.
// ══════════════════════════════════════════════════════════════════════
const INCLUSIONI = [
  'La <strong>pachimetria</strong> è compresa nella visita oculistica.',
  'Il <strong>laser argon</strong>, quando serve come pretrattamento, è compreso nel prezzo dell\'iridotomia YAG.',
  'L\'<strong>anestesista</strong> è compreso nella quota di sala.',
  'Lo <strong>studio precataratta</strong> (biometria, topografia, OCT) è compreso per chi si opera con il Dott. Gizzi.',
  'La <strong>lente monofocale</strong> è compresa nel prezzo dell\'intervento; la premium è a parte.',
  'La <strong>curva tonometrica</strong> viene eseguita dall\'ortottista e non rientra in questo listino.',
];

// Testo che chiude ogni preventivo.
const AVVISO =
  'Gli importi indicati sono comprensivi dei costi di struttura e, per gli ' +
  'interventi, dei controlli post-operatori dei primi tre mesi. I trattamenti ' +
  'laser sono quotati per occhio. ' +
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
  module.exports = { LISTINO, COMBINAZIONI, SEDI, AVVISO, INCLUSIONI, euro, applicaCombinazioni };
}
