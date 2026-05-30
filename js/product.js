/* ============================================================
   Albumetics — product detail page
   Reads ?id= , renders the magnet, and lets the buyer choose
   between the Spotify and Apple Music edition before adding.
   ============================================================ */
(function () {
  'use strict';
  const A = window.ALB;
  const root = document.getElementById('pdp');
  const params = new URLSearchParams(location.search);
  const product = A.find(params.get('id'));

  if (!product) {
    root.innerHTML = `
      <div class="pdp__missing">
        <h1>Magnet not found</h1>
        <p>We couldn't find that one. Let's get you back to the collection.</p>
        <a class="btn btn--solid" href="index.html#shop">Back to shop</a>
      </div>`;
    return;
  }

  document.title = `Albumetics — ${product.name}`;

  let version = A.DEFAULT_VERSION;
  let qty = 1;

  const waveBars = (n) => Array.from({ length: n }, () => '<i></i>').join('');
  const versionBtn = (key) => {
    const v = A.VERSIONS[key];
    return `
      <button class="ver" data-version="${key}" style="--accent:${v.accent}">
        <span class="ver__ico">${A.ICONS[key]}</span>
        <span class="ver__text">
          <span class="ver__label">${v.label}</span>
          <span class="ver__note">${v.note}</span>
        </span>
        <span class="ver__check" aria-hidden="true"></span>
      </button>`;
  };

  root.innerHTML = `
    <a class="pdp__back" href="index.html#shop"><span aria-hidden="true">←</span> Back to shop</a>
    <div class="pdp__grid">
      <div class="pdp__media reveal">
        <div class="pdp__stage">
          <div class="pdp__art" id="pdpArt"
               style="background:linear-gradient(145deg, ${product.color}, ${A.shade(product.color, -18)}); color:${A.textOn(product.color)}">
            <div class="pdp__rings"><i></i><i></i><i></i></div>
            <div class="wave">${waveBars(9)}</div>
            <span class="pdp__nfc">⌖ NFC</span>
          </div>
        </div>
      </div>

      <div class="pdp__info">
        <p class="pdp__kicker reveal">NFC song magnet</p>
        <h1 class="pdp__name reveal">${product.name}</h1>
        <div class="pdp__price reveal">${A.fmt(product.price)}</div>
        <p class="pdp__desc reveal">${product.long}</p>

        <ul class="pdp__features reveal">
          ${product.features.map((f) => `<li>${f}</li>`).join('')}
        </ul>

        <div class="pdp__block reveal">
          <span class="pdp__label">Choose your edition</span>
          <div class="ver-group" id="verGroup">
            ${versionBtn('spotify')}
            ${versionBtn('apple')}
          </div>
          <p class="pdp__hint" id="verHint"></p>
        </div>

        <div class="pdp__buy reveal">
          <div class="qty" aria-label="Quantity">
            <button id="qtyDec" aria-label="Decrease quantity">−</button>
            <span id="qtyVal">1</span>
            <button id="qtyInc" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn--solid btn--lg pdp__add" id="addBtn">Add to cart · ${A.fmt(product.price)}</button>
        </div>

        <p class="pdp__meta reveal">Made to order · ships in 2–3 days · free shipping over $60</p>
      </div>
    </div>`;

  root.querySelectorAll('.reveal').forEach((el) => window.UI.observe(el));

  const verGroup = document.getElementById('verGroup');
  const verHint = document.getElementById('verHint');
  const qtyVal = document.getElementById('qtyVal');
  const addBtn = document.getElementById('addBtn');

  function syncVersion() {
    verGroup.querySelectorAll('.ver').forEach((b) => {
      b.classList.toggle('selected', b.dataset.version === version);
    });
    verHint.textContent = `You'll get the ${A.VERSIONS[version].label} edition — the chip is encoded to ${A.VERSIONS[version].label}.`;
  }
  function syncQty() { qtyVal.textContent = qty; }

  verGroup.addEventListener('click', (e) => {
    const b = e.target.closest('.ver');
    if (!b) return;
    version = b.dataset.version;
    syncVersion();
  });
  document.getElementById('qtyDec').addEventListener('click', () => { qty = Math.max(1, qty - 1); syncQty(); });
  document.getElementById('qtyInc').addEventListener('click', () => { qty = Math.min(99, qty + 1); syncQty(); });

  addBtn.addEventListener('click', () => {
    window.Cart.add(product.id, version, qty);
    window.Cart.open();
  });

  syncVersion();
  syncQty();
})();
