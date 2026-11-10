const fs = require('fs');
const path = require('path');

async function extractPdf(filePath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const lines = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY = null;
    let line = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const str = item.str;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        if (line.trim()) lines.push(line.trim());
        line = str;
      } else {
        line += str;
      }
      lastY = y;
    }
    if (line.trim()) lines.push(line.trim());
    lines.push(`\n--- PAGE ${i} ---\n`);
  }
  return lines.join('\n');
}

async function extractPptx(filePath) {
  const JSZip = require('jszip');
  const buf = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buf);
  // Find slide files sorted by number
  const slideNames = Object.keys(zip.files)
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)[1]);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)[1]);
      return na - nb;
    });
  const out = [];
  for (const name of slideNames) {
    const xml = await zip.file(name).async('string');
    out.push(`\n--- SLIDE ${name.match(/slide(\d+)/)[1]} ---\n`);
    out.push(extractTextFromSlideXml(xml));
  }
  return out.join('\n');
}

function extractTextFromSlideXml(xml) {
  // Extract all <a:t> text runs, grouped by paragraph
  const paragraphs = xml.split(/<a:p[ >]/).slice(1);
  const lines = [];
  for (const p of paragraphs) {
    const runs = [...p.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m => m[1]);
    if (runs.length) {
      let text = runs.join('');
      text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      lines.push(text.trim());
    }
  }
  return lines.filter(l => l).join('\n');
}

module.exports = { extractPdf, extractPptx };

async function main() {
  const [, , filePath] = process.argv;
  if (!filePath) {
    console.error('Usage: node extract.js <file>');
    process.exit(1);
  }
  const ext = path.extname(filePath).toLowerCase();
  const text = ext === '.pdf' ? await extractPdf(filePath) : await extractPptx(filePath);
  console.log(text);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}
