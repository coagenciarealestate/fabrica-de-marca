// Motor de sonido cinematográfico del reel — síntesis determinista, sin samples.
// Capas: aire/viento exterior, tono de cuarto interior, piano de fieltro, cuerdas,
// foley sutil por material, pulso tipo latido, riser, drop a silencio y boom final.
// Todo pasa por una reverb de convolución (sala cálida) y un master suave.

export const SR = 44100;

// ─── utilidades ─────────────────────────────────────────────────────────────
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 48271) % 2147483647) / 2147483647);
}
export const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// Filtro biquad (RBJ) para modelar aire, puertas, vapor…
function biquad(type, f, q = 0.707) {
  const w = (2 * Math.PI * clamp(f, 10, SR * 0.45)) / SR;
  const c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else { b0 = a; b1 = 0; b2 = -a; } // bp
  a0 = 1 + a; a1 = -2 * c; a2 = 1 - a;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
}
function bq(st, x) {
  const y = st.b0 * x + st.b1 * st.x1 + st.b2 * st.x2 - st.a1 * st.y1 - st.a2 * st.y2;
  st.x2 = st.x1; st.x1 = x; st.y2 = st.y1; st.y1 = y;
  return y;
}
function retune(st, type, f, q) {
  const n = biquad(type, f, q);
  st.b0 = n.b0; st.b1 = n.b1; st.b2 = n.b2; st.a1 = n.a1; st.a2 = n.a2;
}

// FFT radix-2 in place (re, im)
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inv ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br; im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

// Convolución por bloques (overlap-add)
function convolve(x, ir) {
  const B = 8192;
  let N = 1;
  while (N < B + ir.length) N <<= 1;
  const hr = new Float64Array(N), hi = new Float64Array(N);
  hr.set(ir);
  fft(hr, hi, false);
  const out = new Float32Array(x.length + ir.length);
  const xr = new Float64Array(N), xi = new Float64Array(N);
  for (let p = 0; p < x.length; p += B) {
    xr.fill(0); xi.fill(0);
    for (let i = 0; i < B && p + i < x.length; i++) xr[i] = x[p + i];
    fft(xr, xi, false);
    for (let k = 0; k < N; k++) {
      const r = xr[k] * hr[k] - xi[k] * hi[k];
      xi[k] = xr[k] * hi[k] + xi[k] * hr[k];
      xr[k] = r;
    }
    fft(xr, xi, true);
    for (let i = 0; i < N && p + i < out.length; i++) out[p + i] += xr[i];
  }
  return out;
}

// Respuesta al impulso: sala cálida de madera, ~3.2s, se oscurece al decaer
function makeIR(seed, secs = 3.2) {
  const r = rng(seed);
  const n = Math.floor(secs * SR);
  const ir = new Float32Array(n);
  const lp = biquad("lp", 6000);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    if (i % 512 === 0) retune(lp, "lp", 6500 * Math.exp(-t * 1.1) + 500, 0.7);
    const pre = t < 0.012 ? 0 : 1; // predelay
    ir[i] = bq(lp, r() * 2 - 1) * Math.exp(-t * 2.3) * pre;
  }
  // primeras reflexiones
  [[0.013, 0.5], [0.021, 0.35], [0.034, 0.28], [0.047, 0.2]].forEach(([t, g]) => (ir[Math.floor(t * SR)] += g));
  let e = 0;
  for (let i = 0; i < n; i++) e += ir[i] * ir[i];
  const g = 1 / Math.sqrt(e);
  for (let i = 0; i < n; i++) ir[i] *= g * 0.6;
  return ir;
}

// ─── mezclador ──────────────────────────────────────────────────────────────
export function createMix(totalSecs, seed = 1) {
  const N = Math.ceil(totalSecs * SR);
  const bus = (n) => ({ L: new Float32Array(n), R: new Float32Array(n) });
  const dry = bus(N), wet = bus(N); // wet = envío a reverb
  const r = rng(seed);
  const add = (b, i, l, rr) => {
    if (i >= 0 && i < N) { b.L[i] += l; b.R[i] += rr; }
  };
  const panG = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];

  const api = { N, r, dry, wet };

  // Piano de fieltro: parciales inarmónicos, cuerdas dobles (batido), martillo suave
  api.piano = (t0, midi, vel = 0.3, { pan = 0, send = 0.55, len = 5 } = {}) => {
    const f = midiHz(midi);
    const s0 = Math.floor(t0 * SR);
    const n = Math.floor(len * SR);
    const [gl, gr] = panG(pan);
    const B = 0.00035;
    const parts = [];
    for (let k = 1; k <= 12; k++) {
      const fk = k * f * Math.sqrt(1 + B * k * k);
      if (fk > 9000) break;
      const amp = Math.exp(-k * (0.55 - vel * 0.35)) / Math.pow(k, 0.6); // más fuerte = más brillo
      const dec = 0.55 + 0.35 * k + f / 900;
      parts.push([fk, amp, dec, r() * 6.28]);
    }
    const hammer = biquad("lp", 900 + vel * 1500);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const att = Math.min(1, t / 0.004);
      let s = 0;
      for (const [fk, amp, dec, ph] of parts) {
        const e = Math.exp(-t * dec);
        if (e < 1e-4) continue;
        s += amp * e * (Math.sin(2 * Math.PI * fk * t + ph) + 0.6 * Math.sin(2 * Math.PI * fk * 1.0009 * t));
      }
      const th = t < 0.02 ? bq(hammer, r() * 2 - 1) * Math.exp(-t * 180) * 0.35 : 0;
      const v = (s * 0.18 * att + th) * vel;
      add(dry, s0 + i, v * gl, v * gr);
      add(wet, s0 + i, v * gl * send, v * gr * send);
    }
  };

  // Cuerdas: acorde aditivo con ataque lento, vibrato leve, filtro que respira
  api.strings = (t0, t1, midis, vel = 0.12, { att = 1.2, rel = 1.4, bright = 0.5, send = 0.7, swell = 0 } = {}) => {
    const s0 = Math.floor(t0 * SR);
    const n = Math.floor((t1 - t0 + rel) * SR);
    const hold = t1 - t0;
    const voices = [];
    midis.forEach((m, vi) => {
      for (const det of [-0.07, 0, 0.06]) voices.push({ f: midiHz(m + det), ph: r() * 6.28, pan: ((vi / Math.max(1, midis.length - 1)) * 2 - 1) * 0.6, vr: 4.5 + r() });
    });
    const lpL = biquad("lp", 1200), lpR = biquad("lp", 1200);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      if (i % 256 === 0) {
        const open = 500 + bright * 2200 * (0.7 + 0.3 * Math.sin(t * 0.8)) * (1 + swell * Math.min(1, t / hold));
        retune(lpL, "lp", open, 0.6); retune(lpR, "lp", open, 0.6);
      }
      let env = Math.min(1, t / att);
      if (t > hold) env *= Math.max(0, 1 - (t - hold) / rel);
      env *= 1 + swell * Math.min(1, t / hold);
      let l = 0, rr = 0;
      for (const v of voices) {
        const vib = 1 + 0.0025 * Math.sin(2 * Math.PI * v.vr * t);
        let s = 0;
        for (let k = 1; k <= 8; k++) s += Math.sin(2 * Math.PI * v.f * vib * k * t + v.ph * k) / k;
        const [gl, gr] = panG(v.pan);
        l += s * gl; rr += s * gr;
      }
      const sc = (vel * env) / voices.length;
      const ol = bq(lpL, l) * sc, or = bq(lpR, rr) * sc;
      add(dry, s0 + i, ol, or);
      add(wet, s0 + i, ol * send, or * send);
    }
  };

  // Ruido modelado (aire, viento, vapor, papel…) con envolvente y filtro variables
  api.noise = (t0, t1, { type = "lp", f = 800, q = 0.7, fEnd, gain = 0.1, env, pan = 0, send = 0.3, width = 0.6 } = {}) => {
    const s0 = Math.floor(t0 * SR);
    const n = Math.floor((t1 - t0) * SR);
    const fL = biquad(type, f, q), fR = biquad(type, f, q);
    let bL = 0, bR = 0;
    const [gl, gr] = panG(pan);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      if (fEnd && i % 128 === 0) {
        const ff = f * Math.pow(fEnd / f, u);
        retune(fL, type, ff, q); retune(fR, type, ff, q);
      }
      const a = r() * 2 - 1, b = r() * 2 - 1;
      bL = 0.97 * bL + 0.03 * a * 4; bR = 0.97 * bR + 0.03 * (a * (1 - width) + b * width) * 4; // ruido marrón suave
      const e = (env ? env(u, i / SR) : 1) * gain;
      const l = bq(fL, bL + a * 0.15) * e * gl, rr = bq(fR, bR + b * 0.15) * e * gr;
      add(dry, s0 + i, l, rr);
      add(wet, s0 + i, l * send, rr * send);
    }
  };

  // Seno con glissando (gota de agua, pájaro lejano, sub)
  api.tone = (t0, len, f0, f1, gain, { decay = 8, pan = 0, send = 0.5, att = 0.002 } = {}) => {
    const s0 = Math.floor(t0 * SR);
    const n = Math.floor(len * SR);
    const [gl, gr] = panG(pan);
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR, u = i / n;
      const f = f0 * Math.pow(f1 / f0, u);
      ph += (2 * Math.PI * f) / SR;
      const e = Math.min(1, t / att) * Math.exp(-t * decay) * gain;
      const v = Math.sin(ph) * e;
      add(dry, s0 + i, v * gl, v * gr);
      add(wet, s0 + i, v * gl * send, v * gr * send);
    }
  };

  // Golpe grave suave (latido / puerta / boom)
  api.thump = (t0, gain, { f0 = 90, f1 = 42, len = 0.6, body = 0.3 } = {}) => {
    api.tone(t0, len, f0, f1, gain, { decay: 4.5 / len, send: 0.25, att: 0.004 });
    api.noise(t0, t0 + 0.08, { f: 300, gain: gain * body, env: (u) => Math.exp(-u * 6), send: 0.2 });
  };

  // Silencio absoluto en un rango (también corta colas de reverb al masterizar)
  const gates = [];
  api.gate = (t0, t1) => gates.push([t0, t1]);

  api.render = (irSeed = 3) => {
    const irL = makeIR(irSeed), irR = makeIR(irSeed + 101);
    const rvL = convolve(wet.L, irL), rvR = convolve(wet.R, irR);
    const L = new Float32Array(N), R = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      L[i] = dry.L[i] + rvL[i] * 0.9;
      R[i] = dry.R[i] + rvR[i] * 0.9;
    }
    for (const [a, b] of gates) {
      const i0 = Math.floor(a * SR), i1 = Math.floor(b * SR);
      for (let i = i0; i < i1 && i < N; i++) {
        const g = 1 - Math.min(1, (i - i0) / (0.025 * SR)); // 25ms y silencio total
        L[i] *= g; R[i] *= g;
      }
    }
    // Master: compresión lenta + saturación suave (tanh)
    let env = 0;
    let peak = 0;
    for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    const pre = 0.9 / peak;
    for (let i = 0; i < N; i++) {
      const x = Math.max(Math.abs(L[i]), Math.abs(R[i])) * pre;
      env = x > env ? env + (x - env) * 0.002 : env + (x - env) * 0.00005;
      const gr = env > 0.35 ? Math.pow(0.35 / env, 0.4) : 1;
      L[i] = Math.tanh(L[i] * pre * gr * 1.2) / Math.tanh(1.2);
      R[i] = Math.tanh(R[i] * pre * gr * 1.2) / Math.tanh(1.2);
    }
    return { L, R };
  };

  return api;
}

export function wav16(L, R) {
  const N = L.length;
  const pcm = Buffer.alloc(N * 4);
  for (let n = 0; n < N; n++) {
    pcm.writeInt16LE(Math.round(clamp(L[n], -1, 1) * 32767), n * 4);
    pcm.writeInt16LE(Math.round(clamp(R[n], -1, 1) * 32767), n * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
