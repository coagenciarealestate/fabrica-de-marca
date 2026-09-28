# Lo que te rodea cambia — planeación

> **v3 (actual):** imágenes nuevas según el estudio del referente — ver `REFERENTE-v3.md`
> (diagnóstico y lista de tomas) y `PROMPTS-v3.md` (prompts de Higgsfield). Bordes curvos,
> fondo liso arriba, técnicas y colores que cambian en cada corte. Como en el referente
> (medido cuadro a cuadro), las tomas son quietas: solo la apertura se acerca, la materia
> viva se mece apenas y dos cortes llegan con barrido. Texto: "Para transformar el mundo, hay
> que empezar cambiando las cosas en casa." — quieto sobre el horizonte, doblado según la
> curva de cada borde, con la óptica de la toma (desenfoque; tinta impresa sobre papel, luz
> sobre lo oscuro) y creciendo un paso en cada corte; el cierre en negrita. La música y el
> pulso de la v2 final se mantienen. Lo de abajo es la v2.


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

**Alineación del match cut:** cada foto trae su borde a una altura distinta (del 36 % al 53 %).
Como hace un editor, alineamos las tomas: `edge` en `scripts/build-reel.mjs` guarda la altura
medida de cada borde; la foto se escala desde ese borde (`transform-origin`) y se desplaza a un
horizonte común (46 %). Así el horizonte no se mueve aunque cada toma respire.

**En la composición:**
- Tomas a pantalla completa, sin máscara. Cada una respira distinto (empuje lento con deriva leve).
- La tinta del texto se **mide** en cada imagen (luminancia sobre el borde) y cambia en el corte.
- Grano de película (registry `grain-overlay`, hecho seekable), viñeta suave y un paso de luz
  (registry `organic-light-leak-overlay`) en el umbral de la puerta.
- Cierre: volvemos al amanecer del inicio, más oscuro, con el logo encima. El ciclo se cierra.

## 3. Diseño sonoro: un camino (v2 final, pulido)

Todo va a **100 BPM (1 tiempo = 0.6 s)**: cortes, frases, acordes y notas caen en la misma rejilla.
Nada se corta de golpe: el colchón cambia de acorde con fundidos y el final respira (baja de volumen) en vez de quedar en silencio.

| Tramo | Qué escuchas | Qué genera |
|---|---|---|
| 0–4.8 · Afuera | Aire de amanecer, pájaros lejanos, colchón en Re (add9); la primera campanita entra en el primer tiempo | Calma, espacio |
| 4.8 · Umbral | Soplo hacia la puerta, acorde suspendido (La sus4), aparece el tono de cuarto | Entramos |
| 6.0–9.6 · Adentro | Una campanita por corte (*match sound*) sobre una línea que sube; foley mínimo (vapor, pan, sábana, gota, crayola, página) | La casa suena |
| 9.6–15.6 · Clímax | El arpegio dobla la densidad con los cortes, grano de aire, crescendo hasta "por qué." | La transformación se acelera |
| 15.6–16.2 | Respiro: todo baja sin cortarse y la imagen funde a negro | Pausa |
| 16.2–21 · Logo | Campanas abiertas en Re (add9) que se quedan, sin golpe grave | Llegada, calma |

Armonía (un acorde cada dos tiempos): Re add9 · Si m · Sol · Re/Fa# · La sus4 · Re · Sol maj7 · Si m · Mi m9 · La · Si m · Sol · La · Re · Re add9.
Master a −16 LUFS con compresión suave. Todo es sintetizado y determinista (`scripts/sound.mjs`, el mismo motor de *Dar el salto*).

## 4. Guion por tiempos (1080×1920, 21 s)

| Tiempo | Tomas | Texto |
|---|---|---|
| 0–1.2 | Amanecer sobre la línea de techos | — |
| 1.2–4.8 | Cal · teja · ladrillo · baranda · adobe · concreto (1 tiempo c/u) | — |
| 4.8–6.0 | Línea de luz bajo la puerta | "Lo que te rodea" (5.4) |
| 6.0–9.6 | Taza · pan · masa de arepa · sábana · tina · crayola | "cambia," (7.8) |
| 9.6–11.7 | Mesa · hoja · manta · plato · libro · bordado · plano (medio tiempo) | "cuando tú cambias." (9.6) |
| 11.7–15.6 | Afuera y adentro alternados, de medio a un cuarto de tiempo | "Nosotros entendemos" (12.6) → ***"por qué."*** (14.4) |
| 15.6–16.2 | Fundido a negro, respiro | — |
| 16.2–21 | Amanecer que aparece + logo C&O + **"La Casa del Marketing"** | — |

## 5. Comandos

```bash
npm run fetch-images   # (ya están en el repo) vuelve a descargar las 22 imágenes y re-mide la tinta
npm run build          # regenera reel.html + audio desde el guion
npm run check
npm run render -- --output renders/lo-que-te-rodea.mp4
```
