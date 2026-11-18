export class StoryParseError extends Error {
  constructor(fileName, line, message) {
    const loc = line ? `${fileName}:${line}` : fileName;
    super(`[${loc}] ${message}`);
    this.name = 'StoryParseError';
    this.fileName = fileName;
    this.line = line || 0;
  }
}

export function validateAssetPath(rawPath, fileName, line = 1) {
  const value = String(rawPath || '').trim();
  if (!value) return '';
  if (
    value.startsWith('/') ||
    value.startsWith('\\') ||
    value.includes('..') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)
  ) {
    throw new StoryParseError(
      fileName,
      line,
      `Ruta de recurso inválida "${value}". Usen solo rutas relativas dentro de la carpeta de la historia.`,
    );
  }
  return value.replace(/^\.\//, '');
}

export function parseFrontmatter(rawText, fileName = 'arquivo.md') {
  const normalized = String(rawText || '').replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  if (lines[0]?.trim() !== '---') {
    throw new StoryParseError(fileName, 1, 'Falta el encabezado frontmatter "---" en la primera línea.');
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    throw new StoryParseError(fileName, 1, 'No se encontró el cierre "---" del frontmatter.');
  }

  const meta = {};
  for (let i = 1; i < endIndex; i += 1) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex <= 0) {
      throw new StoryParseError(fileName, i + 1, `Línea inválida en el frontmatter: "${trimmed}". Se esperaba "clave: valor".`);
    }

    const key = trimmed.slice(0, colonIndex).trim();
    const val = trimmed.slice(colonIndex + 1).trim();
    meta[key] = val;
  }

  const body = lines.slice(endIndex + 1).join('\n').trim();
  return { meta, body, bodyStartLine: endIndex + 2 };
}

function parseListField(rawValue) {
  return String(rawValue || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseStoryManifest(rawText, fileName = 'story.md') {
  const { meta, body } = parseFrontmatter(rawText, fileName);

  if (!meta.title) {
    throw new StoryParseError(fileName, 2, 'Falta el campo obligatorio "title" en story.md.');
  }

  const characters = parseListField(meta.characters);
  if (characters.length === 0) {
    throw new StoryParseError(fileName, 2, 'El campo obligatorio "characters" debe listar al menos un personaje.');
  }

  const missions = parseListField(meta.missions);
  if (missions.length === 0) {
    throw new StoryParseError(fileName, 2, 'El campo obligatorio "missions" debe listar al menos una misión.');
  }

  const items = parseListField(meta.items);
  const collectibles = parseListField(meta.collectibles);
  const encounters = parseListField(meta.encounters);

  return {
    title: meta.title,
    pageTitle: meta.page_title || '',
    subtitle: meta.subtitle || '',
    splash: validateAssetPath(meta.splash || '', fileName, 2),
    characters,
    missions,
    items,
    collectibles,
    encounters,
    description: body,
  };
}

export function parseItemMarkdown(rawText, fileName = 'item.md') {
  const { meta, body } = parseFrontmatter(rawText, fileName);

  if (!meta.id || !meta.name) {
    throw new StoryParseError(fileName, 2, 'El objeto debe definir "id" y "name" en el frontmatter.');
  }

  const rawCategory = String(meta.category || 'missao').trim().toLowerCase();
  if (rawCategory !== 'missao' && rawCategory !== 'extra') {
    throw new StoryParseError(fileName, 2, `Categoría inválida para el objeto "${meta.id}": "${meta.category}". Usen "missao" (misión) o "extra".`);
  }
  const rawRarity = String(meta.rarity || '').trim().toLowerCase();
  if (rawRarity && rawRarity !== 'normal' && rawRarity !== 'especial' && rawRarity !== 'lendario') {
    throw new StoryParseError(fileName, 2, `Rareza inválida para el objeto "${meta.id}": "${meta.rarity}". Usen "normal", "especial" o "lendario" (legendario).`);
  }

  return {
    id: meta.id,
    name: meta.name,
    description: meta.description || body || '',
    image: validateAssetPath(meta.image || '', fileName, 2),
    location: String(meta.location || '').trim(),
    category: rawCategory,
    rarity: rawRarity || (rawCategory === 'extra' ? 'normal' : ''),
  };
}

export function parseCharacterMarkdown(rawText, fileName = 'character.md') {
  const { meta } = parseFrontmatter(rawText, fileName);

  if (!meta.id || !meta.name) {
    throw new StoryParseError(fileName, 2, 'El personaje debe definir "id" y "name" en el frontmatter.');
  }

  return {
    id: meta.id,
    name: meta.name,
    profile: meta.profile || '',
    traits: meta.traits || '',
    sprites: {
      top: validateAssetPath(meta.sprite_top || '', fileName, 2),
      front: validateAssetPath(meta.sprite_front || '', fileName, 2),
      left: validateAssetPath(meta.sprite_left || '', fileName, 2),
      right: validateAssetPath(meta.sprite_right || '', fileName, 2),
    },
  };
}

const OPTION_PREFIXES = ['- OPCAO:', '- OPCION:', '- OPCIÓN:'];

// Un paso VIDEO reemplaza a las falas simples que lo siguen (quedan como transcripción).
// Una fala con opciones, LINK o una entrega no se absorbe: sigue siendo interactiva.
function absorbVideoTranscripts(cutscene) {
  const steps = [];
  let currentVideo = null;
  for (const step of cutscene.steps) {
    if (step.type === 'video') {
      currentVideo = step;
      steps.push(step);
      continue;
    }
    const isPlainSpeech = !step.type && !step.link && !(step.choices && step.choices.length > 0);
    if (currentVideo && isPlainSpeech) {
      currentVideo.transcript.push({ speaker: step.speaker, text: step.text });
      continue;
    }
    currentVideo = null;
    steps.push(step);
  }
  cutscene.steps = steps;
  return cutscene;
}

function parseCutsceneBlock(blockLines, startLine, fileName) {
  const cutscene = {
    leftChar: '',
    rightChar: '',
    background: '',
    steps: [],
  };

  let pendingChoices = null;

  for (let i = 0; i < blockLines.length; i += 1) {
    const lineNum = startLine + i;
    const trimmed = blockLines[i].trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('- ENTREGAR:')) {
      const itemId = trimmed.slice('- ENTREGAR:'.length).trim();
      pendingChoices = null;
      cutscene.steps.push({
        type: 'deliver',
        itemId,
        speaker: '',
        text: '',
      });
      continue;
    }

    if (trimmed.startsWith('- VIDEO:')) {
      const videoPath = trimmed.slice('- VIDEO:'.length).trim();
      if (!/\.(mp4|webm)$/i.test(videoPath)) {
        throw new StoryParseError(fileName, lineNum, `Video inválido "${videoPath}". Usen un archivo .mp4 o .webm dentro de la historia.`);
      }
      pendingChoices = null;
      cutscene.steps.push({ type: 'video', url: validateAssetPath(videoPath, fileName, lineNum), speaker: '', text: '', transcript: [] });
      continue;
    }

    if (trimmed.startsWith('- LINK:')) {
      const linkBody = trimmed.slice('- LINK:'.length).trim();
      const arrowIdx = linkBody.indexOf('->');
      const label = arrowIdx === -1
        ? 'Ver el enlace'
        : (linkBody.slice(0, arrowIdx).trim() || 'Ver el enlace');
      const rawUrl = arrowIdx === -1 ? linkBody : linkBody.slice(arrowIdx + 2).trim();

      if (!rawUrl) {
        throw new StoryParseError(
          fileName,
          lineNum,
          'Enlace vacío en "- LINK:". Usen "- LINK: Texto -> https://..." o "- LINK: https://...".',
        );
      }

      let parsedUrl;
      let relativePath = '';
      if (/^[^:]+\.html?(?:[?#].*)?$/i.test(rawUrl)) {
        // Página HTML relativa à pasta da história (ex.: puzzles/web.html).
        relativePath = validateAssetPath(rawUrl, fileName, lineNum);
        parsedUrl = { protocol: 'https:', href: relativePath };
      } else {
        try {
          parsedUrl = new URL(rawUrl);
        } catch {
          throw new StoryParseError(
            fileName,
            lineNum,
            `URL inválida "${rawUrl}" en "- LINK:". Usen una URL completa con http:// o https://, o una página .html relativa.`,
          );
        }
      }

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new StoryParseError(
          fileName,
          lineNum,
          `Protocolo no permitido "${parsedUrl.protocol}" en "- LINK:". Usen solo http:// o https://.`,
        );
      }

      const lastStep = cutscene.steps[cutscene.steps.length - 1];
      if (!lastStep || lastStep.type === 'deliver' || lastStep.type === 'video') {
        throw new StoryParseError(
          fileName,
          lineNum,
          'La directiva "- LINK:" debe ir justo después de una línea de diálogo de un personaje.',
        );
      }
      if (lastStep.link) {
        throw new StoryParseError(
          fileName,
          lineNum,
          'Cada línea de diálogo puede tener solo una directiva "- LINK:".',
        );
      }

      pendingChoices = null;
      lastStep.link = {
        label,
        url: parsedUrl.href,
      };
      if (relativePath) lastStep.link.relative = true;
      continue;
    }

    const optionPrefix = OPTION_PREFIXES.find((prefix) => trimmed.toUpperCase().startsWith(prefix));
    if (optionPrefix) {
      const optionBody = trimmed.slice(optionPrefix.length).trim();
      const arrowIdx = optionBody.indexOf('->');
      if (arrowIdx === -1) {
        throw new StoryParseError(
          fileName,
          lineNum,
          'Opción mal formada. Usen "- OPCION: Texto -> COMPLETAR" (o "- OPCAO: Texto -> COMPLETE") o "-> FIN: motivo" (o "-> GAMEOVER: motivo").',
        );
      }

      const label = optionBody.slice(0, arrowIdx).trim();
      const targetRaw = optionBody.slice(arrowIdx + 2).trim();
      let outcome = 'complete';
      let reason = '';
      let feedback = '';
      const colonIdx = targetRaw.indexOf(':');
      const keyword = (colonIdx !== -1 ? targetRaw.slice(0, colonIdx) : targetRaw).trim().toUpperCase();
      const detail = colonIdx !== -1 ? targetRaw.slice(colonIdx + 1).trim() : '';

      if (keyword === 'GAMEOVER' || keyword === 'FIN') {
        outcome = 'gameover';
        reason = detail || 'Esa no era la elección correcta.';
      } else if (keyword === 'NEXT' || keyword === 'SIGUIENTE') {
        outcome = 'next';
      } else if (keyword === 'COMPLETE' || keyword === 'COMPLETAR') {
        outcome = 'complete';
      } else if (keyword === 'ATRAS' || keyword === 'ATRÁS' || keyword === 'VOLTAR') {
        // Volta para a fala anterior (ex.: reabrir um LINK de laboratório).
        outcome = 'back';
      } else if (keyword === 'CORRECTO' || keyword === 'CERTO') {
        // Resposta certa: mostra a explicação e segue para a próxima fala.
        outcome = 'next';
        feedback = detail;
      } else if (keyword === 'REINTENTAR' || keyword === 'TENTAR') {
        // Resposta errada: mostra a pista e deixa tentar de novo.
        outcome = 'retry';
        feedback = detail || 'Esa no es. ¡Prueben otra vez!';
      } else {
        throw new StoryParseError(
          fileName,
          lineNum,
          `Destino de opción desconocido "${targetRaw}". Usen SIGUIENTE, CORRECTO: explicación, REINTENTAR: pista, ATRAS, COMPLETAR o FIN: motivo.`,
        );
      }

      if (!pendingChoices) {
        if (cutscene.steps.length === 0) {
          cutscene.steps.push({ speaker: '', text: 'Elijan una acción:', choices: [] });
        }
        const lastStep = cutscene.steps[cutscene.steps.length - 1];
        lastStep.choices = lastStep.choices || [];
        pendingChoices = lastStep.choices;
      }

      pendingChoices.push({ label, outcome, reason, feedback });
      continue;
    }

    pendingChoices = null;

    if (trimmed.startsWith('- ')) {
      const speech = trimmed.slice(2).trim();
      const colonIdx = speech.indexOf(':');
      if (colonIdx <= 0) {
        throw new StoryParseError(fileName, lineNum, `Línea de diálogo mal formada: "${trimmed}". Usen "- Personaje: Texto".`);
      }
      const speaker = speech.slice(0, colonIdx).trim();
      const text = speech.slice(colonIdx + 1).trim();
      cutscene.steps.push({ speaker, text });
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
      const value = trimmed.slice(colonIdx + 1).trim();
      const normalizeChar = (val) => (/^(?:none|nenhum|-)$/i.test(val) ? '' : val);
      if (key === 'left') cutscene.leftChar = normalizeChar(value);
      else if (key === 'right') cutscene.rightChar = normalizeChar(value);
      else if (key === 'bg') cutscene.background = value;
    }
  }

  return absorbVideoTranscripts(cutscene);
}

function splitMarkdownSections(body, bodyStartLine, allowedNames) {
  const lines = body ? body.split('\n') : [];
  const sections = {};
  const sectionStarts = {};
  for (const name of allowedNames) {
    sections[name] = [];
    sectionStarts[name] = bodyStartLine;
  }
  let activeSection = null;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('## ')) {
      const name = trimmed.slice(3).trim().toUpperCase();
      if (allowedNames.includes(name)) {
        activeSection = name;
        sectionStarts[name] = bodyStartLine + i + 1;
      } else {
        activeSection = null;
      }
      continue;
    }
    if (activeSection) {
      sections[activeSection].push(lines[i]);
    }
  }

  return { sections, sectionStarts };
}

function parseOptionalRoofColor(rawValue, fileName) {
  const value = String(rawValue || '').trim();
  if (!value) return '';
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
    throw new StoryParseError(
      fileName,
      2,
      `Color de techo inválido ("roof_color: ${value}"). Usen formato hexadecimal como #d6282e.`,
    );
  }
  return value;
}

export function parseMissionMarkdown(rawText, fileName = 'mission.md', cityMap = null) {
  const { meta, body, bodyStartLine } = parseFrontmatter(rawText, fileName);

  if (!meta.id || !meta.title || !meta.start || !meta.target) {
    throw new StoryParseError(
      fileName,
      2,
      'La misión debe definir "id", "title", "start" y "target" en el frontmatter.',
    );
  }

  if (cityMap) {
    try {
      cityMap.resolveLocationCode(meta.start);
    } catch (err) {
      throw new StoryParseError(fileName, 2, `Lugar de inicio inválido ("start: ${meta.start}"): ${err.message}`);
    }
    try {
      cityMap.resolveLocationCode(meta.target);
    } catch (err) {
      throw new StoryParseError(fileName, 2, `Lugar de destino inválido ("target: ${meta.target}"): ${err.message}`);
    }
    if (meta.pickup) {
      try {
        cityMap.resolveLocationCode(meta.pickup);
      } catch (err) {
        throw new StoryParseError(fileName, 2, `Lugar de recogida inválido ("pickup: ${meta.pickup}"): ${err.message}`);
      }
    }
  }

  const { sections, sectionStarts } = splitMarkdownSections(body, bodyStartLine, [
    'CUTSCENE_INICIO',
    'CUTSCENE_FIM',
  ]);

  return {
    id: meta.id,
    title: meta.title,
    startLocation: meta.start,
    pickupLocation: String(meta.pickup || '').trim(),
    pickupObjective: String(meta.pickup_objective || '').trim(),
    targetLocation: meta.target,
    objective: meta.objective || `Vayan a ${meta.target}`,
    giveItem: String(meta.give_item || '').trim(),
    requireItem: String(meta.require_item || '').trim(),
    rewardItem: String(meta.reward_item || '').trim(),
    roofColor: parseOptionalRoofColor(meta.roof_color, fileName),
    roofLogo: meta.roof_logo ? validateAssetPath(meta.roof_logo, fileName, 2) : '',
    deliveryPrompt: String(meta.delivery_prompt || '').trim(),
    wrongItemMessage: String(meta.wrong_item_message || '').trim(),
    introCutscene: parseCutsceneBlock(sections.CUTSCENE_INICIO, sectionStarts.CUTSCENE_INICIO, fileName),
    outroCutscene: parseCutsceneBlock(sections.CUTSCENE_FIM, sectionStarts.CUTSCENE_FIM, fileName),
  };
}

export function parseEncounterMarkdown(rawText, fileName = 'encounter.md', cityMap = null) {
  const { meta, body, bodyStartLine } = parseFrontmatter(rawText, fileName);

  if (!meta.id || !meta.npc || !meta.location) {
    throw new StoryParseError(
      fileName,
      2,
      'El encuentro extra debe definir "id", "npc" y "location" en el frontmatter.',
    );
  }

  if (cityMap) {
    try {
      cityMap.resolveIndoorOppositePosition(meta.location);
    } catch (err) {
      throw new StoryParseError(
        fileName,
        2,
        `Lugar inválido para el encuentro ("location: ${meta.location}"): ${err.message}`,
      );
    }
  }

  const { sections, sectionStarts } = splitMarkdownSections(body, bodyStartLine, [
    'CUTSCENE',
    'CUTSCENE_INICIO',
  ]);
  const useIntroFallback = sections.CUTSCENE.length === 0 && sections.CUTSCENE_INICIO.length > 0;
  const blockLines = useIntroFallback ? sections.CUTSCENE_INICIO : sections.CUTSCENE;
  const startLine = useIntroFallback ? sectionStarts.CUTSCENE_INICIO : sectionStarts.CUTSCENE;
  const cutscene = parseCutsceneBlock(blockLines, startLine, fileName);

  if (!cutscene.steps || cutscene.steps.length === 0) {
    throw new StoryParseError(
      fileName,
      startLine,
      'El encuentro extra debe tener una sección "## CUTSCENE" con al menos una línea de diálogo.',
    );
  }

  const rawRoofColor = String(meta.roof_color || '').trim();
  const roofColor = rawRoofColor || '#d6282e';
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(roofColor)) {
    throw new StoryParseError(
      fileName,
      2,
      `Color de techo inválido ("roof_color: ${rawRoofColor}"). Usen formato hexadecimal como #d6282e.`,
    );
  }
  const roofLogo = meta.roof_logo ? validateAssetPath(meta.roof_logo, fileName, 2) : '';

  return {
    id: String(meta.id).trim(),
    npc: String(meta.npc).trim(),
    location: String(meta.location).trim(),
    prompt: String(meta.prompt || '').trim(),
    roofColor,
    roofLogo,
    cutscene,
  };
}

export function parseMapMarkdown(rawText, fileName = 'map/map.md') {
  const normalized = String(rawText || '').replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const locationNames = new Map();

  for (let i = 0; i < lines.length; i += 1) {
    let trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('<!--')) continue;
    if (trimmed.startsWith('- ')) {
      trimmed = trimmed.slice(2).trim();
    }
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) {
      throw new StoryParseError(fileName, i + 1, `Línea mal formada en "${fileName}": "${trimmed}". Usen "CODIGO: Nombre".`);
    }
    const code = trimmed.slice(0, colonIdx).trim().toUpperCase();
    const name = trimmed.slice(colonIdx + 1).trim();
    if (!code || !name) {
      throw new StoryParseError(fileName, i + 1, `Código o nombre vacío en "${fileName}": "${trimmed}".`);
    }
    locationNames.set(code, name);
  }

  return locationNames;
}

export function replaceLocationCodesWithNames(text, locationNames) {
  if (!text || typeof text !== 'string' || !locationNames || locationNames.size === 0) {
    return text;
  }
  return text.replace(/\b((?:RUA|CASA|COM|PRACA)-\d+)\b/gi, (match, code) => {
    const resolved = locationNames.get(code.toUpperCase());
    return resolved || match;
  });
}
