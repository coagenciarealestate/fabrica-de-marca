---
workflow: general-video
flow: automation
storyboard: no
message: "Para transformar el mundo, hay que empezar cambiando las cosas en casa."
destination: reel (Instagram / TikTok)
aspect: "9:16"
language: es
length: 21s
angle: match cut + match sound inspirado en el video de referencia de la usuaria
---

## Intent
Reel con la esencia del video de referencia (horizonte curvo constante, materias que cambian
debajo, serif pequeña posada sobre el horizonte, cortes que se aceleran, drop a silencio y logo).
Fachadas de viviendas de estilos distintos → mutan (puerta que se abre) hacia los espacios del
hogar con vida cotidiana en estilos gráficos variados → cierre con el logo de C&O.

## Assets
- v2: 22 macros de materia generados en Higgsfield (gpt_image_2_5, 9:16, calidad medium) — `scripts/fetch-reel-images.sh`.
- Logo, fuentes y tokens de la marca C&O.
- Diseño sonoro cinematográfico sintetizado en código (`scripts/sound.mjs`).

## Notes
- Feedback v1 (usuaria): estética y texturas poco humanas; el círculo acopla cosas a una forma en
  vez de encontrar cosas con la misma forma; sonido intrusivo que agita. Conservar estructura y
  momentum; mejorar dirección, indirecta y emotiva, con sonido de cine. Ver PLAN.md § 1.
