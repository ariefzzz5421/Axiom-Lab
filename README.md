# AXIOM LAB

An experimental creative-coding laboratory for technical illustrations, interactive geometry, and motion on the web.

**Live 3D, not static mockups.** The first three studies are:

1. **Assembly** — Procedural mechanical plates, pin, and latch with an animated exploded view.
2. **Orbit** — Layered orbital rings and moving bodies.
3. **Signal** — A 25-node spatial network with interconnected edges.

## Stack

- Vite + React 19
- Three.js, React Three Fiber and Drei for actual interactive WebGL geometry
- CSS Grid, native CSS animations, small SVG technical drawings
- Lucide icons
- No Blender files, paid assets, third-party APIs, environment variables, or backend required

## Local development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

Import this GitHub repository in Vercel. The framework is **Vite**; use `npm run build` and `dist` as the output directory. No environment variables are required. Vercel will rebuild the site when the connected branch updates.

## How it works

- `src/App.jsx` provides the page, navigation, three study configurations, and slider controls.
- `src/components/TechnicalScene.jsx` builds geometry procedurally using Three.js and renders it with React Three Fiber. Mouse/touch drag rotates the camera; pinch or scroll zooms. Plate and pin movement uses time-based interpolation in `useFrame`.
- `src/styles.css` provides the technical editorial grid, typography, annotations, custom range input, and responsive layouts.

The interactive components render in the browser through WebGL. The illustration thumbnails are inline SVG. Graphics are original studies inspired by historical patent drawings and contemporary engineering editorial design, not copies of any existing site's assets.

## Extending the lab

Create another scene component in `TechnicalScene.jsx`, add its configuration in `EXPERIMENTS` in `App.jsx`, and add an SVG thumbnail in `BlueprintIcon`. Keep each experiment independent and make new controls explicit.

MIT licensed (see `LICENSE`).