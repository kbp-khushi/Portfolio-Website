import { removeBackground } from '@imgly/background-removal-node';
import { readFileSync, writeFileSync } from 'fs';
const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';
const inputBuf = readFileSync(`${BASE}/converted/massing-model/finals/IMG_8091.jpg`);
const blob = new Blob([inputBuf], { type: 'image/jpeg' });
const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
writeFileSync(`${OUT}/test-8091-nobg.png`, Buffer.from(await resultBlob.arrayBuffer()));
console.log('done');
