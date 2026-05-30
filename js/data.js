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

  // Product specs / trust badges shown on every product page
  const SPECS = [
    {
      title: 'Anti-Metal NFC Technology',
      text: 'Seamlessly triggers Spotify / Apple Music links even on metal surfaces like refrigerators or PC cabinets.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1"/></svg>',
    },
    {
      title: '4mm Premium Acrylic',
      text: 'A solid, heavy-duty build with a luxury glass-like finish — not just a thin magnet.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="11" height="11" rx="2"/><rect x="9.5" y="9.5" width="11" height="11" rx="2"/></svg>',
    },
    {
      title: '250 GSM High-Gloss Paper',
      text: 'Lab-grade premium photo paper for deep blacks and vibrant album art colors.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
    },
    {
      title: 'Ultra-HD Print Mastery',
      text: '300+ DPI high-definition printing that captures every detail of the artwork.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="M5 16.5l3.5-3.5 3 3 3-3L20 17"/></svg>',
    },
    {
      title: 'Secure Checkout',
      text: 'Encrypted payment gateway for a 100% safe and worry-free shopping experience.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="6.5" y1="14.5" x2="9.5" y2="14.5"/></svg>',
    },
    {
      title: 'Prepaid Privilege',
      text: 'Faster processing and priority dispatch on all prepaid orders.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8.5l-9-5-9 5 9 5 9-5z"/><path d="M3 8.5v7l9 5 9-5v-7"/><line x1="12" y1="13.5" x2="12" y2="20.5"/></svg>',
    },
  ];

  // Frequently asked questions — accordion on every product page.
  // Each answer is an array of paragraphs.
  const FAQS = [
    {
      q: 'Are these magnets compatible with my phone?',
      a: [
        'Most modern smartphones are equipped with NFC technology.',
        'iOS: all models from iPhone 7 and newer.',
        'Android: 95% of smartphones support NFC. To be sure, go to Settings and type "NFC" in the search bar — if a toggle appears, your phone is compatible.',
      ],
    },
    {
      q: 'What is Anti-Metal NFC technology?',
      a: [
        "Anti-Metal NFC is a specialised technology that lets our magnets work perfectly on metal surfaces like refrigerators, CPUs and filing cabinets. Traditional NFC chips don't function well on metal, but our advanced chips are designed specifically to overcome this limitation.",
      ],
    },
    {
      q: 'Do I need a specific app to use the magnet?',
      a: ['No app is required. Just tap your NFC-enabled smartphone and it will instantly open the link.'],
    },
    {
      q: 'How durable are these magnets?',
      a: ["Our magnets are built to last. Each one features premium 4mm-thick acrylic with high-quality 250 GSM paper printing, and they're completely waterproof."],
    },
    {
      q: 'How do I check for NFC on my device?',
      a: [
        'Android: go to Settings and type "NFC" in the search bar. If a toggle appears, your phone is compatible.',
        'iOS: if you have an iPhone 7 or newer, NFC is already built in and always active.',
      ],
    },
    {
      q: 'Does it need a battery or charging?',
      a: ['Zero batteries, zero charging! Our magnets use passive NFC technology that draws a tiny bit of power from your phone only when you tap it.'],
    },
    {
      q: 'Is the magnet strong enough? Will it slide down?',
      a: ['We use industrial-grade neodymium magnets. Despite the 4mm thickness of the acrylic, the grip is rock solid.'],
    },
    {
      q: 'Is shipping free?',
      a: ['Shipping is completely free when you buy 2 or more products.'],
    },
    {
      q: 'How long will it take to reach me?',
      a: ['We deliver across India within 4 to 7 business days. You will receive a tracking ID as soon as your order is on its way.'],
    },
    {
      q: 'What if I receive a damaged or broken product?',
      a: ['Your satisfaction is our priority! If your magnet arrives damaged, we will send you a 100% free replacement. Note: an unboxing video is mandatory.'],
    },
    {
      q: 'How do I report a problem with my order?',
      a: ['Please reach out to us within 48 hours of delivery. Email us at albummagnets@gmail.com or DM us on Instagram with your Order ID.'],
    },
    {
      q: "What if the NFC isn't scanning?",
      a: ["Don't worry — every single magnet we ship undergoes 3 to 4 rounds of strict testing to ensure the NFC is working perfectly. If it's not scanning instantly, it's usually a small settings or placement issue that's easily solved by reading the \"How to use your NFC magnet\" guide mentioned above."],
    },
  ];

  return { PRODUCTS, VERSIONS, DEFAULT_VERSION, ICONS, SPECS, FAQS, fmt, find, shade, textOn };
})();
