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

  /* ============================================================
     ORDER NOTIFICATIONS (ntfy.sh)
     -------------------------------------------------------------
     Orders are pushed to this ntfy topic. To receive them:
       1. Install the "ntfy" app (Android / iOS) or open ntfy.sh
       2. Subscribe to the EXACT topic name below.
     IMPORTANT: anyone who knows this topic can read your orders,
     so keep it secret. Change it to your own private topic here:
     ============================================================ */
  const NTFY_TOPIC = 'albumetics-orders-a8f3k9qz';
  const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;

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
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCheckout(); close(); } });

    const checkout = $('#checkoutBtn');
    if (checkout) checkout.addEventListener('click', () => {
      const { count } = totals();
      if (!count) { toast('Your cart is empty'); return; }
      openCheckout();
    });

    buildCheckout();
    render();
  }

  /* ============================================================
     Checkout — collect customer details, push order to ntfy
     ============================================================ */
  const FIELDS = [
    { id: 'name',      label: 'Full name',        type: 'text',  required: true,  ph: 'Your name', auto: 'name' },
    { id: 'phone',     label: 'Phone number',     type: 'tel',   required: true,  ph: '+91 ', auto: 'tel' },
    { id: 'email',     label: 'Email',            type: 'email', required: true,  ph: 'you@email.com', auto: 'email' },
    { id: 'instagram', label: 'Instagram handle', type: 'text',  required: false, ph: '@yourhandle' },
    { id: 'address1',  label: 'Address line 1',   type: 'text',  required: true,  ph: 'House / flat, street', auto: 'address-line1' },
    { id: 'address2',  label: 'Address line 2',   type: 'text',  required: false, ph: 'Area, landmark (optional)', auto: 'address-line2' },
    { id: 'city',      label: 'City',             type: 'text',  required: true,  ph: 'City', auto: 'address-level2' },
    { id: 'state',     label: 'State',            type: 'text',  required: true,  ph: 'State', auto: 'address-level1' },
    { id: 'pin',       label: 'PIN code',         type: 'text',  required: true,  ph: '6-digit PIN', auto: 'postal-code', inputmode: 'numeric' },
    { id: 'notes',     label: 'Notes (if any)',   type: 'textarea', required: false, ph: 'Song link, gift message, special instructions…' },
  ];
  const CO_STORE = 'albumetics-customer';

  function buildCheckout() {
    if ($('#checkout')) return;
    const saved = loadCustomer();
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="co-overlay" id="coOverlay"></div>
      <div class="co" id="checkout" role="dialog" aria-modal="true" aria-label="Checkout">
        <div class="co__head">
          <h3>Shipping details</h3>
          <button class="cart__close" id="coClose" aria-label="Close">×</button>
        </div>
        <form class="co__body" id="coForm" novalidate>
          ${FIELDS.map((f) => {
            const req = f.required ? '<span class="co-req">*</span>' : '';
            const val = saved[f.id] ? ` value="${esc(saved[f.id])}"` : '';
            const ctrl = f.type === 'textarea'
              ? `<textarea id="co_${f.id}" rows="3" placeholder="${f.ph}">${saved[f.id] ? esc(saved[f.id]) : ''}</textarea>`
              : `<input id="co_${f.id}" type="${f.type}" placeholder="${f.ph}"${f.auto ? ` autocomplete="${f.auto}"` : ''}${f.inputmode ? ` inputmode="${f.inputmode}"` : ''}${val} />`;
            return `<div class="co-field${f.id === 'notes' || f.id === 'address1' || f.id === 'address2' ? ' co-field--full' : ''}" data-field="${f.id}">
                      <label for="co_${f.id}">${f.label} ${req}</label>${ctrl}
                    </div>`;
          }).join('')}
        </form>
        <div class="co__foot">
          <div class="cart__row"><span>Total</span><span id="coTotal">₹0</span></div>
          <button class="btn btn--solid btn--block" id="coSubmit">Place order</button>
          <p class="cart__note">You'll get a confirmation. We pack &amp; ship in 2–3 days.</p>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    $('#coClose').addEventListener('click', closeCheckout);
    $('#coOverlay').addEventListener('click', closeCheckout);
    $('#coSubmit').addEventListener('click', submitOrder);
    $('#coForm').addEventListener('submit', (e) => { e.preventDefault(); submitOrder(); });
  }

  function openCheckout() {
    buildCheckout();
    $('#coTotal').textContent = A.fmt(totals().sum);
    $('#checkout').classList.add('open');
    $('#coOverlay').classList.add('open');
    setTimeout(() => { const n = $('#co_name'); if (n) n.focus(); }, 350);
  }
  function closeCheckout() {
    const co = $('#checkout'); if (!co) return;
    co.classList.remove('open');
    $('#coOverlay').classList.remove('open');
  }

  function loadCustomer() { try { return JSON.parse(localStorage.getItem(CO_STORE)) || {}; } catch { return {}; } }

  function collect() {
    const data = {};
    FIELDS.forEach((f) => { const el = $('#co_' + f.id); data[f.id] = el ? el.value.trim() : ''; });
    return data;
  }

  function validate(data) {
    let firstBad = null;
    document.querySelectorAll('.co-field').forEach((el) => el.classList.remove('co-field--error'));
    for (const f of FIELDS) {
      const fieldEl = document.querySelector(`.co-field[data-field="${f.id}"]`);
      let bad = false;
      if (f.required && !data[f.id]) bad = true;
      if (f.id === 'email' && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) bad = true;
      if (f.id === 'phone' && data.phone && data.phone.replace(/\D/g, '').length < 7) bad = true;
      if (f.id === 'pin' && data.pin && !/^\d{4,8}$/.test(data.pin.replace(/\s/g, ''))) bad = true;
      if (bad) { fieldEl.classList.add('co-field--error'); if (!firstBad) firstBad = fieldEl; }
    }
    if (firstBad) { firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' }); const inp = firstBad.querySelector('input,textarea'); if (inp) inp.focus(); }
    return !firstBad;
  }

  function orderLines() {
    const lines = [];
    for (const [key, q] of Object.entries(state.items)) {
      const { id, version } = parse(key); const p = A.find(id); if (!p) continue;
      lines.push(`• ${p.name} (${(A.VERSIONS[version] || {}).label || version}) ×${q} — ${A.fmt(p.price * q)}`);
    }
    state.customs.forEach((c) => {
      lines.push(`• CUSTOM: "${c.name}" — ${c.artist} (${(A.VERSIONS[c.version] || {}).label || c.version}) ×${c.qty} — ${A.fmt(A.CUSTOM.price * c.qty)}`);
    });
    return lines;
  }

  function buildMessage(data, sum, count) {
    const L = [];
    L.push('🧲 NEW ALBUMETICS ORDER');
    L.push('');
    L.push(`Items (${count}):`);
    L.push(...orderLines());
    if (state.customs.length) L.push('(custom art images are in the browser — buyer will share/confirm)');
    L.push('');
    L.push(`TOTAL: ${A.fmt(sum)}`);
    L.push('');
    L.push('— Customer —');
    L.push(`Name: ${data.name}`);
    L.push(`Phone: ${data.phone}`);
    L.push(`Email: ${data.email}`);
    if (data.instagram) L.push(`Instagram: ${data.instagram}`);
    L.push('');
    L.push('— Ship to —');
    L.push(data.address1);
    if (data.address2) L.push(data.address2);
    L.push(`${data.city}, ${data.state} ${data.pin}`);
    if (data.notes) { L.push(''); L.push(`Notes: ${data.notes}`); }
    return L.join('\n');
  }

  async function submitOrder() {
    const { count, sum } = totals();
    if (!count) { toast('Your cart is empty'); return; }
    const data = collect();
    if (!validate(data)) { toast('Please fill the required fields'); return; }

    localStorage.setItem(CO_STORE, JSON.stringify(data));
    const btn = $('#coSubmit');
    btn.disabled = true; btn.textContent = 'Placing order…';

    const message = buildMessage(data, sum, count);
    let ok = false;
    try {
      const res = await fetch(NTFY_URL, {
        method: 'POST',
        headers: { 'Title': `New order · ${data.name} · ${A.fmt(sum)}`, 'Tags': 'shopping_cart,magnet', 'Priority': 'high' },
        body: message,
      });
      ok = res.ok;
    } catch (err) { ok = false; }

    btn.disabled = false; btn.textContent = 'Place order';

    if (ok) {
      toast(`Order placed · ${A.fmt(sum)} 🎉`);
      state = { items: {}, customs: [] }; save(); render(); bump();
      closeCheckout(); setTimeout(close, 600);
    } else {
      toast("Couldn't send the order — please try again");
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { add, addCustom, open, close, toast };
})();
