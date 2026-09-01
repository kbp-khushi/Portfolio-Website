import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
let html = readFileSync(htmlPath, 'utf-8');
let changes = 0;

function replace(old, nw, label) {
  if (html.includes(old)) {
    html = html.replace(old, nw);
    console.log(`OK: ${label}`);
    changes++;
  } else {
    console.log(`NOT FOUND: ${label}`);
  }
}

// 1. Remove "Additional" from top nav bar
replace(
  `    <li><a href="#additional-work">Additional</a></li>`,
  ``,
  'Remove Additional nav link'
);

// 2. Remove "Additional" dropdown label in nav dropdown
replace(
  `        <div class="nav-dropdown-label">Additional</div>\n`,
  ``,
  'Remove Additional dropdown label'
);

// 3. Swap model and graphic design sections + rename + remove card-img placeholders + update text
// First, replace the entire additional work section content
const oldSection = `<section class="section" id="additional-work">
  <div class="section-label">Additional Work</div>

  <div class="group-label">Graphic Design &amp; Typography</div>
  <div class="project-grid">
    <div class="project-card" onclick="openProject('virtuous-book')">`;

// Find and extract full section
const sectionStart = html.indexOf('<section class="section" id="additional-work">');
const sectionEnd = html.indexOf('</section>', sectionStart) + '</section>'.length;
const oldSectionFull = html.substring(sectionStart, sectionEnd);

const newSection = `<section class="section" id="additional-work">
  <div class="section-label">Additional Work</div>

  <div class="group-label">Architecture Models</div>
  <div class="project-grid">
    <div class="project-card" onclick="openProject('massing-model')">
      <div class="card-body">
        <div class="card-num">01</div>
        <div class="card-title">Massing Model</div>
        <div class="card-sub">The Pause, Aiken State Park</div>
        <div class="card-course">ARCH 727</div>
        <div class="card-arrow">&rarr;</div>
      </div>
    </div>
    <div class="project-card" onclick="openProject('section-model')">
      <div class="card-body">
        <div class="card-num">02</div>
        <div class="card-title">Section Model</div>
        <div class="card-sub">The Pause, Aiken State Park</div>
        <div class="card-course">ARCH 737</div>
        <div class="card-arrow">&rarr;</div>
      </div>
    </div>
  </div>

  <div class="group-label" style="margin-top:48px">Graphic Design &amp; Typography</div>
  <div class="project-grid">
    <div class="project-card" onclick="openProject('virtuous-book')">
      <div class="card-body">
        <div class="card-num">01</div>
        <div class="card-title">Virtuous Book</div>
        <div class="card-sub">Typographic exploration inspired by Bruno Munari and Michael Bierut</div>
        <div class="card-course">GRDS 353 &bull; Professor McKinney</div>
        <div class="card-arrow">&rarr;</div>
      </div>
    </div>
    <div class="project-card" onclick="openProject('beaufort-cookbook')">
      <div class="card-body">
        <div class="card-num">02</div>
        <div class="card-title">From Elsewhere</div>
        <div class="card-sub">Scrapbook cookbook for a fictional bakery collecting recipes from cities around the world</div>
        <div class="card-course">GDVX 501 &bull; Professor McKinney &bull; 2026</div>
        <div class="card-arrow">&rarr;</div>
      </div>
    </div>
  </div>
</section>`;

if (sectionStart !== -1) {
  html = html.substring(0, sectionStart) + newSection + html.substring(sectionEnd);
  console.log('OK: Replaced entire additional work section (reordered, renamed, removed thumbnails, updated text)');
  changes++;
} else {
  console.log('NOT FOUND: additional-work section');
}

// 4. Reorder nav dropdown links to match: models first, then graphic design
replace(
  `        <a onclick="openProject('virtuous-book')">Virtuous Book</a>
        <a onclick="openProject('beaufort-cookbook')">From Elsewhere</a>
        <a onclick="openProject('massing-model')">Massing Model</a>
        <a onclick="openProject('section-model')">Section Model</a>`,
  `        <a onclick="openProject('massing-model')">Massing Model</a>
        <a onclick="openProject('section-model')">Section Model</a>
        <a onclick="openProject('virtuous-book')">Virtuous Book</a>
        <a onclick="openProject('beaufort-cookbook')">From Elsewhere</a>`,
  'Reorder nav dropdown links'
);

writeFileSync(htmlPath, html);
console.log(`\nDone. ${changes} changes. File size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
