# Fábrica de Assets de Marca — C&O

App de producción para generar todas las piezas de marca de C&O — La Casa del Real Estate desde un solo lugar (redes sociales, comercial, presentaciones y landing de campaña).

## Estado actual

**Fase 0 — Sistema de marca:** completada.

- Reproducción fiel del deck de referencia (logo real, imagen hero, texturas e iconos reales): https://claude.ai/artifact/YP2CN6uZhQt6jNYRNkUNoV
- Tokens de marca reutilizables: [`design/tokens/brand.json`](design/tokens/brand.json)
- Assets reales recuperados del deck original: [`design/deck-co/`](design/deck-co/) (logo, imagen hero, texturas, set de iconos)
- Deck original de la usuaria (fuente): https://claude.ai/artifact/TiWgmG1ToQtfsDbYdFQCB6

El isotipo "C&O" ya es el archivo real (no una aproximación tipográfica) — se recuperó directamente del deck original.

## Video animado — HyperFrames

La carpeta [`video/`](video/) es un proyecto [HyperFrames](https://github.com/heygen-com/hyperframes): cada video se escribe como HTML + animaciones GSAP y se renderiza a MP4 de forma determinista, usando los tokens, fuentes y assets reales de la marca.

```bash
cd video
npm run dev      # estudio de preview en el navegador
npm run check    # lint + validación de layout, movimiento y contraste
npm run render -- --output renders/co-intro.mp4
```

Requisitos: Node.js 22+ y FFmpeg (en Claude Code web se instala solo con el hook de `.claude/`). Incluye una intro vertical de ejemplo (casa cromada + titular → logo sting) con textos editables como variables. Para crear un video nuevo con Claude, pide p. ej. *"Usando /hyperframes, crea un reel de 15 s para …"*.

### Reels

- [`video/lo-que-te-rodea/`](video/lo-que-te-rodea/) — *"Lo que te rodea cambia, cuando tú cambias. Nosotros entendemos por qué."* Match cut sobre un horizonte curvo + match sound (una nota por corte). Planeación en [`PLAN.md`](video/lo-que-te-rodea/PLAN.md).

## Próximas fases

1. Templates de Redes Sociales (post 1080x1080, quote card, banner, historia)
2. Templates de Comercial y Presentaciones (export PDF)
3. Landing page de campaña
4. App de la fábrica (categoría → opción → formulario → vista previa → descarga)
