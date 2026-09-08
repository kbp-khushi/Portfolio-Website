import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;
const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// ---------------------------------------------------------------------------
// 1) Generative tools fold into Software, with the qualifier. The previous note
//    claimed Claude Code built Rose Architects' site — Khushi built that by hand
//    in Squarespace, so that sentence has to go.
// ---------------------------------------------------------------------------
const OLD_BLOCK = `        <div>
          <div class="group-label">generative tools</div>
          <div class="about-ai-note" style="margin-top:10px">I use ComfyUI in a controlled workflow over my own modelled views for atmosphere studies, and Claude Code to build and maintain this site and Rose Architects&rsquo;. ChatGPT, Gemini and DALL&middot;E sit alongside those for research, writing and quick visual tests.</div>
        </div>`.replace(/\n/g, '\r\n');
if (html.split(OLD_BLOCK).length - 1 !== 1) throw new Error('generative tools block not matched');
html = html.replace(OLD_BLOCK, () => '');
console.log('[ok] separate generative tools section removed');

// Squarespace joins the software list; the AI tools follow it, last
const SOFTWARE_TAIL = '<span class="ai-tag" data-tooltip="Documentation and presentations">Microsoft Office</span></div>';
swap(SOFTWARE_TAIL,
  '<span class="ai-tag" data-tooltip="Documentation and presentations">Microsoft Office</span>' +
  '<span class="ai-tag" data-tooltip="Site building, used for the Rose Architects website">Squarespace</span>' +
  '<span class="ai-tag" data-tooltip="Node based tool for generating and refining images">ComfyUI</span>' +
  '<span class="ai-tag" data-tooltip="Research, ideation and writing support">ChatGPT</span>' +
  '<span class="ai-tag" data-tooltip="Coding assistant used to build this site">Claude Code</span>' +
  '<span class="ai-tag" data-tooltip="Layout and visual mockups">Claude Design</span>' +
  '<span class="ai-tag" data-tooltip="Text to image generation for visual studies">DALL&middot;E</span>' +
  '<span class="ai-tag" data-tooltip="Research and ideation support">Gemini</span></div>' +
  '\r\n          <div class="about-ai-note">The generative tools above are used for research, iteration and visual studies, and for website development and document preparation. They are not used to produce final drawings.</div>',
  'software list absorbs the generative tools, with the qualifier');

// ---------------------------------------------------------------------------
// 2) site analysis page renamed
// ---------------------------------------------------------------------------
swap('<h2 class="pp-title">Reading North Charleston</h2>', '<h2 class="pp-title">Beacon &mdash; Site Analysis</h2>', 'page title');
swap('<div class="additional-title">Reading North Charleston</div>', '<div class="additional-title">Beacon &mdash; Site Analysis</div>', 'work index title');
swap('<div class="pp-subtitle">The Study That Chose the Program for Beacon</div>',
     '<div class="pp-subtitle">The Study That Chose the Program</div>', 'subtitle no longer repeats the name');

// ---------------------------------------------------------------------------
// 3) the drawing set button gets an icon, matching View Final Boards
// ---------------------------------------------------------------------------
swap('<a class="we-boards-btn" style="position:static" href="Caesura_Technical_Drawing_Set.pdf" target="_blank" rel="noopener">View the Drawing Set</a>',
  '<a class="we-boards-btn" style="position:static" href="Caesura_Technical_Drawing_Set.pdf" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>View the Drawing Set</a>',
  'drawing set button gains a sheet icon');

// ---------------------------------------------------------------------------
// 4) link to the section model from the drawing set panel, where it is findable
// ---------------------------------------------------------------------------
{
  // this panel was inserted programmatically, so it carries LF endings
  const marker = 'View the Drawing Set</a>\n      </div>';
  if (html.split(marker).length - 1 !== 1) throw new Error('aside close not unique');
  html = html.replace(marker, () =>
    'View the Drawing Set</a>\n        <a class="aside-link" onclick="closeProject();setTimeout(function(){openProject(\'section-model\');},80)">View the section model</a>\n      </div>');
  console.log('[ok] section model link added to the aside');
}

// ---------------------------------------------------------------------------
// 5) the live domain, so link previews work
// ---------------------------------------------------------------------------
swap('<meta property="og:url" content="https://kbp-khushi.github.io/Portfolio-Website/">',
     '<meta property="og:url" content="https://archportfoliopatel.netlify.app/">\r\n<meta property="og:image" content="https://archportfoliopatel.netlify.app/og-image.jpg">\r\n<meta name="twitter:card" content="summary_large_image">',
     'og:url corrected and og:image added');

// ---------------------------------------------------------------------------
// 6) styles
// ---------------------------------------------------------------------------
swap('.pp-aside-set p{', `.aside-link{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);cursor:pointer;text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:3px;transition:color .3s,border-color .3s}
.aside-link:hover{color:var(--text);border-color:var(--accent)}
.pp-aside-set p{`, 'aside link styles');

writeFileSync(P, html);
const count = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', count('boards-popup'), count('flipbook-popup'));
console.log('false Rose Architects claim gone:', !html.includes('Rose Architects&rsquo;.'));
