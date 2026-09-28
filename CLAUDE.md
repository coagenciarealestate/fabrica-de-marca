# Fábrica de Assets de Marca — C&O

- `design/` — sistema de marca (tokens en `design/tokens/brand.json`, assets reales en `design/deck-co/`).
- `video/` — proyecto **HyperFrames** para animar videos (HTML + GSAP → MP4). Antes de tocarlo lee `video/CLAUDE.md` y usa la skill `/hyperframes` (instalada en `.claude/skills/`).
  - `cd video && npm run check` — lint + validación (obligatorio tras cada cambio).
  - `cd video && npm run render -- --output renders/<nombre>.mp4` — render final.
- `video/lo-que-te-rodea/` — reel match cut + match sound (proyecto HyperFrames propio). Su guion vive en `scripts/build-reel.mjs` (genera `compositions/reel.html`; el sonido sale de `scripts/sound.mjs`); no edites `reel.html` a mano. Imágenes v3 en `assets/reel-v3/` (prompts en `PROMPTS-v3.md`): `npm run fetch-images` (requiere acceso a d8j0ntlcm91z4.cloudfront.net).
- `video/dar-el-salto/` — reel del conejo (proyecto HyperFrames propio). Guion en `scripts/build-salto.mjs` (genera `compositions/story.html` y el audio); no edites `story.html` a mano.
- `video/dar-el-salto-papel/` — versión en papel y stop motion (la aprobada en concepto). Guion en `scripts/build-papel.mjs`; poses del conejo recortadas con `scripts/cut-sprites.py`.
- Marca: C&O es **La Casa del Marketing** (ya no "del Real Estate").
- `.claude/hooks/session-start.sh` instala FFmpeg en sesiones web (requisito de render).
- Skills de HyperFrames vendorizadas desde `heygen-com/hyperframes`; actualiza con `npx hyperframes skills update` y copia a `.claude/skills/`.
