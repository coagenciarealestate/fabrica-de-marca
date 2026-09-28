# Lo que te rodea cambia — planeación

## 1. Qué hace el video de referencia (y por qué se siente humano)

| Recurso | En la referencia | Qué genera |
|---|---|---|
| **Match cut** | Una línea de horizonte curva, siempre en el mismo sitio (~50% del alto). Arriba cielo oscuro con polvo; abajo la "materia" cambia en cada corte (miel, arena, hoja, encaje, grabado, collage). | La forma se queda, el mundo cambia → continuidad aunque haya 40 imágenes distintas. |
| **Texto** | Serif pequeña, clara, posada sobre el horizonte ("There's" → "more to" → "discover"). No se mueve cuando cambian las imágenes. | El mensaje es lo único estable: "la idea eres tú, el entorno cambia". |
| **Ritmo** | Cortes ~1s → 0.55s → 0.35s → 0.25s. | Aceleración, emoción que crece. |
| **Match sound** | Cada corte dispara una nota afinada (mallet/pluck con armónicos) sobre un colchón que crece (−38 → −12 dB). | Cada imagen "suena" como si alguien la tocara a mano: lo humano. |
| **Drop + cierre** | Silencio seco a los 16s; logo sobre fondo oscuro con horizonte degradado abajo y una nota que resuelve. | Respiro, memoria, marca. |

## 2. Guion del reel C&O (1080×1920, 20.5s, 30fps)

| Tiempo | Imagen (estilo) | Texto sobre el horizonte | Sonido |
|---|---|---|---|
| 0–1.0 | Amanecer latón/sanguina sobre el horizonte | — | Nota grave + colchón muy bajo |
| 1.0–4.6 | 6 fachadas, 0.6s c/u: colonial (foto), minimalista (foto), mediterránea (risograph), ladrillo (grabado), palafito tropical (acuarela), adobe andino (collage) | — | Una nota grave por fachada |
| 4.6–5.6 | **La mutación:** una puerta se abre hacia adentro (foto) | "Lo que te rodea" | Nota + su octava grave |
| 5.6–9.4 | Cocina (abuela y niña amasando arepas), sala (óleo), comedor cenital, habitación (plano técnico), baño (sepia), estudio (risograph), terraza (acuarela), ropas (cianotipia) | "cambia," | Las notas suben de registro |
| 9.4–12.2 | Jardín (grabado coloreado), mudanza (gouache), cuarto del bebé (carboncillo), baile en la cocina (flash), abuelo leyendo (azulejo) + primer ciclo rápido | "cuando tú cambias." | Crescendo |
| 12.2–15.4 | Clímax: todo el hogar a la vez, cortes de 0.3 → 0.22s | "Nosotros entendemos" → ***"por qué."*** | Máxima intensidad |
| 15.4–16.0 | Negro | — | **Silencio** |
| 16.0–20.5 | Logo C&O claro + "La Casa del Real Estate", horizonte degradado que sube | — | Acorde de Re que se abre, cola larga |

## 3. Cómo está construido

- `scripts/build-reel.mjs` — **una sola lista de cortes** genera `compositions/reel.html` y
  `assets/reel/reel-audio.m4a`. Por eso cada imagen y su nota caen en el mismo frame.
  Cambia tiempos, orden de imágenes, notas o frases ahí y corre `npm run build`.
- `compositions/reel.html` — cielo con polvo, amanecer, **horizonte** (`clip-path: ellipse`) que
  recorta todas las tomas, filo de luz constante y frases. Cada toma tiene un empuje lento (scale 1.08→1).
- `compositions/endcard.html` — logo y tagline (variable `tagline`).
- `index.html` — monta reel (0–15.4s), silencio, endcard (16–20.5s) y el audio.
- Sonido: cuerda pulsada (Karplus-Strong) + mazo de fieltro por corte, con microvariaciones de
  tiempo/velocidad/paneo (semilla fija → determinista), roce de papel en cada corte, colchón
  Re add9 con filtro que se abre, reverb Schroeder, drop a silencio y acorde final. Loudness ≈ −15.6 LUFS.

## 4. Comandos

```bash
npm run fetch-images   # descarga las 20 imágenes de Higgsfield a assets/reel/NN.jpg
npm run build          # regenera reel.html + audio desde el guion
npm run check          # validación HyperFrames
npm run render -- --output renders/lo-que-te-rodea.mp4
```
