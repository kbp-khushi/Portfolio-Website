import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/converted/massing-model/finals';
const B64_OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/massing-model/finals';

async function cropTopWhitespace(inputPath, outputName, topPadding = 24) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let firstContentRow = height;
  for (let y = 0; y < height; y++) {
    let rowHasContent = false;
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * channels;
      if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) { rowHasContent = true; break; }
    }
    if (rowHasContent) { firstContentRow = y; break; }
  }

  const cropTop = Math.max(0, firstContentRow - topPadding);
  console.log(`  ${outputName}: first content row ${firstContentRow}, cropping top ${cropTop}px of ${height}px`);

  const buf = await sharp(inputPath)
    .extract({ left: 0, top: cropTop, width, height: height - cropTop })
    .jpeg({ quality: 82 })
    .toBuffer();

  writeFileSync(join(CONVERTED, `${outputName}-cropped.jpg`), buf);
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(B64_OUT, `${outputName}.txt`), b64);

  const meta = await sharp(buf).metadata();
  console.log(`  ${outputName}: new size ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB b64`);
}

await cropTopWhitespace(join(CONVERTED, 'pick-1-current.jpg'), 'pick-1');
await cropTopWhitespace(join(CONVERTED, 'pick-2-v2.jpg'), 'pick-2');
console.log('Done cropping top whitespace');
