import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

// 1. Upgrade CSS: two-line eyebrow + name treatment
const oldCss = `.pnav-link{position:relative;display:inline-block;padding-bottom:4px;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);text-decoration:none;transition:color .3s}
.pnav-link:hover{color:var(--text)}
.pnav-link::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .3s}
.pnav-link:hover::after{transform:scaleX(1)}
.pnav-link.pnav-prev::after{transform-origin:right}`;

const newCss = `.pnav-link{position:relative;display:inline-flex;flex-direction:column;gap:6px;text-decoration:none;color:var(--text);padding-bottom:6px}
.pnav-link.pnav-prev{align-items:flex-start}
.pnav-link:not(.pnav-prev){align-items:flex-end;text-align:right}
.pnav-eyebrow{font-family:var(--title);font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--text-light)}
.pnav-name{font-family:var(--title);font-size:20px;font-weight:700;letter-spacing:-0.3px;transition:color .3s}
.pnav-link:hover .pnav-name{color:var(--accent)}
.pnav-link::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .4s cubic-bezier(.22,1,.36,1)}
.pnav-link:hover::after{transform:scaleX(1)}
.pnav-link.pnav-prev::after{transform-origin:right}`;

if (!html.includes(oldCss)) throw new Error('old pnav CSS not found');
html = html.replace(oldCss, newCss);

// bump project-nav's own vertical padding for more breathing room
html = html.replace(
  '.project-nav{border-top:1px solid var(--line);margin:0 60px}',
  '.project-nav{border-top:1px solid var(--line);margin:0 60px}\n.project-nav{padding-top:36px !important;padding-bottom:36px !important}'
);

// 2. Rebuild each pnav-link's inner content into eyebrow + name
const linkRe = /<a ([^>]*class="pnav-link( pnav-prev)?"[^>]*)>([^<]*)<\/a>/g;
let count = 0;
html = html.replace(linkRe, (match, attrs, prevFlag, text) => {
  count++;
  const isPrev = !!prevFlag;
  let name = text.trim();
  if (isPrev) {
    name = name.replace(/^Previous\s*—\s*/, '');
  } else {
    name = name.replace(/\s*—\s*Next$/, '');
  }
  const eyebrow = isPrev ? 'Previous Project' : 'Next Project';
  return `<a ${attrs}><span class="pnav-eyebrow">${eyebrow}</span><span class="pnav-name">${name}</span></a>`;
});
console.log('rebuilt', count, 'pnav links');

writeFileSync('index.html', html);
console.log('done, size:', (html.length / 1024 / 1024).toFixed(1), 'MB');
