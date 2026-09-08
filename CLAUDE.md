# Portfolio Site — Khushi Patel

## Identity
This is Khushi Patel's architecture portfolio website. Single page HTML file (an SPA — nav links toggle views and project overlays, no real per page URLs) with images served from `images/`.

## File
- **Everything the site serves lives in `site/`** — `site/index.html`, `site/images/`, both PDFs, `og-image.jpg`. That directory *is* the published root, so nothing else in the repo is publicly reachable. Do not put source material inside it.
- Main file: `site/index.html` — about 170KB of markup, CSS and JS
- Images are **separate files in `site/images/`**, referenced as `src="images/NNN-name.jpg"`. They were inlined as base64 until 2026-09-03, when the document had reached 39MB; extracting them dropped it to 171KB. Do not re-embed them.
- `resume.html` was retired (commit `160bfdb`) — the downloadable resume is now just `Khushi_Patel_Resume.pdf`, replaced directly whenever Khushi has an updated version

## Design System

### Colors
- --bg: #FFFFFF
- --white: #FFFFFF
- --text: #000000 (primary text)
- --text-light: #666666 (secondary/captions)
- --accent: #000000
- --accent-warm: #000000
- --line: #E5E5E5 (hairline borders/dividers)
- Black-and-white UI only. All imagery (hero, thumbnails, diagrams, portrait) stays full, unmodified color — never desaturated or filtered.

### Typography
- One typeface for everything: **Urbanist**, loaded from Google Fonts — `<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">` in `<head>`.
- CSS: both `--title` and `--body` are `'Urbanist',sans-serif`, so there is only one stack. Don't reintroduce a second font.
- Weights loaded: 300/400/500/600/700/800.
- **Note the split with her print work.** Neue Haas Grotesk is the typeface on her InDesign boards and resume, via Adobe Fonts. The website is *not* on it. A Typekit kit (`use.typekit.net/rqn0qpl.css`) was wired up on 2026-08-14 in commit `eedd607` and removed the next day by the v2 redesign (`2a46451`); this file went on claiming Neue Haas until 2026-09-08. If Khushi ever wants the site to match her boards, it means re-adding that kit **and** adding `imkhushi.com` to the allowed domains on the "Khushi Portfolio Site" web project in her Adobe Fonts account — Typekit kits are domain-locked and will silently fall back otherwise.

### Layout
- Page padding: 60px horizontal (16px mobile)
- Edit-row grid: 320px | 1fr with 48px gap
- Section spacing: 48px padding top/bottom
- Mobile breakpoint: 768px (project-grid also gets a 2-up tablet breakpoint around 601–1024px)

## Image Handling
- Images live in `images/` as real files, referenced by relative path
- Set background: none !important on project-page images
- Crop whitespace from PDFs before adding them
- Resize to max 2000-2400px width
- Source/intermediate files for image processing live in `converted/` and `base64/` (both gitignored — regenerable build output, see `scripts/`). Raw originals (`Model Pictures/`, `Additional Work/`, `monet painting/`) are tracked/kept since they're irreplaceable.

## Editing
- The file is small enough to edit normally now, but **prefer a Node script** for anything repetitive: it is exact, checkable, and leaves a record in `scripts/`.
- The working copy has **CRLF line endings**. Multi line match strings must use `\r\n` or they silently fail to match.
- Verify after every scripted edit: the file ends with `</html>`, `boards-popup` and `flipbook-popup` each appear 8 times, and the image count is what you expect.
- Never patch a build script through nested shell quoting. Write the script with the Write tool instead; shell escaping mangled one and truncated index.html from 34MB to 2.3MB on 2026-09-03.

## Deploying
- **Live at https://imkhushi.com** on Cloudflare Pages, connected to this GitHub repo. Went live 2026-09-08. **Push to `master` and it deploys** — there is no manual step any more.
- Cloudflare account `9a8d1f0a1da394964bd860eb1c26501d`, Pages project `portfolio-website`, also reachable at `portfolio-website.pages.dev`. The domain is Active in the same account, so DNS needed no nameserver work.
- Build settings: no build command, **output directory `site`**. Publishing the repo root instead would expose ~950MB of source boards and model photographs, and would fail anyway — 13 tracked source files exceed Cloudflare's 25 MiB per file cap. Nothing inside `site/` does.
- Netlify (`archportfoliopatel.netlify.app`) was deleted 2026-09-08 and now 404s. That subdomain is free for anyone else to claim, so treat any old link to it as dead.
- Both `imkhushi.com` and `www.imkhushi.com` are attached as custom domains and serve over HTTPS.

## Known Issues
- Cloudflare email obfuscation tags reappear on edits — search for __cf_email__ and replace with kbp.khushi@gmail.com
- Remove any <script data-cfasync> tags on every edit

## Site Structure
- Landing (hero + "Selected Work" teaser, 3 projects) → Work index (`#projects`, 3-up grid, 3 groups: Graduate work / Undergraduate work / Additional work) → project overlay pages (`.project-page`, opened via `openProject('slug')`) → About (`#about`: bio, resume download, experience, education, software with the generative tools folded in, honors, licensure with AXP rings, contact) → Footer (persistent: back to top, contact row, copyright)
- Nav is just Work / About. On the landing page only, on desktop, the nav is embedded inside the hero image itself (name + links at the bottom corners, underline-on-hover) and the standalone `.nav` bar is hidden (`body.in-hero` toggles this via a scroll listener); it reverts to the standard top nav bar once scrolled past the hero, and always on mobile (no hover state there).
- **One button pattern for "go see the actual project work":** an `.we-boards-btn` (bordered, uppercase, leading SVG icon) sitting in the `.pp-aside` slot at the top right of `.pp-header`, which needs `style="position:relative;max-width:none"` and its content wrapped in `<div style="max-width:900px">`. All 7 studio pages use it; below 900px the aside goes static and the button stacks above the title. Don't reintroduce a bottom-of-page `.dl-link` for this — `.dl-link` is for secondary things only (resume, process photos, research).
- Each of the 7 studio projects (`page-the-pause`, `page-woven-edge`, `page-beacon`, `page-fluke`, `page-dreamscape`, `page-laker`, `page-drodel`) shares one header template: hero image → title → `.pp-meta-list` (stacked label/value rows — location, studio/professor/year, completion time, software, collaboration only if a named collaborator exists, never a Recognition row) → intro paragraph → design-strategy sections (`.edit-row`/`.edit-text`/`.edit-images`, unique per project, this is the actual write-up content, not captions).
- Graduate work in the index is Caesura, then a stacked pair of small model thumbnails (Massing Model, Section Model — both Caesura's own, linked from its page), then The Woven Edge.
- "Additional work" is a text list: Facade Mask, Beacon — Site Analysis, Camber, Virtuous Book, From Elsewhere, Custom Revit Families. The older ones follow a flipbook/overlay pattern; Camber, Facade Mask and Site Analysis were built in 2026-09 with the label/title/subtitle/course header and images on the page.
- Project order: Caesura → Woven Edge → Beacon → Fluke → Dreamscape → Lakër → Drodel

## Resume
- Two things share this content and should be kept in sync if it changes: the About page's Experience, Education, Software, Honors and Licensure lists in `index.html`, and `Khushi_Patel_Resume.pdf`.
- The PDF is not generated from HTML anymore (`resume.html` and `scripts/generate-resume-pdf.mjs` are dead — see File section above) — when Khushi has a new resume version, replace `Khushi_Patel_Resume.pdf` directly with the file she supplies, keeping that exact filename since the About page's "Download Resume" button links to it by name.
- SCAD M.Arch 2025-2027 (GPA 4.0), B.F.A. Architecture 2021-2025 Summa Cum Laude (GPA 4.0), Minor: Electronic Design, Study Abroad — SCAD Lacoste, France
- Experience: The Johnson Studio at Cooper Carry, Rose Architects, Staging By Design, MRP Design
- AXP: 1,336.25/3,740 (35.7%), broken into six rings on the About page. The ARE line was dropped — publishing a zero volunteers a weakness for no benefit.
- Email: kbp.khushi@gmail.com | Phone: (706) 308-5889 (on the resume only, not the site) | Location: Savannah, GA

## Known gaps / open items
- The landing hero is Khushi's own photograph of a Monet water lily painting. She wants to keep it and add a note tying it to Caesura's palette; the hero headline still reads "welcome to my" and "Since 2026", which both reviewers flagged as the real problem. Not yet done.
- The About portrait is resolved: her own photograph at the Forsyth Park fountain.
- Conceptual and completed model photographs are still to come from Khushi.
- Paintings, sketchbook pages, childhood art and the nail art Instagram were all considered and dropped.
