# Fábrica de Assets de Marca — C&O

- `design/` — sistema de marca (tokens en `design/tokens/brand.json`, assets reales en `design/deck-co/`).
- `video/` — proyecto **HyperFrames** para animar videos (HTML + GSAP → MP4). Antes de tocarlo lee `video/CLAUDE.md` y usa la skill `/hyperframes` (instalada en `.claude/skills/`).
  - `cd video && npm run check` — lint + validación (obligatorio tras cada cambio).
  - `cd video && npm run render -- --output renders/<nombre>.mp4` — render final.
- `.claude/hooks/session-start.sh` instala FFmpeg en sesiones web (requisito de render).
- Skills de HyperFrames vendorizadas desde `heygen-com/hyperframes`; actualiza con `npx hyperframes skills update` y copia a `.claude/skills/`.
