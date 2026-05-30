/* ============================================================
   Albumetics — interactions, animation & shop logic
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Product data ---------- */
  const PRODUCTS = [
    { id: 'classic-black', name: 'The Classic', price: 24, color: '#0a0a0a', desc: 'Matte black, white waveform. The original Albumetics magnet.' },
    { id: 'pure-white',   name: 'Pure',         price: 24, color: '#1c1c1c', desc: 'Clean white face with a debossed tap mark. Minimal, always.' },
    { id: 'sunset',       name: 'Sunset',       price: 28, color: '#ff5a3c', desc: 'A warm gradient for the songs that feel like golden hour.' },
    { id: 'midnight',     name: 'Midnight',     price: 28, color: '#1f3a8a', desc: 'Deep blue, late-night listens. For the 2am playlist.' },
    { id: 'forest',       name: 'Forest',       price: 28, color: '#1f5d3a', desc: 'Earthy green tones for acoustic mornings and slow songs.' },
    { id: 'duo-pack',     name: 'The Duo Pack', price: 44, color: '#0a0a0a', desc: 'Two magnets, two songs. Keep one, gift one. Best value.' },
  ];

  const fmt = (n) => '$' + n;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader').classList.add('done'), 1300);
  });

  /* ---------- Year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Custom cursor ---------- */
  const cursor = $('#cursor');
  if (window.matchMedia('(hover: hover)').matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY; cursor.style.opacity = 1;
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .card')) cursor.classList.add('active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .card')) cursor.classList.remove('active');
    });
  }

  /* ---------- Header scroll state ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Smooth anchor scroll ---------- */
  $$('[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const t = $(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  });

  /* ---------- Hero magnet parallax ---------- */
  const heroMagnet = $('#heroMagnet');
  if (heroMagnet && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = (e.clientY / window.innerHeight - 0.5) * 26;
      heroMagnet.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  $$('.reveal, .card').forEach((el) => io.observe(el));

  /* ---------- Word-by-word pull quote ---------- */
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

  /* ---------- Animated counters ---------- */
  const counters = $$('.stat__num');
  const cIo = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count; let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      const tick = () => {
        cur = Math.min(target, cur + step);
        el.textContent = cur;
        if (cur < target) requestAnimationFrame(tick);
      };
      tick(); cIo.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => cIo.observe(c));

  /* ---------- Render products ---------- */
  const grid = $('#products');
  const waveBars = (n) => Array.from({ length: n }, () => '<i></i>').join('');
  grid.innerHTML = PRODUCTS.map((p, i) => `
    <article class="card" data-delay="${i % 3}">
      <div class="card__media" style="background:linear-gradient(150deg,#fafafa,#efefef)">
        <div class="card__art" style="background:linear-gradient(145deg, ${p.color}, ${shade(p.color, -18)}); color:${textOn(p.color)}">
          <div class="wave">${waveBars(7)}</div>
        </div>
        <div class="card__tap"><span><span class="ico">⌖</span>Tap to play</span></div>
      </div>
      <div class="card__body">
        <div class="card__row">
          <span class="card__name">${p.name}</span>
          <span class="card__price">${fmt(p.price)}</span>
        </div>
        <p class="card__desc">${p.desc}</p>
        <button class="card__add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`).join('');
  // observe freshly injected cards
  $$('#products .card').forEach((el) => io.observe(el));

  /* ---------- Cart logic ---------- */
  const STORE = 'albumetics-cart';
  let cart = load();
  const cartEl = $('#cart');
  const overlay = $('#drawerOverlay');
  const itemsEl = $('#cartItems');
  const countEl = $('#cartCount');
  const totalEl = $('#cartTotal');

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch { return {}; }
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(cart)); }

  function add(id) {
    cart[id] = (cart[id] || 0) + 1;
    save(); render(); bump(); toast('Added to cart');
  }
  function setQty(id, q) {
    if (q <= 0) delete cart[id]; else cart[id] = q;
    save(); render();
  }

  function totals() {
    let count = 0, sum = 0;
    Object.entries(cart).forEach(([id, q]) => {
      const p = PRODUCTS.find((x) => x.id === id); if (!p) return;
      count += q; sum += p.price * q;
    });
    return { count, sum };
  }

  function render() {
    const ids = Object.keys(cart);
    if (!ids.length) {
      itemsEl.innerHTML = '<p class="cart__empty">Your cart is empty.<br>Pick a song magnet to begin.</p>';
    } else {
      itemsEl.innerHTML = ids.map((id) => {
        const p = PRODUCTS.find((x) => x.id === id); if (!p) return '';
        const q = cart[id];
        return `
          <div class="cart-item">
            <div class="cart-item__thumb" style="background:linear-gradient(145deg, ${p.color}, ${shade(p.color, -18)}); color:${textOn(p.color)}">
              <div class="wave"><i></i><i></i><i></i><i></i></div>
            </div>
            <div class="cart-item__info">
              <div class="cart-item__name">${p.name}</div>
              <div class="cart-item__price">${fmt(p.price)}</div>
              <div class="cart-item__qty">
                <button data-dec="${id}" aria-label="Decrease">−</button>
                <span>${q}</span>
                <button data-inc="${id}" aria-label="Increase">+</button>
              </div>
            </div>
          </div>`;
      }).join('');
    }
    const { count, sum } = totals();
    countEl.textContent = count;
    totalEl.textContent = fmt(sum);
  }

  function bump() {
    countEl.classList.remove('pop'); void countEl.offsetWidth; countEl.classList.add('pop');
  }

  function openCart() { cartEl.classList.add('open'); overlay.classList.add('open'); cartEl.setAttribute('aria-hidden', 'false'); }
  function closeCart() { cartEl.classList.remove('open'); overlay.classList.remove('open'); cartEl.setAttribute('aria-hidden', 'true'); }

  // events
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.card__add');
    if (b) add(b.dataset.id);
  });
  itemsEl.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) setQty(inc.dataset.inc, cart[inc.dataset.inc] + 1);
    if (dec) setQty(dec.dataset.dec, cart[dec.dataset.dec] - 1);
  });
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  $('#checkoutBtn').addEventListener('click', () => {
    const { count, sum } = totals();
    if (!count) { toast('Your cart is empty'); return; }
    toast(`Order placed · ${count} magnet${count > 1 ? 's' : ''} · ${fmt(sum)}`);
    cart = {}; save(); render(); bump();
    setTimeout(closeCart, 900);
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  const toastEl = $('#toast');
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- Color helpers ---------- */
  function shade(hex, percent) {
    const n = parseInt(hex.replace('#', ''), 16);
    let r = (n >> 16) + percent, g = ((n >> 8) & 0xff) + percent, b = (n & 0xff) + percent;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function textOn(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? '#0a0a0a' : '#ffffff';
  }

  render();
})();
