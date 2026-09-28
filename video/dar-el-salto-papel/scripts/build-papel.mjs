// "Dar el salto" en papel — guion único de imagen, stop motion, texto y sonido.
//   node scripts/build-papel.mjs  → compositions/story.html + assets/papel/papel-audio.m4a
//
// Historia: el conejo sale de la madriguera a buscar otro lugar donde vivir. Recorre el mismo
// planeta de papel mientras cambian la hora, el clima y la casa posible (cabaña, faro, edificio,
// casa del árbol, iglú, castillo). Ninguna lo convence. En la mitad del mundo hay un sombrero de
// mago: salta adentro y se queda.
//
// Lenguaje: match cut sobre la curva del planeta (todas alineadas a la mitad del cuadro) y stop
// motion real: el conejo es UN recorte de papel con 8 poses, animado a 12 cuadros por segundo,
// y todo "hierve" (se mueve un pixel) cada 2 cuadros como en una mesa de animación.

import { writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMix, wav16, rng } from "./sound.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = (f) => join(ROOT, "assets/papel", f);
const W = 1080, H = 1920, CREST = 960; // la cima de todos los planetas cae aquí
const STEP = 1 / 12; // stop motion a 12 fps
const q = (t) => Math.round(t * 30) / 30;
export const TOTAL = 24.5;
export const END_AT = 20.0;

const pngSize = (f) => { const b = readFileSync(A(f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

// ─── Escenarios ─────────────────────────────────────────────────────────────
// crest / y30: altura (fracción) de la superficie del planeta en el centro y en x=0.3, medidas a ojo.
// ink: tinta del texto según el cielo.
const scenes = [
  { id: "e01", img: "e01-madriguera.png", crest: 0.5, y30: 0.515, start: 0, end: 3.4, ink: "light", name: "La madriguera · noche" },
  { id: "e02", img: "e02-cabana.png", crest: 0.566, y30: 0.58, start: 3.4, end: 5.8, ink: "dark", name: "La cabaña · amanecer" },
  { id: "e03", img: "e03-faro.png", crest: 0.5, y30: 0.515, start: 5.8, end: 7.8, ink: "dark", name: "El faro · viento" },
  { id: "e04", img: "e04-edificio.png", crest: 0.507, y30: 0.52, start: 7.8, end: 9.5, ink: "light", name: "El edificio · tormenta" },
  { id: "e05", img: "e05-arbol.png", crest: 0.493, y30: 0.5, start: 9.5, end: 11.0, ink: "dark", name: "La casa del árbol · tarde" },
  { id: "e06", img: "e06-iglu.png", crest: 0.522, y30: 0.54, start: 11.0, end: 12.3, ink: "light", name: "El iglú · nieve" },
  { id: "e07", img: "e07-castillo.png", crest: 0.456, y30: 0.47, start: 12.3, end: 13.5, ink: "dark", name: "El castillo · niebla" },
  { id: "e08", img: "e08-sombrero.png", crest: 0.53, y30: 0.55, start: 13.5, end: 18.0, ink: "light", name: "El sombrero · noche clara" },
  { id: "e09", img: "e09-adentro.png", crest: 0.5, y30: 0.5, start: 18.0, end: END_AT, ink: "light", name: "Adentro del sombrero", noAlign: true },
].map((s) => {
  const [w0, h0] = pngSize(s.img);
  const s0 = Math.max(W / w0, H / h0);
  const bw = w0 * s0, bh = h0 * s0, left = (W - bw) / 2, top = (H - bh) / 2;
  const cb = top + s.crest * bh; // cima en la imagen base
  const scale = s.noAlign ? 1 : Math.max(1, CREST / (cb - top), (H - CREST) / (top + bh - cb)) * 1.01;
  const dy = s.noAlign ? 0 : CREST - cb;
  const k = (s.y30 - s.crest) / 0.04; // curvatura: y(fx) = crest + k (fx-0.5)^2
  // imagen (fracciones) → pantalla
  const map = (fx, fy) => [W / 2 + (left + fx * bw - W / 2) * scale, (s.noAlign ? top + fy * bh : CREST + (top + fy * bh - cb) * scale)];
  const ground = (fx) => map(fx, s.crest + k * (fx - 0.5) ** 2)[1];
  return { ...s, bw, bh, left, top, cb, scale, dy, map, ground, start: q(s.start), end: q(s.end) };
});
const sceneAt = (t) => scenes.find((s) => t >= s.start && t < s.end) || scenes[scenes.length - 1];

// ─── Conejo: 8 poses del mismo recorte ──────────────────────────────────────
const K = 0.5; // una sola escala para todas las poses (mismo conejo en todos los mundos)
const POSES = ["peek", "sit", "lookback", "crouch", "leap", "land", "back", "up"].map((p) => {
  const [w, h] = pngSize(`r-${p}.png`);
  return { p, w: Math.round(w * K), h: Math.round(h * K) };
});

const keys = []; // {t, pose|null, x, y, rot}
const put = (t, pose, fx, lift = 0, rot = 0) => {
  const s = sceneAt(t + 1e-4);
  keys.push({ t: q(t), pose, x: Math.round(fx * W), y: Math.round(s.ground(fx) + 6 - lift), rot });
};
const hide = (t) => keys.push({ t: q(t), pose: null });
const enter = (t0) => { put(t0, "leap", 0.02, 80); put(t0 + STEP, "leap", 0.12, 40); put(t0 + 2 * STEP, "land", 0.2); put(t0 + 4 * STEP, "sit", 0.23); };
const hop = (t0, a, b) => { put(t0, "crouch", a); put(t0 + 2 * STEP, "leap", (a + b) / 2, 70); put(t0 + 4 * STEP, "land", b); put(t0 + 6 * STEP, "sit", b + 0.01); };
const leave = (t0, a) => { put(t0, "crouch", a); put(t0 + 2 * STEP, "leap", a + 0.28, 110); put(t0 + 3 * STEP, "leap", a + 0.6, 90); put(t0 + 4 * STEP, "leap", 1.25, 70); };
const doubt = (t0, fx) => { put(t0, "lookback", fx); put(t0 + 5 * STEP, "sit", fx); }; // mira atrás: "no"

// 0–3.4 · La madriguera: se asoma, sale, mira su hogar… y se va
const burrow = scenes[0].map(0.14, 0.55); // centro del agujero
keys.push({ t: 0, pose: null });
// La cabeza sale DESDE el agujero: centrada en él, un poco más pequeña que la boca, y el borde
// inferior del agujero la tapa (máscara) para que el corte del cuello nunca se vea.
const HOLE = { x: 255, lip: 1082 }; // centro del agujero y su borde inferior (px de pantalla, medidos)
const peekAt = (t, sink) => keys.push({ t: q(t), pose: "peek", x: HOLE.x, y: HOLE.lip + 20 + sink, rot: 0, sc: 0.74 });
peekAt(0.7, 70); peekAt(0.7 + STEP, 36); peekAt(0.7 + 2 * STEP, 6); peekAt(0.7 + 3 * STEP, -16);
put(1.55, "sit", 0.3); put(1.55 + STEP, "sit", 0.3, 4); put(1.55 + 2 * STEP, "sit", 0.3);
doubt(2.2, 0.3);
leave(3.0, 0.3);
// 3.4–13.5 · Buscar casa: aterriza, mira el lugar, duda, sigue (cada vez más rápido)
const tour = [
  [3.4, 0.5, 4.75, 5.35],
  [5.8, 0.45, 6.75, 7.3],
  [7.8, 0.45, 8.5, 9.05],
  [9.5, 0.35, 10.1, 10.6],
  [11.0, 0.3, 11.5, 11.9],
  [12.3, 0.25, 12.75, 13.1],
];
tour.forEach(([t0, , tDoubt, tLeave]) => { enter(t0); hop(t0 + 0.5, 0.23, 0.33); doubt(tDoubt, 0.34); leave(tLeave, 0.34); });
// 13.5–18 · El sombrero: llega, lo mira, se decide, salta adentro
const hatS = scenes[7];
const hatBox = JSON.parse(readFileSync(A("hat-front.json"), "utf8"));
const [mouthX, mouthY] = hatS.map(hatBox.mouth_x, hatBox.mouth_y);
enter(13.5);
hop(14.2, 0.23, 0.29);
put(15.0, "back", 0.3); // de espaldas, mirando el sombrero: el momento
put(15.9, "sit", 0.3);
put(16.15, "crouch", 0.3);
const TAKEOFF = q(16.15 + 2 * STEP);
// La zambullida: el conejo gira sobre su centro, se encoge un poco (es magia) y entra de cabeza.
// dive(t, pose, cx, cy, rot, sc): posición por el CENTRO del recorte, no por las patas.
const dive = (t, pose, cx, cy, rot, sc) => {
  const P = POSES.find((p) => p.p === pose), hh = (P.h * sc) / 2, a = (rot * Math.PI) / 180;
  // el ancla es la base del recorte: centro − rotar((0, −h/2))
  keys.push({ t: q(t), pose, x: Math.round(cx - hh * Math.sin(a)), y: Math.round(cy + hh * Math.cos(a)), rot, sc });
};
put(TAKEOFF, "up", 0.35, 140);
dive(TAKEOFF + STEP, "up", 0.41 * W, mouthY - 250, 0, 0.9);
dive(TAKEOFF + 2 * STEP, "leap", mouthX - 20, mouthY - 120, 28, 0.78);
dive(TAKEOFF + 3 * STEP, "leap", mouthX + 4, mouthY - 20, 62, 0.64);
dive(TAKEOFF + 4 * STEP, "leap", mouthX + 8, mouthY + 70, 84, 0.56);
const ENTRY = q(TAKEOFF + 5 * STEP);
hide(ENTRY);

// ─── Texto ──────────────────────────────────────────────────────────────────
const phrases = [
  { id: "t1", text: "Cuando ya no te gusta", start: 0.9, end: 4.6, y: 640, size: 60 },
  { id: "t2", text: "donde estás.", start: 4.6, end: 7.6, y: 640, size: 64, italic: true },
  { id: "t3", text: "Solo tienes que:", start: 8.4, end: 13.45, y: 640, size: 60 },
  { id: "t4", text: "Dar el salto", start: TAKEOFF - 0.2, end: 18.0, y: 470, size: 100, italic: true },
].map((p) => ({ ...p, start: q(p.start), end: q(p.end) }));
const INK = {
  light: { color: "#f6ecd8", textShadow: "0 2px 0 rgba(20,16,14,0.35)" },
  dark: { color: "#2a2320", textShadow: "0 2px 0 rgba(255,248,235,0.35)" },
};

// ─── HTML ───────────────────────────────────────────────────────────────────
function buildHtml() {
  const r = rng(12);
  const tw = [];
  const plates = scenes.map((s, i) => {
    const style = `left:${s.left.toFixed(1)}px;top:${s.top.toFixed(1)}px;width:${s.bw.toFixed(1)}px;height:${s.bh.toFixed(1)}px`;
    tw.push(`tl.set("#pl-${s.id}", { transformOrigin: "${(W / 2 - s.left).toFixed(1)}px ${(s.cb - s.top).toFixed(1)}px", scale: ${s.scale.toFixed(4)}, y: ${s.dy.toFixed(1)} }, 0);`);
    return `        <img id="pl-${s.id}" class="clip plate" src="assets/papel/${s.img}" alt="${s.name}" style="${style}" data-start="${s.start}" data-duration="${+(s.end - s.start).toFixed(3)}" data-track-index="${1 + (i % 2)}" />`;
  });
  // Frente del sombrero (por encima del conejo), con la misma transformación que su escenario
  const hs = hatS;
  const hatStyle = `left:${(hs.left + hatBox.x * hs.bw).toFixed(1)}px;top:${(hs.top + hatBox.y * hs.bh).toFixed(1)}px;width:${(hatBox.w * hs.bw).toFixed(1)}px;height:${(hatBox.h * hs.bh).toFixed(1)}px`;
  tw.push(`tl.set("#hat-front", { transformOrigin: "${(W / 2 - hs.left - hatBox.x * hs.bw).toFixed(1)}px ${(hs.cb - hs.top - hatBox.y * hs.bh).toFixed(1)}px", scale: ${hs.scale.toFixed(4)}, y: ${hs.dy.toFixed(1)} }, 0);`);

  // Cámara de stop motion hacia el fondo del sombrero (en pasos, no suave)
  const inside = scenes[8];
  tw.push(`tl.fromTo("#pl-e09", { scale: 1 }, { scale: 2.6, duration: ${(inside.end - inside.start).toFixed(2)}, ease: "steps(24)" }, ${inside.start});`);

  // Poses
  const poseTags = POSES.map((p) => `          <img id="rb-${p.p}" class="pose" src="assets/papel/r-${p.p}.png" alt="" style="width:${p.w}px;height:${p.h}px;left:${-p.w / 2}px;top:${-p.h}px" />`).join("\n");
  tw.push(`tl.set("#rabbit .pose", { opacity: 0 }, 0);`);
  // máscara del agujero mientras se asoma; se retira cuando sale del todo
  tw.push(`tl.set("#boil-r", { clipPath: "inset(0px 0px ${H - HOLE.lip}px 0px)" }, 0);`);
  tw.push(`tl.set("#boil-r", { clipPath: "inset(0px 0px 0px 0px)" }, 1.55);`);
  // Una sola orden por pose y por cuadro (sin "apagar todo y prender una" en el mismo instante,
  // que al buscar en la línea de tiempo puede resolverse en otro orden y dejar un cuadro vacío)
  keys.forEach((k) => {
    POSES.forEach((p) => tw.push(`tl.set("#rb-${p.p}", { opacity: ${p.p === k.pose ? 1 : 0} }, ${k.t});`));
    if (k.pose) {
      tw.push(`tl.set("#rabbit", { x: ${k.x}, y: ${k.y}, rotation: ${k.rot || 0}, scale: ${k.sc || 1} }, ${k.t});`);
    }
  });

  // Chispas de papel dorado al entrar al sombrero (stop motion)
  const sparks = [];
  for (let i = 0; i < 9; i++) {
    const ang = -Math.PI / 2 + (r() - 0.5) * 1.6, dist = 90 + r() * 170, sz = 7 + Math.round(r() * 9);
    sparks.push(`          <i id="sp-${i}" class="spark" style="width:${sz}px;height:${sz}px;left:${Math.round(mouthX - sz / 2)}px;top:${Math.round(mouthY - sz / 2)}px"></i>`);
    tw.push(`tl.set("#sp-${i}", { opacity: 0, x: 0, y: 0 }, 0);`);
    for (let f = 0; f <= 8; f++) {
      const u = f / 8;
      tw.push(`tl.set("#sp-${i}", { opacity: ${f === 8 ? 0 : (1 - u * 0.7).toFixed(2)}, x: ${Math.round(Math.cos(ang) * dist * u)}, y: ${Math.round(Math.sin(ang) * dist * u + 60 * u * u)}, rotation: ${Math.round(u * 180 * (i % 2 ? 1 : -1))} }, ${q(ENTRY + 0.05 + f * STEP)});`);
    }
  }

  // Texto: aparece en 3 pasos (como papel que se posa), la tinta sigue al cielo
  let lastInk = null;
  scenes.forEach((s) => {
    if (s.ink === lastInk) return;
    lastInk = s.ink;
    tw.push(`tl.set("#words", ${JSON.stringify(INK[s.ink])}, ${s.start});`);
  });
  const wordTags = phrases.map((p) => {
    tw.push(`tl.fromTo("#${p.id}-line", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "steps(3)" }, ${p.start});`);
    tw.push(`tl.to("#${p.id}-line", { opacity: 0, duration: 0.17, ease: "steps(2)" }, ${q(p.end - 0.17)});`);
    return `        <div id="${p.id}" class="clip phrase" data-start="${p.start}" data-duration="${+(p.end - p.start).toFixed(3)}" data-track-index="5"><div id="${p.id}-line" class="line${p.italic ? " italic" : ""}" style="top:${p.y}px;font-size:${p.size}px">${p.text}</div></div>`;
  });

  // "Hervor" de stop motion: todo tiembla un pixel cada 2 cuadros
  for (let f = 0; f < END_AT * 15; f++) {
    const t = (f / 15).toFixed(3);
    tw.push(`tl.set("#plates", { x: ${((r() - 0.5) * 3).toFixed(1)}, y: ${((r() - 0.5) * 3).toFixed(1)}, rotation: ${((r() - 0.5) * 0.24).toFixed(2)} }, ${t});`);
    tw.push(`tl.set("#boil-r", { x: ${((r() - 0.5) * 3).toFixed(1)}, y: ${((r() - 0.5) * 2).toFixed(1)}, rotation: ${((r() - 0.5) * 1.2).toFixed(2)} }, ${t});`);
    tw.push(`tl.set("#words", { x: ${((r() - 0.5) * 2).toFixed(1)}, y: ${((r() - 0.5) * 2).toFixed(1)} }, ${t});`);
  }
  tw.push(`tl.fromTo("#fade-out", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "steps(4)" }, ${END_AT - 0.5});`);

  return `<!doctype html>
<!-- GENERADO por scripts/build-papel.mjs — edita el guion allá y vuelve a correrlo. -->
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
          background: #1c1a22;
        }
        #plates {
          position: absolute;
          inset: -8px;
        }
        #plates .plate {
          position: absolute;
          object-fit: fill;
        }
        #rabbit-layer,
        #hat-layer,
        #sparks {
          position: absolute;
          inset: 0;
        }
        #boil-r {
          position: absolute;
          inset: 0;
        }
        #rabbit {
          position: absolute;
          left: 0;
          top: 0;
          width: 1px;
          height: 1px;
          transform-origin: 0 0;
          filter: drop-shadow(0 7px 5px rgba(20, 14, 10, 0.35));
        }
        #rabbit .pose {
          position: absolute;
          display: block;
          opacity: 0;
        }
        #hat-front {
          position: absolute;
        }
        #sparks .spark {
          position: absolute;
          display: block;
          background: #e8c26a;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 210, 120, 0.8);
          opacity: 0;
        }
        #words {
          position: absolute;
          inset: 0;
          color: #f6ecd8;
        }
        #words .line {
          position: absolute;
          left: 90px;
          width: 900px;
          text-align: center;
          font-family: var(--co-font-display);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: 0.005em;
          white-space: nowrap;
        }
        #words .line.italic {
          font-style: italic;
        }
        #fade-out {
          position: absolute;
          inset: 0;
          background: #15131a;
          opacity: 0;
        }
      </style>

      <div id="root" data-composition-id="story" data-width="1080" data-height="1920">
      <div id="plates" data-layout-allow-overflow>
${plates.join("\n")}
      </div>
      <div id="rabbit-layer">
        <div id="boil-r">
          <div id="rabbit">
${poseTags}
          </div>
        </div>
      </div>
      <div id="hat-layer">
        <img id="hat-front" class="clip" src="assets/papel/hat-front.png" alt="" style="${hatStyle}" data-start="${hatS.start}" data-duration="${+(hatS.end - hatS.start).toFixed(3)}" data-track-index="3" />
      </div>
      <div id="sparks">
${sparks.join("\n")}
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

// ─── Sonido: la arquitectura del video de Opus ──────────────────────────────
// Un arpegio pulsado y brillante (una nota en cada cambio de mundo y una rejilla que se acelera
// con los cortes), un sub-grave que crece sin golpes, aire que sube, pulso de shaker que entra a
// mitad del viaje → silencio seco cuando el conejo entra al sombrero → resolución cálida: el
// sub vuelve y tres notas lentas bajo la marca. Tonalidad: Si menor → Re mayor.
function buildAudio() {
  const m = createMix(TOTAL, 20260930);
  const r = m.r;
  const S = (id) => scenes.find((s) => s.id === id);
  const DROP = q(ENTRY + 0.03), BACK = q(DROP + 0.5); // silencio y regreso

  // Acordes por lugar (notas del arpegio) y raíz del sub
  const harmony = {
    e01: { arp: [66, 74, 73, 69], root: 35 }, // Si m(add9): la duda
    e02: { arp: [62, 66, 69, 76, 73, 81], root: 38 }, // Re maj9: sale al mundo
    e03: { arp: [62, 69, 66, 76, 81, 73], root: 38 },
    e04: { arp: [59, 66, 62, 69, 73, 78], root: 35 }, // Si m9: la tormenta
    e05: { arp: [55, 62, 59, 66, 74, 69], root: 43 }, // Sol maj9
    e06: { arp: [64, 71, 67, 74, 78, 83], root: 40 }, // Mi m9
    e07: { arp: [57, 64, 69, 71, 76, 81], root: 33 }, // La sus: casi
    e08: { arp: [59, 66, 71, 74, 78, 81, 85, 86], root: 35 }, // Si m → tensión hacia el salto
  };
  const notesPer = { e01: 4, e02: 6, e03: 6, e04: 6, e05: 7, e06: 8, e07: 8 };
  const grow = (t) => Math.min(1, Math.max(0, (t - 3.4) / (16.3 - 3.4))); // 0→1 a lo largo del viaje

  // 1) Arpegio: primera nota fuerte en el corte, luego la rejilla del lugar (se acelera sola)
  scenes.filter((sc) => notesPer[sc.id]).forEach((sc) => {
    const h = harmony[sc.id], n = notesPer[sc.id], len = sc.end - sc.start;
    const start = sc.id === "e01" ? 0.7 : sc.start;
    const step = (sc.end - start) / n;
    for (let i = 0; i < n; i++) {
      const t = start + i * step;
      const g = grow(t);
      const vel = (i === 0 ? 0.24 : 0.16) * (0.75 + 0.5 * g) * (0.9 + r() * 0.2);
      m.pluck(t + (r() - 0.5) * 0.008, h.arp[i % h.arp.length], vel, { pan: i % 2 ? 0.35 : -0.35, bright: 1.1 + 0.7 * g, delay: 0.3 + 0.2 * g, len: 2.4 });
    }
    void len;
  });
  // El sombrero: el arpegio se vuelve una cascada que se acelera (corcheas → semicorcheas) hasta el salto
  {
    const h = harmony.e08;
    let t = S("e08").start, i = 0;
    while (t < DROP - 0.05) {
      const u = (t - S("e08").start) / (DROP - S("e08").start);
      m.pluck(t, h.arp[i % h.arp.length] + (u > 0.7 ? 12 : 0) * (i % 3 === 0 ? 1 : 0), 0.15 + 0.1 * u, { pan: i % 2 ? 0.4 : -0.4, bright: 1.8, delay: 0.45, len: 1.8 });
      t += 0.34 - 0.2 * u; i++;
    }
  }

  // 2) Sub-grave que crece por debajo de todo el viaje (sin transitorios)
  scenes.filter((sc) => harmony[sc.id]).forEach((sc) => {
    const g0 = sc.id === "e01" ? 0.004 : 0.005 + 0.085 * Math.pow(grow(sc.start), 1.5); // casi nada → pleno
    const end = sc.id === "e08" ? DROP : sc.end + 0.05;
    m.sub(sc.id === "e01" ? 0.4 : sc.start - 0.05, end, harmony[sc.id].root, g0, { att: sc.id === "e01" ? 2.5 : 0.35, rel: 0.25, swell: sc.id === "e08" ? 0.5 : 0.15 });
  });

  // 3) Colchón de cuerdas que se abre
  m.strings(0.3, 3.5, [47, 54, 62], 0.03, { att: 2, rel: 0.8, bright: 0.2 });
  m.strings(3.4, 9.6, [50, 57, 62, 66], 0.04, { att: 0.8, rel: 0.6, bright: 0.3, swell: 0.3 });
  m.strings(9.5, 13.6, [47, 54, 59, 62, 66], 0.05, { att: 0.5, rel: 0.5, bright: 0.4, swell: 0.3 });
  m.strings(13.5, DROP, [47, 54, 59, 66, 71], 0.06, { att: 0.6, rel: 0.05, bright: 0.55, swell: 0.9 });

  // 4) Pulso de shaker: entra con el faro, sigue la rejilla y crece
  scenes.filter((sc) => ["e03", "e04", "e05", "e06", "e07"].includes(sc.id)).forEach((sc) => {
    const n = notesPer[sc.id] * 2, step = (sc.end - sc.start) / n;
    for (let i = 0; i < n; i++) { const t = sc.start + i * step; m.tick(t, (i % 2 ? 0.02 : 0.032) * (0.5 + 0.8 * grow(t)), { pan: i % 2 ? 0.3 : -0.3 }); }
  });
  for (let t = S("e08").start, i = 0; t < DROP - 0.05; i++) { const u = (t - S("e08").start) / (DROP - S("e08").start); m.tick(t, (i % 2 ? 0.024 : 0.038) * (0.8 + 0.5 * u), { pan: i % 2 ? 0.3 : -0.3 }); t += 0.17 - 0.1 * u; }

  // 5) Aire que sube hasta el salto (el "momentum")
  m.noise(8.0, DROP, { type: "hp", f: 5200, gain: 0.035, env: (u) => Math.pow(u, 2.2), send: 0.5 });
  m.noise(14.2, DROP, { type: "bp", f: 350, fEnd: 3200, q: 0.9, gain: 0.05, env: (u) => Math.pow(u, 2.6), send: 0.4 });

  // 6) El mundo de papel, discreto por debajo de la música
  const paperFlip = (t, g) => m.noise(t, t + 0.09, { type: "bp", f: 2600, q: 0.8, gain: g, env: (u) => Math.sin(Math.PI * u) * (1 - u), send: 0.25 });
  scenes.slice(1, 8).forEach((sc) => paperFlip(sc.start, 0.014));
  keys.filter((k) => k.pose === "land" && k.t < DROP).forEach((k) => m.hop(k.t, 0.014));
  for (let t = 0.2; t < S("e01").end - 0.2; t += 0.42) for (let k = 0; k < 3; k++) m.tone(t + k * 0.035, 0.025, 4700, 4600, 0.004, { decay: 90, pan: 0.5, send: 0.4 }); // grillos
  m.noise(S("e03").start, S("e03").end, { f: 600, gain: 0.018, env: (u) => Math.sin(Math.PI * u), send: 0.3 }); // viento
  m.noise(S("e04").start, S("e04").end, { type: "hp", f: 3800, gain: 0.004, env: (u) => Math.sin(Math.PI * u), send: 0.5 }); // lluvia
  m.noise(S("e04").start + 0.1, S("e04").start + 1.3, { f: 200, gain: 0.03, env: (u) => Math.exp(-u * 3) * Math.min(1, u * 20), send: 0.5 }); // trueno lejano
  m.noise(S("e05").start, S("e05").end, { type: "bp", f: 3600, q: 0.6, gain: 0.005, env: (u) => Math.sin(Math.PI * u), send: 0.4 }); // hojas

  // 7) El salto: respiración, vuelo, y el "pop" de entrar
  m.noise(TAKEOFF, TAKEOFF + 0.4, { f: 1600, fEnd: 500, gain: 0.05, env: (u) => Math.sin(Math.PI * u), send: 0.5 });
  m.tone(ENTRY, 0.1, 800, 300, 0.03, { decay: 18, send: 0.3 });

  // 8) SILENCIO — y luego el regreso cálido (como en Opus): el sub vuelve y tres notas lentas
  m.gate(DROP, BACK);
  m.sub(BACK, 20.0, 38, 0.07, { att: 0.6, rel: 1.0 }); // Re: llegó a casa
  m.bell(BACK + 0.02, 86, 0.05, { len: 3 }); // la magia, sola
  [[BACK + 0.05, 66], [BACK + 0.55, 76], [BACK + 1.05, 69], [BACK + 1.9, 74], [BACK + 2.4, 78]].forEach(([t, n], i) => m.pluck(t, n, 0.18 - i * 0.015, { pan: i % 2 ? 0.3 : -0.3, bright: 1.0, delay: 0.45, len: 3.2 }));
  m.strings(BACK + 0.2, END_AT + 0.3, [50, 57, 62, 66, 69], 0.035, { att: 1.5, rel: 0.8, bright: 0.3, swell: 0.4 });
  m.noise(18.2, END_AT, { type: "hp", f: 4500, gain: 0.01, env: (u) => Math.pow(u, 2), send: 0.6 }); // cae hacia la luz

  // 9) La Casa del Marketing: Re add9, sub cálido, notas que se abren y se quedan
  m.sub(END_AT - 0.1, TOTAL - 1.6, 38, 0.075, { att: 0.8, rel: 1.4 });
  [[END_AT, 62], [END_AT + 0.02, 69], [END_AT + 0.5, 76], [END_AT + 1.0, 66], [END_AT + 1.6, 81], [END_AT + 2.3, 73]].forEach(([t, n], i) => m.pluck(t, n, 0.2 - i * 0.02, { pan: (i % 3 - 1) * 0.35, bright: 1.0, delay: 0.5, len: 3.6 }));
  m.bell(END_AT + 0.6, 90, 0.03, { len: 3 });
  m.strings(END_AT + 0.1, TOTAL - 1.2, [50, 57, 62, 66, 69, 76], 0.04, { att: 1.6, rel: 1.2, bright: 0.3 });

  const { L, R } = m.render(3, { hp: 30, delayTime: 0.375, feedback: 0.36 });
  const f0 = Math.floor((TOTAL - 1.6) * 44100);
  for (let i = f0; i < L.length; i++) { const g = 1 - (i - f0) / (L.length - f0); L[i] *= g; R[i] *= g; }
  return wav16(L, R);
}

// ─── Main ───────────────────────────────────────────────────────────────────
writeFileSync(join(ROOT, "compositions/story.html"), buildHtml());
const wav = A("papel-audio.wav");
writeFileSync(wav, buildAudio());
let ln = "loudnorm=I=-15:TP=-1.5:LRA=11";
try {
  const j = JSON.parse(execFileSync("bash", ["-c", `ffmpeg -nostdin -hide_banner -i "${wav}" -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`]).toString());
  ln += `:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
} catch {}
execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-y", "-i", wav, "-af", ln, "-ar", "44100", "-c:a", "aac", "-b:a", "224k", A("papel-audio.m4a")]);
unlinkSync(wav);
console.log(`story.html: ${scenes.length} escenarios, ${keys.length} cuadros del conejo · despegue ${TAKEOFF}s, entra al sombrero ${ENTRY}s · boca del sombrero (${mouthX.toFixed(0)}, ${mouthY.toFixed(0)})`);
