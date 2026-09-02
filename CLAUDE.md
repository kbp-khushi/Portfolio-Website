# Portfolio Site — Khushi Patel

## Identity
This is Khushi Patel's architecture portfolio website. Single-page HTML file (an SPA — nav links scroll/toggle sections and project overlays, no real per-page URLs) with embedded base64 images.

## File
- Main file: `index.html`
- Single HTML file, all CSS/JS/images inline
- `resume.html` was retired (commit `160bfdb`) — the downloadable resume is now just `Khushi_Patel_Resume.pdf`, replaced directly whenever Khushi has an updated version, not regenerated from HTML

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
- One typeface for everything: **Neue Haas Grotesk**, loaded via Adobe Fonts kit — `<link rel="stylesheet" href="https://use.typekit.net/rqn0qpl.css">` in `<head>`.
- CSS: `font-family:'neue-haas-grotesk-display',sans-serif;` — both `var(--title)` and `var(--body)` point to this same stack, so don't reintroduce a second font.
- Weights loaded: 400/500/700 normal, 400/500 italic. Italic is used for accent lines and the resume tagline.
- This is an Adobe (Typekit) dependency tied to Khushi's SCAD Creative Cloud account — if the kit ever stops resolving, that's why. The web project is named "Khushi Portfolio Site" in her Adobe Fonts account.

### Layout
- Page padding: 60px horizontal (16px mobile)
- Edit-row grid: 320px | 1fr with 48px gap
- Section spacing: 48px padding top/bottom
- Mobile breakpoint: 768px (project-grid also gets a 2-up tablet breakpoint around 601–1024px)

## Image Handling
- All images embedded as base64 data URIs
- Set background: none !important on project-page images
- Crop whitespace from PDFs before embedding
- Resize to max 2000-2400px width before encoding
- Source/intermediate files for image processing live in `converted/` and `base64/` (both gitignored — regenerable build output, see `scripts/`). Raw originals (`Model Pictures/`, `Additional Work/`, `monet painting/`) are tracked/kept since they're irreplaceable.

## CRITICAL: File Truncation Fix
The file is ~30MB. It truncates at the flipbook popup when written in one pass. ALWAYS:
1. Never use the Write tool on this file — use the Edit tool for text-only changes, or a small Node.js script (read/replace/write via `fs`) for large or repetitive changes. Node has no token-limit truncation risk; the Write/Edit tool interfaces do.
2. Never target a `src="data:..."` attribute's content in an Edit match — only match short, unique text/markup snippets around the base64, never the blob itself.
3. If you must reconstruct the file some other way: write main content first, then APPEND the flipbook popup + `</body></html>` separately.

## Known Issues
- Cloudflare email obfuscation tags reappear on edits — search for __cf_email__ and replace with kbp.khushi@gmail.com
- Remove any <script data-cfasync> tags on every edit

## Site Structure
- Landing (hero + "Selected Work" teaser, 3 projects) → Work index (`#projects`, 3-up grid, 3 groups: Graduate work / Undergraduate work / Additional work) → project overlay pages (`.project-page`, opened via `openProject('slug')`) → About (`#about`: bio, resume download, experience, education, software, AI-Assisted Design, licensure) → Footer (persistent: back to top, contact row, copyright)
- Nav is just Work / About. On the landing page only, on desktop, the nav is embedded inside the hero image itself (name + links at the bottom corners, underline-on-hover) and the standalone `.nav` bar is hidden (`body.in-hero` toggles this via a scroll listener); it reverts to the standard top nav bar once scrolled past the hero, and always on mobile (no hover state there).
- Each of the 7 studio projects (`page-the-pause`, `page-woven-edge`, `page-beacon`, `page-fluke`, `page-dreamscape`, `page-laker`, `page-drodel`) shares one header template: hero image → title → `.pp-meta-list` (stacked label/value rows — location, studio/professor/year, completion time, software, collaboration only if a named collaborator exists, never a Recognition row) → intro paragraph → design-strategy sections (`.edit-row`/`.edit-text`/`.edit-images`, unique per project, this is the actual write-up content, not captions).
- "Additional work" (Massing Model, Section Model, Virtuous Book, From Elsewhere) are a separate 4 cards in the work index, generated/injected by `scripts/build-overlays.mjs` + `scripts/inject-overlays.mjs` — these follow an older flipbook/overlay pattern, not the 7-project header template above.
- Project order: The Pause → Woven Edge → Beacon → Fluke → Dreamscape → Lakër → Drodel

## Resume
- Two things share this content and should be kept in sync if it changes: the About page's Experience/Education/Software/AI-Assisted Design/Honors/Licensure lists in `index.html`, and `Khushi_Patel_Resume.pdf`.
- The PDF is not generated from HTML anymore (`resume.html` and `scripts/generate-resume-pdf.mjs` are dead — see File section above) — when Khushi has a new resume version, replace `Khushi_Patel_Resume.pdf` directly with the file she supplies, keeping that exact filename since the About page's "Download Resume" button links to it by name.
- SCAD M.Arch 2025-2027 (GPA 4.0), B.F.A. Architecture 2021-2025 Summa Cum Laude (GPA 4.0), Minor: Electronic Design, Study Abroad — SCAD Lacoste, France
- Experience: The Johnson Studio at Cooper Carry, Rose Architects, Staging By Design, MRP Design
- AXP: 955/3740 (26%), ARE: 0/6
- Email: kbp.khushi@gmail.com | Phone: (706) 308-5889 | Location: Savannah, GA

## Known gaps / open items
- Landing hero photo (Monet's water lily painting, Met) and About-page portrait: hero photo is in place (`monet painting/IMG_7057.HEIC`, cropped to just the painting); the About portrait is still a placeholder (`.about-portrait-placeholder`) — swap in a real `<img>` when Khushi supplies one.
- DALL-E / Gemini one-line descriptions in AI-Assisted Design were written to match the style of the other 4 tools, not dictated verbatim — worth a review pass.
- "AI-Assisted Design" being included on the printed resume (not just the About page) was a judgment call carried over from the source planning chat — worth a gut-check before using it for actual job applications.
