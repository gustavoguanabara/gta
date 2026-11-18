// Renderiza todos los videos de diálogo a ../story/videos/<id>.mp4 con un solo bundle.
// Uso: npm run render:all   (opcional: un filtro, ej. npm run render:all -- 03-volcan, o -- -v para solo verticales)
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../story/videos');
fs.mkdirSync(outDir, { recursive: true });
const filtro = process.argv[2] || '';
const browserExecutable = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;

const serveUrl = await bundle({ entryPoint: path.resolve(here, '../src/index.ts') });
const comps = (await getCompositions(serveUrl, { browserExecutable })).filter((c) => c.id.includes(filtro));
for (const composition of comps) {
  // Las composiciones verticales (id terminado en -v) van a story/videos/vertical/.
  const vertical = composition.id.endsWith('-v');
  if (vertical) fs.mkdirSync(path.join(outDir, 'vertical'), { recursive: true });
  const outputLocation = vertical
    ? path.join(outDir, 'vertical', `${composition.id.slice(0, -2)}.mp4`)
    : path.join(outDir, `${composition.id}.mp4`);
  await renderMedia({
    serveUrl,
    composition,
    codec: 'h264',
    crf: 27,
    muted: true,
    outputLocation,
    browserExecutable,
    concurrency: 4,
  });
  console.log('✔', composition.id, `${(fs.statSync(outputLocation).size / 1024).toFixed(0)} KB`);
}
