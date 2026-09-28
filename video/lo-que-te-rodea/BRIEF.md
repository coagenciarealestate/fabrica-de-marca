---
workflow: general-video
flow: automation
storyboard: no
message: "Lo que te rodea cambia, cuando tú cambias. Nosotros entendemos por qué."
destination: reel (Instagram / TikTok)
aspect: "9:16"
language: es
length: 20.5s
angle: match cut + match sound inspirado en el video de referencia de la usuaria
---

## Intent
Reel con la esencia del video de referencia (horizonte curvo constante, materias que cambian
debajo, serif pequeña posada sobre el horizonte, cortes que se aceleran, drop a silencio y logo).
Fachadas de viviendas de estilos distintos → mutan (puerta que se abre) hacia los espacios del
hogar con vida cotidiana en estilos gráficos variados → cierre con el logo de C&O.

## Assets
- 20 imágenes generadas en Higgsfield (gpt_image_2_5, 9:8, calidad low) — `scripts/fetch-reel-images.sh`.
- Logo, fuentes y tokens de la marca C&O.
- Sonido sintetizado en código (`scripts/build-reel.mjs`).
