import { removeBackground } from '@imgly/background-removal-node';
import { readFileSync, writeFileSync } from 'fs';

const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

const inputBuf = readFileSync(`${OUT}/test-overhead-cropped.jpg`);
const blob = new Blob([inputBuf], { type: 'image/jpeg' });
const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
const arrayBuf = await resultBlob.arrayBuffer();
writeFileSync(`${OUT}/test-overhead-cropped-nobg.png`, Buffer.from(arrayBuf));
console.log('done');
