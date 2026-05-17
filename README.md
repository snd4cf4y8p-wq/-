# Minecraft For Beginners

Three-language Minecraft beginner guide site for Europe:

- English
- Deutsch
- Francais

The site is a lightweight Node.js app with server-rendered guide pages and local Minecraft-style asset files.

## Local run

Requirements:

- Node.js 24

Commands:

```bash
npm install
npm start
```

Then open:

- `http://localhost:3000/en/`
- `http://localhost:3000/de/`
- `http://localhost:3000/fr/`

## Deploy to Render

This repo is already prepared for Render deployment.

### Option 1: Render Blueprint

1. Push this project to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Connect the GitHub repository.
4. Render will read [`render.yaml`](./render.yaml) automatically.
5. Wait for the deploy to finish.

### Option 2: Manual Web Service

Use these settings:

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

Recommended environment:

- `NODE_VERSION=24.14.1`

## GitHub upload

Suggested quick flow:

```bash
git init
git add .
git commit -m "Initial Minecraft For Beginners site"
```

Then create a GitHub repo and push:

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Project structure

- [`server.mjs`](./server.mjs): server, routes, guide content, simulator markup
- [`public/styles.css`](./public/styles.css): site styles
- [`public/crafting-sim.js`](./public/crafting-sim.js): crafting and furnace simulator logic
- [`public/assets/minecraft`](./public/assets/minecraft): local Minecraft-style textures/icons
