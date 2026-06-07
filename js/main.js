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
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
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
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-btn').classList.remove('open');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.classList.add('open');
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
