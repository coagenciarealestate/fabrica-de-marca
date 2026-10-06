# 08 · Entregable

Siempre minimalista, legible y premium. **Por defecto: documento editable** (B), con las secciones Datos de la unidad · Guion 1 · Guion 2 · Revisión y tomas. La versión premium (A) solo si se pide.

## A · Premium (PDF / página con la marca)
- Plantilla: `templates/guion-premium.html` (tokens de `design/tokens/brand.json`: Inria Serif para titulares, Jost para texto, Pergamino y Carbón de fondo, Latón como acento).
- Para: cliente, propietario, archivo y presentación.
- Se exporta a PDF tamaño carta desde el navegador (estilos de impresión incluidos).

## B · Editable (documento para comentar)
- Mismo contenido, sin diseño, en el sistema de documentos del equipo (Claude Docs, Google Docs o Notion).
- Para: agente, editor y equipo, que pueden comentar línea por línea antes de grabar.

## Estructura (las dos versiones)
1. **Datos de la unidad:** una línea de resumen + tabla de datos (precio, área, ubicación, espacios, zonas comunes).
2. **Guion 1 · Precio primero:** tabla Tiempo | Lo que dice el agente | Lo que se ve.
3. **Guion 2 · Suspenso:** misma tabla; loops en **negrita**.
4. **Revisión y tomas:** comparación de los dos guiones (qué frena, qué retiene, a quién filtra, para qué plataforma, cambios hechos) + lista de tomas para grabar ambos en una jornada.

Copy por plataforma, conversión y ficha completa solo si se piden.

## Reglas de diseño
- Una idea por página o por sección. Mucho aire.
- Tablas sin bordes pesados: filetes finos de Latón.
- La voz del agente en tipografía grande y legible: es lo que se lee en el set.
- Nada de emojis en la versión premium.
