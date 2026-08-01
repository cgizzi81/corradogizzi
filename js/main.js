// main.js — solo italiano, no sistema i18n

// ── Navbar scroll ──────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile menu ────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;
  const sync = () => {
    const open = links.classList.contains('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  };
  toggle.addEventListener('click', () => { links.classList.toggle('open'); sync(); });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => { links.classList.remove('open'); sync(); })
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open'); sync(); toggle.focus();
    }
  });
  sync();

  // Sottomenu su mobile: da desktop si apre in hover/focus via CSS, qui serve
  // solo il pulsante +/− quando il menu è la lista verticale a tutta pagina.
  links.querySelectorAll('.nav-sub-toggle').forEach(btn => {
    const submenu = btn.parentElement.querySelector('.nav-submenu');
    if (!submenu) return;
    btn.addEventListener('click', () => {
      const open = submenu.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
}

// ── Scroll reveal ──────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    io.observe(el);
  });
}

// ── Cookie banner ──────────────────────────────────────────
function initCookies() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('cookies-ok')) {
    banner.classList.add('hidden');
    return;
  }
  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('cookies-ok', '1');
    banner.classList.add('hidden');
  });
}

// ── Accordion (FAQ) ────────────────────────────────────────
function initAccordion() {
  const btns = document.querySelectorAll('.accordion-btn');
  btns.forEach((btn, i) => {
    const body = btn.closest('.accordion-item')?.querySelector('.accordion-body');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-expanded', 'false');
    if (body) {
      if (!body.id) body.id = `accordion-body-${i + 1}`;
      btn.setAttribute('aria-controls', body.id);
    }
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('open');
        const b = el.querySelector('.accordion-btn');
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── Form di contatto — invio nativo a Netlify ─────────────
// Non usiamo preventDefault: il browser invia il form
// direttamente a Netlify che gestisce tutto lato server.
// Mostriamo solo feedback visivo durante l'invio.
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', () => {
    const btn = form.querySelector('[type=submit]');
    if (btn) {
      btn.textContent = 'Invio in corso…';
      btn.disabled = true;
    }
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initReveal();
  initCookies();
  initAccordion();
  initContactForm();
});
