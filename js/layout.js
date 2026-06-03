// layout.js — nav e footer in italiano, testi modificabili direttamente qui

function getNavHTML(activePage) {
  const pages = [
    { key: 'home', href: 'index.html',      label: 'Home' },
    { key: 'sedi', href: 'ambulatori.html', label: 'Ambulatori' },
    { key: 'bio',  href: 'biografia.html',  label: 'Biografia' },
    { key: 'info', href: 'pazienti.html',   label: 'Info Pazienti' },
    { key: 'book', href: 'prenota.html',    label: 'Prenota' },
  ];
  const links = pages.map(p =>
    `<a href="${p.href}" class="${activePage === p.key ? 'nav-active' : ''}">${p.label}</a>`
  ).join('');
  return `
<nav id="navbar">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">
      <img src="assets/logo-symbol.svg" alt="CG" class="nav-logo-symbol">
      <div class="nav-logo-text">
        <span class="name">Dott. Corrado Gizzi</span>
        <span class="title">Specialista in Oftalmologia</span>
      </div>
    </a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Menu">
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
          <img src="assets/logo-symbol.svg" alt="CG" class="footer-logo-symbol">
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
          <a href="index.html">Home</a>
          <a href="ambulatori.html">Ambulatori</a>
          <a href="biografia.html">Biografia</a>
          <a href="pazienti.html">Info Pazienti</a>
          <a href="prenota.html">Prenota</a>
        </div>
      </div>
      <div>
        <div class="footer-heading">Contatti</div>
        <div class="footer-links">
          <a href="mailto:info@corradogizzi.it">info@corradogizzi.it</a>
          <a href="tel:051242588">LCB Bologna: 051 242588</a>
          <a href="tel:054619106013">Le Cicogne Faenza: 0546 1910613</a>
          <a href="prenota.html">Prenota online →</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Dott. Corrado Gizzi. Tutti i diritti riservati.</p>
      <a href="privacy.html">Privacy Policy</a>
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
}
