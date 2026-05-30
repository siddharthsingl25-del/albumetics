/* ============================================================
   Albumetics — Customize page
   Upload album art + song/album name + artist, live preview,
   then add the made-to-order custom magnet to the cart.
   ============================================================ */
(function () {
  'use strict';
  const A = window.ALB;
  const root = document.getElementById('custom');

  let version = A.DEFAULT_VERSION;
  let qty = 1;
  let imageData = '';

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
          <figure class="pola" id="pola">
            <div class="pola__img" id="polaImg">
              <span class="pola__placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                Your album art
              </span>
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
        <p class="pdp__desc reveal">Upload your own album art, add the song and the artist, and we'll print a one-of-a-kind NFC magnet — encoded to your song.</p>

        <div class="pdp__block reveal">
          <span class="pdp__label">1 · Upload your album art</span>
          <label class="dropzone" id="dropzone">
            <input type="file" id="fileInput" accept="image/*" hidden />
            <span class="dropzone__inner" id="dropInner">
              <span class="dropzone__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>
              </span>
              <span class="dropzone__text"><b>Click to upload</b> or drag an image here</span>
              <span class="dropzone__hint">JPG or PNG · square works best</span>
            </span>
          </label>
        </div>

        <div class="pdp__block reveal">
          <span class="pdp__label">2 · Song / album details</span>
          <div class="field">
            <label for="songName">Song / album name</label>
            <input type="text" id="songName" maxlength="40" placeholder="e.g. Midnight City" autocomplete="off" />
          </div>
          <div class="field">
            <label for="artistName">Artist name</label>
            <input type="text" id="artistName" maxlength="40" placeholder="e.g. M83" autocomplete="off" />
          </div>
          <p class="field__note">* Please ensure the spelling is correct. We print exactly what you provide.</p>
        </div>

        <div class="pdp__block reveal">
          <span class="pdp__label">3 · Choose your edition</span>
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

        <p class="pdp__meta reveal">Made to order · ships in 2–3 days · free shipping over $60</p>
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

  /* ---- elements ---- */
  const polaImg = document.getElementById('polaImg');
  const polaName = document.getElementById('polaName');
  const polaArtist = document.getElementById('polaArtist');
  const fileInput = document.getElementById('fileInput');
  const dropzone = document.getElementById('dropzone');
  const songName = document.getElementById('songName');
  const artistName = document.getElementById('artistName');
  const verGroup = document.getElementById('verGroup');
  const verHint = document.getElementById('verHint');
  const qtyVal = document.getElementById('qtyVal');
  const addBtn = document.getElementById('addBtn');

  /* ---- live text preview ---- */
  songName.addEventListener('input', () => {
    polaName.textContent = songName.value.trim() || 'Song / album name';
  });
  artistName.addEventListener('input', () => {
    polaArtist.textContent = artistName.value.trim() || 'Artist name';
  });

  /* ---- image upload + downscale ---- */
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { window.Cart.toast('Please choose an image file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        imageData = canvas.toDataURL('image/jpeg', 0.85);
        polaImg.style.backgroundImage = `url('${imageData}')`;
        polaImg.classList.add('has-img');
        dropzone.classList.add('has-img');
        document.getElementById('dropInner').innerHTML =
          '<span class="dropzone__text"><b>Image added.</b> Click to replace</span>';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  ['dragover', 'dragenter'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('drag'); }));
  dropzone.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });

  /* ---- version + qty ---- */
  function syncVersion() {
    verGroup.querySelectorAll('.ver').forEach((b) => b.classList.toggle('selected', b.dataset.version === version));
    verHint.textContent = `Your chip will be encoded to ${A.VERSIONS[version].label}.`;
  }
  verGroup.addEventListener('click', (e) => { const b = e.target.closest('.ver'); if (b) { version = b.dataset.version; syncVersion(); } });
  document.getElementById('qtyDec').addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyVal.textContent = qty; });
  document.getElementById('qtyInc').addEventListener('click', () => { qty = Math.min(99, qty + 1); qtyVal.textContent = qty; });

  /* ---- validate + add ---- */
  function flash(el) {
    el.classList.remove('field--error'); void el.offsetWidth; el.classList.add('field--error');
  }
  addBtn.addEventListener('click', () => {
    const name = songName.value.trim();
    const artist = artistName.value.trim();
    if (!imageData) { window.Cart.toast('Please upload your album art'); dropzone.classList.add('field--error'); return; }
    if (!name) { window.Cart.toast('Please add the song / album name'); flash(songName.closest('.field')); return; }
    if (!artist) { window.Cart.toast('Please add the artist name'); flash(artistName.closest('.field')); return; }
    window.Cart.addCustom({ name, artist, version, image: imageData }, qty);
    window.Cart.open();
  });

  syncVersion();
})();
