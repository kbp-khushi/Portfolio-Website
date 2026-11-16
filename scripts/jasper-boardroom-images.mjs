// Jasper Boardroom (freelance for Staging By Design, Nov 2026) -> site images.
// Takes the clean colored drawings (no labels, no dimensions) from the
// Jasper-Boardroom project and writes 2400 px wide JPGs into site/images.
// Prints each file's final width/height for the <img> attributes.
import sharp from 'sharp';
import path from 'node:path';

const SRC = 'C:/KHUSHI/Claude/1-Projects/Jasper-Boardroom/previews/color';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/images';

const jobs = [
  ['JB - COLOR - FLOOR PLAN - NO LABELS - ROTATED.png', '203-jasper-plan.jpg'],
  ['JB - COLOR - ELEV A.png', '204-jasper-tv-wall.jpg'],
  ['JB - COLOR - ELEV B.png', '205-jasper-window-wall.jpg'],
  ['JB - COLOR - ELEV C.png', '206-jasper-lettering-wall.jpg'],
  ['JB - COLOR - ELEV D - NO DIMS.png', '207-jasper-bench-wall.jpg'],
];

// 2026-11-16: Khushi swapped the page to the labeled (callout) drawings and
// dropped the PDF button. Wider than usual (3000 px) so the callouts survive zoom.
const labeled = [
  ['labeled/JB - COLOR - FLOOR PLAN - LABELED - ROTATED.png', '244-jasper-plan-labeled.jpg'],
  ['labeled/JB - COLOR - ELEV A - LABELED.png', '245-jasper-tv-wall-labeled.jpg'],
  ['labeled/JB - COLOR - ELEV B - LABELED.png', '246-jasper-window-wall-labeled.jpg'],
  ['labeled/JB - COLOR - ELEV C - LABELED.png', '247-jasper-lettering-wall-labeled.jpg'],
  ['labeled/JB - COLOR - ELEV D - LABELED.png', '248-jasper-bench-wall-labeled.jpg'],
];

const only = process.argv[2]; // 'clean' or 'labeled'
for (const [set, width] of [[jobs, 2400], [labeled, 3000]]) {
  if (only && (only === 'labeled') !== (set === labeled)) continue;
  for (const [src, out] of set) {
    const info = await sharp(path.join(SRC, src), { limitInputPixels: false })
      .flatten({ background: '#ffffff' })
      .trim({ background: '#ffffff', threshold: 4 })
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT, out));
    console.log(out, info.width, info.height, Math.round(info.size / 1024) + ' KB');
  }
}
