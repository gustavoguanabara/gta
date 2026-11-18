// Sincroniza la historia (story/*.md) con el proyecto de video:
// 1. Marca en cada misión dónde empieza un bloque de diálogo en video (- VIDEO: videos/...).
// 2. Copia los recursos que usan los videos a video/public/story.
// 3. Genera src/escenas.generated.ts con los datos de cada video.
// Uso: node scripts/sync-story.mjs   (desde la carpeta video/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.resolve(here, '..');
const storyDir = path.resolve(videoDir, '../story');
const publicStory = path.join(videoDir, 'public/story');

const readFront = (raw) => {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const end = lines.indexOf('---', 1);
  const meta = {};
  for (const l of lines.slice(1, end)) {
    const i = l.indexOf(':');
    if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  return { meta, lines, end };
};

const list = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
const manifest = readFront(fs.readFileSync(path.join(storyDir, 'story.md'), 'utf8')).meta;

// Personajes
const characters = {};
for (const id of list(manifest.characters)) {
  const { meta } = readFront(fs.readFileSync(path.join(storyDir, 'characters', `${id}.md`), 'utf8'));
  characters[id] = { id, name: meta.name, profile: meta.profile || '' };
}
const findCharacter = (speaker) => {
  const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const s = norm(speaker);
  return Object.values(characters).find((c) => norm(c.id) === s || norm(c.name) === s || norm(c.name).split(/\s+/)[0] === s);
};

// Nombres del mapa para reemplazar códigos (COM-30 → Puerto de partida)
const mapNames = new Map();
for (const line of fs.readFileSync(path.join(storyDir, 'map/map.md'), 'utf8').split('\n')) {
  const m = line.trim().replace(/^- /, '').match(/^([A-Z]+-\d+):\s*(.+)$/);
  if (m) mapNames.set(m[1], m[2]);
}
const names = (t) => t.replace(/\b((?:RUA|CASA|COM|PRACA|HOSP)-\d+)\b/g, (c) => mapNames.get(c) || c);

const items = {};
for (const id of list(manifest.items)) {
  const { meta } = readFront(fs.readFileSync(path.join(storyDir, 'items', `${id}.md`), 'utf8'));
  items[id] = { name: meta.name, image: meta.image };
}

const INTERACTIVE = /^- (OPCAO|OPCION|OPCIÓN|LINK|ENTREGAR):/i;
const SPEECH = /^- ([^:]+):\s*(.+)$/;
const files = [
  ...list(manifest.missions).map((id) => ({ id, kind: 'mission' })),
  ...list(manifest.encounters).map((id) => ({ id, kind: 'encounter' })),
];

const scenes = [];
files.forEach(({ id, kind }, missionIndex) => {
  const file = path.join(storyDir, 'missions', `${id}.md`);
  const { meta, lines, end } = readFront(fs.readFileSync(file, 'utf8'));
  const out = lines.slice(0, end + 1);
  let section = null;
  let left = '';
  let right = '';
  let counter = 0;
  const body = lines.slice(end + 1);
  for (let i = 0; i < body.length; i++) {
    const raw = body[i];
    const t = raw.trim();
    if (t.startsWith('## ')) {
      section = t.slice(3).trim().toUpperCase();
      counter = 0;
      left = right = '';
      out.push(raw);
      continue;
    }
    if (/^left:/i.test(t)) left = t.split(':')[1].trim();
    if (/^right:/i.test(t)) right = t.split(':')[1].trim();
    if (t.startsWith('- VIDEO:')) continue; // se regenera
    const sp = t.match(SPEECH);
    const isSpeech = sp && !INTERACTIVE.test(t);
    if (!isSpeech) { out.push(raw); continue; }
    // ¿Es la fala que lleva opciones o un LINK? Entonces queda interactiva.
    const nextNonEmpty = body.slice(i + 1).find((l) => l.trim());
    const holdsInteraction = nextNonEmpty && /^- (OPCAO|OPCION|OPCIÓN|LINK):/i.test(nextNonEmpty.trim());
    const prevOut = out.filter((l) => l.trim()).at(-1)?.trim() || '';
    const prevIsPlainSpeech = SPEECH.test(prevOut) && !INTERACTIVE.test(prevOut) && !prevOut.startsWith('- VIDEO:');
    if (holdsInteraction) { out.push(raw); continue; }
    if (!prevIsPlainSpeech || prevOut === '') {
      counter += 1;
      const tag = { CUTSCENE_INICIO: 'inicio', CUTSCENE_FIM: 'fin', CUTSCENE: 'escena' }[section] || 'escena';
      const videoId = `${id}-${tag}-${counter}`;
      out.push(`- VIDEO: videos/${videoId}.mp4`);
      scenes.push({
        id: videoId,
        missionId: id,
        kind,
        section: tag,
        order: counter,
        missionNumber: kind === 'mission' ? missionIndex + 1 : 0,
        title: names(meta.title || ''),
        color: meta.roof_color || '#00A096',
        logo: meta.roof_logo || '',
        left, right,
        lines: [],
        reward: null,
      });
    }
    const scene = scenes.at(-1);
    const who = findCharacter(sp[1]);
    scene.lines.push({ speaker: who?.id || '', name: who?.name || sp[1].trim(), text: names(sp[2].trim()) });
    out.push(raw);
  }
  fs.writeFileSync(file, out.join('\n'));
  // El último video del final entrega el cofre.
  if (meta.reward_item) {
    const last = scenes.filter((s) => s.missionId === id && s.section === 'fin').at(-1);
    if (last) {
      const item = items[meta.reward_item];
      last.reward = { name: item.name, image: item.image, letter: item.name.trim().slice(-1) };
    }
  }
});

// Recursos para los videos
fs.rmSync(publicStory, { recursive: true, force: true });
for (const dir of ['characters', 'logos-cursos', 'assets', 'map']) {
  fs.cpSync(path.join(storyDir, dir), path.join(publicStory, dir), {
    recursive: true,
    filter: (src) => !src.endsWith('.md'),
  });
}

const durationOf = (scene) => {
  const intro = scene.section === 'inicio' && scene.order === 1 && scene.kind === 'mission' ? 75 : 20;
  const perLine = scene.lines.map((l) => Math.round(30 * Math.min(7, 1.6 + l.text.length / 17)));
  const outro = scene.reward ? 120 : 15;
  return { intro, perLine, outro, total: intro + perLine.reduce((a, b) => a + b, 0) + outro };
};

const data = scenes.map((s) => ({ ...s, timing: durationOf(s), characters: [s.left, s.right].filter(Boolean).map((c) => characters[c]) }));
fs.writeFileSync(
  path.join(videoDir, 'src/escenas.generated.ts'),
  `// Generado por scripts/sync-story.mjs a partir de story/. No editar a mano:\n// cambien el texto en story/missions/*.md y vuelvan a correr "npm run sync".\nimport type {Escena} from './tipos';\n\nexport const ESCENAS: Escena[] = ${JSON.stringify(data, null, 2)};\n`,
);
console.log(`${data.length} videos de diálogo:`);
for (const d of data) console.log(`  ${d.id}  ${d.lines.length} falas  ${(d.timing.total / 30).toFixed(1)} s${d.reward ? '  + cofre ' + d.reward.letter : ''}`);
