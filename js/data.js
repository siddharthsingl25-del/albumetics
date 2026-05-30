/* ============================================================
   Albumetics — shared data & helpers (window.ALB)
   ============================================================ */
window.ALB = (function () {
  'use strict';

  const PRODUCTS = [
    {
      id: 'classic-black', name: 'The Classic', price: 24, color: '#0a0a0a',
      desc: 'Matte black, white waveform. The original Albumetics magnet.',
      long: 'The one that started it all. A deep matte-black face with a crisp white waveform, finished with a debossed tap mark. Understated on any fridge, unmistakable up close.',
      features: ['Premium matte finish', 'Strong neodymium hold', 'Made to order in 2–3 days'],
    },
    {
      id: 'pure-white', name: 'Pure', price: 24, color: '#1c1c1c',
      desc: 'Clean white face with a debossed tap mark. Minimal, always.',
      long: 'For the minimalists. A clean off-white face with a softly debossed tap mark — no noise, just the song waiting underneath.',
      features: ['Soft-touch white shell', 'Strong neodymium hold', 'Made to order in 2–3 days'],
    },
    {
      id: 'sunset', name: 'Sunset', price: 28, color: '#ff5a3c',
      desc: 'A warm gradient for the songs that feel like golden hour.',
      long: 'A warm orange-to-coral gradient for the tracks that feel like golden hour. The kind of song you want to see every time you reach for the door.',
      features: ['Hand-blended gradient', 'Strong neodymium hold', 'Made to order in 2–3 days'],
    },
    {
      id: 'midnight', name: 'Midnight', price: 28, color: '#1f3a8a',
      desc: 'Deep blue, late-night listens. For the 2am playlist.',
      long: 'Deep midnight blue for late-night listens and the 2am playlist. Quiet, moody, and built to glow against a bright kitchen.',
      features: ['Rich pigment shell', 'Strong neodymium hold', 'Made to order in 2–3 days'],
    },
    {
      id: 'forest', name: 'Forest', price: 28, color: '#1f5d3a',
      desc: 'Earthy green tones for acoustic mornings and slow songs.',
      long: 'Earthy forest green for acoustic mornings and slow songs. Calm, grounded, and a little bit alive.',
      features: ['Earth-tone finish', 'Strong neodymium hold', 'Made to order in 2–3 days'],
    },
    {
      id: 'duo-pack', name: 'The Duo Pack', price: 44, color: '#0a0a0a',
      desc: 'Two magnets, two songs. Keep one, gift one. Best value.',
      long: 'Two magnets, two songs, one box. Keep one and gift the other — or encode a his-and-hers pair. Our best value, and our most-gifted set.',
      features: ['Two magnets, two songs', 'Mix any two colours on request', 'Made to order in 2–3 days'],
    },
  ];

  // Two editions — the NFC chip is encoded to one streaming service.
  const VERSIONS = {
    spotify: { id: 'spotify', label: 'Spotify',     note: 'Opens in the Spotify app',     accent: '#1DB954' },
    apple:   { id: 'apple',   label: 'Apple Music', note: 'Opens in the Apple Music app', accent: '#FA243C' },
  };
  const DEFAULT_VERSION = 'spotify';

  const fmt = (n) => '$' + n;
  const find = (id) => PRODUCTS.find((p) => p.id === id);

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
  // Streaming service glyphs (inline SVG strings)
  const ICONS = {
    spotify: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.59 14.43a.62.62 0 01-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 11-.28-1.21c3.82-.88 7.1-.51 9.72 1.09.3.18.39.57.21.87zm1.22-2.72a.78.78 0 01-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 11-.45-1.49c3.63-1.1 8.15-.56 11.24 1.33.37.22.49.7.25 1.07zm.11-2.84C14.8 8.16 9.3 7.97 6.2 8.91a.93.93 0 11-.54-1.78c3.56-1.08 9.64-.87 13.45 1.39a.93.93 0 11-.95 1.6z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm3.2 5.07v6.9a2.06 2.06 0 01-1.46 2 2.04 2.04 0 11-1.4-3.83c.36 0 .7.09 1 .25V8.86l-3.93.86v5.06a2.06 2.06 0 01-1.46 2 2.04 2.04 0 11-1.4-3.83c.36 0 .7.09 1 .25V8.2c0-.38.26-.7.63-.78l4.93-1.08a.66.66 0 01.8.64z"/></svg>',
  };

  return { PRODUCTS, VERSIONS, DEFAULT_VERSION, ICONS, fmt, find, shade, textOn };
})();
