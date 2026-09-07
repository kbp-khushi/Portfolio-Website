import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const OLD = `document.querySelectorAll('.stack-img[data-slug]').forEach(img=>{
  const slug=img.getAttribute('data-slug');
  let source=document.querySelector(\`.project-card[onclick*="'\${slug}'"] .card-img\`);
  // projects that live in a list rather than a card fall back to their page's first image
  if(!source)source=document.querySelector(\`#page-\${slug} img\`);
  if(source)img.src=source.src;
});`;
if (html.split(OLD).length-1 !== 1) throw new Error('populate script not found once');
// this script sits above several project pages in the document, so it has to wait
// for the parser to finish before it can find their images
const NEW = `function populateStackImages(){
  document.querySelectorAll('.stack-img[data-slug]').forEach(img=>{
    if(img.src)return;
    const slug=img.getAttribute('data-slug');
    let source=document.querySelector(\`.project-card[onclick*="'\${slug}'"] .card-img\`);
    // projects that live in a list rather than a card fall back to their page's first image
    if(!source)source=document.querySelector(\`#page-\${slug} img\`);
    if(source)img.src=source.src;
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',populateStackImages);
else populateStackImages();`;
html = html.replace(OLD, () => NEW);
writeFileSync(P, html);
console.log('[ok] stack images now populate after the document parses');
console.log('ends html:', html.trimEnd().endsWith('</html>'));
