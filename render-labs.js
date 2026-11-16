const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

const LABS = [
  { number: 1, file: 'Lab 1.pdf' },
  { number: 2, file: 'Lab 2.pdf' },
  { number: 3, file: 'Lab 3.pdf' },
  { number: 4, file: 'Lab4.pdf' },
  { number: 5, file: 'Lab5.pdf' },
  { number: 6, file: 'Lab6.pdf' },
  { number: 7, file: 'Lab7.pdf' },
];

const OUT_DIR = path.join(__dirname, 'public', 'labs');

(async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {};

  for (const lab of LABS) {
    const fp = path.join(__dirname, 'Firewall LAB', lab.file);
    if (!fs.existsSync(fp)) { console.log(`skip ${lab.file} (not found)`); continue; }
    const data = new Uint8Array(fs.readFileSync(fp));
    const doc = await pdfjs.getDocument({ data }).promise;
    const labDir = path.join(OUT_DIR, 'lab' + lab.number);
    if (!fs.existsSync(labDir)) fs.mkdirSync(labDir, { recursive: true });

    const pages = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      // High DPI for crisp text/diagrams (vector PDFs scale cleanly).
      const vp = page.getViewport({ scale: 3.0 });
      const canvas = createCanvas(Math.floor(vp.width), Math.floor(vp.height));
      const ctx = canvas.getContext('2d');
      // White background so the sheet looks like paper.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, vp.width, vp.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const buf = canvas.toBuffer('image/webp', 90);
      const name = 'page' + p + '.webp';
      fs.writeFileSync(path.join(labDir, name), buf);
      pages.push('labs/lab' + lab.number + '/' + name);
      process.stdout.write(`\r  ${lab.file} page ${p}/${doc.numPages} (${Math.round(buf.length / 1024)} KB)      `);
    }
    manifest[lab.number] = pages;
    console.log(`\n  ${lab.file}: ${pages.length} pages rendered`);
    await doc.cleanup();
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\nDone. Manifest written to public/labs/manifest.json');
})();
