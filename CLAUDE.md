# CLAUDE.md — LumiGlow

Guidance for AI agents working on this codebase.

## Project overview

LumiGlow is an **enterprise smart-lighting SaaS** demo — a static marketing site with an interactive dashboard. It is a **front-end-only demo**: there is no backend, database, or authentication. All data is mocked.

**Live demo:** https://lumi-labs-demo.github.io/lumiglow/

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, static export) |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Charts | Plain SVG — no charting library |
| Language | TypeScript |
| Deployment | GitHub Pages (`gh-pages` branch) |

---

## Repository layout

```
app/
  page.tsx            # Marketing landing page
  dashboard/
    page.tsx          # Interactive mock dashboard
  globals.css
  layout.tsx

components/
  Nav.tsx             # Top navigation bar
  Hero.tsx            # Hero section
  ConsolePreview.tsx  # Animated console preview
  FeatureGrid.tsx     # Feature highlights grid
  SecurityBand.tsx    # Security / compliance band
  Testimonials.tsx    # Customer testimonials
  Pricing.tsx         # Pricing tiers
  FAQ.tsx             # Accordion FAQ
  Footer.tsx
  Modal.tsx           # Generic modal wrapper
  Toast.tsx           # Temporary notification toast
  ThemeToggle.tsx     # Light / dark toggle button

lib/
  mockData.ts         # All shared mock data (buildings, zones, alerts, energy, pricing)
  utils.ts            # cn(), formatWatts(), calcSavingsPct()
```

---

## Key conventions

### Internal navigation
Always use `next/link` — **never** a plain `<a>` tag for internal routes.  
Next.js `<Link>` automatically prepends `basePath` at build time.

```tsx
// ✅
import Link from "next/link";
<Link href="/dashboard">Dashboard</Link>

// ❌ breaks on GitHub Pages
<a href="/dashboard">Dashboard</a>
```

### Mock data
All data lives in `lib/mockData.ts`. The landing page and dashboard both import from there. Do **not** introduce fetch calls or API routes — this is a static demo.

### Charts
Built with plain SVG. Do **not** add a charting library unless explicitly requested.

### Utility helpers (`lib/utils.ts`)
- `cn(...classes)` — conditional class merging
- `formatWatts(w)` — formats watts/kilowatts
- `calcSavingsPct(actual, baseline)` — percentage energy savings

### No `out/` on `main`
The build output folder is gitignored on `main`. Build artefacts live exclusively on `gh-pages`.

---

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Build & deploy to GitHub Pages

> **Deploy target:** `gh-pages` branch of `Lumi-Labs-Demo/lumiglow`  
> **Live URL:** https://lumi-labs-demo.github.io/lumiglow/

```bash
# 1. Start from a clean main
cd /workspace/lumiglow
git checkout main && git pull origin main

# 2. Build static export
NODE_ENV=production npm run build
touch out/.nojekyll          # required for _next/ assets to be served

# 3. Force-push built output to gh-pages (orphan keeps history clean)
git checkout --orphan gh-pages-tmp
git rm -rf . --quiet
cp -r out/. . && rm -rf out node_modules .next
git add -A
git commit -m "deploy: built LumiGlow static site for GitHub Pages"
git push origin HEAD:gh-pages --force

# 4. Return to main
git checkout main
```

**Why `NODE_ENV=production`?** This activates `basePath: '/lumiglow'` in `next.config.js`. Without it, assets 404 on GitHub Pages.

**Why `--orphan`?** Keeps `gh-pages` to a single commit with no accumulated build history.

---

## GitHub Pages configuration (pre-configured)

| Setting | Value |
|---|---|
| Source | Deploy from a branch |
| Branch | `gh-pages` / root |
| GitHub Actions | Not used |

---

## Agent / PR workflow

- All code changes go in a **single PR** against `main`.
- PR titles should be prefixed with the task ID if one exists, e.g. `[TASK-42] Add dark-mode toggle`.
- After merging to `main`, run the deploy commands above to push to `gh-pages`.
- Always comment the live URL on the originating Notion page once deployed.
- Change the Notion page icon to ✅ when the task is complete.

---

## What this project is NOT

- Not a full-stack app — no API routes, no database, no auth.
- Not a production system — it is purely a sales/marketing demo.
- Do not add real payment flows, real user accounts, or real data persistence.
