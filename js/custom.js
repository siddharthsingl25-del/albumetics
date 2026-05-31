/* ============================================================
   Albumetics — Customize page
   Song/album name + artist (singer) only, with live preview,
   then add the made-to-order custom magnet to the cart.
   ============================================================ */
(function () {
  'use strict';
  const A = window.ALB;
  const root = document.getElementById('custom');

  let version = A.DEFAULT_VERSION;
  let qty = 1;

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
          <figure class="pola pola--text" id="pola">
            <div class="pola__img">
              <div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
            </div>
            <figcaption class="pola__cap">
              <span class="pola__name" id="polaName">Song / album name</span>
              <span class="pola__artist" id="polaArtist">Artist name</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <div class="pdp__info">
        <p class="pdp__kicker reveal">Make it yours</p>
        <h1 class="pdp__name reveal">Custom Magnet</h1>
        <div class="pdp__price reveal">${A.fmt(A.CUSTOM.price)}</div>
        <p class="pdp__desc reveal">Tell us the song and the singer, and we'll craft a one-of-a-kind NFC magnet — encoded to your song.</p>

        <div class="pdp__block reveal">
          <span class="pdp__label">1 · Song / album details</span>
          <div class="field">
            <label for="songName">Song / album name</label>
            <input type="text" id="songName" maxlength="40" placeholder="e.g. Midnight City" autocomplete="off" />
          </div>
          <div class="field">
            <label for="artistName">Artist / singer name</label>
            <input type="text" id="artistName" maxlength="40" placeholder="e.g. M83" autocomplete="off" />
          </div>
          <p class="field__note">* Please ensure the spelling is correct. We print exactly what you provide.</p>
        </div>

        <div class="pdp__block reveal">
          <span class="pdp__label">2 · Choose your edition</span>
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
          <button class="btn btn--solid btn--lg pdp__add" id="addBtn">Add to cart · ${A.fmt(A.CUSTOM.price)}</button>
        </div>

        <p class="pdp__meta reveal">Made to order · ships in 2–3 days · free shipping over ₹999</p>
      </div>
    </div>

    <section class="specs">
      <h2 class="specs__title reveal">Built different.</h2>
      <div class="specs__grid">
        ${A.SPECS.map((s, i) => `
          <article class="spec reveal" data-delay="${i % 3}">
            <span class="spec__icon">${s.icon}</span>
            <h3 class="spec__title">${s.title}</h3>
            <p class="spec__text">${s.text}</p>
          </article>`).join('')}
      </div>
    </section>`;

  root.querySelectorAll('.reveal').forEach((el) => window.UI.observe(el));

  const polaName = document.getElementById('polaName');
  const polaArtist = document.getElementById('polaArtist');
  const songName = document.getElementById('songName');
  const artistName = document.getElementById('artistName');
  const verGroup = document.getElementById('verGroup');
  const verHint = document.getElementById('verHint');
  const qtyVal = document.getElementById('qtyVal');
  const addBtn = document.getElementById('addBtn');

  /* live text preview */
  songName.addEventListener('input', () => {
    polaName.textContent = songName.value.trim() || 'Song / album name';
  });
  artistName.addEventListener('input', () => {
    polaArtist.textContent = artistName.value.trim() || 'Artist name';
  });

  /* version + qty */
  function syncVersion() {
    verGroup.querySelectorAll('.ver').forEach((b) => b.classList.toggle('selected', b.dataset.version === version));
    verHint.textContent = `Your chip will be encoded to ${A.VERSIONS[version].label}.`;
  }
  verGroup.addEventListener('click', (e) => { const b = e.target.closest('.ver'); if (b) { version = b.dataset.version; syncVersion(); } });
  document.getElementById('qtyDec').addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyVal.textContent = qty; });
  document.getElementById('qtyInc').addEventListener('click', () => { qty = Math.min(99, qty + 1); qtyVal.textContent = qty; });

  /* validate + add */
  function flash(el) { el.classList.remove('field--error'); void el.offsetWidth; el.classList.add('field--error'); }
  addBtn.addEventListener('click', () => {
    const name = songName.value.trim();
    const artist = artistName.value.trim();
    if (!name) { window.Cart.toast('Please add the song / album name'); flash(songName.closest('.field')); return; }
    if (!artist) { window.Cart.toast('Please add the artist / singer name'); flash(artistName.closest('.field')); return; }
    window.Cart.addCustom({ name, artist, version }, qty);
    window.Cart.open();
  });

  syncVersion();
})();
