/* ============================================================
   Albumetics — cart drawer (window.Cart)
   Catalog items are keyed by "<productId>|<version>".
   Custom magnets are unique line items (own image + names),
   stored separately in a list.
   ============================================================ */
window.Cart = (function () {
  'use strict';
  const A = window.ALB;
  const STORE = 'albumetics-cart-v3';
  const $ = (s) => document.querySelector(s);

  let state = load();           // { items: {key:qty}, customs: [..] }
  let els = {};
  let toastTimer;

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      return { items: (s && s.items) || {}, customs: (s && s.customs) || [] };
    } catch { return { items: {}, customs: [] }; }
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(state)); }

  const keyOf = (id, version) => id + '|' + version;
  const parse = (key) => { const [id, version] = key.split('|'); return { id, version }; };

  function totals() {
    let count = 0, sum = 0;
    for (const [key, q] of Object.entries(state.items)) {
      const { id } = parse(key); const p = A.find(id); if (!p) continue;
      count += q; sum += p.price * q;
    }
    for (const c of state.customs) { count += c.qty; sum += A.CUSTOM.price * c.qty; }
    return { count, sum };
  }

  /* ---- catalog ---- */
  function add(id, version, qty = 1) {
    version = version || A.DEFAULT_VERSION;
    const key = keyOf(id, version);
    state.items[key] = (state.items[key] || 0) + qty;
    save(); render(); bump();
    toast(`Added · ${A.find(id).name} · ${A.VERSIONS[version].label}`);
  }
  function setQty(key, q) { if (q <= 0) delete state.items[key]; else state.items[key] = q; save(); render(); }

  /* ---- custom ---- */
  function addCustom(data, qty = 1) {
    const uid = 'c' + Date.now() + Math.floor(Math.random() * 1000);
    state.customs.push({ uid, name: data.name, artist: data.artist, version: data.version || A.DEFAULT_VERSION, image: data.image, qty });
    save(); render(); bump();
    toast(`Added · ${data.name} · Custom`);
  }
  function setCustomQty(uid, q) {
    const c = state.customs.find((x) => x.uid === uid); if (!c) return;
    if (q <= 0) state.customs = state.customs.filter((x) => x.uid !== uid); else c.qty = q;
    save(); render();
  }

  function render() {
    const { count, sum } = totals();
    if (els.count) els.count.textContent = count;
    if (els.total) els.total.textContent = A.fmt(sum);
    if (!els.items) return;

    const keys = Object.keys(state.items);
    if (!keys.length && !state.customs.length) {
      els.items.innerHTML = '<p class="cart__empty">Your cart is empty.<br>Pick a song magnet to begin.</p>';
      return;
    }

    const catalogHtml = keys.map((key) => {
      const { id, version } = parse(key);
      const p = A.find(id); if (!p) return '';
      const v = A.VERSIONS[version] || A.VERSIONS[A.DEFAULT_VERSION];
      const q = state.items[key];
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

    const customHtml = state.customs.map((c) => {
      const v = A.VERSIONS[c.version] || A.VERSIONS[A.DEFAULT_VERSION];
      return `
        <div class="cart-item">
          <div class="cart-item__thumb cart-item__thumb--img" style="background-image:url('${c.image}')"></div>
          <div class="cart-item__info">
            <div class="cart-item__name">${esc(c.name)}</div>
            <div class="cart-item__edition"><span class="svc-ico">${A.ICONS[c.version] || ''}</span>${v.label} · ${esc(c.artist)}</div>
            <div class="cart-item__price">${A.fmt(A.CUSTOM.price)} · Custom</div>
            <div class="cart-item__qty">
              <button data-cdec="${c.uid}" aria-label="Decrease">−</button>
              <span>${c.qty}</span>
              <button data-cinc="${c.uid}" aria-label="Increase">+</button>
            </div>
          </div>
        </div>`;
    }).join('');

    els.items.innerHTML = catalogHtml + customHtml;
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

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
      const inc = e.target.closest('[data-inc]'); const dec = e.target.closest('[data-dec]');
      const cinc = e.target.closest('[data-cinc]'); const cdec = e.target.closest('[data-cdec]');
      if (inc) setQty(inc.dataset.inc, (state.items[inc.dataset.inc] || 0) + 1);
      if (dec) setQty(dec.dataset.dec, (state.items[dec.dataset.dec] || 0) - 1);
      if (cinc) { const c = state.customs.find((x) => x.uid === cinc.dataset.cinc); if (c) setCustomQty(c.uid, c.qty + 1); }
      if (cdec) { const c = state.customs.find((x) => x.uid === cdec.dataset.cdec); if (c) setCustomQty(c.uid, c.qty - 1); }
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
      state = { items: {}, customs: [] }; save(); render(); bump();
      setTimeout(close, 900);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { add, addCustom, open, close, toast };
})();
