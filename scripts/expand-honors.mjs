import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// ordered by what an outside reader weighs most: an external, reviewed
// acceptance first, then the honour society, then school awards, with the
// five scholarships grouped so the list stays scannable
const OLD = `            <li>Dean&rsquo;s List &mdash; Savannah College of Art and Design, 2022&ndash;2025</li>\r\n            <li>Outstanding Student Award &mdash; SCAD, 2025</li>`;
if (html.split(OLD).length - 1 !== 1) throw new Error('honors list not matched');

const NEW = `            <li>Poster accepted &mdash; ACSA 2026 Intersections Research Conference: Urban Design Matters, for <em>The Woven Edge</em></li>\r
            <li>Tau Sigma Delta &mdash; National Honor Society in Architecture and Allied Arts</li>\r
            <li>Outstanding Student Award &mdash; SCAD, 2025</li>\r
            <li>Dean&rsquo;s List &mdash; Savannah College of Art and Design, 2022&ndash;2025</li>\r
            <li>SCAD scholarships and fellowships &mdash; Academic Honors, Achievement Honor, Student Recognition, the Dr. Victor Andrews Endowed Scholarship, and the SCAD Alumni Fellowship</li>`;

html = html.replace(OLD, () => NEW);
console.log('[ok] honors expanded to five entries');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
