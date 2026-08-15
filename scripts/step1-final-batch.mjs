import { removeBackground } from '@imgly/background-removal-node';
import { readFileSync, writeFileSync } from 'fs';
const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const SCRATCH = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

async function run(inputPath, outName) {
  const inputBuf = readFileSync(inputPath);
  const blob = new Blob([inputBuf], { type: 'image/jpeg' });
  const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
  writeFileSync(`${SCRATCH}/${outName}-nobg.png`, Buffer.from(await resultBlob.arrayBuffer()));
  console.log(`${outName}: done`);
}

// Final confirmed replacements: plan view, front elevation, front view
await run(`${BASE}/converted/massing-model/finals/IMG_8083.jpg`, 'final-pick1-plan');
await run(`${BASE}/converted/massing-model/finals/IMG_8101.jpg`, 'final-pick2-frontelev');
await run(`${BASE}/converted/massing-model/finals/IMG_8088.jpg`, 'final-pick4-frontview');
