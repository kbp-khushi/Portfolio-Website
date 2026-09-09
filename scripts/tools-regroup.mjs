import { readFileSync, writeFileSync } from 'fs';

// Second pass on the tool list, from her read of the first:
//
//   - documentation and modeling merge into "design and documentation", which
//     names what the group actually is: where the building gets made
//   - Hand Drafting and Model Making join it rather than standing apart, each
//     next to its digital counterpart. Her bio says she moves between hand
//     drafting and BIM; a separate analog group would contradict that
//   - Illustrator moves to visualization, where the diagram work belongs
//   - "layout and research" was a grab bag. Splitting it leaves presentation
//     and layout, which is everything that communicates the work
//   - ChatGPT and Gemini come out. Every applicant lists them, so a labelled
//     group of two said less than nothing
//   - the heading stops saying "software", since hand drafting and model
//     making are not

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// recover every pill so the tooltips survive the regroup
const pills = {};
for (const m of html.matchAll(/<span class="ai-tag" data-tooltip="([^"]*)">([^<]*)<\/span>/g)) pills[m[2]] = m[1];
console.log('[ok] recovered', Object.keys(pills).length, 'pills');

const GROUPS = [
  ['design and documentation', ['Revit', 'AutoCAD', 'Hand Drafting', 'Rhino', 'SketchUp', '3DS Max', 'Model Making']],
  ['visualization',            ['Lumion', 'Enscape', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', 'ComfyUI', 'DALL&middot;E']],
  ['presentation and layout',  ['InDesign', 'Squarespace', 'Claude Design', 'Claude Code', 'Microsoft Office']],
];
const CUT = ['ChatGPT', 'Gemini'];

const placed = GROUPS.flatMap(g => g[1]);
const missing = placed.filter(n => !(n in pills));
const unaccounted = Object.keys(pills).filter(n => !placed.includes(n) && !CUT.includes(n));
if (missing.length) throw new Error('not in the current list: ' + missing.join(', '));
if (unaccounted.length) throw new Error('would vanish silently: ' + unaccounted.join(', '));
console.log('[ok] every pill accounted for,', placed.length, 'kept,', CUT.length, 'cut');

// replace the whole run of existing groups
const first = html.indexOf('          <div class="tool-group">');
const marker = '<div class="about-ai-note">';
const end = html.indexOf(marker);
if (first === -1 || end === -1 || end < first) throw new Error('could not bound the tool groups');
const markup = GROUPS.map(([label, names]) =>
  '          <div class="tool-group">\n' +
  `            <div class="tool-group-label">${label}</div>\n` +
  '            <div class="ai-tags">' +
  names.map(n => `<span class="ai-tag" data-tooltip="${pills[n]}">${n}</span>`).join('') +
  '</div>\n' +
  '          </div>').join('\n') + '\n          ';
html = html.slice(0, first) + markup + html.slice(end);
console.log('[ok] three groups written');

swap('<div class="group-label">software</div>', '<div class="group-label">tools</div>',
     'heading is "tools", since hand drafting and model making are not software');

// research leaves the note along with the two tools that did it
swap('Generative tools are used for research, iteration and visual studies, and for website development and document preparation.',
     'Generative tools are used for iteration and visual studies, and for website development and document preparation.',
     'note drops research, which left with ChatGPT and Gemini');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| pills:', c('class="ai-tag"'), '| groups:', c('class="tool-group-label"'),
  '| chatgpt/gemini:', c('>ChatGPT<'), c('>Gemini<'),
  '| popups:', c('boards-popup'), c('flipbook-popup'));
