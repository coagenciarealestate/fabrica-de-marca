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

export const REEL_END = 15.4; // corte a silencio
export const LOGO_AT = 16.0;
export const TOTAL = 20.5;

// ─── Imágenes (Higgsfield, 9:16) — ver scripts/fetch-reel-images.sh ─────────
// ink: tono del texto sobre el borde si aún no hay imagen local para medirlo.
const IMG = {
  100: { alt: "Amanecer sobre la línea de techos de la ciudad", ink: "light" },
  101: { alt: "Filo de un muro de cal contra el cielo de la mañana", ink: "dark" },
  102: { alt: "Cumbrera de tejas de barro con musgo", ink: "dark" },
  103: { alt: "Muro de ladrillo al atardecer", ink: "light" },
  104: { alt: "Baranda de balcón en madera, pintura descascarada", ink: "dark" },
  105: { alt: "Muro de adobe con paja contra el cielo andino", ink: "light" },
  106: { alt: "Filo de concreto de una casa moderna en la hora azul", ink: "light" },
  107: { alt: "Línea de luz bajo una puerta", ink: "light" },
  108: { alt: "Borde de una taza de café con vapor", ink: "light" },
  109: { alt: "Corteza de pan recién horneado", ink: "dark" },
  110: { alt: "Masa de arepa con huellas de dedos pequeños", ink: "light" },
  111: { alt: "Pliegue de una sábana de lino con luz de ventana", ink: "dark" },
  112: { alt: "Línea de agua de una tina con espuma", ink: "dark" },
  113: { alt: "Dibujo en crayola de una casa y una familia", ink: "dark" },
  114: { alt: "Borde de una mesa de comedor con migas", ink: "light" },
  115: { alt: "Borde de una hoja de monstera a contraluz", ink: "dark" },
  116: { alt: "Manta tejida mostaza", ink: "dark" },
  117: { alt: "Borde de un plato pintado a mano de Carmen de Viboral", ink: "light" },
  118: { alt: "Páginas de un libro a la luz de una lámpara", ink: "light" },
  119: { alt: "Bordado en un bastidor de madera", ink: "light" },
  120: { alt: "Plano de una casa a lápiz sobre papel mantequilla", ink: "dark" },
  121: { alt: "Maracuyá partido sobre una tabla", ink: "dark" },
};

// Mide la luminancia justo encima del borde para decidir el tono del texto
function inkFor(id) {
  const f = join(ROOT, "assets/reel", `${id}.jpg`);
  if (!existsSync(f)) return IMG[id].ink;
  try {
    const out = execFileSync("ffmpeg", ["-loglevel", "error", "-i", f, "-vf", "crop=iw*0.6:ih*0.1:iw*0.2:ih*0.37,scale=1:1,format=gray", "-f", "rawvideo", "-"]);
    return out[0] > 150 ? "dark" : "light";
  } catch {
    return IMG[id].ink;
  }
}

// ─── Cortes ─────────────────────────────────────────────────────────────────
const cuts = [];
const push = (t, id) => cuts.push({ t: snap(t), id });

push(0, 100); // el amanecer abre (como la referencia)
[101, 102, 103, 104, 105, 106].forEach((id, i) => push(1.0 + i * 0.6, id)); // piel de la ciudad
push(4.6, 107); // umbral: la luz bajo la puerta
const interiors = [108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
const gaps = [0.55, 0.55, 0.5, 0.5, 0.45, 0.45, 0.4, 0.4, 0.35, 0.35, 0.35, 0.3, 0.3];
let t = 5.6;
interiors.forEach((id, i) => { push(t, id); t += gaps[i]; });
// Clímax: afuera y adentro se alternan — el entorno cambia cada vez más rápido
const climax = [101, 111, 102, 109, 103, 117, 104, 112, 105, 115, 106, 121, 113, 116, 108, 118, 110, 119, 114, 120];
for (let k = 0; t < REEL_END - 0.2; k++) {
  push(t, climax[k % climax.length]);
  t += 0.3 - 0.08 * Math.min(1, (t - 11) / 4);
}
const shots = cuts.map((c, i) => ({ ...c, i, end: i + 1 < cuts.length ? cuts[i + 1].t : REEL_END, ink: inkFor(c.id) }));

// Frases sobre el borde. Cambian en un corte, como en la referencia.
const at = (target) => shots.reduce((best, s) => (Math.abs(s.t - target) < Math.abs(best - target) ? s.t : best), 0);
const phrases = [
  { id: "p1", text: "Lo que te rodea", start: 4.9, size: 58 },
  { id: "p2", text: "cambia,", start: at(7.2), size: 64, italic: true },
  { id: "p3", text: "cuando tú cambias.", start: at(9.4), size: 58 },
  { id: "p4", text: "Nosotros entendemos", start: at(12.2), size: 60 },
  { id: "p5", text: "por qué.", start: at(13.9), size: 96, italic: true },
];
phrases.forEach((p, i) => (p.end = i + 1 < phrases.length ? phrases[i + 1].start : REEL_END));

// ─── HTML ───────────────────────────────────────────────────────────────────
function buildHtml() {
  const r = rng(11);
  const shotTags = shots
    .map((s) => `        <img id="reel-shot-${s.i}" class="clip shot" src="assets/reel/${s.id}.jpg" alt="${IMG[s.id].alt}" data-start="${s.t}" data-duration="${+(s.end - s.t).toFixed(4)}" data-track-index="${1 + (s.i % 2)}" />`)
    .join("\n");
  const phraseTags = phrases
    .map((p) => `        <div id="reel-${p.id}" class="clip phrase" data-start="${p.start}" data-duration="${+(p.end - p.start).toFixed(4)}" data-track-index="4"><span id="reel-${p.id}-text" class="phrase-text${p.italic ? " italic" : ""}" style="font-size:${p.size}px">${p.text}</span></div>`)
    .join("\n");

  // Cada toma respira distinto: un empuje lento con deriva leve (nada idéntico, nada rígido)
  const shotTweens = shots
    .map((s) => {
      const d = Math.max(0.3, s.end - s.t + 0.2).toFixed(2);
      const x = ((r() - 0.5) * 14).toFixed(1), y = ((r() - 0.5) * 10).toFixed(1);
      const from = s.i === 0 ? 1.1 : (1.035 + r() * 0.03).toFixed(3);
      return `        tl.fromTo("#reel-shot-${s.i}", { scale: ${from}, x: ${x}, y: ${y} }, { scale: 1, x: 0, y: 0, duration: ${s.i === 0 ? 1.2 : d}, ease: "sine.out" }, ${s.t});`;
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
      return `        tl.set("#reel-words", { color: "${k.color}", textShadow: "${k.textShadow}" }, ${Math.max(0, s.t)});`;
    })
    .filter(Boolean)
    .join("\n");
  const phraseTweens = phrases
    .map((p) => `        tl.fromTo("#reel-${p.id}-text", { opacity: 0 }, { opacity: 1, duration: ${p.id === "p1" ? 0.6 : 0.18}, ease: "sine.out" }, ${p.start});`)
    .join("\n");

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
          transform-origin: 50% 50%;
        }
        /* Frases: serif pequeña posada sobre el borde de cada imagen */
        #reel-words {
          position: absolute;
          inset: 0;
          color: #f4e7cb;
        }
        #reel-words .phrase {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 986px;
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
${phraseTags}
      </div>
      </div>

      <script>
        const tl = gsap.timeline({ paused: true });
${shotTweens}
${inkSets}
${phraseTweens}
        window.__timelines["reel"] = tl;
      </script>
    </template>
  </body>
</html>
`;
}

// ─── Sonido: un camino, no un golpe por corte ───────────────────────────────
function buildAudio() {
  const m = createMix(TOTAL, 20260927);
  const r = m.r;
  const shotAt = (id, n = 0) => shots.filter((s) => s.id === id)[n]?.t;

  // 0–4.6 · AFUERA — aire de amanecer, pájaros lejanos, piano que piensa
  m.noise(0, 4.75, { f: 650, q: 0.5, gain: 0.045, send: 0.25, env: (u, tt) => Math.min(1, tt / 2.2) * (0.75 + 0.25 * Math.sin(tt * 1.7) * Math.sin(tt * 0.6)) * (u > 0.965 ? Math.max(0, (1 - u) / 0.035) : 1) });
  m.noise(0, 4.7, { type: "hp", f: 5200, gain: 0.0025, send: 0.4, env: (u, tt) => Math.min(1, tt / 2.5) }); // brillo del aire
  [[0.55, 0.6], [0.68, 0.6], [2.35, -0.5], [2.47, -0.5], [2.56, -0.5], [3.9, 0.7]].forEach(([tt, pan]) => m.tone(tt, 0.08, 2900 + r() * 500, 3600 + r() * 400, 0.018, { decay: 30, pan, send: 0.9 }));
  m.piano(0.1, 38, 0.14, { len: 7, send: 0.7 }); // Re grave: el suelo
  m.piano(1.0, 69, 0.13, { pan: -0.2 });
  m.piano(2.2, 66, 0.14, { pan: 0.2 });
  m.piano(3.4, 64, 0.15, { pan: -0.1 });
  const tiles = shotAt(102);
  [0.12, 0.31, 0.44].forEach((d) => m.tone(tiles + d, 0.05, 1900 + r() * 300, 900, 0.022, { decay: 60, pan: 0.4, send: 0.6 })); // gotas en las tejas

  // 4.6 · EL UMBRAL — la puerta: el mundo se apaga, entra la luz
  const door = shotAt(107);
  m.noise(door, door + 1.2, { f: 220, gain: 0.035, env: (u) => 1 - u, send: 0.2 }); // el viento, ya del otro lado
  m.thump(door, 0.16, { f0: 70, f1: 38, len: 0.9, body: 0.2 });
  m.piano(door + 0.03, 50, 0.17, { send: 0.8 });
  m.piano(door + 0.06, 57, 0.14, { send: 0.8 });
  m.noise(door, REEL_END, { f: 240, gain: 0.03, send: 0.1, env: (u, tt) => Math.min(1, tt / 0.8) }); // tono de cuarto: estamos adentro

  // 4.9–15.4 · ADENTRO — las cuerdas sostienen, el piano canta, la casa suena
  m.strings(4.9, 7.2, [50, 54, 57, 62], 0.11, { att: 1.6, bright: 0.35 });
  m.strings(7.2, 9.4, [47, 54, 59, 62], 0.12, { att: 0.9, bright: 0.4 });
  m.strings(9.4, 12.2, [43, 50, 59, 62, 66], 0.13, { att: 0.8, bright: 0.5 });
  m.strings(12.2, 13.9, [45, 52, 57, 61, 64], 0.15, { att: 0.5, bright: 0.6 });
  m.strings(13.9, REEL_END, [38, 50, 57, 62, 66, 69], 0.17, { att: 0.35, bright: 0.7, swell: 0.9 });
  [[5.6, 69, 0.2], [6.7, 71, 0.18], [7.2, 74, 0.22], [8.13, 73, 0.17], [8.6, 71, 0.17], [9.4, 69, 0.2], [10.1, 71, 0.17], [10.73, 74, 0.18], [11.33, 76, 0.16], [12.2, 78, 0.2], [12.77, 76, 0.14], [13.27, 74, 0.14], [13.9, 81, 0.2]].forEach(([tt, n, v], i) => m.piano(snap(tt), n, v, { pan: i % 2 ? 0.25 : -0.25 }));
  [[9.4, 50], [12.2, 45], [13.9, 50]].forEach(([tt, n]) => m.piano(tt, n, 0.16, { send: 0.8 }));

  // Foley: cada material deja su huella, muy bajito (match sound por materia)
  const f = (id, fn) => { const tt = shotAt(id); if (tt != null) fn(tt); };
  f(108, (tt) => m.noise(tt, tt + 0.9, { type: "bp", f: 4200, q: 0.9, gain: 0.03, env: (u) => Math.sin(Math.PI * u), send: 0.5, pan: 0.2 })); // vapor
  f(109, (tt) => { for (let k = 0; k < 7; k++) m.tone(tt + r() * 0.35, 0.012, 2600, 1800, 0.025, { decay: 300, pan: (r() - 0.5) * 0.6, send: 0.3 }); }); // corteza que cruje
  f(110, (tt) => m.noise(tt, tt + 0.22, { f: 500, gain: 0.06, env: (u) => Math.sin(Math.PI * u), send: 0.2 })); // masa
  f(111, (tt) => m.noise(tt - 0.1, tt + 0.45, { f: 1400, fEnd: 380, gain: 0.045, env: (u) => Math.sin(Math.PI * u), send: 0.4 })); // la sábana
  f(112, (tt) => { m.tone(tt + 0.05, 0.1, 1500, 650, 0.06, { decay: 30, pan: -0.2, send: 0.8 }); m.tone(tt + 0.3, 0.09, 1250, 600, 0.04, { decay: 34, pan: 0.2, send: 0.8 }); }); // gota
  f(113, (tt) => { for (let k = 0; k < 3; k++) m.noise(tt + k * 0.11, tt + k * 0.11 + 0.08, { type: "bp", f: 2600, q: 1.2, gain: 0.035, env: (u) => Math.sin(Math.PI * u), send: 0.2 }); }); // crayola
  f(115, (tt) => m.noise(tt, tt + 0.35, { type: "bp", f: 3200, q: 0.7, gain: 0.03, env: (u) => Math.sin(Math.PI * u), send: 0.4, pan: 0.3 })); // hoja
  f(118, (tt) => m.noise(tt, tt + 0.25, { type: "bp", f: 2000, q: 0.8, gain: 0.03, env: (u) => Math.sin(Math.PI * u), send: 0.3 })); // página

  // Latido: desde "cuando tú cambias" el pulso sigue los cortes y crece
  shots.filter((s) => s.t >= at(9.4) && s.t < REEL_END).forEach((s) => {
    const g = 0.07 + 0.16 * Math.min(1, (s.t - 9.4) / 6);
    m.thump(s.t, g, { f0: 62, f1: 44, len: 0.32, body: 0.1 });
  });
  // Clímax: arpegio muy suave en cada corte + riser de aire que se abre
  shots.filter((s) => s.t >= 12.2).forEach((s, k) => m.piano(s.t, [62, 66, 69, 74, 78, 81][k % 6] + (s.t > 14.3 ? 12 : 0), 0.07, { pan: k % 2 ? 0.4 : -0.4, len: 2, send: 0.7 }));
  m.noise(11.8, REEL_END, { type: "bp", f: 260, fEnd: 5200, q: 1.1, gain: 0.2, env: (u) => Math.pow(u, 2.6), send: 0.5 });
  m.noise(14.2, REEL_END, { type: "hp", f: 4500, gain: 0.07, env: (u) => Math.pow(u, 4), send: 0.3 });

  // 15.4–16.0 · SILENCIO
  m.gate(REEL_END, LOGO_AT - 0.002);

  // 16.0 · LOGO — boom grave y un acorde que se queda
  m.thump(LOGO_AT, 0.3, { f0: 58, f1: 30, len: 3, body: 0.25 });
  [38, 45, 54, 64, 69].forEach((n, k) => m.piano(LOGO_AT + k * 0.035, n, 0.24 - k * 0.02, { pan: (k - 2) * 0.2, len: 4.5, send: 0.8 }));
  m.strings(LOGO_AT + 0.1, TOTAL - 1.4, [38, 50, 57, 62, 66], 0.07, { att: 1.8, rel: 1.2, bright: 0.25 });
  m.noise(LOGO_AT, TOTAL, { type: "hp", f: 6000, gain: 0.004, env: (u) => Math.sin(Math.PI * u), send: 0.6 });

  const { L, R } = m.render();
  // Fade final
  const SRr = 44100, f0 = Math.floor((TOTAL - 1.3) * SRr);
  for (let i = f0; i < L.length; i++) { const g = 1 - (i - f0) / (L.length - f0); L[i] *= g; R[i] *= g; }
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
