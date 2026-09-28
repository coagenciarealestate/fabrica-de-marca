// Genera el reel "Lo que te rodea cambia" a partir de UNA sola lista de cortes:
//   - compositions/reel.html  (imágenes recortadas por el mismo horizonte curvo = match cut)
//   - assets/reel/reel-audio.m4a (una nota afinada por corte = match sound)
// Así cada corte de imagen y su nota comparten exactamente el mismo instante.
//
// Uso:  node scripts/build-reel.mjs      (desde video/)
// Todo es determinista: el "azar humano" (timing, velocidad, paneo) usa una semilla fija.

import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FPS = 30;
const snap = (t) => Math.round(t * FPS) / FPS;

// ─── Guion ──────────────────────────────────────────────────────────────────
export const REEL_END = 15.4; // corte a silencio (como el drop de la referencia)
export const TOTAL = 20.5; // fin del end card

// Imágenes (assets/reel/NN.jpg) — ver scripts/fetch-reel-images.sh
const IMG = {
  "00": "Fachada colonial — foto 35mm",
  "01": "Fachada minimalista — foto arquitectura",
  "02": "Fachada mediterránea — risograph",
  "03": "Fachada de ladrillo — grabado",
  "04": "Casa tropical en palafitos — acuarela",
  "05": "Casa de adobe andina — collage de papel",
  "06": "Puerta que se abre — foto 35mm (la mutación hacia adentro)",
  "07": "Cocina: abuela y niña amasando arepas — foto",
  "08": "Sala: pareja leyendo con su perro — óleo",
  "09": "Comedor: almuerzo de domingo cenital — foto",
  "10": "Habitación: niño saltando en la cama — plano técnico",
  "11": "Baño: afeitada con vapor — foto sepia",
  "12": "Estudio: home office con gato — risograph",
  "13": "Terraza: amigos brindando — acuarela",
  "14": "Patio de ropas: sábanas al viento — cianotipia",
  "15": "Jardín: padre e hija regando — grabado coloreado",
  "16": "Escalera: pareja mudándose — gouache",
  "17": "Cuarto del bebé de noche — carboncillo",
  "18": "Cocina de noche: pareja bailando — foto con flash",
  "19": "Rincón de lectura: abuelo con café — azulejo",
};

// Escala pentatónica de Re (D E F# A B). Índices de nota → frecuencia.
const PENTA = [0, 2, 4, 7, 9];
const noteHz = (deg, baseOct = 3) => {
  const oct = Math.floor(deg / 5);
  const semis = PENTA[((deg % 5) + 5) % 5] + 12 * (oct + baseOct - 3);
  return 146.832 * Math.pow(2, semis / 12); // D3 = 146.83 Hz
};

// Lista de cortes: [inicio, imagen, grado de nota]. Los cortes se aceleran
// (0.6s → 0.5s → 0.35s → 0.22s) igual que el video de referencia.
const cuts = [];
const push = (t, img, deg) => cuts.push({ t: snap(t), img, deg });

// Acto 1 — Fachadas (exterior, registro grave)
["00", "01", "02", "03", "04", "05"].forEach((img, i) => push(1.0 + i * 0.6, img, [0, 2, 1, 3, 2, 4][i]));
// La mutación: la puerta se abre y nos lleva adentro (se sostiene 1s)
push(4.6, "06", 5);
// Acto 2 — Espacios del hogar (interior, el registro sube)
const interiors = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
const interiorGaps = [0.55, 0.55, 0.5, 0.5, 0.45, 0.45, 0.4, 0.4, 0.35, 0.35, 0.35, 0.3, 0.3];
const interiorDegs = [5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11];
{
  let t = 5.6;
  interiors.forEach((img, i) => {
    push(t, img, interiorDegs[i]);
    t += interiorGaps[i];
  });
  // Acto 3 — Clímax: todo el hogar a la vez, cortes cada vez más rápidos
  const climax = ["00", "07", "02", "09", "04", "12", "01", "13", "08", "03", "16", "10", "05", "18", "15", "14", "19", "11", "17"];
  let k = 0;
  while (t < REEL_END - 0.2) {
    const gap = 0.3 - 0.08 * Math.min(1, (t - 11) / 4);
    push(t, climax[k % climax.length], [12, 14, 13, 15, 14, 16, 15, 17][k % 8]);
    t += gap;
    k++;
  }
}

// Frases sobre el horizonte
const phrases = [
  { id: "p1", text: "Lo que te rodea", start: 4.9, end: 7.2, size: 66 },
  { id: "p2", text: "cambia,", start: 7.2, end: 9.4, size: 72, italic: true },
  { id: "p3", text: "cuando tú cambias.", start: 9.4, end: 12.2, size: 66 },
  { id: "p4", text: "Nosotros entendemos", start: 12.2, end: 13.9, size: 70 },
  { id: "p5", text: "por qué.", start: 13.9, end: REEL_END, size: 92, italic: true },
].map((p) => ({ ...p, start: snap(p.start), end: snap(p.end) }));

// ─── Composición HTML ───────────────────────────────────────────────────────
function buildHtml() {
  const shots = cuts.map((c, i) => {
    const end = i + 1 < cuts.length ? cuts[i + 1].t : REEL_END;
    return { ...c, i, dur: +(end - c.t).toFixed(4) };
  });

  // Polvo en el cielo (posiciones deterministas)
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dust = Array.from({ length: 46 }, (_, i) => ({
    i,
    x: Math.round(rnd() * 1060 + 10),
    y: Math.round(rnd() * 900 + 40),
    s: +(1.5 + rnd() * 3).toFixed(1),
    o: +(0.15 + rnd() * 0.5).toFixed(2),
    drift: Math.round(20 + rnd() * 60),
  }));

  const shotTags = shots
    .map(
      (s) =>
        `        <img id="reel-shot-${s.i}" class="clip shot" src="assets/reel/${s.img}.jpg" alt="${IMG[s.img]}" data-start="${s.t}" data-duration="${s.dur}" data-track-index="${2 + (s.i % 2)}" />`,
    )
    .join("\n");

  const phraseTags = phrases
    .map(
      (p) =>
        `      <div id="reel-${p.id}" class="clip phrase" data-start="${p.start}" data-duration="${+(p.end - p.start).toFixed(4)}" data-track-index="5"><span id="reel-${p.id}-text" class="phrase-text${p.italic ? " italic" : ""}" style="font-size:${p.size}px">${p.text}</span></div>`,
    )
    .join("\n");

  const dustTags = dust
    .map(
      (d) =>
        `        <i id="reel-dust-${d.i}" class="dust" style="left:${d.x}px;top:${d.y}px;width:${d.s}px;height:${d.s}px;opacity:${d.o}"></i>`,
    )
    .join("\n");

  // Tweens: empuje lento dentro de cada toma (vida), entrada de frases, polvo.
  const shotTweens = shots
    .map(
      (s) =>
        `        tl.fromTo("#reel-shot-${s.i}", { scale: 1.08 }, { scale: 1, duration: ${Math.max(0.3, s.dur).toFixed(2)}, ease: "power2.out" }, ${s.t});`,
    )
    .join("\n");
  const phraseTweens = phrases
    .map(
      (p) =>
        `        tl.fromTo("#reel-${p.id}-text", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${p.start});`,
    )
    .join("\n");
  const dustTweens = dust
    .map(
      (d) =>
        `        tl.fromTo("#reel-dust-${d.i}", { y: 0 }, { y: -${d.drift}, duration: ${REEL_END}, ease: "none" }, 0);`,
    )
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
          background: radial-gradient(120% 60% at 50% 55%, #2a221c 0%, var(--co-carbon) 45%, #0d0b0a 100%);
        }
        /* Cielo: polvo suspendido */
        #reel-sky {
          position: absolute;
          inset: 0;
        }
        #reel-sky .dust {
          position: absolute;
          display: block;
          border-radius: 50%;
          background: var(--co-marfil);
        }
        /* Brillo de amanecer del intro (latón → sanguina) */
        #reel-dawn {
          position: absolute;
          left: -10%;
          width: 120%;
          top: 700px;
          height: 520px;
          background: radial-gradient(62% 34% at 50% 50%, rgba(244, 231, 203, 0.75) 0%, rgba(205, 150, 90, 0.6) 22%, rgba(139, 54, 28, 0.45) 45%, rgba(44, 49, 31, 0.25) 65%, rgba(28, 23, 20, 0) 85%);
        }
        /* EL HORIZONTE: la misma curva recorta todas las imágenes = match cut */
        #reel-horizon {
          position: absolute;
          left: 0;
          top: 960px;
          width: 1080px;
          height: 960px;
          overflow: hidden;
          clip-path: ellipse(110% 100% at 50% 100%);
          background: #0d0b0a;
        }
        #reel-horizon .shot {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform-origin: 50% 0%;
        }
        /* Sombra suave bajo el borde para dar volumen de "planeta" */
        #reel-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13, 11, 10, 0.55) 0%, rgba(13, 11, 10, 0) 18%, rgba(13, 11, 10, 0) 70%, rgba(13, 11, 10, 0.45) 100%);
        }
        /* Filo de luz sobre la curva, constante entre cortes */
        #reel-rim {
          position: absolute;
          left: -648px;
          top: 958px;
          width: 2376px;
          height: 1920px;
          border-radius: 50%;
          box-shadow: 0 -3px 24px rgba(244, 231, 203, 0.28), inset 0 2px 2px rgba(244, 231, 203, 0.55);
        }
        /* Frases: serif pequeña posada sobre el horizonte */
        #root .phrase {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 972px;
        }
        #root .phrase-text {
          display: block;
          font-family: var(--co-font-display);
          font-weight: 400;
          line-height: 1;
          color: var(--co-marfil);
          white-space: nowrap;
          text-shadow: 0 2px 18px rgba(13, 11, 10, 0.85), 0 0 2px rgba(13, 11, 10, 0.6);
        }
        #root .phrase-text.italic {
          font-style: italic;
        }
      </style>

      <div id="root" data-composition-id="reel" data-width="1080" data-height="1920">
      <div id="reel-sky">
${dustTags}
      </div>
      <div id="reel-dawn" data-layout-allow-overflow></div>
      <div id="reel-horizon">
${shotTags}
        <div id="reel-shade"></div>
      </div>
      <div id="reel-rim" data-layout-allow-overflow></div>
${phraseTags}
      </div>

      <script>
        const tl = gsap.timeline({ paused: true });
        // Intro: el amanecer se enciende y se apaga cuando entra la primera fachada
        tl.fromTo("#reel-dawn", { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "sine.out" }, 0);
        tl.to("#reel-dawn", { opacity: 0.25, duration: 0.3, ease: "power1.in" }, ${cuts[0].t - 0.1});
        tl.fromTo("#reel-rim", { opacity: 0.4 }, { opacity: 1, duration: 1, ease: "sine.out" }, 0);
${shotTweens}
${phraseTweens}
${dustTweens}
        window.__timelines["reel"] = tl;
      </script>
    </template>
  </body>
</html>
`;
}

// ─── Sonido ─────────────────────────────────────────────────────────────────
function buildAudio(outWav) {
  const SR = 44100;
  const N = Math.ceil(TOTAL * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const notes = new Float32Array(N); // bus de notas → reverb
  const notesR = new Float32Array(N);

  let seed = 20260927;
  const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);

  // Cuerda pulsada (Karplus-Strong) + mazo suave: cálido, orgánico, "tocado a mano"
  function pluck(t0, hz, vel, pan, dur = 2.4) {
    const start = Math.floor(t0 * SR);
    const len = Math.min(Math.floor(dur * SR), N - start);
    if (len <= 0) return;
    const P = Math.max(2, Math.round(SR / hz));
    const buf = new Float32Array(P);
    let lp = 0;
    for (let i = 0; i < P; i++) {
      lp = lp * 0.55 + (rnd() * 2 - 1) * 0.45; // ataque suave (fieltro)
      buf[i] = lp;
    }
    const gl = Math.cos((pan + 1) * Math.PI / 4);
    const gr = Math.sin((pan + 1) * Math.PI / 4);
    let idx = 0;
    for (let n = 0; n < len; n++) {
      const a = buf[idx];
      const b = buf[(idx + 1) % P];
      buf[idx] = 0.4985 * (a + b);
      idx = (idx + 1) % P;
      const t = n / SR;
      const mallet = Math.sin(2 * Math.PI * hz * t) * Math.exp(-t * 2.6) * 0.55 + Math.sin(2 * Math.PI * hz * 4 * t) * Math.exp(-t * 14) * 0.12;
      const env = n < 64 ? n / 64 : 1;
      const s = (a * 0.9 + mallet) * vel * env;
      notes[start + n] += s * gl;
      notesR[start + n] += s * gr;
    }
  }

  // Roce de papel en cada corte: textura táctil muy baja
  function brush(t0, vel) {
    const start = Math.floor(t0 * SR);
    const len = Math.min(Math.floor(0.09 * SR), N - start);
    let hp = 0, prev = 0;
    for (let n = 0; n < len; n++) {
      const w = rnd() * 2 - 1;
      hp = 0.7 * (hp + w - prev);
      prev = w;
      const env = Math.exp(-n / (0.018 * SR));
      L[start + n] += hp * env * vel;
      R[start + n] += hp * env * vel * 0.8;
    }
  }

  // Match sound: cada corte dispara su nota (con microvariaciones humanas)
  cuts.forEach((c, i) => {
    const human = (rnd() - 0.5) * 0.012;
    const t = Math.max(0, c.t + human);
    const climax = c.t > 11;
    const grow = Math.min(1, c.t / REEL_END); // crescendo: de un susurro al clímax
    const vel = (0.1 + 0.26 * Math.pow(grow, 1.2)) * (climax ? 0.85 : 1) * (0.85 + rnd() * 0.3);
    const pan = (i % 2 ? 0.35 : -0.35) * (0.6 + rnd() * 0.4);
    pluck(t, noteHz(c.deg), vel, pan, climax ? 1.4 : 2.6);
    if (c.img === "06") pluck(t + 0.004, noteHz(c.deg - 5), 0.22, 0, 3); // la puerta: octava abajo, más peso
    brush(c.t, (climax ? 0.05 : 0.035) * (0.4 + 0.6 * Math.min(1, c.t / REEL_END)));
  });
  // Intro: una sola nota grave bajo el amanecer
  pluck(0.12, noteHz(0, 2), 0.16, 0, 3.5);
  // Cada frase entra con una nota grave que la sostiene
  phrases.forEach((p, i) => pluck(p.start, noteHz([0, 3, 1, 2, 0][i], 2), 0.3, 0, 3));

  // Colchón armónico que crece hasta el drop (Re add9)
  const chord = [73.42, 110.0, 146.83, 185.0, 220.0, 329.63];
  const endPad = Math.floor(REEL_END * SR);
  let lpL = 0, lpR = 0;
  for (let n = 0; n < endPad; n++) {
    const t = n / SR;
    const grow = Math.min(1, t / REEL_END);
    const amp = 0.03 + 0.3 * Math.pow(grow, 2);
    let sL = 0, sR = 0;
    chord.forEach((f, k) => {
      const ph1 = (t * f * 1.0015) % 1;
      const ph2 = (t * f * 0.9985) % 1;
      sL += (2 * ph1 - 1) / chord.length;
      sR += (2 * ph2 - 1) / chord.length;
    });
    const cutoff = 0.012 + 0.05 * grow + 0.004 * Math.sin(t * 0.9); // se abre el filtro
    lpL += cutoff * (sL - lpL);
    lpR += cutoff * (sR - lpR);
    const tail = n > endPad - 0.02 * SR ? (endPad - n) / (0.02 * SR) : 1; // corte seco
    const fadeIn = Math.min(1, t / 1.2);
    L[n] += lpL * amp * tail * fadeIn;
    R[n] += lpR * amp * tail * fadeIn;
  }

  // Resolución con el logo: acorde que se abre despacio, cola larga
  const T_LOGO = 16.0;
  [[0, 0.3], [3, 0.24], [5, 0.26], [7, 0.2], [9, 0.16]].forEach(([deg, v], k) => pluck(T_LOGO + k * 0.06, noteHz(deg, 3), v, (k - 2) * 0.25, 4.4));

  // Reverb Schroeder sobre el bus de notas
  function reverb(input, out, offset) {
    const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0 }));
    const aps = [225, 556].map((d) => ({ d: d + offset, buf: new Float32Array(d + offset), i: 0 }));
    for (let n = 0; n < N; n++) {
      const x = input[n];
      let y = 0;
      for (const c of combs) {
        const o = c.buf[c.i];
        c.buf[c.i] = x + o * 0.84;
        c.i = (c.i + 1) % c.d;
        y += o;
      }
      y *= 0.25;
      for (const a of aps) {
        const o = a.buf[a.i];
        const v = y + o * 0.5;
        a.buf[a.i] = v;
        a.i = (a.i + 1) % a.d;
        y = o - v * 0.5;
      }
      out[n] += x + y * 0.35;
    }
  }
  reverb(notes, L, 0);
  reverb(notesR, R, 23);

  // El drop: silencio absoluto entre el último corte y el logo (también corta la cola de reverb)
  const g0 = Math.floor(REEL_END * SR), g1 = Math.floor(T_LOGO * SR) - 1;
  for (let n = g0; n < g1; n++) {
    const k = Math.min(1, (n - g0) / (0.03 * SR));
    L[n] *= 1 - k;
    R[n] *= 1 - k;
  }

  // Normalizar y fade final
  let peak = 0;
  for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
  const g = 0.89 / peak;
  const fadeStart = Math.floor((TOTAL - 1.2) * SR);
  const pcm = Buffer.alloc(N * 4);
  for (let n = 0; n < N; n++) {
    const f = n > fadeStart ? 1 - (n - fadeStart) / (N - fadeStart) : 1;
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[n] * g * f)) * 32767), n * 4);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[n] * g * f)) * 32767), n * 4 + 2);
  }
  const hdr = Buffer.alloc(44);
  hdr.write("RIFF", 0);
  hdr.writeUInt32LE(36 + pcm.length, 4);
  hdr.write("WAVEfmt ", 8);
  hdr.writeUInt32LE(16, 16);
  hdr.writeUInt16LE(1, 20);
  hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(SR, 24);
  hdr.writeUInt32LE(SR * 4, 28);
  hdr.writeUInt16LE(4, 32);
  hdr.writeUInt16LE(16, 34);
  hdr.write("data", 36);
  hdr.writeUInt32LE(pcm.length, 40);
  writeFileSync(outWav, Buffer.concat([hdr, pcm]));
}

// ─── Main ───────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "assets/reel"), { recursive: true });
writeFileSync(join(ROOT, "compositions/reel.html"), buildHtml());
const wav = join(ROOT, "assets/reel/reel-audio.wav");
buildAudio(wav);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", wav, "-c:a", "aac", "-b:a", "192k", join(ROOT, "assets/reel/reel-audio.m4a")]);
unlinkSync(wav);
console.log(`reel.html: ${cuts.length} cortes, ${phrases.length} frases · audio ${TOTAL}s → assets/reel/reel-audio.m4a`);
console.log(cuts.map((c) => `${c.t.toFixed(2)}:${c.img}`).join(" "));
