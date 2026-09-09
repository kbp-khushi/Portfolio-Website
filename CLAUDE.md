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
- **Mobile gutter is 24px, everywhere, no exceptions** — nav, hero, sections, project pages, the previous/next rule and the footer all share one left edge. Full-bleed images (padding 0, flush to the edge) are the only thing allowed off it. Before this pass a single project page had four different left edges (16 / 24 / 60 / 72), which is what made it look unfinished. Watch two traps when adding anything: the `[style*="padding:…"]` overrides in the mobile block rewrite inline padding with `!important` and will silently eat a value you set inline, and `.project-nav` needs the `.project-page .project-nav` specificity to beat them.
- Hero buttons sit in a row on both desktop and mobile. They were briefly stacked full width because at the old size every label broke in half; the fix was smaller type (9.5px, .6px tracking), not stacking.

## Scroll reveal
- Two fade-in systems, both driven by one IntersectionObserver: `.reveal` (32px rise, for landing and About content) and `.pp-reveal` (24px rise, applied to project-page blocks). An element gets the class *and* must be passed to `revealObs.observe(el)` — adding the class alone leaves it stuck at `opacity:0`.
- **Both systems go through one `addReveal(root,selector,cls,after)` helper with a nesting guard.** A reveal inside another reveal never fires: the outer sits at opacity 0 so the inner never intersects and stays hidden for good. The helper skips anything already inside one, and the project loop then strips `pp-reveal` from markup authored elements that ended up nested. If you add a block, add its selector to that list rather than writing the class into the markup.
- The About block lists its selectors explicitly, so **anything new added to About stays un-faded until it is added to that list.** That is what happened to the AXP rings and the honors list. The rings (`.axp-item`) and honors (`.honors-list li`) now run on their own staggers so each group animates in reading order; the shared `(i%6)*70` counter had the first ring coming in last, at 350ms.
- Verifying this in the preview pane is unreliable: when the pane is not compositing, IntersectionObserver does not fire and *everything* reads `opacity:0`, including elements that work in production. Check for the `visible` class after a real `computer` scroll on a fronted tab, not for opacity.

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
- **Every image carries width/height attributes. Keep it that way.** Without them a lazy image occupies zero height until it loads, which shifts everything below it. That is what broke the category jump nav on Caesura and Woven Edge after 76 overlay images were made lazy: weNav scrolled to a position that then moved. `scripts/fix-jump-nav-drift.mjs` regenerates them from the real files.
- **weNav is deliberately defensive** (`scripts/wenav-rewrite.mjs`): it remeasures the target every frame, corrects again whenever an image inside the page fires load, keeps correcting for a short window, and cancels completely on real input or on a new jump. An earlier version leaked its listeners, so clicking a second category could yank you back to the first.
- **Flex label columns need a basis wider than the longest label.** `.fact-label` and `.pp-meta-label` are flex items with `white-space:nowrap`, and a flex item will not shrink below its content (`min-width:auto`). A 96px basis with a 105px label silently rendered at 105px and indented that one row by 9px. If a label column looks misaligned, measure the longest label before touching anything else.
- **A push does not guarantee a deploy.** The GitHub webhook into Cloudflare Pages dropped twice in seventeen deploys on 2026-09-08, leaving commits on GitHub that were never built. Confirm the change is live rather than assuming; another push retriggers it.
- Cloudflare email obfuscation tags reappear on edits — search for __cf_email__ and replace with kbp.khushi@gmail.com
- Remove any <script data-cfasync> tags on every edit

## Site Structure
- Landing (hero + "Selected Work" teaser, 3 projects) → Work index (`#projects`, 3-up grid, 3 groups: Graduate work / Undergraduate work / Additional work) → project overlay pages (`.project-page`, opened via `openProject('slug')`) → About (`#about`: bio, resume download, experience, education, software with the generative tools folded in, honors, licensure with AXP rings, contact) → Footer (persistent: back to top, contact row, copyright)
- Nav is Home / Work / About in a fixed top bar, present on every view. (There is no `body.in-hero` behaviour: that was described here for months but never existed in the file.) On mobile the top bar carries only the wordmark, and a fixed bottom tab bar carries home / work / about, mirroring the desktop nav.
- **One button style for "go see the actual project work": `.we-boards-btn`** — bordered, uppercase, leading SVG icon, always with `style="position:static"` when used outside the aside (the base rule is absolutely positioned). Every such trigger on the site uses it, 19 of them. `.dl-link` and `.model-links a` are both fully retired and have zero uses in the markup; their CSS is dead but harmless.
  - **Centred under the write-up is the default**, in a `<div style="padding:8px 60px 60px;text-align:center">` sitting just before `.project-nav`. That trailing 60px is what keeps the button clear of the nav's `border-top` rule — keep it. Beacon, Fluke, Dreamscape, Lakër and Drodel all use exactly this, and the additional-work pages (both model pages, Virtuous Book, Beaufort Cookbook, Site Analysis) are centred in place too.
  - Beacon additionally hangs the site analysis `.model-links` link directly under its button (`justify-content:center;padding:18px 60px 60px`), so the 60px lives on the link instead.
  - **Top right** survives only where the aside carries more than a button: Caesura (three buttons plus their explanatory blocks) and The Woven Edge (button over the hero). That is the `.pp-aside` slot, which needs `.pp-header` to have `style="position:relative;max-width:none"` and its content wrapped in `<div style="max-width:900px">`. Below 900px `.pp-header` becomes a flex column and the aside takes `order:2`, so the project name always leads. Do not remove that ordering: the aside is the first child in source, so without it Caesura opened on its sidebar and the title did not appear until roughly 1000px down the page.
  - Icons carry meaning and repeat across pages: four-square grid = boards/full project, sheet = drawing set or research, camera = process photos, book = book/cookbook, house = section model.
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
- **The hero is resolved (2026-09-08).** It is the Monet with the type inside it: eyebrow "M.Arch candidate · Savannah / Atlanta", her name as the headline, and her own sentence from About as the position line, over a scrim weighted to the bottom left. "welcome to my" and "Since 2026" are gone. She chose this from six rendered options; the runner up was keeping the Monet as a small captioned band. Do not reintroduce a generic headline. The canvas is `calc(100svh - 112px)` on both desktop and mobile: a full screen less about an inch, so the first view ends on a white band instead of running to the edge. `svh` is what keeps it from overflowing on a phone once browser chrome shows. `.work-teaser` carries a large top padding (150px desktop, 130px mobile) so Selected Work sits below that band rather than peeking into it.
- The About portrait is resolved: her own photograph at the Forsyth Park fountain.
- The model photographs are in (2026-09-08): the massing model and the section model each have their own card in the Selected Work stack and their own project page. Nothing outstanding here.
- Paintings, sketchbook pages, childhood art and the nail art Instagram were all considered and dropped.
