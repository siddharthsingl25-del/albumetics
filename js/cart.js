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
  const NTFY_TOPIC = 'albumetics-orders-ama961fsmxtl5e5j';
  const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;

  /* ============================================================
     UPI PAYMENT — buyers pay here, then upload a screenshot.
     Change these to your own UPI details if they ever change.
     ============================================================ */
  const UPI_ID = 'albumetics@okaxis';
  const UPI_NAME = 'Abhijot Singh';
  const UPI_BANK = 'Punjab National Bank 5527';

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
    state.customs.push({ uid, name: data.name, artist: data.artist, version: data.version || A.DEFAULT_VERSION, qty });
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
          <div class="cart-item__thumb" style="background:linear-gradient(145deg, #0a0a0a, #2a2a2a); color:#fff">
            <div class="wave"><i></i><i></i><i></i><i></i></div>
          </div>
          <div class="cart-item__info">
            <div class="cart-item__name">${esc(c.name)}</div>
            <div class="cart-item__by">by ${esc(c.artist)}</div>
            <div class="cart-item__edition"><span class="svc-ico">${A.ICONS[c.version] || ''}</span>${v.label} · Custom</div>
            <div class="cart-item__price">${A.fmt(A.CUSTOM.price)}</div>
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
          <h3 id="coHead">Shipping details</h3>
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
        <div class="co__pay" id="coPay" hidden>
          <p class="co-pay__amount">Pay <strong id="coPayAmt">₹0</strong></p>
          <div class="co-qr" id="coQr"></div>
          <a class="btn btn--solid btn--block co-pay__app" id="coPayApp" href="#">Pay in UPI app</a>
          <div class="co-upi">
            <div class="co-upi__row"><span>UPI ID</span><button type="button" id="coUpiCopy" class="co-upi__copy">${UPI_ID} <span aria-hidden="true">⧉</span></button></div>
            <div class="co-upi__row"><span>Name</span><b>${esc(UPI_NAME)}</b></div>
            <div class="co-upi__row"><span>Bank</span><b>${esc(UPI_BANK)}</b></div>
          </div>
          <p class="co-pay__scan">Scan to pay with any UPI app (GPay, PhonePe, Paytm…)</p>

          <div class="co-field co-field--full" data-field="screenshot">
            <label>Upload payment screenshot <span class="co-req">*</span></label>
            <label class="shot" id="shotZone">
              <input type="file" id="shotInput" accept="image/png,image/jpeg" hidden />
              <span class="shot__inner" id="shotInner">
                <span class="shot__ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>
                </span>
                <span class="shot__text"><b>Click to upload</b> your payment screenshot</span>
                <span class="shot__hint">JPG or PNG</span>
              </span>
            </label>
          </div>

          <div class="co-note-box">
            <p><b>How confirmation works</b></p>
            <p>1 · Pay the exact order amount using the QR / UPI ID above.</p>
            <p>2 · Upload the payment screenshot here and place your order.</p>
            <p>3 · Once we receive &amp; verify your payment, your order is <b>confirmed within 24 hours</b>.</p>
            <p>4 · Dispatched within a few days of confirmation · delivery in <b>5–7 days</b>.</p>
          </div>
        </div>

        <div class="co__foot">
          <div class="cart__row"><span>Total</span><span id="coTotal">₹0</span></div>
          <button class="btn btn--solid btn--block" id="coNext">Continue to payment</button>
          <button class="btn btn--solid btn--block" id="coSubmit" hidden>Place order</button>
          <button class="btn btn--ghost btn--block" id="coBack" hidden>← Back to details</button>
          <p class="cart__note" id="coFootNote">Next: pay by UPI &amp; upload the screenshot.</p>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    $('#coClose').addEventListener('click', closeCheckout);
    $('#coOverlay').addEventListener('click', closeCheckout);
    $('#coNext').addEventListener('click', goToPayment);
    $('#coBack').addEventListener('click', backToDetails);
    $('#coSubmit').addEventListener('click', submitOrder);
    $('#coForm').addEventListener('submit', (e) => { e.preventDefault(); goToPayment(); });

    // UPI ID copy
    $('#coUpiCopy').addEventListener('click', () => {
      navigator.clipboard && navigator.clipboard.writeText(UPI_ID);
      toast('UPI ID copied');
    });

    // screenshot upload
    const shotInput = $('#shotInput');
    const shotZone = $('#shotZone');
    shotInput.addEventListener('change', (e) => handleShot(e.target.files[0]));
    ['dragover', 'dragenter'].forEach((ev) => shotZone.addEventListener(ev, (e) => { e.preventDefault(); shotZone.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => shotZone.addEventListener(ev, (e) => { e.preventDefault(); shotZone.classList.remove('drag'); }));
    shotZone.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) handleShot(e.dataTransfer.files[0]); });
  }

  let payShot = '';   // payment screenshot as data URL

  function upiLink(amount) {
    const p = new URLSearchParams({ pa: UPI_ID, pn: UPI_NAME, am: String(amount), cu: 'INR', tn: 'Albumetics order' });
    return 'upi://pay?' + p.toString();
  }

  function goToPayment() {
    const data = collect();
    if (!validate(data)) { toast('Please fill the required fields'); return; }
    localStorage.setItem(CO_STORE, JSON.stringify(data));

    const sum = totals().sum;
    const link = upiLink(sum);
    $('#coPayAmt').textContent = A.fmt(sum);
    $('#coPayApp').href = link;
    $('#coQr').innerHTML = `<img alt="Scan to pay ${A.fmt(sum)}" width="220" height="220"
      src="https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=0&data=${encodeURIComponent(link)}" />`;

    $('#coForm').hidden = true;
    $('#coPay').hidden = false;
    $('#coHead').textContent = 'Pay & confirm';
    $('#coNext').hidden = true;
    $('#coSubmit').hidden = false;
    $('#coBack').hidden = false;
    $('#coFootNote').textContent = 'We confirm within 24 hrs of receiving payment.';
    $('#checkout').scrollTop = 0;
  }

  function backToDetails() {
    const co = $('#checkout'); if (!co) return;
    const done = co.querySelector('.co-done'); if (done) done.hidden = true;
    co.querySelector('.co__body').hidden = false;
    const foot = co.querySelector('.co__foot'); if (foot) foot.hidden = false;
    $('#coPay').hidden = true;
    $('#coForm').hidden = false;
    $('#coHead').textContent = 'Shipping details';
    $('#coNext').hidden = false;
    $('#coSubmit').hidden = true;
    $('#coBack').hidden = true;
    $('#coFootNote').textContent = 'Next: pay by UPI & upload the screenshot.';
    co.scrollTop = 0;
  }

  function handleShot(file) {
    if (!file || !/^image\/(png|jpeg)$/.test(file.type)) { toast('Please upload a JPG or PNG'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        payShot = canvas.toDataURL('image/jpeg', 0.8);
        $('#shotInner').innerHTML = `<span class="shot__preview" style="background-image:url('${payShot}')"></span><span class="shot__text"><b>Screenshot added.</b> Click to replace</span>`;
        $('#shotZone').classList.add('has-img');
        const fld = document.querySelector('.co-field[data-field="screenshot"]');
        if (fld) fld.classList.remove('co-field--error');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function openCheckout() {
    buildCheckout();
    payShot = '';
    backToDetails();
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

  function dataURLtoBlob(dataURL) {
    const [meta, b64] = dataURL.split(',');
    const mime = (meta.match(/:(.*?);/) || [])[1] || 'image/jpeg';
    const bin = atob(b64); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function submitOrder() {
    const { count, sum } = totals();
    if (!count) { toast('Your cart is empty'); return; }
    const data = collect();
    if (!validate(data)) { backToDetails(); toast('Please fill the required fields'); return; }

    if (!payShot) {
      toast('Please upload your payment screenshot');
      const fld = document.querySelector('.co-field[data-field="screenshot"]');
      if (fld) { fld.classList.add('co-field--error'); fld.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      return;
    }

    localStorage.setItem(CO_STORE, JSON.stringify(data));
    const btn = $('#coSubmit');
    btn.disabled = true; btn.textContent = 'Placing order…';

    const message = buildMessage(data, sum, count);
    // HTTP headers must be Latin-1 only — strip anything else (₹, emoji, etc.)
    const asciiName = data.name.replace(/[^\x20-\x7E]/g, '').trim() || 'Customer';
    const title = `New order - ${asciiName} - Rs ${sum}`;
    let ok = false;
    try {
      // 1) order details as a text notification
      const res = await fetch(NTFY_URL, {
        method: 'POST',
        headers: { 'Title': title, 'Tags': 'shopping_cart', 'Priority': 'high' },
        body: message,
      });
      ok = res.ok;
      // 2) the payment screenshot as an attachment
      if (ok && payShot) {
        await fetch(NTFY_URL, {
          method: 'PUT',
          headers: {
            'Title': `Payment screenshot - ${asciiName} - Rs ${sum}`,
            'Filename': 'payment.jpg',
            'Tags': 'moneybag',
          },
          body: dataURLtoBlob(payShot),
        });
      }
    } catch (err) {
      console.error('ntfy order failed:', err);
      ok = false;
    }

    btn.disabled = false; btn.textContent = 'Place order';

    if (ok) {
      showConfirmation(sum);
      state = { items: {}, customs: [] }; save(); render(); bump();
      payShot = '';
    } else {
      toast("Couldn't send the order — please try again");
    }
  }

  function showConfirmation(sum) {
    const co = $('#checkout');
    co.querySelector('.co__body').hidden = true;
    $('#coPay').hidden = true;
    const foot = co.querySelector('.co__foot'); if (foot) foot.hidden = true;
    $('#coHead').textContent = 'Order received';
    let done = co.querySelector('.co-done');
    if (!done) {
      done = document.createElement('div');
      done.className = 'co-done';
      co.appendChild(done);
    }
    done.hidden = false;
    done.innerHTML = `
      <div class="co-done__tick">✓</div>
      <h4>Thank you! Payment screenshot received.</h4>
      <p>We'll verify your payment and <b>confirm your order within 24 hours</b>.</p>
      <p>Your magnets are dispatched within a few days of confirmation, and reach you in <b>5–7 days</b>.</p>
      <p class="co-done__total">Order total · ${A.fmt(sum)}</p>
      <button class="btn btn--solid btn--block" id="coDoneClose">Done</button>`;
    $('#coDoneClose').addEventListener('click', () => { closeCheckout(); setTimeout(close, 400); });
    co.scrollTop = 0;
  }

  document.addEventListener('DOMContentLoaded', init);
  return { add, addCustom, open, close, toast };
})();
