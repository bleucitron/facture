import fs from 'fs';
import { PNG } from 'pngjs';

const widthNb = 28;
const heightNb = 18;

const imgName = 'pokemon';

fs
.createReadStream(`../images/${imgName}.png`)
.pipe(new PNG())
.on('parsed', function () {
  const width = this.width / widthNb;
  const height = this.height / heightNb;

  const rows = [...Array(widthNb).keys()];
  const columns = [...Array(heightNb).keys()];

  columns.forEach(column => {
    rows.forEach(row => {
      const nb = (row + 1) % (widthNb + 1) + column * widthNb;
      console.log('Nb', nb);
      var dst = new PNG({ width, height });
      this.bitblt(dst, row * width, column * height, width, height, 0, 0);
      dst.pack().pipe(fs.createWriteStream(`./images/${imgName}/${ nb }.png`));
    });
  });
});
