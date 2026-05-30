/* ============================================================
   Albumetics — shared UI: loader, cursor, header, reveal
   Exposes window.UI.observe(el) for dynamically added elements.
   ============================================================ */
window.UI = (function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const canHover = window.matchMedia('(hover: hover)').matches;

  /* Loader */
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (loader) setTimeout(() => loader.classList.add('done'), 900);
  });

  /* Year */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* Custom cursor */
  const cursor = $('#cursor');
  if (cursor && canHover) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; cursor.style.opacity = 1; });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', (e) => { if (e.target.closest('a, button, .card')) cursor.classList.add('active'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest('a, button, .card')) cursor.classList.remove('active'); });
  }

  /* Header scrolled state */
  const header = $('#header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Smooth in-page anchor scroll */
  $$('[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const t = $(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  });

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  const observe = (el) => io.observe(el);
  $$('.reveal, .card').forEach(observe);

  return { observe };
})();
