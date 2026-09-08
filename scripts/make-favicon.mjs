import sharp from 'sharp';
import { writeFileSync } from 'fs';

// The site had no favicon, so tabs showed the browser's blank default. This
// makes one in the site's own system: solid black, lowercase "kp" in white,
// matching the "khushi patel" wordmark.

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';

const mark = (size) => {
  const fs = Math.round(size * 0.46);
  // optical centring: the baseline sits slightly below true centre
  const baseline = Math.round(size * 0.68);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <text x="${size / 2}" y="${baseline}" font-family="Arial, Helvetica, sans-serif" font-size="${fs}"
        font-weight="700" letter-spacing="${(size * 0.005).toFixed(2)}" fill="#FFFFFF"
        text-anchor="middle">kp</text>
</svg>`;
};

const targets = [
  ['site/favicon-32.png', 32],
  ['site/favicon-180.png', 180],
];

for (const [out, size] of targets) {
  const buf = await sharp(Buffer.from(mark(size * 4)))
    .resize(size, size, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  writeFileSync(`${ROOT}/${out}`, buf);
  console.log(`[ok] ${out} (${size}x${size}, ${buf.length} bytes)`);
}
