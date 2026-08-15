import { removeBackground } from '@imgly/background-removal-node';
import { readFileSync, writeFileSync } from 'fs';

const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

async function test(inputPath, outName) {
  const inputBuf = readFileSync(inputPath);
  const blob = new Blob([inputBuf], { type: 'image/jpeg' });
  const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
  const arrayBuf = await resultBlob.arrayBuffer();
  const pngBuf = Buffer.from(arrayBuf);
  writeFileSync(`${OUT}/${outName}-nobg.png`, pngBuf);
  console.log(`${outName}: done`);
}

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
await test(`${BASE}/converted/massing-model/finals/IMG_8083.jpg`, 'test-plan');
await test(`${BASE}/converted/massing-model/finals/IMG_8101.jpg`, 'test-frontelev');
