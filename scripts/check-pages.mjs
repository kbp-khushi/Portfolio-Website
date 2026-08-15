import * as mupdf from 'mupdf';
import { readFileSync } from 'fs';
for (const f of ['../The Woven Edge/Site Plan Icon Diagrams.pdf', '../The Woven Edge/Final Site Plan Cropped.pdf', '../The Woven Edge/Stepping Render.pdf']) {
  const buf = readFileSync(f);
  const doc = mupdf.Document.openDocument(buf, 'application/pdf');
  console.log(f, '->', doc.countPages(), 'pages');
}
