import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { Audio } from '@remotion/media';
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { Escena, Fala } from './tipos';

const { fontFamily: TITULO } = loadAnton('normal', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
const { fontFamily: TEXTO } = loadMontserrat('normal', { weights: ['600', '800'], subsets: ['latin', 'latin-ext'] });

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const story = (p: string) => staticFile(`story/${p}`);
const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
// Versión vertical (celular): mismos elementos, otra disposición.
const useVertical = () => { const { width, height } = useVideoConfig(); return height > width; };

// Fondo: foto del lugar con zoom lento, tinte del curso, viñeta y barras de cine.
const Fondo: React.FC<{ escena: Escena }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const n = ((Math.max(1, escena.missionNumber) - 1) % 4) + 1;
  const bg = escena.section === 'inicio' ? `map/rua-${n}` : `map/com-${n}`;
  const ext = ['rua-1', 'rua-4', 'praca-1', 'praca-4', 'casa-1', 'casa-4'].includes(bg.slice(4)) ? 'png' : 'jpg';
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.2], clamp);
  const barras = interpolate(frame, [0, 12], [0, 56], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0b12' }}>
      <Img src={story(`${bg}.${ext}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', scale: String(zoom), filter: 'saturate(1.15) contrast(1.05) blur(2px)' }} />
      <AbsoluteFill style={{ background: `linear-gradient(115deg, ${escena.color}cc 0%, ${escena.color}55 38%, rgba(20,10,40,.35) 65%, rgba(255,120,60,.35) 100%)`, mixBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.7) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: barras, backgroundColor: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: barras, backgroundColor: '#000' }} />
    </AbsoluteFill>
  );
};

// Placa de título de misión: texto inclinado que entra y sale con golpe.
const PlacaMision: React.FC<{ escena: Escena }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const sale = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], clamp);
  const [num, ...resto] = escena.title.split('—');
  const v = useVertical();
  return (
    <AbsoluteFill style={{ justifyContent: v ? 'flex-start' : 'center', alignItems: 'flex-start', paddingLeft: v ? 60 : 110, paddingRight: v ? 40 : 0, paddingTop: v ? 260 : 0 }}>
      <div style={{ rotate: '-4deg', translate: `${interpolate(entra, [0, 1], [-900, 0])}px ${sale * -40}px`, opacity: 1 - sale }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {escena.logo ? <Img src={story(escena.logo)} style={{ width: 96, height: 92, borderRadius: 12, border: '5px solid #111', boxShadow: '8px 8px 0 #111' }} /> : null}
          <div style={{ fontFamily: TITULO, fontSize: 54, color: '#FFC800', letterSpacing: 3, textShadow: '4px 4px 0 #111', WebkitTextStroke: '2px #111' }}>
            {(num || '').trim().toUpperCase()}
          </div>
        </div>
        <div style={{ fontFamily: TITULO, fontSize: v ? 120 : 132, lineHeight: 1, color: '#fff', marginTop: 10, WebkitTextStroke: '5px #111', paintOrder: 'stroke fill', textShadow: '10px 10px 0 #111' }}>
          {resto.join('—').trim().toUpperCase() || escena.title.toUpperCase()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Personajes: entran desde los costados; quien habla se agranda, el otro se apaga.
const Personajes: React.FC<{ escena: Escena; hablante: string; desde: number }> = ({ escena, hablante, desde }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = useVertical();
  const slots = [
    { id: escena.left, lado: 'izq' as const },
    { id: escena.right, lado: 'der' as const },
  ].filter((s) => s.id);
  return (
    <AbsoluteFill>
      {slots.map(({ id, lado }) => {
        const entra = spring({ frame: frame - desde - (lado === 'der' ? 6 : 0), fps, config: { damping: 16, stiffness: 110 } });
        const activo = hablante === id;
        const foco = spring({ frame: frame - desde, fps, config: { damping: 20 } });
        const respira = Math.sin(frame / 14) * (activo ? 4 : 1.5);
        const x = interpolate(entra, [0, 1], [lado === 'izq' ? -520 : 520, 0]);
        return (
          <Img
            key={id}
            src={story(`characters/${id}.png`)}
            style={{
              position: 'absolute',
              bottom: v ? -30 : -40,
              [lado === 'izq' ? 'left' : 'right']: v ? -20 : 120,
              height: v ? 720 : 640,
              translate: `${x}px ${respira + (activo ? 0 : 18)}px`,
              scale: String(activo ? 1.06 : 0.96),
              filter: activo ? `drop-shadow(0 0 26px ${escena.color}) brightness(1.05)` : `brightness(${interpolate(foco, [0, 1], [1, 0.5])}) saturate(.7)`,
              transformOrigin: 'bottom center',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Caja de diálogo con nombre en placa inclinada y texto que se escribe solo.
const Subtitulo: React.FC<{ fala: Fala; color: string; lado: 'izq' | 'der' }> = ({ fala, color, lado }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 14, stiffness: 160 } });
  const sale = interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], clamp);
  const letras = Math.floor(interpolate(frame, [4, Math.max(8, durationInFrames - 22)], [0, fala.text.length], clamp));
  const v = useVertical();
  return (
    <AbsoluteFill style={{ justifyContent: v ? 'flex-start' : 'flex-end', alignItems: 'center', paddingBottom: v ? 0 : 78, paddingTop: v ? 170 : 0 }}>
      <div style={{ width: v ? 650 : 1060, translate: `0px ${interpolate(entra, [0, 1], [80, 0]) + sale * 30}px`, opacity: interpolate(entra, [0, 1], [0, 1]) * (1 - sale) }}>
        <div style={{ display: 'flex', justifyContent: lado === 'izq' ? 'flex-start' : 'flex-end' }}>
          <div style={{ fontFamily: TITULO, fontSize: v ? 40 : 34, letterSpacing: 2, color: '#111', backgroundColor: '#FFC800', padding: '4px 20px', rotate: '-3deg', border: '4px solid #111', boxShadow: '6px 6px 0 #111', marginBottom: -10, zIndex: 2 }}>
            {fala.name.toUpperCase()}
          </div>
        </div>
        <div style={{ backgroundColor: 'rgba(10,10,18,.88)', border: `4px solid ${color}`, borderRadius: 18, padding: '26px 34px 24px', boxShadow: '0 18px 40px rgba(0,0,0,.55)' }}>
          <div style={{ fontFamily: TEXTO, fontWeight: 800, fontSize: v ? 42 : 34, lineHeight: 1.3, color: '#fff', minHeight: v ? 220 : 88 }}>
            {fala.text.slice(0, letras)}
            <span style={{ opacity: 0 }}>{fala.text.slice(letras)}</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Etiqueta de llamada entrante para las introducciones de las islas 2 a 7.
const Llamada: React.FC<{ escena: Escena }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const pulso = 0.6 + 0.4 * Math.abs(Math.sin(frame / 8));
  return (
    <div style={{ position: 'absolute', top: 80, left: 70, display: 'flex', alignItems: 'center', gap: 14, backgroundColor: 'rgba(0,0,0,.7)', border: `3px solid ${escena.color}`, borderRadius: 999, padding: '10px 24px 10px 14px' }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, backgroundColor: '#30d158', opacity: pulso, boxShadow: '0 0 14px #30d158' }} />
      <div style={{ fontFamily: TITULO, fontSize: 30, letterSpacing: 3, color: '#fff' }}>LLAMADA ENTRANTE</div>
    </div>
  );
};

// Cofre que cae, se abre y muestra la letra.
const Cofre: React.FC<{ escena: Escena }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!escena.reward) return null;
  const cae = spring({ frame, fps, config: { damping: 9, stiffness: 120 } });
  const letra = spring({ frame: frame - 28, fps, config: { damping: 8, stiffness: 160 } });
  const brillo = interpolate(frame, [20, 60], [0, 1], clamp);
  const v = useVertical();
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: `rgba(0,0,0,${0.55 * brillo})` }}>
      <div style={{ position: 'absolute', width: 760, height: 760, borderRadius: 999, background: `radial-gradient(circle, ${escena.color}aa 0%, rgba(255,200,0,.25) 40%, rgba(0,0,0,0) 70%)`, opacity: brillo, rotate: `${frame * 1.5}deg` }} />
      <Img src={story(escena.reward.image)} style={{ width: 260, height: 260, imageRendering: 'pixelated', translate: `0px ${interpolate(cae, [0, 1], [-700, -60])}px` }} />
      <div style={{ position: 'absolute', top: v ? 760 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', scale: String(letra), rotate: '-4deg' }}>
        <div style={{ fontFamily: TITULO, fontSize: 64, color: '#FFC800', WebkitTextStroke: '3px #111', paintOrder: 'stroke fill', textShadow: '6px 6px 0 #111', letterSpacing: 4 }}>
          LETRA {escena.reward.letter}
        </div>
        <div style={{ fontFamily: TEXTO, fontWeight: 800, fontSize: 30, color: '#fff', textShadow: '3px 3px 0 #111' }}>¡Anótenla en la bitácora!</div>
      </div>
    </AbsoluteFill>
  );
};

export const Dialogo: React.FC<{ escena: Escena }> = ({ escena }) => {
  const { timing } = escena;
  const conPlaca = escena.section === 'inicio' && escena.order === 1 && escena.kind === 'mission';
  let cursor = timing.intro;
  const tramos = escena.lines.map((fala, i) => {
    const from = cursor;
    cursor += timing.perLine[i];
    return { fala, from, dur: timing.perLine[i] };
  });
  const finDialogo = cursor;
  const frame = useCurrentFrame();
  const actual = tramos.find((t) => frame >= t.from && frame < t.from + t.dur) || tramos[tramos.length - 1];
  const { durationInFrames } = useVideoConfig();
  const entradaPersonajes = conPlaca ? timing.intro - 20 : 0;
  return (
    <AbsoluteFill style={{ fontFamily: TEXTO }}>
      <Audio
        name="Música"
        src={sfx('musica')}
        loop
        volume={(f) => 0.32 * interpolate(f, [0, 15, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], clamp)}
      />
      {conPlaca ? (
        <>
          <Audio name="Whoosh título" src={sfx('whoosh')} volume={0.7} />
          <Sequence name="Golpe título" from={8} layout="none">
            <Audio src={sfx('golpe')} volume={0.8} />
          </Sequence>
        </>
      ) : null}
      <Sequence name="Whoosh personajes" from={entradaPersonajes} layout="none">
        <Audio src={sfx('whoosh')} volume={0.45} />
      </Sequence>
      {escena.section === 'inicio' && escena.missionNumber > 1 ? <Audio name="Llamada" src={sfx('llamada')} volume={0.5} /> : null}
      {tramos.map((t, i) => (
        <Sequence key={`a${i}`} name={`Sonido fala ${i + 1}`} from={t.from} durationInFrames={t.dur} layout="none">
          <Audio src={sfx('pop')} volume={0.5} />
          <Audio src={sfx('tecleo')} volume={0.35} durationInFrames={Math.max(8, t.dur - 26)} />
        </Sequence>
      ))}
      {escena.reward ? (
        <Sequence name="Sonidos cofre" from={finDialogo} layout="none">
          <Audio src={sfx('caida')} volume={0.6} />
          <Sequence from={26} layout="none">
            <Audio src={sfx('ding')} volume={0.7} />
          </Sequence>
          <Sequence from={32} layout="none">
            <Audio src={sfx('fanfarria')} volume={0.5} />
          </Sequence>
        </Sequence>
      ) : null}
      <Fondo escena={escena} />
      <Sequence name="Personajes" from={conPlaca ? timing.intro - 20 : 0} layout="none">
        <Personajes escena={escena} hablante={frame >= (conPlaca ? timing.intro - 20 : 0) ? actual?.fala.speaker || '' : ''} desde={0} />
      </Sequence>
      {conPlaca ? (
        <Sequence name="Placa de misión" durationInFrames={timing.intro + 10}>
          <PlacaMision escena={escena} />
        </Sequence>
      ) : null}
      {escena.section === 'inicio' && escena.missionNumber > 1 ? <Llamada escena={escena} /> : null}
      {tramos.map((t, i) => (
        <Sequence key={i} name={`Fala ${i + 1}: ${t.fala.name}`} from={t.from} durationInFrames={t.dur}>
          <Subtitulo fala={t.fala} color={escena.color} lado={t.fala.speaker === escena.left ? 'izq' : 'der'} />
        </Sequence>
      ))}
      {escena.reward ? (
        <Sequence name="Cofre" from={finDialogo}>
          <Cofre escena={escena} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
