import sharp from 'sharp';
const files = ['site/images/075-image.jpg','site/images/042-image.jpg','site/images/070-image.jpg','site/images/071-image.jpg'];
for (const f of files) {
  const img = sharp(f);
  const meta = await img.metadata();
  const { data, info } = await img.greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, TH = 245;
  let top=H, bot=-1, left=W, right=-1;
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
    if (data[y*W+x] < TH) { if(y<top)top=y; if(y>bot)bot=y; if(x<left)left=x; if(x>right)right=x; }
  }
  const pct = n => ((n/H)*100).toFixed(1)+'%';
  console.log(`${f}  ${meta.width}x${meta.height}`);
  console.log(`   content rows ${top}..${bot}   top blank ${top}px (${pct(top)})   bottom blank ${H-1-bot}px (${pct(H-1-bot)})`);
  console.log(`   content cols ${left}..${right}  left blank ${left}px  right blank ${W-1-right}px`);
}
