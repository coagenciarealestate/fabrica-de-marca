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

## Lo esencial aprendido (reels de C&O)

- **Estudia el referente cuadro a cuadro antes de interpretar**: mide cortes, movimiento dentro de cada toma y cómo vive el texto (no supongas).
- **Match cut estilo Opus/Claude** (`lo-que-te-rodea`):
  - Borde **curvo** a una altura común, fondo liso de un color arriba.
  - Escala sorpresa (planeta, microscopio, macro).
  - Técnica y color cambian en cada corte.
  - **Tomas quietas**: solo la apertura se acerca; la materia viva apenas se mece.
  - **Texto integrado**:
    - Quieto sobre el horizonte y doblado con la curva de cada borde.
    - Con la óptica de la toma (desenfoque; *multiply* sobre papel, *screen* sobre lo oscuro).
    - Crece un paso en cada corte; cierre en negrita.
- **Sonido**:
  - Musical, suave y continuo; nada de cortes abruptos ni bajos que "estallen" en el logo.
  - Todo en un pulso común (cortes, frases y acordes).
- **Imágenes**:
  - Se prefiere materia real y lo hecho a mano, no lo literal ni el "banco de imágenes".
  - Genera con Nano Banana Pro ilimitado en la web de Higgsfield (el MCP no usa el ilimitado): entrega prompts completos + imágenes de referencia.
- **Texto en pantalla**: redáctalo bien (puntuación y gramática) aunque llegue escrito rápido.
