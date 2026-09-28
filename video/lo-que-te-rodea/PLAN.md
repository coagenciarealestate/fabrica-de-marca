# Lo que te rodea cambia — planeación (v2)

## 1. Dónde nos alejamos del referente (v1)

| El referente hace… | La v1 hizo… | Por qué se perdió lo humano |
|---|---|---|
| **Encuentra** el horizonte dentro de cada imagen: el filo de un plato, la cresta de una duna, el menisco de un líquido, un trazo de crayola. La línea está en la materia. | **Impuso** un círculo: recortó cada imagen con la misma elipse y dejó un cielo negro fijo. | El ojo ya no descubre la rima; la ve forzada. Un molde es lo contrario de lo orgánico. |
| Imágenes de **materia muy de cerca**: textura, grano, luz rasante, fuera de foco. No muestra "cosas", muestra superficies. El significado llega de forma indirecta. | Mostró **escenas literales** (fachadas completas, gente haciendo cosas) en un catálogo de "estilos" (acuarela, risograph, óleo…). | Lo literal explica en lugar de evocar. Los "estilos" generados leen como banco de imágenes, no como objetos reales. |
| **Lo hecho a mano es real**: crayola, tinta, cerámica pintada, fotografiados como objetos, con papel, fibras y luz. | Estilos simulados, en calidad baja. | Se perdió la huella humana: nadie tocó eso. |
| **Cada toma trae su propio cielo** (blanco, turquesa, negro, amarillo, azul). El cambio de color arriba del borde da el salto emocional. | Un mismo cielo carbón con polvo en todas. | Sin contraste entre tomas no hay "cambio" que sentir. |
| **El texto cambia de tinta** según lo que tiene debajo (claro sobre oscuro, negro sobre crema) y se posa justo en el borde. | Siempre marfil con sombra pesada. | Se sentía pegado encima, no parte del mundo. |
| **Sonido musical y consonante**: notas afinadas que se van sumando sobre un colchón que crece; silencio seco; una sola nota que resuelve. | Una cuerda pulsada + roce de papel en **cada** corte, colchón de sierra brillante, reverb metálica. | Denso, brillante, repetitivo → agita. No había camino: todo pasaba igual todo el tiempo. |

**Lo que sí funcionó y se conserva:** la estructura y el momentum (afuera → umbral → adentro →
clímax → silencio → logo), el ritmo de cortes que se acelera, la serif sobre el borde y el cierre.

## 2. Nueva dirección de arte

**Idea:** el cambio no se muestra, se siente en la materia. Primero la piel de la ciudad (cal,
teja, ladrillo, madera, adobe, concreto); luego una línea de luz bajo una puerta; y adentro,
las huellas de la vida (el borde de una taza, la corteza del pan, dedos pequeños en la masa de
arepa, el pliegue de una sábana, la línea del agua de la tina, un dibujo en crayola de una casa,
migas en la mesa, un plato de Carmen de Viboral, un bordado, un plano a lápiz). Nunca vemos a
nadie, pero se siente que alguien vive ahí.

**Reglas de cada imagen (prompts en Higgsfield):**
- Fotografía macro 100 mm, profundidad de campo corta, luz natural rasante, grano de película.
- Un **borde natural** del objeto cruza la mitad del cuadro. Arriba, un fondo limpio de color propio.
- Lo hecho a mano (crayola, bordado, plano a lápiz, cerámica) se fotografía como objeto físico.
- Nada literal ni "estilizado": materia, luz, huella.

**En la composición:**
- Tomas a pantalla completa, sin máscara. Cada una respira distinto (empuje lento con deriva leve).
- La tinta del texto se **mide** en cada imagen (luminancia sobre el borde) y cambia en el corte.
- Grano de película (registry `grain-overlay`, hecho seekable), viñeta suave y un paso de luz
  (registry `organic-light-leak-overlay`) en el umbral de la puerta.
- Cierre: volvemos al amanecer del inicio, más oscuro, con el logo encima. El ciclo se cierra.

## 3. Diseño sonoro: un camino

| Tramo | Qué escuchas | Qué genera |
|---|---|---|
| 0–4.6 · Afuera | Aire de amanecer muy bajo, pájaros lejanos, un Re grave de piano, tres notas sueltas de piano de fieltro (no una por corte) | Calma, espacio, alguien pensando |
| 4.6 · Umbral | El viento se apaga como si una puerta se cerrara, un golpe grave suave, dos notas; aparece el tono de cuarto | Entramos. El mundo se vuelve íntimo |
| 4.9–12.2 · Adentro | Cuerdas que entran despacio (Re → Si m → Sol), una melodía de piano que sube; foley mínimo por material: vapor del café, pan que cruje, la sábana, una gota en la tina, la crayola, una página | La casa suena; lo humano está en los detalles |
| 9.4–15.4 · Clímax | Un pulso grave tipo latido que sigue los cortes y crece; arpegio suave; riser de aire que se abre; cuerdas en crescendo | La transformación se acelera en el pecho |
| 15.4–16.0 | Silencio absoluto | Respiro |
| 16.0–20.5 · Logo | Boom grave contenido, acorde de piano que se queda, cuerdas muy bajas | Llegada, calma, memoria |

Master a −16 LUFS, pico −1.5 dBTP, compresión lenta. Todo sintetizado y determinista
(`scripts/sound.mjs`), con reverb de convolución de sala cálida.

## 4. Guion por tiempos (1080×1920, 20.5 s)

| Tiempo | Tomas | Texto |
|---|---|---|
| 0–1.0 | Amanecer sobre la línea de techos | — |
| 1.0–4.6 | Cal · teja · ladrillo · baranda · adobe · concreto (0.6 s c/u) | — |
| 4.6–5.6 | Línea de luz bajo la puerta | "Lo que te rodea" |
| 5.6–9.4 | Taza · pan · masa de arepa · sábana · tina · crayola · mesa · hoja | "cambia," (7.2) |
| 9.4–12.2 | Manta · plato · libro · bordado · plano + primer ciclo rápido | "cuando tú cambias." |
| 12.2–15.4 | Afuera y adentro alternados, cortes de 0.3 → 0.22 s | "Nosotros entendemos" → ***"por qué."*** |
| 15.4–16.0 | Negro, silencio | — |
| 16.0–20.5 | Amanecer oscuro + logo C&O | — |

## 5. Comandos

```bash
npm run fetch-images   # descarga las 22 imágenes y re-mide la tinta del texto
npm run build          # regenera reel.html + audio desde el guion
npm run check
npm run render -- --output renders/lo-que-te-rodea.mp4
```
