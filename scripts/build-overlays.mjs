import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64';

function readB64(path) {
  return readFileSync(path, 'utf-8').trim();
}

function readAllB64(dir) {
  const files = readdirSync(dir).filter(f => f.endsWith('.txt')).sort();
  return files.map(f => readB64(join(dir, f)));
}


// --- Virtuous Book ---
const vbPages = readAllB64(join(B64, 'virtuous-book'));
const virtuousBook = `
<div class="project-page" id="page-virtuous-book">
  <button class="pp-back" onclick="closeProject()">&larr; Back</button>
  <button class="pp-close" onclick="closeProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s" onmouseover="this.style.color='var(--text)';this.style.borderColor='var(--accent)'" onmouseout="this.style.color='var(--text-light)';this.style.borderColor='var(--line)'">&times;</button>
  <div class="pp-header">
    <div class="pp-label">Graphic Design &amp; Typography</div>
    <h2 class="pp-title">Virtuous Book</h2>
    <div class="pp-subtitle">A Typographic Exploration of Design as Dialogue</div>
    <div class="pp-course">GRDS 353 &bull; Professor McKinney</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>This book merges Bruno Munari&rsquo;s methodical approach to design with Michael Bierut&rsquo;s reflective narrative style, challenging readers to see design beyond aesthetics. Through a dynamic typographic landscape, each page serves as a carefully curated composition, utilizing contrast, rhythm, and hierarchy to guide perception and provoke thought.</p>
  </div>
  <div style="padding:20px 60px;text-align:center">
    <a class="dl-link" onclick="openFlipbook('virtuous-book')" style="cursor:pointer">View Book</a>
  </div>
  <div id="boards-virtuous-book" style="display:none">
${vbPages.map(b => `    <img src="${b}" alt="Virtuous Book page">`).join('\n')}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <a onclick="closeProject();setTimeout(function(){openProject('section-model');},100)" style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'">&larr; Section Model</a>
    <a onclick="closeProject();setTimeout(function(){openProject('beaufort-cookbook');},100)" style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'">From Elsewhere &rarr;</a>
  </div>
  <div style="height:80px"></div>
</div>
`;

// --- Cookbook ---
const cbPages = readAllB64(join(B64, 'cookbook'));
// Reorder cookbook: remove page 1 (index 0), move pages 2-3 (indices 1-2) to end
const cbPage1 = cbPages.shift(); // remove page-01
const cbPages2and3 = cbPages.splice(0, 2); // extract page-02, page-03
cbPages.push(...cbPages2and3); // append at end

const cookbook = `
<div class="project-page" id="page-beaufort-cookbook">
  <button class="pp-back" onclick="closeProject()">&larr; Back</button>
  <button class="pp-close" onclick="closeProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s" onmouseover="this.style.color='var(--text)';this.style.borderColor='var(--accent)'" onmouseout="this.style.color='var(--text-light)';this.style.borderColor='var(--line)'">&times;</button>
  <div class="pp-header">
    <div class="pp-label">Graphic Design</div>
    <h2 class="pp-title">From Elsewhere</h2>
    <div class="pp-subtitle">A Scrapbook Cookbook for Beaufort Bakery</div>
    <div class="pp-course">GDVX 501 &bull; Professor McKinney &bull; 2026</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>A cookbook built around a story: a baker who collected recipes from the cities she passed through. The name Beaufort, the short menu, the sketchbook format, none of it felt arbitrary. The scrapbook aesthetic demanded restraint; pulling things out was harder than putting them in. The handwriting, the taped photos, the coffee stains, the recipe she kept for herself at the end, it feels like something she carried.</p>
  </div>
  <div style="padding:20px 60px;text-align:center">
    <a class="dl-link" onclick="openFlipbook('beaufort-cookbook')" style="cursor:pointer">View Cookbook</a>
  </div>
  <div id="boards-beaufort-cookbook" style="display:none">
${cbPages.map(b => `    <img src="${b}" alt="From Elsewhere page">`).join('\n')}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <a onclick="closeProject();setTimeout(function(){openProject('virtuous-book');},100)" style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'">&larr; Virtuous Book</a>
    <span></span>
  </div>
  <div style="height:80px"></div>
</div>
`;

// --- Massing Model ---
const massingFinals = [
  readB64(join(B64, 'massing-model/finals/IMG_8083.txt')),
  readB64(join(B64, 'massing-model/finals/IMG_8084.txt')),
  readB64(join(B64, 'massing-model/finals/IMG_8093.txt')),
  readB64(join(B64, 'massing-model/finals/IMG_8092.txt')),
  readB64(join(B64, 'massing-model/finals/IMG_8098.txt')),
  readB64(join(B64, 'massing-model/finals/IMG_8097.txt')),
];
const massingProcess = readAllB64(join(B64, 'massing-model/process'));

const massingModel = `
<div class="project-page" id="page-massing-model">
  <button class="pp-back" onclick="closeProject()">&larr; Back</button>
  <button class="pp-close" onclick="closeProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s" onmouseover="this.style.color='var(--text)';this.style.borderColor='var(--accent)'" onmouseout="this.style.color='var(--text-light)';this.style.borderColor='var(--line)'">&times;</button>
  <div class="pp-header">
    <div class="pp-label">Architecture Models, The Pause</div>
    <h2 class="pp-title">Massing Model</h2>
    <div class="pp-subtitle">Site &amp; Building Massing Study</div>
    <div class="pp-course">ARCH 727</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>Massing model for The Pause at Aiken State Park, exploring the relationship between building volumes, the curving pathway, and the surrounding landscape.</p>
    <p style="font-family:var(--title);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:12px">Laser cut basswood and chipboard</p>
  </div>
  <div style="padding:0 60px">
    <div class="pp-reveal" style="margin-bottom:32px">
      <img src="${massingFinals[0]}" alt="Massing model plan view" style="width:100%;max-width:900px;display:block;margin:0 auto;background:none !important">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1200px;margin:0 auto">
      <div class="pp-reveal"><img src="${massingFinals[1]}" alt="Massing model front view" style="width:100%;aspect-ratio:4/3;object-fit:cover;background:none !important"></div>
      <div class="pp-reveal"><img src="${massingFinals[2]}" alt="Massing model side view" style="width:100%;aspect-ratio:4/3;object-fit:cover;background:none !important"></div>
      <div class="pp-reveal"><img src="${massingFinals[3]}" alt="Massing model angle view" style="width:100%;aspect-ratio:4/3;object-fit:cover;background:none !important"></div>
      <div class="pp-reveal"><img src="${massingFinals[4]}" alt="Massing model detail" style="width:100%;aspect-ratio:4/3;object-fit:cover;background:none !important"></div>
    </div>
    <div class="pp-reveal" style="margin-top:32px">
      <img src="${massingFinals[5]}" alt="Massing model front elevation" style="width:100%;max-width:900px;display:block;margin:0 auto;background:none !important">
    </div>
  </div>
  <div style="padding:40px 60px;text-align:center">
    <a class="dl-link" onclick="openFlipbook('massing-model-process')" style="cursor:pointer">View Process Photos</a>
  </div>
  <div id="boards-massing-model-process" style="display:none">
${massingProcess.map(b => `    <img src="${b}" alt="Massing model process">`).join('\n')}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <span></span>
    <a onclick="closeProject();setTimeout(function(){openProject('section-model');},100)" style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'">Section Model &rarr;</a>
  </div>
  <div style="height:80px"></div>
</div>
`;

// --- Section Model ---
const sectionFinals = readAllB64(join(B64, 'section-model/finals'));
const sectionProcess = readAllB64(join(B64, 'section-model/process'));

const sectionModel = `
<div class="project-page" id="page-section-model">
  <button class="pp-back" onclick="closeProject()">&larr; Back</button>
  <button class="pp-close" onclick="closeProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s" onmouseover="this.style.color='var(--text)';this.style.borderColor='var(--accent)'" onmouseout="this.style.color='var(--text-light)';this.style.borderColor='var(--line)'">&times;</button>
  <div class="pp-header">
    <div class="pp-label">Architecture Models, The Pause</div>
    <h2 class="pp-title">Section Model</h2>
    <div class="pp-subtitle">Building Section &amp; Structural Detail</div>
    <div class="pp-course">ARCH 737</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>Section model for The Pause at Aiken State Park, revealing the internal spatial relationships, structural system, and connection between interior and landscape.</p>
    <p style="font-family:var(--title);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:12px">Handcut basswood, chipboard, illustration board, bristol, and 3D printed parts</p>
  </div>
  <div style="padding:0 60px">
    <div class="pp-reveal" style="margin-bottom:32px">
      <img src="${sectionFinals[0]}" alt="Section model view 1" style="width:100%;max-width:900px;display:block;margin:0 auto;background:none !important">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1200px;margin:0 auto">
      <div class="pp-reveal"><img src="${sectionFinals[1]}" alt="Section model view 2" style="width:100%;background:none !important"></div>
      <div class="pp-reveal"><img src="${sectionFinals[2]}" alt="Section model view 3" style="width:100%;background:none !important"></div>
      <div class="pp-reveal"><img src="${sectionFinals[3]}" alt="Section model view 4" style="width:100%;background:none !important"></div>
      <div class="pp-reveal"><img src="${sectionFinals[4]}" alt="Section model view 5" style="width:100%;background:none !important"></div>
    </div>
  </div>
  <div style="padding:40px 60px;text-align:center">
    <a class="dl-link" onclick="openFlipbook('section-model-process')" style="cursor:pointer">View Process Photos</a>
  </div>
  <div id="boards-section-model-process" style="display:none">
${sectionProcess.map(b => `    <img src="${b}" alt="Section model process">`).join('\n')}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <a onclick="closeProject();setTimeout(function(){openProject('massing-model');},100)" style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'">&larr; Massing Model</a>
    <a onclick="closeProject();setTimeout(function(){openProject('virtuous-book');},100)" style="cursor:pointer;font-family:var(--title);font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-light);transition:color .3s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-light)'">Virtuous Book &rarr;</a>
  </div>
  <div style="height:80px"></div>
</div>
`;

// --- Write output ---
// massingModel excluded for now (in progress)
const allOverlays = virtuousBook + cookbook + sectionModel;
writeFileSync('C:/KHUSHI/Claude/Portfolio-Website/scripts/overlays.html', allOverlays);
console.log(`Generated overlays.html (${(allOverlays.length / 1024 / 1024).toFixed(1)} MB)`);
