// ══════════════════════════════════════════════════════════════════════
//  LISTINO PRESTAZIONI — la fonte unica dei prezzi.
//
//  Lo legge sia lo strumento interattivo (preventivo.html) sia lo script
//  genera-preventivo.js: modificare gli importi QUI e basta.
//
//  Gli importi sono onorario professionale. Sala operatoria, materiali e
//  anestesia sono fatturati a parte dalla struttura: se cambia, va aggiornato
//  anche l'avviso in fondo al preventivo.
// ══════════════════════════════════════════════════════════════════════
const LISTINO = [
  { cat: 'Visite ed esami', nome: 'Prima visita glaucoma',            prezzo: 150 },
  { cat: 'Visite ed esami', nome: 'Visita di controllo',               prezzo: 100 },
  { cat: 'Visite ed esami', nome: 'OCT del nervo ottico',              prezzo: 100 },
  { cat: 'Visite ed esami', nome: 'Campo visivo',                      prezzo: 80  },
  { cat: 'Visite ed esami', nome: 'Pachimetria corneale',              prezzo: 40  },

  { cat: 'Trattamenti laser', nome: 'SLT — trabeculoplastica selettiva', prezzo: 600 },
  { cat: 'Trattamenti laser', nome: 'Iridotomia YAG',                    prezzo: 450 },
  { cat: 'Trattamenti laser', nome: 'YAG capsulotomia',                  prezzo: 400 },
  { cat: 'Trattamenti laser', nome: 'Ciclofotocoagulazione a diodo',     prezzo: 1100 },

  { cat: 'Chirurgia', nome: 'Trabeculectomia',            prezzo: 3200 },
  { cat: 'Chirurgia', nome: 'Impianto drenante',          prezzo: 3800 },
  { cat: 'Chirurgia', nome: 'XEN',                        prezzo: 3000 },
  { cat: 'Chirurgia', nome: 'Preserflo',                  prezzo: 3200 },
  { cat: 'Chirurgia', nome: 'MIGS',                       prezzo: 2600 },
  { cat: 'Chirurgia', nome: 'Chirurgia della cataratta',  prezzo: 2400 },
];

// Funziona sia col tag <script> nel browser sia con require() da Node.
if (typeof module !== 'undefined' && module.exports) module.exports = LISTINO;
