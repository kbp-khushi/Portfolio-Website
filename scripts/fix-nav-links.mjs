import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

// 1. Add new CSS class after .dl-link block
const cssAnchor = ".dl-link:hover::after{transform:scaleX(1)}";
const newCss = `
.pnav-link{position:relative;display:inline-block;padding-bottom:4px;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);text-decoration:none;transition:color .3s}
.pnav-link:hover{color:var(--text)}
.pnav-link::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .3s}
.pnav-link:hover::after{transform:scaleX(1)}
.pnav-link.pnav-prev::after{transform-origin:right}`;
if (!html.includes(cssAnchor)) throw new Error('css anchor not found');
html = html.replace(cssAnchor, cssAnchor + newCss);

// 2. Replace inline style within each project-nav block only
const oldInline = `style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'"`;
const escapedOldInline = oldInline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const oldInlineRe = new RegExp(escapedOldInline, 'g');

let count = 0;
html = html.replace(/<div class="project-nav"[\s\S]*?<\/div>/g, (block) => {
  return block.replace(oldInlineRe, (m, offset) => {
    count++;
    const afterTag = block.slice(offset, offset + 300);
    const isPrev = /&#10229;[\sA-Za-z]/.test(afterTag);
    return `class="pnav-link${isPrev ? ' pnav-prev' : ''}"`;
  });
});
console.log('replaced', count, 'project-nav link styles');

writeFileSync('index.html', html);
console.log('done, size:', (html.length / 1024 / 1024).toFixed(1), 'MB');
