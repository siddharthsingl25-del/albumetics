/* ============================================================
   Albumetics — cart drawer (window.Cart)
   Items are keyed by "<productId>|<version>" so the same magnet
   in a Spotify edition and an Apple Music edition stay separate.
   ============================================================ */
window.Cart = (function () {
  'use strict';
  const A = window.ALB;
  const STORE = 'albumetics-cart-v2';
  const $ = (s) => document.querySelector(s);

  let cart = load();
  let els = {};
  let toastTimer;

  function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }
  function save() { localStorage.setItem(STORE, JSON.stringify(cart)); }

  const keyOf = (id, version) => id + '|' + version;
  function parse(key) { const [id, version] = key.split('|'); return { id, version }; }

  function totals() {
    let count = 0, sum = 0;
    for (const [key, q] of Object.entries(cart)) {
      const { id } = parse(key); const p = A.find(id); if (!p) continue;
      count += q; sum += p.price * q;
    }
    return { count, sum };
  }

  function add(id, version, qty = 1) {
    version = version || A.DEFAULT_VERSION;
    const key = keyOf(id, version);
    cart[key] = (cart[key] || 0) + qty;
    save(); render(); bump();
    const v = A.VERSIONS[version];
    toast(`Added · ${A.find(id).name} · ${v.label}`);
  }
  function setQty(key, q) { if (q <= 0) delete cart[key]; else cart[key] = q; save(); render(); }

  function render() {
    const { count, sum } = totals();
    if (els.count) els.count.textContent = count;
    if (els.total) els.total.textContent = A.fmt(sum);
    if (!els.items) return;

    const keys = Object.keys(cart);
    if (!keys.length) {
      els.items.innerHTML = '<p class="cart__empty">Your cart is empty.<br>Pick a song magnet to begin.</p>';
      return;
    }
    els.items.innerHTML = keys.map((key) => {
      const { id, version } = parse(key);
      const p = A.find(id); if (!p) return '';
      const v = A.VERSIONS[version] || A.VERSIONS[A.DEFAULT_VERSION];
      const q = cart[key];
      return `
        <div class="cart-item">
          <div class="cart-item__thumb" style="background:linear-gradient(145deg, ${p.color}, ${A.shade(p.color, -18)}); color:${A.textOn(p.color)}">
            <div class="wave"><i></i><i></i><i></i><i></i></div>
          </div>
          <div class="cart-item__info">
            <div class="cart-item__name">${p.name}</div>
            <div class="cart-item__edition"><span class="svc-ico">${A.ICONS[version] || ''}</span>${v.label}</div>
            <div class="cart-item__price">${A.fmt(p.price)}</div>
            <div class="cart-item__qty">
              <button data-dec="${key}" aria-label="Decrease">−</button>
              <span>${q}</span>
              <button data-inc="${key}" aria-label="Increase">+</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function bump() {
    if (!els.count) return;
    els.count.classList.remove('pop'); void els.count.offsetWidth; els.count.classList.add('pop');
  }
  function open() { els.cart.classList.add('open'); els.overlay.classList.add('open'); els.cart.setAttribute('aria-hidden', 'false'); }
  function close() { els.cart.classList.remove('open'); els.overlay.classList.remove('open'); els.cart.setAttribute('aria-hidden', 'true'); }

  function toast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
  }

  function init() {
    els = {
      cart: $('#cart'), overlay: $('#drawerOverlay'), items: $('#cartItems'),
      count: $('#cartCount'), total: $('#cartTotal'), toast: $('#toast'),
    };
    if (!els.cart) { render(); return; }

    els.items.addEventListener('click', (e) => {
      const inc = e.target.closest('[data-inc]');
      const dec = e.target.closest('[data-dec]');
      if (inc) setQty(inc.dataset.inc, (cart[inc.dataset.inc] || 0) + 1);
      if (dec) setQty(dec.dataset.dec, (cart[dec.dataset.dec] || 0) - 1);
    });
    const cartBtn = $('#cartBtn'); if (cartBtn) cartBtn.addEventListener('click', open);
    const cartClose = $('#cartClose'); if (cartClose) cartClose.addEventListener('click', close);
    els.overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    const checkout = $('#checkoutBtn');
    if (checkout) checkout.addEventListener('click', () => {
      const { count, sum } = totals();
      if (!count) { toast('Your cart is empty'); return; }
      toast(`Order placed · ${count} magnet${count > 1 ? 's' : ''} · ${A.fmt(sum)}`);
      cart = {}; save(); render(); bump();
      setTimeout(close, 900);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { add, open, close, toast };
})();
