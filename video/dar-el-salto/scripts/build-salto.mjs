// "Dar el salto" — guion único de imagen, texto y sonido.
//   node scripts/build-salto.mjs   → compositions/story.html + assets/salto/salto-audio.m4a
//
// Historia (metamorfosis): un conejo duda en su madriguera, sabe que es el momento, salta,
// cruza un mundo que cambia y se vuelve adverso, y al final encuentra un sombrero de mago en
// la mitad del mundo. Da el salto dentro del sombrero: se vuelve la magia.
//
// Dirección: todo se funde. Disoluciones largas entre secuencias, cámara que respira, el
// texto como parte del aire — se acerca, se aleja, entra en foco y sale — con tinta que
// se imprime sobre la luz (multiply) o brilla sobre la sombra (screen).

import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMix, wav16, rng } from "./sound.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FPS = 30;
const snap = (t) => Math.round(t * FPS) / FPS;
export const TOTAL = 25.5;
export const END_AT = 21.4; // entra el cierre de marca

// ─── Planos ─────────────────────────────────────────────────────────────────
// Clip A (301): 0–1.8 s duda en la madriguera · 2.0 empuja · 2.3–3.0 salta a la derecha.
// Clip B (302): 0–0.9 se agacha · 1.0 despega · 1.3–1.8 en el aire · 2.1 entra · 2.3+ polvo dorado.
const RATE_A1 = 0.6, RATE_A2 = 0.7, RATE_B = 0.8;
const shots = [
  { id: "a1", kind: "video", src: "301.mp4", start: 0, dur: 1.8 / RATE_A1, mediaStart: 0, rate: RATE_A1, fade: 0, alt: "El conejo duda en la madriguera" },
  { id: "eye", src: "202.jpg", start: 2.7, dur: 2.6, fade: 0.6, push: [1.12, 1.0], alt: "El ojo del conejo: sabe" },
  { id: "a2", kind: "video", src: "301.mp4", start: 5.0, dur: 1.29 / RATE_A2, mediaStart: 1.75, rate: RATE_A2, fade: 0.35, alt: "El conejo sale de la madriguera" },
  { id: "wheat", src: "203.jpg", start: 6.75, dur: 1.45, fade: 0.25, drift: [60, 0], alt: "Salto sobre el trigo" },
  { id: "wind", src: "204.jpg", start: 8.0, dur: 1.3, fade: 0.3, drift: [40, 0], alt: "Contra el viento y el polvo" },
  { id: "rain", src: "205.jpg", start: 9.1, dur: 1.2, fade: 0.3, drift: [30, -10], alt: "Bajo la lluvia en el bosque" },
  { id: "city", src: "206.jpg", start: 10.1, dur: 1.1, fade: 0.25, drift: [-30, 0], alt: "Cruzando la ciudad de noche" },
  { id: "snow", src: "207.jpg", start: 11.0, dur: 1.1, fade: 0.3, drift: [30, 10], alt: "En la tormenta de nieve" },
  { id: "ridge", src: "208.jpg", start: 11.9, dur: 2.0, fade: 0.4, push: [1.04, 1.12], alt: "En la cima, frente al mar de nubes" },
  { id: "hat", src: "209.jpg", start: 13.6, dur: 2.9, fade: 0.8, push: [1.0, 1.14], origin: "50% 45%", alt: "Un sombrero de mago en la mitad del mundo" },
  { id: "b", kind: "video", src: "302.mp4", start: 16.2, dur: 3.04 / RATE_B, mediaStart: 0, rate: RATE_B, fade: 0.7, alt: "El conejo salta dentro del sombrero" },
  { id: "inside", src: "211.jpg", start: 19.5, dur: 2.2, fade: 0.7, push: [1.0, 2.1], origin: "50% 78%", alt: "Adentro del sombrero: una luz" },
].map((s) => ({ ...s, start: snap(s.start), dur: +s.dur.toFixed(3) }));

// Momentos clave (tiempo del reel)
const T = {
  pushOut: snap(5.0 + (2.0 - 1.75) / RATE_A2), // empuja fuera de la madriguera
  takeoffB: snap(16.2 + 1.0 / RATE_B), // despega hacia el sombrero
  airB: snap(16.2 + 1.35 / RATE_B),
  entryB: snap(16.2 + 2.1 / RATE_B), // entra al sombrero
};

// ─── Texto ──────────────────────────────────────────────────────────────────
// ink: "print" = tinta cálida impresa sobre la luz · "glow" = marfil que brilla en la sombra
const phrases = [
  { id: "t1", words: ["Existen", "momentos"], start: 0.6, end: 3.3, x: 540, y: 300, size: 70, ink: "print", move: "approach" },
  { id: "t2", words: ["donde", "sabes,"], start: 3.2, end: 5.55, x: 540, y: 1460, size: 84, italic: true, ink: "print", move: "focus" },
  { id: "t3", words: ["que", "es", "tiempo", "de:"], start: 8.3, end: 13.7, x: 540, y: 560, size: 72, ink: "print", move: "journey" },
  { id: "t4", words: ["Dar", "el", "salto"], start: T.takeoffB - 0.1, end: 19.9, x: 540, y: 420, size: 132, italic: true, ink: "print", move: "leap" },
];
// La tinta sigue la luz de cada plano durante el viaje
const inkByShot = { a1: "print", eye: "print", a2: "print", wheat: "print", wind: "print", rain: "glow", city: "glow", snow: "print", ridge: "print", hat: "print", b: "print", inside: "glow" };
const INK = {
  print: { color: "#2b1a0d", mixBlendMode: "multiply", textShadow: "0 0 26px rgba(255, 232, 190, 0.55)" },
  glow: { color: "#fbf0dc", mixBlendMode: "screen", textShadow: "0 0 22px rgba(255, 196, 120, 0.45)" },
};

function buildHtml() {
  const r = rng(7);
  const shotTags = shots
    .map((s, i) => {
      const common = `id="st-${s.id}" class="clip plate" data-start="${s.start}" data-duration="${s.dur}" data-track-index="${1 + (i % 2)}"`;
      if (s.kind === "video")
        return `        <video ${common} src="assets/salto/${s.src}" data-hf-media-start-basis="local" data-media-start="${s.mediaStart}" data-playback-rate="${s.rate}" muted playsinline></video>`;
      return `        <img ${common} src="assets/salto/${s.src}" alt="${s.alt}" />`;
    })
    .join("\n");

  const tw = [];
  // Estado base de cada plano en t=0 y luego solo tl.to(): seekable desde cualquier punto
  shots.forEach((s) => {
    const d = (s.dur + 0.1).toFixed(2);
    const base = { opacity: s.fade ? 0 : 1 };
    const to = {};
    if (s.push) { Object.assign(base, { scale: s.push[0], transformOrigin: s.origin || "50% 50%" }); to.scale = s.push[1]; }
    else if (s.drift) { Object.assign(base, { scale: 1.1, x: s.drift[0], y: s.drift[1] }); Object.assign(to, { scale: 1.06, x: 0, y: 0 }); }
    else if (s.kind === "video") { base.scale = 1.02; to.scale = 1.06; }
    tw.push(`tl.set("#st-${s.id}", ${JSON.stringify(base)}, 0);`);
    if (s.fade) tw.push(`tl.to("#st-${s.id}", { opacity: 1, duration: ${s.fade}, ease: "sine.inOut" }, ${s.start});`);
    const ease = s.drift ? "power1.out" : s.kind === "video" ? "none" : "sine.inOut";
    tw.push(`tl.to("#st-${s.id}", { ...${JSON.stringify(to)}, duration: ${d}, ease: "${ease}" }, ${s.start});`);
  });
  // Un "latido" de cámara en cada salto del viaje: sube y cae con el conejo
  tw.push(`tl.set("#stage", { y: 0 }, 0);`);
  shots.filter((s) => ["wheat", "wind", "rain", "city", "snow"].includes(s.id)).forEach((s) => {
    tw.push(`tl.to("#stage", { y: -14, duration: 0.22, ease: "sine.out", yoyo: true, repeat: 1 }, ${s.start});`);
  });

  // Oscurecer al fondo del sombrero antes del cierre
  tw.push(`tl.fromTo("#fade-out", { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "sine.in" }, ${END_AT - 0.9});`);

  // Tinta por plano
  let lastInk = null;
  shots.forEach((s) => {
    const ink = inkByShot[s.id];
    if (ink === lastInk) return;
    lastInk = ink;
    const k = INK[ink];
    tw.push(`tl.set("#words", { color: "${k.color}", mixBlendMode: "${k.mixBlendMode}", textShadow: "${k.textShadow}" }, ${Math.max(0, s.start + (s.fade || 0) * 0.5).toFixed(2)});`);
  });

  // Coreografía del texto: cercanía, foco y aire
  const wordTags = [];
  phrases.forEach((p) => {
    const spans = p.words.map((w, i) => `<span id="${p.id}-w${i}" class="word">${w}</span>`).join(" ");
    wordTags.push(`        <div id="${p.id}" class="clip phrase" data-start="${snap(p.start)}" data-duration="${+(p.end - p.start).toFixed(3)}" data-track-index="5"><div id="${p.id}-line" class="line${p.italic ? " italic" : ""}" style="left:${p.x}px;top:${p.y}px;font-size:${p.size}px">${spans}</div></div>`);
    const life = p.end - p.start;
    const ids = p.words.map((_, i) => `#${p.id}-w${i}`);
    const S = snap(p.start);
    if (p.move === "approach") {
      ids.forEach((id, i) => tw.push(`tl.fromTo("${id}", { opacity: 0, filter: "blur(14px)", y: 18 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.1, ease: "sine.out" }, ${(S + i * 0.35).toFixed(2)});`));
      tw.push(`tl.fromTo("#${p.id}-line", { scale: 0.9 }, { scale: 1.06, duration: ${(life - 0.6).toFixed(2)}, ease: "none" }, ${S});`);
      tw.push(`tl.to("#${p.id}-line", { opacity: 0, filter: "blur(10px)", scale: 1.14, duration: 0.6, ease: "sine.in" }, ${(p.end - 0.6).toFixed(2)});`);
    } else if (p.move === "focus") {
      tw.push(`tl.fromTo("#${p.id}-line", { opacity: 0, scale: 1.45, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.3, ease: "power2.out" }, ${S});`);
      tw.push(`tl.to("#${p.id}-line", { opacity: 0, scale: 0.9, filter: "blur(8px)", duration: 0.55, ease: "sine.in" }, ${(p.end - 0.55).toFixed(2)});`);
    } else if (p.move === "journey") {
      ids.forEach((id, i) => tw.push(`tl.fromTo("${id}", { opacity: 0, x: 40, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8, ease: "sine.out" }, ${(S + i * 0.22).toFixed(2)});`));
      // el viento lo empuja, la lluvia lo desenfoca un instante: el texto vive en el clima
      const wind = shots.find((s) => s.id === "wind").start, rain = shots.find((s) => s.id === "rain").start;
      tw.push(`tl.to("#${p.id}-line", { x: -16, skewX: -4, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, ${wind.toFixed(2)});`);
      tw.push(`tl.to("#${p.id}-line", { filter: "blur(3px)", duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, ${rain.toFixed(2)});`);
      tw.push(`tl.fromTo("#${p.id}-line", { scale: 1 }, { scale: 0.86, duration: ${life.toFixed(2)}, ease: "none" }, ${S});`); // se aleja con el horizonte
      tw.push(`tl.to("#${p.id}-line", { opacity: 0, filter: "blur(12px)", y: -30, duration: 0.8, ease: "sine.in" }, ${(p.end - 0.8).toFixed(2)});`);
    } else if (p.move === "leap") {
      // las palabras suben con el arco del salto…
      ids.forEach((id, i) => tw.push(`tl.fromTo("${id}", { opacity: 0, y: 90, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, ${(S + i * 0.14).toFixed(2)});`));
      // …y cuando el conejo entra, el texto cae dentro del sombrero
      tw.push(`tl.to("#${p.id}-line", { x: -216, y: 440, scale: 0.12, filter: "blur(6px)", opacity: 0, duration: 0.75, ease: "power2.in" }, ${(T.entryB - 0.15).toFixed(2)});`);
    }
  });

  void r;
  return `<!doctype html>
<!-- GENERADO por scripts/build-salto.mjs — edita el guion allá y vuelve a correrlo. -->
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
          background: #120c07;
        }
        #stage {
          position: absolute;
          inset: -24px;
        }
        #stage .plate {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        #words {
          position: absolute;
          inset: 0;
          color: #2b1a0d;
          mix-blend-mode: multiply;
        }
        #words .line {
          position: absolute;
          display: block;
          width: 1000px;
          margin-left: -500px;
          text-align: center;
          font-family: var(--co-font-display);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -0.01em;
          white-space: nowrap;
          transform-origin: 50% 50%;
        }
        #words .line.italic {
          font-style: italic;
        }
        #words .word {
          display: inline-block;
        }
        #fade-out {
          position: absolute;
          inset: 0;
          background: #120c07;
          opacity: 0;
        }
      </style>

      <div id="root" data-composition-id="story" data-width="1080" data-height="1920">
      <div id="stage" data-layout-allow-overflow>
${shotTags}
      </div>
      <div id="words">
${wordTags.join("\n")}
      </div>
      <div id="fade-out"></div>
      </div>

      <script>
        const tl = gsap.timeline({ paused: true });
${tw.map((l) => "        " + l).join("\n")}
        window.__timelines["story"] = tl;
      </script>
    </template>
  </body>
</html>
`;
}

// ─── Sonido: la metamorfosis como camino ────────────────────────────────────
function buildAudio() {
  const m = createMix(TOTAL, 20260928);
  const r = m.r;
  const at = (id) => shots.find((s) => s.id === id).start;

  // 0–5 · LA DUDA — mañana quieta, aire, pájaros, un piano que pregunta sin resolver
  m.noise(0, 13.8, { f: 600, q: 0.5, gain: 0.03, send: 0.25, env: (u, t) => Math.min(1, t / 1.5) * (t > 12.8 ? Math.max(0, 13.8 - t) : 1) });
  [[0.7, 0.5], [0.82, 0.5], [2.1, -0.4], [2.2, -0.4]].forEach(([t, pan]) => m.tone(t, 0.07, 3000 + r() * 400, 3700, 0.014, { decay: 32, pan, send: 0.9 }));
  m.strings(0, 5.2, [50, 57, 62], 0.045, { att: 2, rel: 1.5, bright: 0.2 });
  m.piano(0.45, 69, 0.11, { pan: -0.2 });
  m.piano(1.65, 66, 0.1, { pan: 0.2 });
  m.piano(2.75, 64, 0.1, { send: 0.8 }); // queda en el aire: no resuelve
  // "donde sabes," — el corazón lo sabe antes que él
  [3.05, 3.38, 4.15, 4.48].forEach((t, i) => m.tone(t, 0.25, 78, 52, i % 2 ? 0.05 : 0.08, { decay: 14, send: 0.1 }));
  m.piano(3.25, 74, 0.1, { send: 0.9 });

  // 5 · EL SALTO — respira, empuja, sale
  m.noise(4.3, T.pushOut + 0.05, { type: "bp", f: 350, fEnd: 1800, q: 0.8, gain: 0.06, env: (u) => Math.pow(u, 2), send: 0.4 });
  m.noise(T.pushOut, T.pushOut + 0.6, { f: 1200, fEnd: 300, gain: 0.08, env: (u) => Math.sin(Math.PI * Math.min(1, u * 1.4)) * (1 - u), send: 0.5, pan: 0.4 });
  [62, 66, 69, 74].forEach((n, i) => m.piano(T.pushOut + i * 0.07, n, 0.14 - i * 0.015, { pan: -0.3 + i * 0.2 }));

  // 6.8–13.9 · EL VIAJE — pulso de cuerdas, un paso por cada mundo, el clima de cada lugar
  m.strings(at("wheat") - 0.2, at("rain"), [50, 54, 57, 62], 0.09, { att: 0.6, bright: 0.45 });
  m.strings(at("rain"), at("snow"), [47, 54, 59, 62], 0.1, { att: 0.4, bright: 0.35 }); // la adversidad
  m.strings(at("snow"), at("ridge"), [43, 50, 55, 62], 0.1, { att: 0.3, bright: 0.4 });
  m.strings(at("ridge"), at("hat") + 0.8, [45, 52, 57, 61, 64, 69], 0.12, { att: 0.5, rel: 2, bright: 0.55, swell: 0.6 }); // la cima: se abre
  const journey = ["wheat", "wind", "rain", "city", "snow", "ridge"];
  const notes = [66, 69, 71, 69, 74, 78];
  journey.forEach((id, i) => {
    const t = at(id);
    m.hop(t, 0.045, { pan: i % 2 ? 0.2 : -0.2 });
    m.piano(t + 0.02, notes[i], 0.12, { pan: i % 2 ? 0.3 : -0.3 });
  });
  const w = (id, fn) => fn(at(id), shots.find((s) => s.id === id).dur);
  w("wheat", (t, d) => m.noise(t, t + d, { type: "bp", f: 3200, q: 0.6, gain: 0.02, env: (u) => Math.sin(Math.PI * u), send: 0.4 }));
  w("wind", (t, d) => m.noise(t - 0.1, t + d + 0.2, { f: 800, fEnd: 450, gain: 0.05, env: (u, tt) => Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(tt * 9)), send: 0.3 }));
  w("rain", (t, d) => { m.noise(t, t + d + 0.2, { type: "hp", f: 3200, gain: 0.011, env: (u) => Math.sin(Math.PI * u), send: 0.5 }); for (let k = 0; k < 6; k++) m.tone(t + r() * d, 0.04, 2200, 1100, 0.012, { decay: 70, pan: r() - 0.5, send: 0.6 }); });
  w("city", (t, d) => { m.noise(t, t + d, { f: 180, gain: 0.05, env: (u) => Math.sin(Math.PI * u), send: 0.2 }); m.noise(t + 0.1, t + d, { type: "bp", f: 700, fEnd: 240, q: 1, gain: 0.05, env: (u) => Math.sin(Math.PI * u), pan: -0.5, send: 0.3 }); });
  w("snow", (t, d) => { m.noise(t, t + d + 0.2, { f: 420, gain: 0.045, env: (u) => Math.sin(Math.PI * u), send: 0.4 }); m.noise(t, t + d, { type: "hp", f: 7000, gain: 0.006, env: (u) => Math.sin(Math.PI * u), send: 0.6 }); });
  w("ridge", (t, d) => m.noise(t, t + d + 0.6, { f: 520, gain: 0.05, env: (u) => Math.sin(Math.PI * u), send: 0.5, width: 0.9 }));

  // 13.6–16.2 · EL SOMBRERO — todo se calla; solo el aire y un brillo de cristal
  m.noise(13.6, 17.5, { f: 480, gain: 0.025, env: (u) => Math.sin(Math.PI * u), send: 0.5 });
  [[14.0, 88], [14.9, 93], [15.7, 90]].forEach(([t, n], i) => m.bell(t, n, 0.05, { pan: (i - 1) * 0.4, len: 3 }));
  m.strings(13.9, 16.4, [74, 78, 81], 0.035, { att: 1.5, rel: 1.5, bright: 0.3 });

  // 16.2–20 · DAR EL SALTO — la respiración, el vuelo, la entrada, la magia
  m.noise(16.3, T.takeoffB, { type: "bp", f: 300, fEnd: 1500, q: 0.9, gain: 0.05, env: (u) => Math.pow(u, 2.2), send: 0.4 });
  m.noise(T.takeoffB, T.takeoffB + 0.5, { f: 1400, fEnd: 400, gain: 0.07, env: (u) => Math.sin(Math.PI * u), send: 0.5, pan: -0.3 });
  [74, 76, 78, 81, 83, 86].forEach((n, i) => m.piano(T.airB + i * 0.06, n, 0.1, { pan: -0.4 + i * 0.12, len: 2.5 }));
  m.noise(T.entryB - 0.05, T.entryB + 0.25, { f: 700, fEnd: 140, gain: 0.07, env: (u) => Math.sin(Math.PI * u), send: 0.3 }); // "fwoop" de tela
  m.tone(T.entryB, 0.22, 520, 180, 0.04, { decay: 10, send: 0.3 });
  [86, 81, 78, 74, 69].forEach((n, i) => m.bell(T.entryB + 0.12 + i * 0.1, n, 0.075 - i * 0.008, { pan: 0.4 - i * 0.2, len: 3.2 }));
  m.noise(T.entryB + 0.2, T.entryB + 1.6, { type: "hp", f: 6000, gain: 0.006, env: (u) => Math.sin(Math.PI * u), send: 0.7 }); // polvo dorado

  // 19.5–21.4 · ADENTRO — caemos en la luz (swell invertido, sin golpe)
  m.noise(19.4, END_AT - 0.05, { f: 300, fEnd: 2600, gain: 0.05, env: (u) => Math.pow(u, 2.5), send: 0.5 });
  m.strings(19.5, END_AT, [57, 62, 66, 69], 0.06, { att: 1.2, rel: 0.4, bright: 0.4, swell: 0.8 });
  m.gate(END_AT - 0.05, END_AT + 0.12); // una respiración

  // 21.4 · LA CASA DEL MARKETING — cálido, abierto, sin bajos
  [62, 66, 69, 76].forEach((n, k) => m.piano(END_AT + 0.15 + k * 0.05, n, 0.13 - k * 0.015, { pan: (k - 1.5) * 0.25, len: 4, send: 0.85 }));
  [[END_AT + 0.35, 90], [END_AT + 0.75, 93], [END_AT + 1.3, 86]].forEach(([t, n], i) => m.bell(t, n, 0.04, { pan: (i - 1) * 0.5, len: 3 }));
  m.strings(END_AT + 0.2, TOTAL - 1.2, [50, 57, 62, 66], 0.05, { att: 1.8, rel: 1.2, bright: 0.25 });
  m.noise(END_AT, TOTAL, { type: "hp", f: 6000, gain: 0.0015, env: (u) => Math.sin(Math.PI * u), send: 0.6 });

  const { L, R } = m.render();
  const f0 = Math.floor((TOTAL - 1.5) * 44100);
  for (let i = f0; i < L.length; i++) { const g = 1 - (i - f0) / (L.length - f0); L[i] *= g; R[i] *= g; }
  return wav16(L, R);
}

// ─── Main ───────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "assets/salto"), { recursive: true });
writeFileSync(join(ROOT, "compositions/story.html"), buildHtml());
const wav = join(ROOT, "assets/salto/salto-audio.wav");
writeFileSync(wav, buildAudio());
let ln = "loudnorm=I=-16:TP=-1.5:LRA=11";
try {
  const j = JSON.parse(execFileSync("bash", ["-c", `ffmpeg -nostdin -hide_banner -i "${wav}" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`]).toString());
  ln += `:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
} catch {}
execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-y", "-i", wav, "-af", ln, "-ar", "44100", "-c:a", "aac", "-b:a", "224k", join(ROOT, "assets/salto/salto-audio.m4a")]);
unlinkSync(wav);
console.log(`story.html: ${shots.length} planos, ${phrases.length} frases · audio ${TOTAL}s · despegue ${T.takeoffB}s, entrada ${T.entryB}s`);
