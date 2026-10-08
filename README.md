# Sion Ng — The Creative Workbench

A public Traditional Chinese portfolio combining Sion Ng's CV, commercial multimedia work and 12 public GitHub projects, built with Three.js and Vite.

**Website:** https://sion-rgb.github.io/sion-portfolio/

## Experience

- Full-screen creative workbench with an original machined optical assembly, aperture blades, engraved dial, brushed metal and studio lighting.
- A continuous scroll journey from the four introductory scenes through commercial work, impact, creative process, experiments, portrait, career, contact and the closing ribbon. The same optical object travels between all chapters using one shared animation clock.
- A four-step creative process with scroll and manual controls: FRAME, DESIGN, MOVE and PLAY. Original perforated film, fanning design cards and sculpted code brackets float around the lens and respond to the selected step.
- A clickable constellation connects all 12 curated projects to their expandable details. Moving signal paths, a discipline ticker, layered photo reels, a scanning line and pointer feedback add motion across the page.
- Animated CSS/SVG depth layers preserve the scroll story and interaction when WebGL is unavailable or its context is lost. GPU environment maps rebuild when the context returns.
- A pinned film reel of four real commercial case studies, with scroll-driven transitions, floating photographs, manual navigation and accessible native dialogs.
- Three pinned experiment screens change with scrolling or manual tabs, followed by an expandable index of 12 projects with category filters.
- Historical CV figures count up once, the portrait opens through an aperture, a career line follows reading position, and kinetic contact typography leads into a running closing ribbon.
- Original CV and visual portfolio PDF downloads.
- A fixed full-page pause control, responsive layouts and reduced-motion support. Reduced motion presents every commercial work and intro chapter in normal reading order. Paused and reduced-motion modes keep newly opened project details visible. Rendering stops while the document is hidden; offscreen decorative CSS loops pause.

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

Update project data in `src/data.js`, the page copy in `index.html`, and styles in `src/style.css`, `src/journey.css` and `src/embellishments.css`. `src/story.js` owns the shared interaction/scroll state; `src/scene.js` renders the lens, with original props in `src/studio-elements.js`. `src/embellishments.js` adds the creative process and constellation. This is a curated snapshot; no authenticated GitHub API runs in visitors' browsers. Google Fonts is optional; system fonts are the fallback.

The immersive scroll narrative, tactile workshop direction and oversized typography were inspired by [Oryzo by Lusion](https://oryzo.ai/). Its assets, models and source code were not used. The lens, film, design cards and code brackets are original portfolio metaphors, not real products or application screenshots.

## Verification

The expanded motion update was checked on 8 October 2026 in Chromium (Edge) at 1440×1000, 1366×768, 1280×600, 768×1024, 390×844 and 320×568. The 85-check regression covers continuous rendered motion in every chapter after the intro, scrolling and manual gallery navigation, portrait aperture, career progress, real pointer/keyboard rotation, paused pixels, commercial dialogs, filters, unobstructed narrow-screen actions, reduced motion and two GPU loss/restoration cycles. All 46 additional checks passed for automatic/manual process steps, all 12 constellation links, filtering recovery, layout, render budget and new runtime errors. A separate browser page denies WebGL contexts to check the animated CSS props and manual process controls. These viewport checks do not certify performance on physical phones or revalidate the linked applications.

Measured scene budget with all new props visible: 39 draw calls, 58,912 triangles, 20 geometries, six textures; DPR caps are 1.65 on desktop and 1.5 on narrower screens. No post-processing chain or shadow-map pass is used. The original PDF hashes remain unchanged.

## Deployment

GitHub Actions checks content, builds Vite and deploys the output to GitHub Pages. The workflow grants Pages write and OIDC permissions only to the deploy job. No API keys, account credentials or analytics trackers are required or included.

Source: `.github/workflows/deploy.yml`. The repository must have GitHub Pages configured to use **GitHub Actions**.

## Rights

Portfolio content, original visual identity and code © 2026 Sion Ng. No additional reuse licence is granted by publication. Open-source dependencies retain their upstream licences (Three.js and Vite: MIT). Public project screenshots retain their original project and third-party attribution.
