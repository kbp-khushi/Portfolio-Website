import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

// 1. Extract the current inline section (grid of 7 cards)
const oldSectionStart = html.indexOf('<!-- PROFESSIONAL WORK (TJS) -->');
const oldSectionEnd = html.indexOf('</section>', oldSectionStart) + '</section>'.length;
const oldSection = html.slice(oldSectionStart, oldSectionEnd);

// pull out the project-grid block (the 7 cards) to reuse inside the overlay
const gridStart = oldSection.indexOf('<div class="project-grid">');
const gridEnd = oldSection.lastIndexOf('</div>\n</section>');
const gridBlock = oldSection.slice(gridStart, gridEnd + 6); // include the grid's own closing </div>

// 2. Build the new compact work-index entry (text-only, matches Additional Work style)
const newInlineSection = `<!-- PROFESSIONAL WORK (TJS) -->
<section class="section" id="professional-work">
  <div class="group-label">professional work</div>
  <div class="additional-list">
    <div class="additional-item" onclick="openProject('professional-work')">
      <div class="additional-title">Custom Revit Families</div>
      <div class="additional-sub">Generic, reusable parametric geometry built during my internship at The Johnson Studio at Cooper Carry &mdash; 7 families, not tied to any specific client project</div>
    </div>
  </div>
</section>`;

html = html.slice(0, oldSectionStart) + newInlineSection + html.slice(oldSectionEnd);

// 3. Build the new overlay page and insert it before the flipbook popup
const overlayPage = `<div class="project-page" id="page-professional-work">
  <button class="pp-back" onclick="closeProject()">&#10229;Back</button>
  <div class="pp-header">
    <h2 class="pp-title">Professional Work</h2>
    <div class="pp-subtitle">Custom Revit Families &mdash; The Johnson Studio at Cooper Carry</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>Generic, reusable parametric geometry built during my internship &mdash; shown here to demonstrate modeling skill, not tied to any specific client project.</p>
  </div>
  <div style="padding:0 60px 60px">
    ${gridBlock}
  </div>
  <div style="height:80px"></div>
</div>

`;

const insertAnchor = '<div id="flipbook-popup"';
const insertIdx = html.indexOf(insertAnchor);
if (insertIdx === -1) throw new Error('flipbook-popup anchor not found');
html = html.slice(0, insertIdx) + overlayPage + html.slice(insertIdx);

writeFileSync('index.html', html);
console.log('Professional Work restructured into click-through overlay. size:', (html.length / 1024 / 1024).toFixed(1), 'MB');
