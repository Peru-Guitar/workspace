// Run from the workspace root after changing Fret Quest's SVG mark.
const sharp = require('../../pg-web/node_modules/sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../../pg-fretquest/public/icons');
(async () => {
  const source = await fs.readFile(path.join(root, 'quest-mark.svg'));
  for (const size of [192, 512]) {
    await sharp(source).resize(size, size).png().toFile(path.join(root, `icon-${size}.png`));
  }
  // Keep the entire mark inside Android's central safe circle.
  const mark = await sharp(source).resize(320, 320).png().toBuffer();
  await sharp({create: {width:512,height:512,channels:4,background:'#111111'}})
    .composite([{input:mark,left:96,top:96}]).png()
    .toFile(path.join(root, 'icon-maskable-512.png'));
})();
