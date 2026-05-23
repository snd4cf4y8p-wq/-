# mo.co Hype Board

Standalone multilingual `mo.co` mini-site.

Languages:

- English
- Deutsch
- Francais

## Local run

```bash
npm install
npm start
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/de/`
- `http://localhost:3000/fr/`

## Deploy to Render

This folder can be deployed as its own Render service.

### Blueprint

Point Render at this repo and use the blueprint in:

- [`render.yaml`](./render.yaml)

The blueprint already sets:

- `rootDir: mo`
- `buildCommand: npm install`
- `startCommand: npm start`

Set:

- `PUBLIC_SITE_URL=https://your-new-mo-domain.onrender.com`

## Structure

- [`index.html`](./index.html): English landing page
- [`de/index.html`](./de/index.html): German landing page
- [`fr/index.html`](./fr/index.html): French landing page
- [`styles.css`](./styles.css): shared visual styles
- [`app.js`](./app.js): mission tab interactions
- [`assets`](./assets): official `mo.co` images used by the site
