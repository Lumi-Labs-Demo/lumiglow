# LumiGlow

Enterprise smart lighting SaaS — marketing site + interactive demo dashboard.

**Live demo:** https://lumi-labs-demo.github.io/lumiglow/

---

## Stack

- **Next.js 14** (App Router, static export)
- **Tailwind CSS 3**
- **Lucide React** icons
- Deployed to **GitHub Pages** (`gh-pages` branch)

---

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Deployment

The site is deployed as a pre-built static export to the `gh-pages` branch.  
**Never commit the `out/` build folder to `main`** — source and build artifacts live on separate branches.

GitHub Pages is configured to serve from the **`gh-pages` branch / root**.  
`next.config.js` sets `basePath: '/lumiglow'` in production so all asset paths and internal links resolve correctly.

### Step-by-step

```bash
# 1. Make sure you're on main with the latest source
git checkout main && git pull origin main

# 2. Build the static site
NODE_ENV=production npm run build

# 3. Add .nojekyll so GitHub Pages serves _next/ assets correctly
touch out/.nojekyll

# 4. Force-push the built output to gh-pages (orphan keeps history clean)
git branch -D gh-pages-tmp 2>/dev/null || true
git checkout --orphan gh-pages-tmp
git rm -rf . --quiet
cp -r out/. .
rm -rf out node_modules .next
git add -A
git commit -m "deploy: built LumiGlow static site for GitHub Pages"
git push origin HEAD:gh-pages --force

# 5. Return to main for further development
git checkout main
```

> **Why `--orphan`?**  
> A throwaway orphan branch force-pushed to `gh-pages` keeps the deployment branch to a single commit with no accumulated build history — much cleaner than layering build commits on top of each other.

> **Why `NODE_ENV=production`?**  
> This is what activates `basePath: '/lumiglow'` in `next.config.js`. Without it, the build omits the sub-path prefix and all assets 404 on GitHub Pages.

### GitHub Pages settings (already configured)

| Setting | Value |
|---|---|
| Source | Deploy from a branch |
| Branch | `gh-pages` / `root` |
| GitHub Actions | Not used |

---

## Internal navigation

Always use `next/link` (not a plain `<a>` tag) for internal routes. Next.js's `<Link>` component automatically prepends `basePath` at build time, so links resolve correctly under `/lumiglow/` in production.

```tsx
// ✅ correct
import Link from "next/link";
<Link href="/dashboard">Go to Dashboard</Link>

// ❌ wrong — ignores basePath, breaks on GitHub Pages
<a href="/dashboard">Go to Dashboard</a>
```

---

## Project structure

```
app/
  page.tsx            # Marketing landing page
  dashboard/
    page.tsx          # Interactive mock dashboard
  globals.css
  layout.tsx

components/
  Nav.tsx
  Hero.tsx
  ConsolePreview.tsx
  FeatureGrid.tsx
  SecurityBand.tsx
  Testimonials.tsx
  Pricing.tsx
  FAQ.tsx
  Footer.tsx
  Modal.tsx
  Toast.tsx
  ThemeToggle.tsx

lib/
  mockData.ts         # Shared mock data (buildings, zones, alerts, energy, pricing)
  utils.ts
```

---

## Key conventions

- **Routing** — use `next/link` for all internal links (see above).
- **Charts** — built with plain SVG; no charting library dependency.
- **Mock data** — lives in `lib/mockData.ts`, shared between the landing page and the dashboard.
- **No `out/` on `main`** — add `out/` to `.gitignore` if it isn't already ignored.
