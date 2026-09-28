# Fábrica de Assets de Marca — C&O

- `design/` — sistema de marca (tokens en `design/tokens/brand.json`, assets reales en `design/deck-co/`).
- `video/` — proyecto **HyperFrames** para animar videos (HTML + GSAP → MP4). Antes de tocarlo lee `video/CLAUDE.md` y usa la skill `/hyperframes` (instalada en `.claude/skills/`).
  - `cd video && npm run check` — lint + validación (obligatorio tras cada cambio).
  - `cd video && npm run render -- --output renders/<nombre>.mp4` — render final.
- `video/lo-que-te-rodea/` — reel match cut + match sound (proyecto HyperFrames propio). Su guion vive en `scripts/build-reel.mjs` (genera `compositions/reel.html` y el audio); no edites `reel.html` a mano. Imágenes: `npm run fetch-images` (requiere acceso a d8j0ntlcm91z4.cloudfront.net).
- `.claude/hooks/session-start.sh` instala FFmpeg en sesiones web (requisito de render).
- Skills de HyperFrames vendorizadas desde `heygen-com/hyperframes`; actualiza con `npx hyperframes skills update` y copia a `.claude/skills/`.
