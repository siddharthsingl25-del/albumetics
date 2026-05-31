/* ============================================================
   Albumetics — homepage: hero parallax, pull quote,
   counters, and the product grid (links to product.html)
   ============================================================ */
(function () {
  'use strict';
  const A = window.ALB;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* Hero magnet parallax */
  const heroMagnet = $('#heroMagnet');
  if (heroMagnet && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = (e.clientY / window.innerHeight - 0.5) * 26;
      heroMagnet.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* Word-by-word pull quote */
  $$('.reveal-text p').forEach((p) => {
    const words = p.textContent.trim().split(' ');
    p.innerHTML = words.map((w) => `<span class="word">${w}&nbsp;</span>`).join('');
  });
  const words = $$('.reveal-text .word');
  if (words.length) {
    window.addEventListener('scroll', () => {
      const vh = window.innerHeight;
      words.forEach((w) => {
        const r = w.getBoundingClientRect();
        w.classList.toggle('lit', r.top < vh * 0.78 && r.bottom > vh * 0.18);
      });
    }, { passive: true });
  }

  /* Animated counters */
  const cIo = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count; let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      const tick = () => { cur = Math.min(target, cur + step); el.textContent = cur; if (cur < target) requestAnimationFrame(tick); };
      tick(); cIo.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.stat__num').forEach((c) => cIo.observe(c));

  /* Product grid — each card links to its detail page */
  const grid = $('#products');
  if (grid) {
    const waveBars = (n) => Array.from({ length: n }, () => '<i></i>').join('');
    const productCards = A.PRODUCTS.map((p, i) => `
      <a class="card" href="product.html?id=${p.id}" data-delay="${i % 3}">
        <div class="card__media" style="background:linear-gradient(150deg,#fafafa,#efefef)">
          <div class="card__art" style="background:linear-gradient(145deg, ${p.color}, ${A.shade(p.color, -18)}); color:${A.textOn(p.color)}">
            <div class="wave">${waveBars(7)}</div>
          </div>
          <div class="card__tap"><span><span class="ico">⌖</span>View magnet</span></div>
        </div>
        <div class="card__body">
          <div class="card__row">
            <span class="card__name">${p.name}</span>
            <span class="card__price">${A.fmt(p.price)}</span>
          </div>
          <p class="card__desc">${p.desc}</p>
          <span class="card__add">View product <span aria-hidden="true">→</span></span>
        </div>
      </a>`).join('');

    const customCard = `
      <a class="card card--custom" href="custom.html">
        <div class="card__media">
          <div class="card__art card__art--custom">
            <span class="card__plus">+</span>
            <div class="wave">${waveBars(7)}</div>
          </div>
          <div class="card__tap"><span><span class="ico">✶</span>Build your own</span></div>
        </div>
        <div class="card__body">
          <div class="card__row">
            <span class="card__name">Customize</span>
            <span class="card__price">${A.fmt(A.CUSTOM.price)}</span>
          </div>
          <p class="card__desc">Your song, your artist — a one-of-a-kind magnet made just for you.</p>
          <span class="card__add">Make it yours <span aria-hidden="true">→</span></span>
        </div>
      </a>`;

    grid.innerHTML = productCards + customCard;
    $$('#products .card').forEach((el) => window.UI.observe(el));
  }
})();
