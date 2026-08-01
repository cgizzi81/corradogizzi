// layout.js — nav e footer in italiano, testi modificabili direttamente qui
//
// Le pagine dentro una sottocartella (chirurgia/, laser/) passano '../' come
// secondo argomento di injectLayout, così tutti i percorsi qui sotto restano
// scritti una volta sola rispetto alla radice del sito.

// Voci di menu. Una voce con `children` diventa un menu a tendina; la voce
// principale resta comunque un link cliccabile alla pagina indice.
const NAV_PAGES = [
  { key: 'home', href: 'index.html',      label: 'Home' },
  { key: 'sedi', href: 'ambulatori.html', label: 'Ambulatori' },
  { key: 'bio',  href: 'biografia.html',  label: 'Biografia' },
  { key: 'info', href: 'pazienti.html',   label: 'Info Pazienti' },
  {
    key: 'cura', href: 'chirurgia/index.html', label: 'Trattamenti',
    children: [
      { key: 'chirurgia',       href: 'chirurgia/index.html',            label: 'Chirurgia del glaucoma' },
      { key: 'trabeculectomia', href: 'chirurgia/trabeculectomia.html',  label: '— Trabeculectomia' },
      { key: 'laser',           href: 'laser/index.html',                label: 'Trattamenti laser' },
    ],
  },
  { key: 'book', href: 'prenota.html',    label: 'Prenota' },
];

function getNavHTML(activePage, base) {
  const isActive = p =>
    activePage === p.key || (p.children || []).some(c => c.key === activePage);

  const links = NAV_PAGES.map(p => {
    const active = isActive(p);
    const cls = active ? ' class="nav-active"' : '';
    const cur = activePage === p.key ? ' aria-current="page"' : '';
    if (!p.children) {
      return `<a href="${base}${p.href}"${cls}${cur}>${p.label}</a>`;
    }
    const sub = p.children.map(c =>
      `<a href="${base}${c.href}"${c.key === activePage ? ' aria-current="page"' : ''}>${c.label}</a>`
    ).join('');
    return `
      <div class="nav-dropdown">
        <a href="${base}${p.href}"${cls}${cur}>${p.label}<span class="nav-caret" aria-hidden="true">▾</span></a>
        <button class="nav-sub-toggle" type="button" aria-expanded="false"
                aria-label="Mostra le pagine di ${p.label}"></button>
        <div class="nav-submenu">${sub}</div>
      </div>`;
  }).join('');

  return `
<nav id="navbar" aria-label="Navigazione principale">
  <div class="nav-inner">
    <a href="${base}index.html" class="nav-logo">
      <img src="${base}assets/logo-symbol.svg" alt="" width="40" height="40" class="nav-logo-symbol">
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

function getFooterHTML(base) {
  return `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <img src="${base}assets/logo-symbol.svg" alt="" width="40" height="40" class="footer-logo-symbol">
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
          <a href="${base}index.html">Home</a>
          <a href="${base}ambulatori.html">Ambulatori</a>
          <a href="${base}biografia.html">Biografia</a>
          <a href="${base}pazienti.html">Info Pazienti</a>
          <a href="${base}chirurgia/index.html">Chirurgia del glaucoma</a>
          <a href="${base}laser/index.html">Trattamenti laser</a>
          <a href="${base}prenota.html">Prenota</a>
        </div>
      </div>
      <div>
        <div class="footer-heading">Contatti</div>
        <div class="footer-links">
          <a href="mailto:info@corradogizzi.it">info@corradogizzi.it</a>
          <a href="tel:+39051242588">LCB Bologna: 051 242588</a>
          <a href="tel:+3905461910613">Le Cicogne Faenza: 0546 1910613</a>
          <a href="${base}prenota.html">Prenota online →</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span id="footer-year">2026</span> Dott. Corrado Gizzi. Tutti i diritti riservati.</p>
      <a href="${base}privacy.html">Privacy Policy</a>
    </div>
  </div>
</footer>

<div id="cookie-banner">
  <span>Questo sito utilizza cookie tecnici per garantire il corretto funzionamento. Nessun dato viene ceduto a terzi.</span>
  <button class="btn btn-primary" id="cookie-accept">Accetta</button>
</div>`;
}

// base: '' per le pagine in radice, '../' per quelle in una sottocartella.
function injectLayout(activePage, base) {
  base = base || '';
  const navDiv = document.createElement('div');
  navDiv.innerHTML = getNavHTML(activePage, base);
  document.body.insertBefore(navDiv.firstElementChild, document.body.firstChild);
  const footDiv = document.createElement('div');
  footDiv.innerHTML = getFooterHTML(base);
  while (footDiv.firstChild) document.body.appendChild(footDiv.firstChild);
  const year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();
}
