import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync } from 'fs';

// Caesura's exploded axon (037-image.jpg) clips the top of the pink tree on the left.
// The labelled board version has no more room above it, but Building Axo.pdf has the
// full tree. scripts/axon-register.mjs found where that render sits on the web image
// (scale 0.735, offset -306,-306); this adds a white band on top and fills it from the
// PDF, then lays the original image back over everything below the band.
// Writes a new filename, since browsers cache images by path.
const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const S = 0.735, DX = -306, DY = -306;
const BAND = 56;

const doc = mupdf.Document.openDocument(readFileSync(`${BASE}/Caesura/Building Axo.pdf`), 'application/pdf');
const pix = doc.loadPage(0).toPixmap(mupdf.Matrix.scale(200 / 72, 200 / 72), mupdf.ColorSpace.DeviceRGB, false, true);
const src = await sharp(Buffer.from(pix.asPNG())).resize(Math.round(2200 * S), Math.round(3400 * S)).toBuffer();

const webPath = `${BASE}/site/images/037-image.jpg`;
const { width: W, height: H } = await sharp(webPath).metadata();

const band = await sharp(src).extract({ left: -DX, top: -DY - BAND, width: W, height: BAND }).toBuffer();
await sharp({ create: { width: W, height: H + BAND, channels: 3, background: '#ffffff' } })
  .composite([{ input: band, left: 0, top: 0 }, { input: webPath, left: 0, top: BAND }])
  .jpeg({ quality: 90 })
  .toFile(`${BASE}/site/images/037-image-treetop.jpg`);
console.log('wrote 037-image-treetop.jpg', W, H + BAND);
