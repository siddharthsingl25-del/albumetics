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
- A working **shop** with product grid
- A **cart drawer** with add / quantity / remove, live totals, and mock checkout
- Cart persists in `localStorage`
- Fully responsive; respects `prefers-reduced-motion`

## Run it

It's a static site — no build step. Either open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html      Markup for the single-page store
css/style.css   All styling, animation and responsive rules
js/main.js      Animation, product data, and cart logic
```

## Customising

- **Products:** edit the `PRODUCTS` array at the top of `js/main.js`
  (id, name, price, color, description).
- **Colours/spacing:** tweak the CSS custom properties in `:root` in `css/style.css`.
- **Copy:** edit the section text directly in `index.html`.
