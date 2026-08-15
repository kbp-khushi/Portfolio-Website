import { removeBackground } from '@imgly/background-removal-node';
import { readFileSync, writeFileSync } from 'fs';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

async function run(inputPath, outName) {
  const inputBuf = readFileSync(inputPath);
  const blob = new Blob([inputBuf], { type: 'image/jpeg' });
  const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
  const arrayBuf = await resultBlob.arrayBuffer();
  writeFileSync(`${OUT}/${outName}-nobg.png`, Buffer.from(arrayBuf));
  console.log(`${outName}: done`);
}

await run(`${BASE}/converted/massing-model/finals/IMG_8095.jpg`, 'test-overhead');
await run(`${BASE}/converted/massing-model/finals/IMG_8088.jpg`, 'test-frontview');
