# Sion Ng — The Creative Workbench

A public Traditional Chinese portfolio combining Sion Ng's CV, commercial multimedia work and 12 public GitHub projects, built with Three.js and Vite.

**Website:** https://sion-rgb.github.io/sion-portfolio/

## Experience

- Full-screen creative workbench with an original machined optical assembly, aperture blades, engraved dial, brushed metal and studio lighting.
- Four scroll-driven scenes: the workbench, framing a story, motion production and interactive exploration. Pointer/touch and keyboard rotation, lens disassembly and pause controls share one state.
- Animated CSS/SVG depth layers preserve the scroll story and interaction when WebGL is unavailable or its context is lost. GPU environment maps rebuild when the context returns.
- Large commercial case studies with accessible native dialogs and source links.
- Three featured project views and an expandable index of 12 curated public projects, with game, tool and content filters.
- Professional experience, education, creative tools and contact links.
- Original CV and visual portfolio PDF downloads.
- Responsive layouts and reduced-motion support. Animation pauses when the page is hidden or the story leaves the viewport.

## Develop

Node.js 24 is recommended. Versions are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Local URLs use `/sion-portfolio/`, matching the GitHub Pages deployment base path. If the repository is renamed or deployed elsewhere, update `vite.config.js`, canonical/OG URLs, `robots.txt` and `sitemap.xml`.

## Content and attribution

Content was reviewed on **6 October 2026**:

- `Sion_Ng_Premium_Executive_CV.pdf`: experience, education, contact information and reported YouTube metrics.
- User-provided Visual Portfolio PDF: portrait, commercial work images and role descriptions.
- Public `sion-rgb` GitHub READMEs: project summaries and repository screenshots.

The PDF documents and portfolio photographs were supplied by the portfolio owner for publication. Brand names and third-party materials belong to their respective owners. `public/sources.json` records image sources and repository URLs.

YouTube metrics are the CV's historical maintenance-period figures, not live analytics. Project summaries describe the public README and do not imply all device behavior or third-party integrations were revalidated here. The publisher's live account integration limit and Sakura Sprint's PARTIAL art status are preserved.

Update project data in `src/data.js`, the page copy in `index.html`, and styles in `src/style.css`. `src/story.js` owns the interaction/scroll state; `src/scene.js` renders the original Three.js lens. This is a curated snapshot; no authenticated GitHub API runs in visitors' browsers. Google Fonts is optional; system fonts are the fallback.

The immersive scroll narrative, tactile workshop direction and oversized typography were inspired by [Oryzo by Lusion](https://oryzo.ai/). Its assets, models and source code were not used. The lens is an original portfolio metaphor, not a real product.

## Verification

The redesign was checked in Chromium at 1440×1000, 1366×768, 768×1024, 390×844 and 320×568. Browser checks cover scrolling chapters, real pointer/keyboard rotation, paused pixels, all commercial dialogs, featured projects, category counts, original source qualifications, reduced motion, two GPU loss/restoration cycles and a browser with WebGL disabled. These viewport checks do not certify performance on physical phones or revalidate the linked applications.

Measured scene budget: 25 draw calls, 58,280 triangles, 16 geometries, four textures; DPR caps are 1.65 on desktop and 1.5 on narrower screens. No post-processing chain or shadow-map pass is used. The original PDF hashes remain unchanged.

## Deployment

GitHub Actions checks content, builds Vite and deploys the output to GitHub Pages. The workflow grants Pages write and OIDC permissions only to the deploy job. No API keys, account credentials or analytics trackers are required or included.

Source: `.github/workflows/deploy.yml`. The repository must have GitHub Pages configured to use **GitHub Actions**.

## Rights

Portfolio content, original visual identity and code © 2026 Sion Ng. No additional reuse licence is granted by publication. Open-source dependencies retain their upstream licences (Three.js and Vite: MIT). Public project screenshots retain their original project and third-party attribution.
