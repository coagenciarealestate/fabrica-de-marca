# Fábrica de Assets de Marca — C&O

App de producción para generar todas las piezas de marca de C&O — La Casa del Real Estate desde un solo lugar (redes sociales, comercial, presentaciones y landing de campaña).

## Estado actual

**Fase 0 — Sistema de marca:** completada.

- Reproducción fiel del deck de referencia (logo real, imagen hero, texturas e iconos reales): https://claude.ai/artifact/YP2CN6uZhQt6jNYRNkUNoV
- Tokens de marca reutilizables: [`design/tokens/brand.json`](design/tokens/brand.json)
- Assets reales recuperados del deck original: [`design/deck-co/`](design/deck-co/) (logo, imagen hero, texturas, set de iconos)
- Deck original de la usuaria (fuente): https://claude.ai/artifact/TiWgmG1ToQtfsDbYdFQCB6

El isotipo "C&O" ya es el archivo real (no una aproximación tipográfica) — se recuperó directamente del deck original.

## Sistema de guiones de propiedades

Skill `/guionespropiedades`: [`skills/guionespropiedades/`](skills/guionespropiedades/SKILL.md). Carga los datos de un inmueble y entrega dos guiones de recorrido narrado con agente a cámara: uno que abre con el precio para segmentar y otro de suspenso con loops, en un documento editable.

- Piloto: [`propiedades/domus-san-patricio-5a/guion.md`](propiedades/domus-san-patricio-5a/guion.md) (v2 basada en el libreto del agente; la v1 descartada está en `v1-descartada/`)
- Historial: `propiedades/_referentes.md` y `propiedades/_resultados.csv`, que alimentan la mejora de la skill

## Próximas fases

1. Templates de Redes Sociales (post 1080x1080, quote card, banner, historia)
2. Templates de Comercial y Presentaciones (export PDF)
3. Landing page de campaña
4. App de la fábrica (categoría → opción → formulario → vista previa → descarga)
