// layout.js — nav e footer in italiano, testi modificabili direttamente qui
//
// Nav e footer usano percorsi ASSOLUTI dalla radice, sempre nella forma canonica
// (/chirurgia/, non /chirurgia/index.html): un link alla variante index.html fa
// scansionare a Google un duplicato che poi scarta, sprecando budget di crawling.
// Il secondo argomento di injectLayout non serve più ed è ignorato: resta accettato
// solo per non dover toccare le chiamate esistenti in fondo a ogni pagina.

// ── Statistiche di visita (Umami) ──
//
// Umami non usa cookie e non scrive nulla sul dispositivo del visitatore:
// per questo non serve un banner di consenso e la dichiarazione «solo cookie
// tecnici» della privacy policy resta vera. Con GA4 non sarebbe stato così.
//
// L'ID si copia dalla dashboard Umami (Settings → Websites → Edit → Website ID),
// insieme all'indirizzo dello script, che va confermato lì perché cambia a
// seconda di dove è ospitato l'account. Finché UMAMI_ID è vuoto non viene
// caricato nulla e il sito si comporta esattamente come prima.
const UMAMI_ID  = '1ca714ad-5dc5-481d-8cc6-f55d7f7a0d6a';
const UMAMI_SRC = 'https://cloud.umami.is/script.js';

// Si conta solo il dominio di produzione. I deploy di anteprima del ramo
// `revisione` sono una copia integrale del sito su un secondo host: senza
// questo filtro ogni pagina che apriamo noi per revisionarla finirebbe nelle
// statistiche insieme alle visite dei pazienti, e i numeri non direbbero più
// niente. È lo stesso motivo per cui tools/anteprime-noindex.mjs tiene le
// anteprime fuori da Google.
const DOMINIO_PRODUZIONE = 'corradogizzi.it';

function injectAnalytics() {
  // Chi cura il sito lo apre di continuo, e con un traffico ancora basso le
  // proprie visite falserebbero ogni statistica. Aprire una pagina qualsiasi
  // con ?notrack=1 spegne il conteggio su quel browser una volta per tutte
  // (?notrack=0 lo riaccende): è la chiave che Umami stesso controlla.
  // Serve perché Firefox su Android non ha una console da cui impostarla a
  // mano, ed è il browser da cui Corrado visita il sito più spesso.
  const q = new URLSearchParams(location.search);
  if (q.has('notrack')) {
    const spegni = q.get('notrack') !== '0';
    try {
      if (spegni) localStorage.setItem('umami.disabled', '1');
      else localStorage.removeItem('umami.disabled');
      alert(spegni
        ? 'Statistiche disattivate su questo browser.'
        : 'Statistiche riattivate su questo browser.');
    } catch (e) { /* navigazione privata: localStorage non disponibile */ }
  }

  if (!UMAMI_ID) return;
  const host = location.hostname;
  if (host !== DOMINIO_PRODUZIONE && host !== 'www.' + DOMINIO_PRODUZIONE) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = UMAMI_SRC;
  s.setAttribute('data-website-id', UMAMI_ID);
  document.head.appendChild(s);
}

// Voci di menu. Una voce con `children` diventa un menu a tendina; la voce
// principale resta comunque un link cliccabile alla pagina indice.
const NAV_PAGES = [
  { key: 'home', href: '/',                label: 'Home' },
  { key: 'sedi', href: '/ambulatori.html', label: 'Ambulatori' },
  { key: 'bio',  href: '/biografia.html',  label: 'Biografia' },
  { key: 'info', href: '/pazienti.html',   label: 'Info Pazienti' },
  {
    key: 'cura', href: '/diagnostica/', label: 'Diagnosi e cure',
    children: [
      { key: 'diagnostica', href: '/diagnostica/', label: 'Diagnostica del glaucoma',
        interne: ['tonometria', 'disco-ottico', 'oct', 'campo-visivo', 'pachimetria', 'gonioscopia'] },
      { key: 'laser',       href: '/laser/',       label: 'Trattamenti laser',
        interne: ['slt', 'yag', 'diodo'] },
      { key: 'chirurgia',   href: '/chirurgia/',   label: 'Chirurgia del glaucoma',
        interne: ['trabeculectomia', 'drenanti', 'migs', 'mibs'] },
    ],
  },
  { key: 'blog', href: '/blog/',        label: 'Blog' },
  {
    key: 'book', href: '/prenota.html', label: 'Prenota',
    children: [
      { key: 'book',       href: '/prenota.html',          label: 'Prenota una visita' },
      { key: 'preventivo', href: '/richiedi-preventivo/',  label: 'Richiedi un preventivo' },
    ],
  },
];

function getNavHTML(activePage) {
  // `interne` elenca le chiavi delle pagine di dettaglio di una sezione: senza,
  // stando su mibs.html o slt.html il menu non segnalava dove ci si trova.
  const appartiene = c => c.key === activePage || (c.interne || []).includes(activePage);
  const isActive = p =>
    activePage === p.key || (p.children || []).some(appartiene);

  const links = NAV_PAGES.map(p => {
    const active = isActive(p);
    const cls = active ? ' class="nav-active"' : '';
    // Con un sottomenu, aria-current sta sulla voce figlia: metterlo anche sul
    // padre marcherebbe due link come "pagina corrente" nello stesso menu.
    const cur = activePage === p.key && !p.children ? ' aria-current="page"' : '';
    if (!p.children) {
      return `<a href="${p.href}"${cls}${cur}>${p.label}</a>`;
    }
    const sub = p.children.map(c =>
      `<a href="${c.href}"${c.key === activePage ? ' aria-current="page"' : ''}${
        appartiene(c) && c.key !== activePage ? ' class="nav-active"' : ''}>${c.label}</a>`
    ).join('');
    return `
      <div class="nav-dropdown">
        <a href="${p.href}"${cls}${cur}>${p.label}<span class="nav-caret" aria-hidden="true">▾</span></a>
        <button class="nav-sub-toggle" type="button" aria-expanded="false"
                aria-label="Mostra le pagine di ${p.label}"></button>
        <div class="nav-submenu">${sub}</div>
      </div>`;
  }).join('');

  return `
<nav id="navbar" aria-label="Navigazione principale">
  <div class="nav-inner">
    <a href="/" class="nav-logo">
      <img src="/assets/logo-symbol.svg" alt="" width="40" height="40" class="nav-logo-symbol">
      <div class="nav-logo-text">
        <span class="name">Dott. Corrado Gizzi</span>
        <span class="title">Specialista in Oftalmologia</span>
      </div>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Apri il menu"
            aria-expanded="false" aria-controls="nav-links">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-links" id="nav-links">
      ${links}
    </div>
  </div>
</nav>`;
}

function getFooterHTML() {
  return `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <img src="/assets/logo-symbol.svg" alt="" width="40" height="40" class="footer-logo-symbol">
          <div>
            <div class="footer-logo-name">Dott. Corrado Gizzi</div>
            <div class="footer-logo-title">Medico Chirurgo · Specialista in Oftalmologia</div>
          </div>
        </div>
        <p>Ambulatori specialistici a Bologna e Faenza.<br>
        Per emergenze oculistiche rivolgersi al Pronto Soccorso più vicino.</p>
      </div>
      <div>
        <div class="footer-heading">Pagine</div>
        <div class="footer-links">
          <a href="/">Home</a>
          <a href="/ambulatori.html">Ambulatori</a>
          <a href="/biografia.html">Biografia</a>
          <a href="/pazienti.html">Info Pazienti</a>
          <a href="/glaucoma-bologna/">Glaucoma a Bologna</a>
          <a href="/glaucoma-faenza/">Glaucoma a Faenza</a>
          <a href="/glaucoma-emilia-romagna/">Glaucoma in Emilia-Romagna</a>
          <a href="/chirurgia/">Chirurgia del glaucoma</a>
          <a href="/laser/">Trattamenti laser</a>
          <a href="/prenota.html">Prenota</a>
        </div>
      </div>
      <div>
        <div class="footer-heading">Contatti</div>
        <div class="footer-links">
          <a href="mailto:info@corradogizzi.it">info@corradogizzi.it</a>
          <a href="tel:+39051242588">LCB Bologna: 051 242588</a>
          <a href="tel:+393491908892">Le Cicogne Faenza: 349 1908892</a>
          <a href="/prenota.html">Prenota online →</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span id="footer-year">2026</span> Dott. Corrado Gizzi. Tutti i diritti riservati.</p>
      <a href="/privacy.html">Privacy Policy</a>
    </div>
  </div>
</footer>

<div id="cookie-banner">
  <span>Questo sito utilizza cookie tecnici per garantire il corretto funzionamento. Nessun dato viene ceduto a terzi.</span>
  <button class="btn btn-primary" id="cookie-accept">Accetta</button>
</div>`;
}

function injectLayout(activePage) {
  const navDiv = document.createElement('div');
  navDiv.innerHTML = getNavHTML(activePage);
  document.body.insertBefore(navDiv.firstElementChild, document.body.firstChild);
  const footDiv = document.createElement('div');
  footDiv.innerHTML = getFooterHTML();
  while (footDiv.firstChild) document.body.appendChild(footDiv.firstChild);
  const year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();
  injectAnalytics();
}
