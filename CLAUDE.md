# Portfolio Site — Khushi Patel

## Identity
This is Khushi Patel's architecture portfolio website. Single-page HTML file with embedded base64 images.

## File
- Main file: `Portfolio Website.html`
- Single HTML file, all CSS/JS/images inline

## Design System

### Colors
- --bg: #F5F2EE (warm off-white)
- --white: #FFFFFF (cards/popups)
- --text: #2A2A2A (primary text)
- --text-light: #6B6B6B (secondary/captions)
- --accent: #8B7D6B (headings, links)
- --accent-warm: #A0876E (hover states)
- --line: #D4CEC6 (borders, dividers)

### Typography
- Headings: Poppins (300-800 weights)
- Body: Century Gothic / Avenir / Futura
- Section titles: 14px, weight 600, letter-spacing 2px, uppercase, accent color
- Body text: 14px, line-height 1.7
- Project titles: 42px, weight 700
- Captions: 9-11px, uppercase, letter-spacing 1.5px

### Layout
- Page padding: 60px horizontal (16px mobile)
- Edit-row grid: 320px | 1fr with 48px gap
- Section spacing: 48px padding top/bottom
- Mobile breakpoint: 768px

## Image Handling
- All images embedded as base64 data URIs
- Set background: none !important on project-page images
- Crop whitespace from PDFs before embedding
- Resize to max 2000-2400px width before encoding

## CRITICAL: File Truncation Fix
The file is ~21MB. It truncates at the flipbook popup when written in one pass. ALWAYS:
1. Write main content first
2. APPEND the flipbook popup + </body></html> separately
Never rewrite the entire file in a single operation.

## Known Issues
- Cloudflare email obfuscation tags reappear on edits — search for __cf_email__ and replace with kbp.khushi@gmail.com
- Remove any <script data-cfasync> tags on every edit

## Site Structure
- Hero → Projects Grid (7 projects) → Resume → Contact → Footer
- Graduate projects (The Pause, The Woven Edge): editorial layout with overlay pages
- Undergrad projects (Beacon, Fluke, Dreamscape, Lakër, Drodel): flipbook popup
- Project order: The Pause → Woven Edge → Beacon → Fluke → Dreamscape → Lakër → Drodel

## Resume Info
- SCAD M.Arch 2025-2027 (GPA 4.0), BFA Architecture 2021-2025 Summa Cum Laude (GPA 4.0)
- Experience: Rose Architects, Staging By Design, MRP Design
- AXP: 955/3740 (26%), ARE: 0/6
- Email: kbp.khushi@gmail.com | Location: Savannah, GA
