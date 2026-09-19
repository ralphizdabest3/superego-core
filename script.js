(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');
  let lastScroll = 0, ticking = false;
  function updateNav() {
    const y = window.pageYOffset;
    nav.classList.toggle('at-top', y < 50);
    if (y > 120) nav.classList.toggle('hidden', y > lastScroll && y > 200);
    else nav.classList.remove('hidden');
    lastScroll = y; ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateNav); ticking = true; } }, { passive: true });
  nav.classList.add('at-top');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); document.body.style.overflow = '';
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); document.body.style.overflow = ''; toggle.focus();
      }
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href'); if (id === '#') return;
      const target = document.querySelector(id);
      if (target) { e.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
    });
  });
  if (!prefersReducedMotion) {
    const obs = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
})();