import { readFileSync, writeFileSync } from 'fs';

// Follow-up to the mobile pass. Three edges still did not land on 24px:
//
// 1. .project-nav carries an inline padding:40px 60px, which the attribute
//    override rewrites to 24px with !important and beats the plain class
//    rule, so margin 24 + padding 24 put its content at 48. Raising the
//    specificity to .project-page .project-nav wins the cascade back.
// 2. Camber and Site Analysis wrap content in an inline padding:0 60px that
//    no override covered.
// 3. Facade Mask's brief was still on 16px.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (oldStr, newStr, label) => {
  const hits = html.split(oldStr).length - 1;
  if (hits !== 1) throw new Error(`${label}: ${hits} matches`);
  html = html.replace(oldStr, () => newStr);
  console.log('[ok]', label);
};

// 1) beat the inline-padding override, so the rule and its text share one edge
swap('.project-nav{margin:0 24px!important;padding:24px 0 0!important}',
     '.project-page .project-nav{margin:0 24px!important;padding:24px 0 0!important}',
     'project-nav specificity raised');

// 2) the uncovered inline padding
swap('[style*="padding:12px 60px"]{padding:12px 24px!important}',
     '[style*="padding:12px 60px"]{padding:12px 24px!important}\r\n' +
     '  [style*="padding:0 60px"]{padding-left:24px!important;padding-right:24px!important}',
     'padding:0 60px wrappers brought to 24px');

// 3) Facade Mask brief
const FM = (html.match(/\.fm-brief\{[^}]*\}/g) || []).filter(r => r.includes('16px'));
if (FM.length !== 1) throw new Error(`fm-brief 16px rules: ${FM.length}`);
swap(FM[0], FM[0].split('16px').join('24px'), 'fm-brief gutter 16 -> 24');

writeFileSync(P, html);

const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'), '| inline data URIs:', c('data:image/'));
