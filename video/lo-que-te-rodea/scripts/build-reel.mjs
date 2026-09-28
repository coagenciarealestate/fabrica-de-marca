// Guion del reel "Lo que te rodea cambia" — una sola lista de cortes genera:
//   - compositions/reel.html      (tomas a pantalla completa; el horizonte lo pone cada foto)
//   - assets/reel/reel-audio.m4a  (diseño sonoro, ver scripts/sound.mjs)
//
// Dirección: no imponemos una forma. Cada imagen es un macro de materia real cuyo propio
// borde (el filo de un muro, el borde de una taza, la línea de agua de una tina) cae a la
// mitad del cuadro. La continuidad se encuentra, no se fuerza.
//
// Uso (desde video/lo-que-te-rodea):  node scripts/build-reel.mjs

import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMix, wav16, rng } from "./sound.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FPS = 30;
const snap = (t) => Math.round(t * FPS) / FPS;

export const BEAT = 0.6; // 100 BPM: cortes, frases y acordes caen en el pulso
export const REEL_END = 15.6; // termina el clímax (26 tiempos)
export const LOGO_AT = 16.2; // entra la marca (27 tiempos)
export const TOTAL = 21.0;
const H = 1920;
const HORIZON = 0.46 * H; // donde se encuentran todos los bordes (y donde se posa el texto)

// ─── Imágenes v3 (Higgsfield, 9:16) — ver REFERENTE-v3.md y scripts/fetch-reel-images.sh ─
// Cada imagen sigue las reglas del referente: borde curvo (un domo, como un horizonte de
// planeta), fondo liso de un color arriba, escala sorpresa y técnica distinta a la anterior.
// edge: altura (% del cuadro) de la cima del borde, medida con scripts/measure-edges.py.
// move: cómo respira la toma — E empuje · D deriva lateral · G giro leve · V viva (líquidos).
const IMGDIR = "assets/reel-v3";
const IMG = {
  200: { edge: 48.9, move: "E", ink: "light", alt: "Horizonte curvo de los Andes al amanecer visto desde muy alto" },
  201: { edge: 38.5, move: "E", ink: "light", alt: "Corte de una teja de barro contra un fondo cobalto" },
  202: { edge: 49.6, move: "D", ink: "dark", alt: "Grabado en tinta de una fachada colonial con arco" },
  203: { edge: 40.6, move: "G", ink: "light", alt: "Plano en tiza del arco de una puerta sobre papel azul" },
  204: { edge: 41.5, move: "E", ink: "dark", alt: "Corte de guadua al microscopio" },
  205: { edge: 46.0, move: "D", ink: "light", alt: "Techo de teja en cámara térmica con el calor de la casa" },
  206: { edge: 47.9, move: "E", ink: "light", alt: "Una línea de luz cálida sobre el piso en la oscuridad" },
  207: { edge: 37.8, move: "V", ink: "light", alt: "La crema de un café, como un planeta" },
  208: { edge: 44.7, move: "E", ink: "dark", alt: "Masa de arepa con huellas de dedos pequeños" },
  209: { edge: 42.3, move: "D", ink: "light", alt: "Tejido de una mochila wayuu" },
  210: { edge: 44.6, move: "G", ink: "dark", alt: "Dibujo en crayola de una casa y una familia" },
  211: { edge: 35.3, move: "E", ink: "dark", alt: "Sala en collage de papel recortado" },
  212: { edge: 37.5, move: "D", ink: "light", alt: "Cortina de encaje" },
  213: { edge: 39.0, move: "V", ink: "light", alt: "Película iridiscente de una burbuja de jabón" },
  214: { edge: 45.7, move: "E", ink: "dark", alt: "Filo de un plato pintado de Carmen de Viboral" },
  215: { edge: 47.1, move: "G", ink: "light", alt: "Cristales de panela en luz polarizada" },
  216: { edge: 47.7, move: "D", ink: "dark", alt: "Borde de una hoja de helecho a contraluz" },
  217: { edge: 43.5, move: "G", ink: "dark", alt: "Construcción de un arco en lápiz" },
  218: { edge: 38.2, move: "E", ink: "dark", alt: "Ilustración antigua de una casa de bahareque" },
  219: { edge: 34.2, move: "D", ink: "dark", alt: "Plano de una casa en tinta sobre papel kraft" },
  220: { edge: 45.5, move: "V", ink: "light", alt: "Panela derretida con burbujas" },
  221: { edge: 40.9, move: "E", ink: "light", alt: "Mota de algodón a contraluz" },
};

// Mide la luminancia justo encima del borde para decidir el tono del texto
function inkFor(id) {
  const f = join(ROOT, IMGDIR, `${id}.jpg`);
  if (!existsSync(f)) return IMG[id].ink;
  try {
    const top = Math.max(0, IMG[id].edge / 100 - 0.07).toFixed(3);
    const out = execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-i", f, "-vf", `crop=iw*0.6:ih*0.06:iw*0.2:ih*${top},scale=1:1,format=gray`, "-f", "rawvideo", "-"]);
    return out[0] > 150 ? "dark" : "light";
  } catch {
    return IMG[id].ink;
  }
}

// ─── Cortes ─────────────────────────────────────────────────────────────────
const cuts = [];
const push = (t, id) => cuts.push({ t: snap(t), id });

// Todo cae en el pulso. El orden busca que cada corte salte de color y de técnica
// (oscuro → claro, foto → dibujo → ciencia), como el referente.
push(0, 200); // el planeta abre (3 tiempos)
[201, 202, 203, 204, 205].forEach((id, i) => push(3 * BEAT + i * BEAT, id)); // afuera: la piel de la casa
push(8 * BEAT, 206); // umbral: una línea de luz (2 tiempos)
const interiors = [207, 208, 209, 212, 210, 211, 213, 214, 215, 217, 220, 218, 219];
let t = 10 * BEAT;
interiors.forEach((id, i) => { push(t, id); t += i < 6 ? BEAT : BEAT / 2; }); // 6 a un tiempo, 7 a medio tiempo
// Clímax: todo el mundo vuelve, cada vez más rápido — medio tiempo y luego cuarto de tiempo.
// La mota de algodón cierra y se queda mientras todo respira.
const climax = [216, 201, 213, 203, 208, 215, 202, 209, 205, 214, 212, 210, 207, 219, 204, 211, 217, 220, 218];
for (let k = 0; t < REEL_END - 1e-6; k++) {
  push(t, climax[k % climax.length]);
  t += t < 23 * BEAT - 1e-6 ? BEAT / 2 : BEAT / 4;
}
cuts[cuts.length - 1].id = 221;
// la última toma se queda hasta que entra la marca: se funde a negro (no se corta)
const shots = cuts.map((c, i) => ({ ...c, i, end: i + 1 < cuts.length ? cuts[i + 1].t : LOGO_AT, ink: inkFor(c.id) }));
// Barrido de movimiento en los cortes grandes (como la transición borrosa del referente)
const SMEAR = [snap(8 * BEAT), snap(21 * BEAT)];

// Frases sobre el borde. Cambian en un corte, como en la referencia.
const at = (target) => shots.reduce((best, s) => (Math.abs(s.t - target) < Math.abs(best - target) ? s.t : best), 0);
const phrases = [
  { id: "p1", text: "Para transformar", start: 9 * BEAT, size: 58 },
  { id: "p2", text: "el mundo,", start: 13 * BEAT, size: 66, italic: true },
  { id: "p3", text: "hay que empezar", start: 16 * BEAT, size: 60 },
  { id: "p4", text: "cambiando las cosas", start: 21 * BEAT, size: 62 },
  { id: "p5", text: "en casa.", start: 24 * BEAT, size: 100, italic: true },
].map((p) => ({ ...p, start: snap(p.start) }));
phrases.forEach((p, i) => (p.end = i + 1 < phrases.length ? phrases[i + 1].start : snap(LOGO_AT - 0.2)));

// ─── HTML ───────────────────────────────────────────────────────────────────
function buildHtml() {
  const r = rng(11);
  const shotTags = shots
    .map((s) => `        <img id="reel-shot-${s.i}" class="clip shot" src="${IMGDIR}/${s.id}.jpg" alt="${IMG[s.id].alt}" data-start="${s.t}" data-duration="${+(s.end - s.t).toFixed(4)}" data-track-index="${1 + (s.i % 2)}" />`)
    .join("\n");
  const phraseTags = phrases
    .map((p) => `        <div id="reel-${p.id}" class="clip phrase" data-start="${p.start}" data-duration="${+(p.end - p.start).toFixed(4)}" data-track-index="4"><span id="reel-${p.id}-text" class="phrase-text${p.italic ? " italic" : ""}" style="font-size:${p.size}px">${p.text}</span></div>`)
    .join("\n");

  // Alineación: cada foto escala desde su propio borde (transform-origin en el borde), que
  // se desplaza a HORIZON. Así el horizonte queda quieto aunque la toma respire.
  // Cada toma respira distinto: un empuje lento con deriva leve (nada idéntico, nada rígido)
  // El texto no es indiferente a la toma: vive en #reel-motion, que se mueve exactamente como
  // la superficie (mismo acercamiento, deriva y giro, con el pivote en el horizonte). Como en el
  // referente, la frase queda posada sobre la materia y se acerca con ella.
  const f3 = (v) => +(+v).toFixed(4);
  const shotTweens = shots
    .map((s) => {
      const im = IMG[s.id];
      const y0 = (im.edge / 100) * H;
      const cover = Math.max(1, HORIZON / y0, (H - HORIZON) / (H - y0)) * 1.025;
      const dy = (HORIZON - y0).toFixed(1);
      const d = Math.floor((s.end - s.t) * 1000 - 1) / 1000; // termina justo antes del siguiente corte
      const sel = `"#reel-shot-${s.i}"`;
      const side = r() < 0.5 ? -1 : 1;
      // k = acercamiento relativo (1 = cuadro justo cubierto), x en px, rot en grados
      let a, b;
      if (s.i === 0) { a = { k: 1, x: 0, rot: 0 }; b = { k: 1.1, x: 0, rot: 0 }; } // nos acercamos al mundo
      else if (im.move === "D") { a = { k: 1.06, x: 34 * side, rot: 0 }; b = { k: 1.075, x: -10 * side, rot: 0 }; } // deriva
      else if (im.move === "G") { a = { k: 1.08, x: 0, rot: 1.1 * side }; b = { k: 1.1, x: 0, rot: 0 }; } // giro leve
      else if (im.move === "V") { a = { k: 1.04, x: 0, rot: -0.9 * side }; b = { k: 1.1, x: 0, rot: 0.4 * side }; } // materia viva
      else { a = { k: 1, x: f3((r() - 0.5) * 12), rot: 0 }; b = { k: f3(1.05 + r() * 0.03), x: 0, rot: 0 }; } // se acerca
      const hue = s.id === 213;
      const lines = [`        tl.set(${sel}, { transformOrigin: "50% ${im.edge}%", y: ${dy} }, 0);`];
      lines.push(`        tl.fromTo(${sel}, { scale: ${f3(cover * a.k)}, x: ${a.x}, rotation: ${a.rot}${hue ? ', filter: "hue-rotate(0deg)"' : ""} }, { scale: ${f3(cover * b.k)}, x: ${b.x}, rotation: ${b.rot}${hue ? ', filter: "hue-rotate(50deg)"' : ""}, duration: ${d}, ease: "sine.inOut" }, ${s.t});`);
      if (SMEAR.some((x) => Math.abs(x - s.t) < 0.01) && !hue) {
        lines.push(`        tl.fromTo(${sel}, { filter: "blur(18px) brightness(1.25)" }, { filter: "blur(0px) brightness(1)", duration: 0.28, ease: "power2.out" }, ${s.t});`);
      }
      // el texto hace el mismo movimiento que la superficie
      lines.push(`        tl.set("#reel-motion", { scale: ${a.k}, x: ${a.x}, rotation: ${a.rot} }, ${s.t});`);
      lines.push(`        tl.to("#reel-motion", { scale: ${b.k}, x: ${b.x}, rotation: ${b.rot}, duration: ${d}, ease: "sine.inOut" }, ${s.t});`);
      return lines.join("\n");
    })
    .join("\n");

  // El texto cambia de tinta según la imagen que tiene debajo
  const INK = {
    light: { color: "#f4e7cb", textShadow: "0 1px 14px rgba(18,14,12,0.55)" },
    dark: { color: "#1c1714", textShadow: "0 1px 12px rgba(244,231,203,0.35)" },
  };
  let last = null;
  const inkSets = shots
    .filter((s) => s.t >= phrases[0].start - 0.7)
    .map((s) => {
      if (s.ink === last) return null;
      last = s.ink;
      const k = INK[s.ink];
      return `        tl.to("#reel-words", { color: "${k.color}", textShadow: "${k.textShadow}", duration: 0.12, ease: "sine.inOut" }, ${Math.max(0, s.t - 0.04).toFixed(3)});`;
    })
    .filter(Boolean)
    .join("\n");
  // Entran en el pulso con un leve ascenso y salen con fundido (nunca desaparecen de golpe)
  const phraseTweens = phrases
    .map((p) => {
      const inD = p.id === "p1" ? 0.6 : 0.24, outD = p.id === "p5" ? 0.5 : 0.16;
      return `        tl.fromTo("#reel-${p.id}-text", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: ${inD}, ease: "sine.out" }, ${p.start});\n        tl.to("#reel-${p.id}-text", { opacity: 0, duration: ${outD}, ease: "sine.in" }, ${(p.end - outD).toFixed(3)});\n        tl.fromTo("#reel-${p.id}", { scale: 1 }, { scale: ${p.id === "p5" ? 1.12 : 1.06}, duration: ${(p.end - p.start).toFixed(3)}, ease: "none" }, ${p.start});`;
    })
    .join("\n");
  // Fundido a negro al final del clímax (la última toma no se corta)
  const fadeTween = `        tl.fromTo("#reel-fade", { opacity: 0 }, { opacity: 1, duration: ${(LOGO_AT - REEL_END).toFixed(2)}, ease: "sine.in" }, ${REEL_END});`;

  return `<!doctype html>
<!-- GENERADO por scripts/build-reel.mjs — edita el guion allá y vuelve a correrlo. -->
<html lang="es">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <template>
      <style>
        #root {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #0d0b0a;
        }
        #reel-plates {
          position: absolute;
          inset: 0;
        }
        #reel-plates .shot {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* Frases: serif pequeña posada sobre el borde de cada imagen */
        #reel-fade {
          position: absolute;
          inset: 0;
          background: #0d0b0a;
          opacity: 0;
        }
        #reel-words {
          position: absolute;
          inset: 0;
          color: #f4e7cb;
        }
        #reel-motion {
          position: absolute;
          inset: 0;
          transform-origin: 50% ${HORIZON}px;
        }
        #reel-words .phrase {
          transform-origin: 50% ${HORIZON}px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: ${Math.round(H - HORIZON + 14)}px;
        }
        #reel-words .phrase-text {
          display: block;
          font-family: var(--co-font-display);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -0.005em;
          white-space: nowrap;
        }
        #reel-words .phrase-text.italic {
          font-style: italic;
        }
      </style>

      <div id="root" data-composition-id="reel" data-width="1080" data-height="1920">
      <div id="reel-plates">
${shotTags}
      </div>
      <div id="reel-words">
        <div id="reel-motion">
${phraseTags}
        </div>
      </div>
      <div id="reel-fade"></div>
      </div>

      <script>
        const tl = gsap.timeline({ paused: true });
${shotTweens}
${inkSets}
${phraseTweens}
${fadeTween}
        window.__timelines["reel"] = tl;
      </script>
    </template>
  </body>
</html>
`;
}

// ─── Sonido: campanitas, colchón y materia — todo en el pulso ────────────────
// Un acorde por tramo (colchón ligado, sin huecos), una nota por corte (match sound) que sigue
// una línea melódica ascendente, arpegio que dobla la densidad con los cortes, el foley de cada
// material muy discreto, soplos hacia los cambios grandes y, al final, una respiración (no un
// corte) antes de la marca. Sin golpes de bajo.
function buildAudio() {
  const m = createMix(TOTAL, 20261004);
  const r = m.r;
  const B = BEAT, X = 0.3;
  // [inicio, fin, bajo, colchón, intensidad]
  const HARM = [
    [0, 2 * B, 38, [62, 66, 69, 76], 0.3],       // Re add9 — amanecer
    [2 * B, 4 * B, 47, [62, 66, 73], 0.38],      // Si m — la ciudad
    [4 * B, 6 * B, 43, [62, 67, 71], 0.42],      // Sol
    [6 * B, 8 * B, 42, [62, 69, 76], 0.46],      // Re/Fa#
    [8 * B, 10 * B, 45, [62, 69, 74], 0.5],      // La sus4 — el umbral
    [10 * B, 12 * B, 38, [62, 66, 69], 0.55],    // Re — adentro
    [12 * B, 14 * B, 43, [62, 66, 71], 0.6],     // Sol maj7
    [14 * B, 16 * B, 47, [66, 71, 74], 0.66],    // Si m
    [16 * B, 18 * B, 40, [67, 71, 78], 0.72],    // Mi m9 — cuando tú cambias
    [18 * B, 20 * B, 45, [64, 69, 73], 0.8],     // La
    [20 * B, 22 * B, 47, [66, 71, 74], 0.88],    // Si m — nosotros entendemos
    [22 * B, 24 * B, 43, [67, 71, 74], 0.95],    // Sol
    [24 * B, REEL_END, 45, [64, 69, 73, 76], 1.05], // La — por qué (crece)
    [REEL_END, LOGO_AT, 38, [62, 66, 69], 0.6],  // Re — respira
    [LOGO_AT, TOTAL - 1.2, 38, [62, 66, 69, 76], 0.85], // Re add9 — La Casa del Marketing
  ];
  HARM.forEach(([t0, t1, bass, mids, k], i) => {
    const s0 = Math.max(0, t0 - X), s1 = t1 + X;
    const sw = i === 12 ? 1.2 : 0.2;
    m.drone(s0, s1, [bass], 0.05 * k, { att: i ? 0.6 : 2.2, rel: 0.6, send: 0.25, bright: 0.2, swell: sw });
    m.drone(s0, s1, mids, 0.032 * k, { att: i ? 0.6 : 2.4, rel: 0.7, send: 0.6, bright: 0.45, swell: sw });
    if (i) m.piano(t0, bass + 12, 0.06 * k, { send: 0.8, len: 3 }); // ancla cada cambio
  });
  const harmAt = (t) => HARM.find(([t0, t1]) => t >= t0 && t < t1) || HARM[HARM.length - 1];

  // Match sound: una nota por corte, la del acorde más cercana a una línea que asciende
  const target = (t) => 76 + 14 * Math.pow(Math.min(1, t / REEL_END), 1.1);
  let prev = 76;
  shots.forEach((sh, i) => {
    const dense = sh.end - sh.t < 0.2;
    if (dense && i % 2) return; // en el cuarto de tiempo, una sí y una no
    const [, , , mids, k] = harmAt(sh.t + 1e-3);
    const tones = [...mids, ...mids.map((n) => n + 12), ...mids.map((n) => n + 24)];
    const goal = target(sh.t) + (i % 2 ? 1.5 : -1.5);
    let best = tones[0];
    tones.forEach((n) => { if (Math.abs(n - goal) + 0.3 * Math.abs(n - prev) < Math.abs(best - goal) + 0.3 * Math.abs(best - prev)) best = n; });
    prev = best;
    const isPhrase = phrases.some((p) => Math.abs(p.start - sh.t) < 0.02);
    m.chime(Math.max(sh.t, BEAT), best, (isPhrase ? 0.2 : 0.12 + 0.06 * k) * (0.9 + r() * 0.2), { pan: i % 2 ? 0.25 : -0.25, send: 0.65, delay: 0.45, octave: 0.8, dec: 2.8, len: 2.8 });
  });

  // Arpegio suave que dobla la densidad con los cortes
  const grid = [];
  for (let t = 2 * B; t < 16 * B - 1e-6; t += B / 2) grid.push(t);
  for (let t = 16 * B; t < REEL_END - 1e-6; t += B / 4) grid.push(t);
  const shape = [0, 1, 2, 3, 2, 1];
  grid.forEach((t, i) => {
    const [, , , mids, k] = harmAt(t + 1e-3);
    const tones = [...mids.map((n) => n + 12), ...mids.map((n) => n + 24)].sort((x, y) => x - y);
    m.chime(t + B / 4 * (t < 16 * B ? 1 : 0.5), tones[shape[i % shape.length] % tones.length], (0.035 + 0.035 * k) * (0.85 + r() * 0.3), { pan: i % 2 ? 0.45 : -0.45, send: 0.5, delay: 0.3, octave: 0.5, dec: 3.8, len: 1.6 });
  });

  // Afuera: aire y pájaros · Umbral: el viento se apaga, entra el cuarto
  const shotAt = (id) => shots.find((x) => x.id === id)?.t;
  m.noise(0, 8 * B + 0.4, { f: 600, q: 0.5, gain: 0.03, send: 0.3, env: (u, tt) => Math.min(1, tt / 1.5) * (u > 0.9 ? (1 - u) * 10 : 1) });
  [[0.6, 0.5], [0.72, 0.5], [2.9, -0.5], [3.0, -0.5]].forEach(([tt, pan]) => m.tone(tt, 0.07, 3000 + r() * 400, 3700, 0.012, { decay: 32, pan, send: 0.9 }));
  m.noise(8 * B, REEL_END, { f: 240, gain: 0.02, send: 0.15, env: (u, tt) => Math.min(1, tt / 0.8) });
  m.noise(8 * B - 0.5, 8 * B + 0.05, { f: 500, fEnd: 2400, gain: 0.03, env: (u) => Math.pow(u, 2) * (u > 0.9 ? (1 - u) * 10 : 1), send: 0.5 }); // soplo al umbral
  m.noise(16 * B - 0.5, 16 * B + 0.05, { f: 500, fEnd: 2800, gain: 0.035, env: (u) => Math.pow(u, 2) * (u > 0.9 ? (1 - u) * 10 : 1), send: 0.5 }); // soplo a "cuando tú cambias"

  // La materia deja su huella (muy bajito)
  const f = (id, fn) => { const tt = shotAt(id); if (tt != null) fn(tt); };
  f(207, (tt) => m.noise(tt, tt + 0.6, { type: "bp", f: 4200, q: 0.9, gain: 0.02, env: (u) => Math.sin(Math.PI * u), send: 0.5, pan: 0.2 })); // vapor
  f(204, (tt) => { for (let k = 0; k < 6; k++) m.tone(tt + r() * 0.3, 0.012, 2600, 1800, 0.016, { decay: 300, pan: (r() - 0.5) * 0.6, send: 0.3 }); }); // fibra que cruje
  f(212, (tt) => m.noise(tt - 0.1, tt + 0.4, { f: 1400, fEnd: 380, gain: 0.03, env: (u) => Math.sin(Math.PI * u), send: 0.4 })); // tela
  f(213, (tt) => { m.tone(tt + 0.05, 0.1, 1500, 650, 0.035, { decay: 30, pan: -0.2, send: 0.8 }); m.tone(tt + 0.28, 0.09, 1250, 600, 0.025, { decay: 34, pan: 0.2, send: 0.8 }); }); // burbuja
  f(210, (tt) => { for (let k = 0; k < 3; k++) m.noise(tt + k * 0.1, tt + k * 0.1 + 0.07, { type: "bp", f: 2600, q: 1.2, gain: 0.02, env: (u) => Math.sin(Math.PI * u), send: 0.2 }); }); // crayola
  f(218, (tt) => m.noise(tt, tt + 0.22, { type: "bp", f: 2000, q: 0.8, gain: 0.02, env: (u) => Math.sin(Math.PI * u), send: 0.3 })); // página

  // Crepitar y aire que crecen hacia "por qué."
  m.grains(16 * B, REEL_END, { density: [4, 60], gain: [0.006, 0.04] });
  m.noise(20 * B, REEL_END + 0.1, { type: "hp", f: 4200, gain: 0.022, env: (u) => Math.pow(u, 2.2), send: 0.5 });

  // Respira (no se corta) y entra la marca: notas que se abren y se quedan, sin golpe grave
  m.duck(REEL_END + 0.1, LOGO_AT - 0.05, 0.45, 0.35);
  [[LOGO_AT, 74, 86], [LOGO_AT + 0.6, 78, 0], [LOGO_AT + 1.2, 81, 0], [LOGO_AT + 2.4, 76, 0], [LOGO_AT + 3.6, 69, 0]].forEach(([tt, n, n2], i) => {
    m.chime(tt, n, 0.17 - i * 0.02, { pan: (i % 3 - 1) * 0.35, send: 0.7, delay: 0.5, len: 3 });
    if (n2) m.chime(tt + 0.004, n2, 0.08, { pan: 0.3, send: 0.7, delay: 0.5, len: 3 });
  });

  const { L, R } = m.render(3, { hp: 32, delayTime: 0.45, feedback: 0.32 }); // delay = 3/4 de tiempo
  const f0 = Math.floor((TOTAL - 1.6) * 44100);
  for (let i = f0; i < L.length; i++) { const u = (i - f0) / (L.length - f0); const g = 0.5 + 0.5 * Math.cos(Math.PI * u); L[i] *= g; R[i] *= g; }
  return wav16(L, R);
}

// ─── Main ───────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "assets/reel"), { recursive: true });
writeFileSync(join(ROOT, "compositions/reel.html"), buildHtml());
const wav = join(ROOT, "assets/reel/reel-audio.wav");
writeFileSync(wav, buildAudio());
// Loudness de entrega: −16 LUFS integrados, pico real −1.5 dB (dos pasadas)
let ln = "loudnorm=I=-16:TP=-1.5:LRA=11";
try {
  const errOut = execFileSync("bash", ["-c", `ffmpeg -hide_banner -i "${wav}" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`]).toString();
  const j = JSON.parse(errOut);
  ln += `:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
} catch {}
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", wav, "-af", ln, "-ar", "44100", "-c:a", "aac", "-b:a", "224k", join(ROOT, "assets/reel/reel-audio.m4a")]);
unlinkSync(wav);
console.log(`reel.html: ${shots.length} tomas, ${phrases.length} frases · audio ${TOTAL}s`);
console.log(shots.map((s) => `${s.t.toFixed(2)}:${s.id}${s.ink === "dark" ? "·d" : ""}`).join(" "));
