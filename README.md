# Albumetics

**Tap. Play. Remember.** — an e-commerce site for NFC fridge magnets that play songs.
Tap a magnet with your phone and the track you love starts playing instantly. No app needed.

## Concept

- **Product:** premium fridge magnets with an embedded NFC chip encoded to a song link
  (Spotify / Apple Music / YouTube). Tap → the song opens and plays.
- **Brand feel:** clean, mostly white with restrained black accents.
- **Type:** [Ranade](https://www.fontshare.com/fonts/ranade) (loaded from the Fontshare CDN).

## Features

- Animated intro loader and word-by-word reveal headlines
- Custom blended cursor and parallax floating magnet (hover devices)
- Scroll-reveal sections, animated equaliser/NFC artwork, counters, marquee
- A working **shop** with product grid — each card opens a **product page**
- **Product detail page** (`product.html?id=…`) with a **Spotify / Apple Music edition** selector and quantity stepper
- **Customize page** (`custom.html`) — upload album art, add song + artist (with a live preview) for a made-to-order magnet
- A **cart drawer** with add / quantity / remove, live totals, and **checkout**. Each line remembers its edition (Spotify vs Apple Music)
- **Checkout** collects shipping details (name, phone, email, Instagram, address, city, state, PIN, notes) and **pushes the order to ntfy.sh** so you get a phone notification
- Cart persists in `localStorage`
- Fully responsive; respects `prefers-reduced-motion`

## Order notifications (ntfy)

Orders are sent as a push notification via [ntfy.sh](https://ntfy.sh) — no
backend or server needed.

**To receive orders:**
1. Install the **ntfy** app (Android / iOS) or open [ntfy.sh](https://ntfy.sh) in a browser.
2. Subscribe to the topic set in `js/cart.js` (`NTFY_TOPIC`).
3. Place a test order — a notification appears with the customer + items.

**Important:** change `NTFY_TOPIC` at the top of `js/cart.js` to your own
long, secret topic name. Anyone who knows the topic can read your orders, so
keep it private (don't reuse a guessable word). For stronger privacy you can
self-host ntfy or use an access-token-protected topic.

## Run it

It's a static site — no build step. Either open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html      Home / shop page
product.html    Product detail page (reads ?id=…)
css/style.css   All styling, animation and responsive rules
js/data.js      Product data, editions (Spotify/Apple Music) and helpers
js/ui.js        Shared UI: loader, cursor, header, scroll reveals
js/cart.js      Cart drawer + localStorage (variant-aware)
js/main.js      Home page: hero, pull-quote, counters, product grid
js/product.js   Product detail page logic + edition selector
```

## Customising

- **Products:** edit the `PRODUCTS` array in `js/data.js`
  (id, name, price, color, descriptions, features).
- **Editions:** the `VERSIONS` object in `js/data.js` defines the
  Spotify and Apple Music options.
- **Colours/spacing:** tweak the CSS custom properties in `:root` in `css/style.css`.
- **Copy:** edit the section text directly in `index.html`.
