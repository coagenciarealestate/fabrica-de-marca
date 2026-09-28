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
export const TOTAL = 24.0;
export const END_AT = 19.5;
export const BEAT = 0.5; // 120 BPM: todos los cortes caen en un tiempo

const pngSize = (f) => { const b = readFileSync(A(f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

// ─── Escenarios ─────────────────────────────────────────────────────────────
// crest / y30: altura (fracción) de la superficie del planeta en el centro y en x=0.3, medidas a ojo.
// ink: tinta del texto según el cielo.
const scenes = [
  { id: "e01", img: "e01-madriguera.png", crest: 0.5, y30: 0.515, start: 0, end: 3.5, ink: "light", name: "La madriguera · noche" },
  { id: "e02", img: "e02-cabana.png", crest: 0.566, y30: 0.58, start: 3.5, end: 6.0, ink: "dark", name: "La cabaña · amanecer" },
  { id: "e03", img: "e03-faro.png", crest: 0.5, y30: 0.515, start: 6.0, end: 8.0, ink: "dark", name: "El faro · viento" },
  { id: "e04", img: "e04-edificio.png", crest: 0.507, y30: 0.52, start: 8.0, end: 9.5, ink: "light", name: "El edificio · tormenta" },
  { id: "e05", img: "e05-arbol.png", crest: 0.493, y30: 0.5, start: 9.5, end: 11.0, ink: "dark", name: "La casa del árbol · tarde" },
  { id: "e06", img: "e06-iglu.png", crest: 0.522, y30: 0.54, start: 11.0, end: 12.0, ink: "light", name: "El iglú · nieve" },
  { id: "e07", img: "e07-castillo.png", crest: 0.456, y30: 0.47, start: 12.0, end: 13.0, ink: "dark", name: "El castillo · niebla" },
  { id: "e08", img: "e08-sombrero.png", crest: 0.53, y30: 0.55, start: 13.0, end: 17.5, ink: "light", name: "El sombrero · noche clara" },
  { id: "e09", img: "e09-adentro.png", crest: 0.5, y30: 0.5, start: 17.5, end: END_AT, ink: "light", name: "Adentro del sombrero", noAlign: true },
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
leave(3.1, 0.3);
// 3.4–13.5 · Buscar casa: aterriza, mira el lugar, duda, sigue (cada vez más rápido)
const tour = [
  [3.5, 0, 4.85, 5.45],
  [6.0, 0, 6.95, 7.55],
  [8.0, 0, 8.6, 9.1],
  [9.5, 0, 10.1, 10.6],
  [11.0, 0, 11.4, 11.62],
  [12.0, 0, 12.4, 12.62],
];
// En los lugares cortos no alcanza a dar un saltito extra: aterriza, duda y sigue
tour.forEach(([t0, , tDoubt, tLeave]) => { enter(t0); const x = tDoubt - t0 >= 1.1 ? (hop(t0 + 0.5, 0.23, 0.33), 0.34) : 0.24; doubt(tDoubt, x); leave(tLeave, x); });
// 13.5–18 · El sombrero: llega, lo mira, se decide, salta adentro
const hatS = scenes[7];
const hatBox = JSON.parse(readFileSync(A("hat-front.json"), "utf8"));
const [mouthX, mouthY] = hatS.map(hatBox.mouth_x, hatBox.mouth_y);
enter(13.0);
hop(13.7, 0.23, 0.29);
put(14.5, "back", 0.3); // de espaldas, mirando el sombrero: el momento
put(15.4, "sit", 0.3);
put(15.83, "crouch", 0.3);
const TAKEOFF = q(15.83 + 2 * STEP); // = 16.0, tiempo fuerte
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
  { id: "t1", text: "Cuando ya no te gusta", start: 0.9, end: 4.5, y: 640, size: 60 },
  { id: "t2", text: "donde estás.", start: 4.5, end: 7.5, y: 640, size: 64, italic: true },
  { id: "t3", text: "Solo tienes que:", start: 8.0, end: 12.95, y: 640, size: 60 },
  { id: "t4", text: "Dar el salto", start: TAKEOFF - 0.2, end: 17.5, y: 470, size: 100, italic: true },
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

// ─── Música: violín solista y cuerdas, 120 BPM, Si menor → Re mayor ─────────
// Un solo arco dramático y continuo, sin cortes: el violín canta la duda sola en la madriguera;
// al salir entran las cuerdas con un ostinato que empuja (el camino); cada lugar sube un
// escalón de armonía; en el sombrero todo crece hasta el despegue (16.0, tiempo fuerte, con
// percusión); cuando entra al sombrero la orquesta respira (no se corta) y resuelve cálida
// en Re mayor bajo la marca. El mundo de papel queda muy discreto por debajo.
function buildAudio() {
  const m = createMix(TOTAL, 20261001);
  const r = m.r;
  const b = (n) => n * BEAT; // tiempo en pulsos

  // Armonía por compases (inicio, fin, [chelos], [violas/violines 2], intensidad)
  const chords = [
    [0.0, 3.5, [35, 47], [54, 62], 0.18],          // Si m — la duda (solo chelos y violas muy suaves)
    [3.5, 6.0, [35, 47], [54, 59, 62, 66], 0.38],  // Si m — sale
    [6.0, 8.0, [31, 43], [50, 55, 59, 62], 0.48],  // Sol
    [8.0, 9.5, [28, 40], [52, 55, 59, 64], 0.6],   // Mi m — la tormenta
    [9.5, 11.0, [30, 42], [50, 54, 57, 62], 0.7], // Re/Fa#
    [11.0, 12.0, [31, 43], [50, 55, 59, 62], 0.8],// Sol
    [12.0, 13.0, [33, 45], [52, 57, 61, 64], 0.9],// La
    [13.0, 14.0, [35, 47], [54, 59, 62, 66], 1.0],// Si m — el sombrero
    [14.0, 15.0, [31, 43], [55, 59, 62, 67], 1.15],// Sol
    [15.0, 15.5, [38, 50], [54, 57, 62, 66], 1.3], // Re
    [15.5, 16.0, [33, 45], [52, 57, 61, 64], 1.45], // La
    [16.0, 16.9, [38, 50], [54, 57, 62, 66, 69], 1.7], // RE — el salto
  ];
  let prevHi = null;
  chords.forEach(([t0, t1, lo, hi, k]) => {
    const d = t1 - t0 + 0.12; // se enciman un poco: legato, sin huecos
    lo.forEach((n, i) => m.bowed(t0, d, n, 0.045 * k * (i ? 0.8 : 1), { players: 3, body: "cello", att: t0 === 0 ? 1.5 : 0.35, rel: 0.5, from: null, pan: -0.25 + i * 0.1 }));
    hi.forEach((n, i) => m.bowed(t0, d, n, 0.03 * k, { players: 3, body: i < 2 ? "viola" : "violin", att: t0 === 0 ? 1.8 : 0.3, rel: 0.5, bright: 0.6 + 0.4 * k, pan: -0.4 + (i / Math.max(1, hi.length - 1)) * 0.8, from: prevHi && prevHi[i] != null && Math.abs(prevHi[i] - n) <= 4 ? prevHi[i] : null }));
    prevHi = hi;
  });

  // Ostinato (el camino): corcheas de violas en spiccato desde que sale; crece y se duplica
  const pattern = (lo, hi) => [hi[0], hi[1] ?? hi[0], hi[hi.length - 1] ?? hi[0], hi[1] ?? hi[0]];
  for (let t = 3.5; t < 16.0 - 1e-6; t += BEAT / 2) {
    const c = chords.find(([t0, t1]) => t >= t0 && t < t1);
    const k = c[4], pat = pattern(c[2], c[3]);
    const i = Math.round(t / (BEAT / 2));
    m.bowed(t, 0.2, pat[i % 4], 0.05 * k * (i % 2 ? 0.75 : 1), { players: 3, body: "viola", short: true, pan: i % 2 ? 0.3 : -0.3, send: 0.35 });
    if (t >= 9.5 && i % 2 === 0) m.bowed(t, 0.2, c[2][1], 0.055 * k, { players: 3, body: "cello", short: true, send: 0.3 });
    if (t >= 13.0) m.bowed(t + BEAT / 4, 0.16, pat[(i + 2) % 4] + 12, 0.035 * k, { players: 3, body: "violin", short: true, pan: i % 2 ? -0.35 : 0.35, send: 0.35 });
  }

  // El violín solista: la voz del conejo (legato, portamento entre notas)
  const solo = [
    // la duda (sola, íntima)
    [b(1), b(3), 78], [b(4), b(1), 76], [b(5), b(2), 74],
    // sale (las cuerdas entran)
    [3.5, b(1), 71], [4.0, b(1), 73], [4.5, b(2), 74], [5.5, b(1), 78], [6.0, b(2), 76], [7.0, b(1), 74], [7.5, b(1), 73],
    // la tormenta y el camino (sube)
    [8.0, b(2), 79], [9.0, b(1), 78], [9.5, b(2), 81], [10.5, b(1), 79], [11.0, b(2), 83], [12.0, b(1), 81], [12.5, b(1), 85],
    // el sombrero: canta alto
    [13.0, b(2), 86], [14.0, b(1), 83], [14.5, b(1), 85], [15.0, b(1), 86], [15.5, b(1), 88], [16.0, b(3), 86],
    // adentro: respira y resuelve
    [17.5, b(2), 81], [18.5, b(1), 78], [19.0, b(1), 76],
    // la marca
    [19.5, b(6), 74],
  ];
  solo.forEach(([t, d, n], i) => {
    const prev = solo[i - 1];
    const legato = prev && Math.abs(prev[0] + prev[1] - t) < 0.02 && Math.abs(prev[2] - n) <= 7;
    const inten = t < 3.5 ? 0.07 : t < 8 ? 0.09 : t < 13 ? 0.11 : t < 17 ? 0.17 : t < 19.5 ? 0.08 : 0.11;
    m.bowed(t, d + (legato ? 0.03 : 0), n, inten, { from: legato ? prev[2] : null, att: legato ? 0.05 : 0.22, rel: t >= 19.5 ? 2.2 : 0.3, vib: 1.1, pan: 0.05, send: 0.75, swell: d > 1 ? 0.25 : 0 });
  });
  // violines 1 doblan la melodía una octava abajo desde el sombrero (épico)
  solo.filter(([t]) => t >= 13 && t < 17).forEach(([t, d, n], i, arr) => m.bowed(t, d, n - 12, 0.06, { players: 4, from: i ? arr[i - 1][2] - 12 : null, att: 0.08, rel: 0.3, pan: -0.2, send: 0.7 }));

  // Percusión de cine: tambores graves con cuerpo (no sub) que entran con la tormenta
  const drum = (t, g) => { m.tone(t, 0.5, 120, 70, g, { decay: 7, send: 0.45 }); m.noise(t, t + 0.12, { f: 500, gain: g * 0.6, env: (u) => Math.exp(-u * 5), send: 0.5 }); };
  for (let t = 8.0; t < 16.0; t += t < 12.0 ? 1.0 : BEAT) drum(t, 0.03 + 0.08 * ((t - 8) / 8) ** 1.5);
  drum(16.0, 0.16); // el salto
  m.noise(14.0, 16.0, { type: "hp", f: 4500, gain: 0.035, env: (u) => Math.pow(u, 3), send: 0.6 }); // platillo que crece
  m.noise(16.0, 18.5, { type: "hp", f: 5000, gain: 0.03, env: (u) => Math.exp(-u * 3), send: 0.7 }); // y se abre

  // Después del salto: la orquesta respira (decrece, no se corta) y resuelve en Re
  m.bowed(16.8, 2.9, 38, 0.025, { players: 3, body: "cello", att: 0.6, rel: 1 });
  m.bowed(16.8, 2.9, 50, 0.022, { players: 3, body: "cello", att: 0.6, rel: 1 });
  [57, 62, 66].forEach((n, i) => m.bowed(16.9, 2.8, n, 0.016, { players: 3, body: i ? "violin" : "viola", att: 0.8, rel: 1, pan: -0.3 + i * 0.3 }));
  // La Casa del Marketing: Re add9, amplio, cálido, se queda
  [[38, "cello"], [45, "cello"], [50, "viola"], [57, "viola"], [62, "violin"], [64, "violin"], [66, "violin"], [69, "violin"]].forEach(([n, body], i) =>
    m.bowed(END_AT, TOTAL - END_AT - 1.2, n, body === "cello" ? 0.05 : 0.038, { players: 3, body, att: 0.9, rel: 1.4, pan: -0.45 + (i / 7) * 0.9, swell: 0.2 }));
  [[END_AT + 0.05, 86], [END_AT + 0.6, 90], [END_AT + 1.3, 93]].forEach(([t, n], i) => m.bell(t, n, 0.028, { pan: (i - 1) * 0.4, len: 3 }));

  // La magia al entrar (campanas suaves) y el mundo de papel, muy discreto
  [93, 90, 86, 81].forEach((n, i) => m.bell(ENTRY + 0.05 + i * 0.09, n, 0.035, { pan: 0.4 - i * 0.25, len: 2.5 }));
  scenes.slice(1, 8).forEach((sc) => m.noise(sc.start, sc.start + 0.09, { type: "bp", f: 2600, q: 0.8, gain: 0.008, env: (u) => Math.sin(Math.PI * u) * (1 - u), send: 0.25 }));
  for (let t = 0.2; t < 3.3; t += 0.42) for (let k = 0; k < 3; k++) m.tone(t + k * 0.035, 0.025, 4700, 4600, 0.003, { decay: 90, pan: 0.5, send: 0.4 });

  const { L, R } = m.render(3, { hp: 32, delayTime: 0.375, feedback: 0.25 });
  const f0 = Math.floor((TOTAL - 1.4) * 44100);
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
