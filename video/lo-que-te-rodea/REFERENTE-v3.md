# Lo que te rodea cambia — v3: estudio del referente e imágenes nuevas

Estudié el referente toma por toma (37 cortes en 24 s) y lo comparé con nuestras 22 imágenes.
El ritmo, la estructura y el sonido ya funcionan. Donde nos alejamos es en **las imágenes**.

## 1. Qué hace el referente y qué hicimos nosotros

| # | El referente | Nuestra v2 | Qué se pierde |
|---|---|---|---|
| 1 | **El borde es una curva convexa**, como el horizonte de un planeta (el filo de una placa de Petri, un plato, una hoja, un diente de león). La curva se repite toma a toma y es la rima visual. | Bordes **rectos** (muros, mesas, filos de concreto). | La rima pierde fuerza, y lo recto se lee como arquitectura quieta, no como un mundo que gira. |
| 2 | **Escala ambigua**: microscopio, planeta y macro. Durante medio segundo no sabes qué estás viendo. De ahí sale la sensación de *descubrir*. | Objetos **reconocibles a escala humana** (pan, taza, libro, lámpara). | No hay sorpresa; se entiende todo al instante. |
| 3 | **Arriba del borde, un fondo plano de un solo color** (negro, turquesa, crema, cobalto, magenta, amarillo). Es gráfico y limpio. | Arriba hay **contexto**: cielos con degradé, cuartos, lámparas, ventanas, bokeh. | Ruido visual y sensación de foto de banco. El texto compite con el fondo. |
| 4 | **Muchas técnicas**: foto macro (~40 %), ciencia (microscopía, falso color, térmica, ~20 %), hecho a mano (plano en tiza, grabado, ilustración antigua, crayola, collage de papel, lápiz, tinta, encaje, ~30 %) y orgánico (hoja, diente de león, ~10 %). | **100 % la misma foto**: mismo lente, misma luz dorada, mismo acabado. | No hay diversidad de texturas; todo se siente igual. |
| 5 | **Cada toma tiene su propio color saturado** y el corte salta a su complementario (turquesa → naranja, cobalto → crema, magenta → verde ácido). | Casi todo es **cálido, café y ámbar**. Las tomas vecinas se parecen. | El corte no "hace clic" y no se siente el cambio. |
| 6 | **Luz plana o científica**: estudio, transmitida, contraluz. | Todo es **hora dorada cinematográfica**. | Monotonía emocional. |
| 7 | **Hay tomas vivas**: líquidos con burbujas que se mueven, una transición con barrido de movimiento, pelusa que flota. Además, empuje leve. | Todas son fotos quietas con el mismo empuje. | Falta la sensación de movimiento y de materia viva. |
| 8 | **La densidad crece**: campos calmos al inicio y texturas finas y densas (encaje, células, grabado) en el clímax. | La densidad es pareja todo el tiempo. | El clímax no se siente distinto a la vista. |

## 2. Cómo lo adapto a C&O

Mantengo la historia: **afuera → umbral → adentro → clímax → logo**. Cada imagen sigue ahora cuatro reglas:

1. **Borde curvo** (un domo suave) a media altura, siempre a la misma altura para que el corte calce.
2. **Fondo liso de un color** arriba, donde se posa la frase.
3. **Escala sorpresa**: el hogar visto como planeta, como célula o como dibujo.
4. **Técnica y color distintos a los de la toma anterior**. Nunca dos técnicas iguales seguidas.

La casa se reconoce por pistas (teja, arco colonial, plano, arepa, café, un dibujo de casa, mochila), no por fotos literales.

## 3. Lista de tomas v3 (22)

La columna **Mov.** indica cómo se mueve cada toma: empuje (E), deriva lateral (D), giro leve (G), barrido de transición (B) o toma viva en video (V).

| id | Tramo | Técnica | Qué es | Color arriba / abajo | Mov. |
|---|---|---|---|---|---|
| 200 | Apertura | Foto orbital | Horizonte curvo de los Andes al amanecer, línea naranja fina, luces de ciudad | negro azul / noche | E lento |
| 201 | Afuera | Foto macro | Corte de teja de barro vista de canto, arco perfecto | cobalto / terracota | E |
| 202 | Afuera | Grabado | Arco de fachada colonial en grabado de tinta negra | crema / negro | D |
| 203 | Afuera | Plano en tiza | Arco de puerta en tiza blanca sobre papel azul | azul plano / blanco | G |
| 204 | Afuera | Microscopía | Corte de guadua teñido (células) | blanco hueso / verde, magenta | E |
| 205 | Afuera | Termografía | Techo de teja con el calor de la casa brillando | violeta / amarillo, naranja | D |
| 206 | Umbral | Foto | Una línea de luz cálida sobre un piso curvo, oscuridad total | negro / oro | E + B |
| 207 | Adentro | Macro líquido | Crema del café como planeta | negro / ámbar | V |
| 208 | Adentro | Macro | Domo de masa de arepa con huellas de dedos | turquesa / amarillo maíz | E |
| 209 | Adentro | Textil | Tejido de mochila wayuu, macro | magenta / multicolor | D |
| 210 | Adentro | Crayola | Dibujo de niño de una casa, colina curva | amarillo / crayola | G |
| 211 | Adentro | Collage | Sala en papel recortado estilo Matisse | crema / cobalto, rojo, verde | E |
| 212 | Adentro | Textil | Cortina de encaje blanco | negro / blanco | D |
| 213 | Adentro | Ciencia | Película iridiscente de una burbuja de jabón de la tina | negro / arcoíris | V |
| 214 | Clímax | Cerámica | Filo de plato de Carmen de Viboral | crema / azul cobalto | E |
| 215 | Clímax | Microscopía polarizada | Cristales de panela o azúcar en luz polarizada | negro / arcoíris | G |
| 216 | Clímax | Botánica | Borde de hoja de helecho a contraluz | crema / verde ácido | E |
| 217 | Clímax | Lápiz | Líneas de construcción de un arco en lápiz rojo y azul | blanco / líneas | D |
| 218 | Clímax | Ilustración antigua | Grabado coloreado a mano de una casa de bahareque | beige / acuarela | E |
| 219 | Clímax | Tinta | Garabato de plano en tinta sobre papel kraft | amarillo kraft / negro | G |
| 220 | Clímax | Macro líquido | Panela derretida con burbujas | naranja / ámbar oscuro | V |
| 221 | Final | Orgánico | Mota de algodón (fibras) a contraluz, suave | negro / blanco | E lento |

## 4. Prompt base (Nano Banana Pro o GPT Image, 9:16)

Añade a cada descripción:

> …The subject's top edge is a gently convex curved arc (like a planet horizon) crossing the full
> width at exactly mid-height; the upper half of the frame is an empty, flat, seamless single-colour
> field ([COLOR]). Extreme close-up, the subject fills the lower half and is cropped by the frame.
> No text, no letters, no numbers, no UI.

Las técnicas hechas a mano (grabado, tiza, crayola, collage, lápiz, tinta) se piden como
**objeto físico fotografiado en plano**, con la fibra del papel visible.

## 5. Estado y prompts completos

Ya generadas, como muestra de dirección, en `assets/reel-v3/`: **203** (plano en tiza), **204** (guadua al
microscopio), **205** (techo térmico), **207** (café como planeta) y **211** (collage). Faltan 17.

**Cómo entregarlas:** 9:16, Nano Banana Pro. Guárdalas con su número (`200.png`, `201.png`, …) en
`video/lo-que-te-rodea/assets/reel-v3/`. Yo las recorto a 1080×1920, mido la altura de cada
borde para que el corte calce, mido el color de la tinta y armo el reel.

Cada prompt ya incluye la regla del borde curvo y el fondo liso.

**200 — Apertura, horizonte orbital**
> Photograph from very high altitude at dawn: the curved horizon of the Earth over the Andes mountains, a razor-thin glowing orange and gold line of sunrise along the curve, faint scattered city lights below in deep blue darkness. The curved horizon crosses the full width at exactly mid-height as a gently convex arc; above it a flat, seamless near-black blue field, empty. Subtle film grain. No text.

**201 — Teja de barro**
> Extreme macro photograph of a single handmade Colombian clay roof tile seen end-on, its cross-section forming a perfect gently convex arc crossing the full width at exactly mid-height; porous terracotta texture, tiny cracks, a trace of lichen. The upper half of the frame is an empty, flat, seamless cobalt blue studio backdrop. Soft even studio light, shallow depth of field. No text.

**202 — Grabado de fachada colonial**
> Antique black-ink engraving (fine cross-hatching, woodcut style) of the top of a whitewashed colonial Latin American house facade with a rounded arch and clay-tile roof, printed on warm cream laid paper, photographed flat as a physical print with visible paper fibre. The top of the drawing forms a gently convex curved line crossing the full width at exactly mid-height; the upper half of the frame is empty cream paper. Extreme close-up, cropped by the frame. No text, no letters.

**206 — Umbral, línea de luz**
> Extreme close-up photograph in near-total darkness: a single thin line of warm golden light spilling across a gently convex curved wooden floor surface, the light line itself forming a shallow dome arc across the full width at exactly mid-height; the upper half of the frame is pure black, empty; below, the floor's wood grain glows faintly amber and falls into shadow. Very shallow depth of field, film grain. No door visible, no text.

**208 — Masa de arepa**
> Extreme macro photograph of a dome of fresh yellow corn arepa dough with small child fingerprints pressed into it, fine corn-meal grain texture. The dough's top edge is a gently convex arc crossing the full width at exactly mid-height; the upper half of the frame is an empty, flat, seamless turquoise studio backdrop. Soft diffuse light, shallow depth of field. No text.

**209 — Mochila wayuu**
> Extreme macro photograph of a tightly crocheted Wayuu mochila bag textile, geometric pattern in vivid orange, magenta, turquoise and black thread, individual fibres visible. The textile's top edge is a gently convex curved arc crossing the full width at exactly mid-height; the upper half of the frame is an empty, flat, seamless deep magenta backdrop. Soft even light. No text.

**210 — Dibujo en crayola**
> A child's crayon drawing on rough yellow construction paper, photographed flat as a physical object with visible wax strokes and paper grain: a small house with a red roof, a door, a tree and stick-figure family standing on a big green curved hill. The hill line is a gently convex arc crossing the full width at exactly mid-height; the upper half of the frame is empty yellow paper with only faint crayon texture. Extreme close-up, cropped by the frame. No text, no letters.

**212 — Cortina de encaje**
> Extreme macro photograph of white lace curtain fabric with floral pattern, dense and intricate, laid over a gently convex curved form so its edge forms a shallow dome arc crossing the full width at exactly mid-height; the upper half of the frame is pure empty black. Soft side light revealing threads. No text.

**213 — Burbuja de jabón**
> Extreme macro photograph of the iridescent thin film of a large soap bubble from a bathtub, swirling rainbow interference colours of magenta, gold, cyan and violet flowing across its surface. The bubble's top forms a gently convex arc crossing the full width at exactly mid-height like a planet horizon; the upper half of the frame is pure empty black. No text.

**214 — Plato de Carmen de Viboral**
> Extreme close-up photograph of the rim of a hand-painted ceramic plate from Carmen de Viboral, Colombia: loose cobalt-blue and red floral brushstrokes on glossy white glaze, tiny glaze bubbles and crazing. The plate rim forms a gently convex arc crossing the full width at exactly mid-height; the upper half of the frame is an empty, flat, seamless warm cream backdrop. Soft even light. No text.

**215 — Cristales de panela (luz polarizada)**
> Polarized light microscopy photograph of recrystallized sugar-cane panela crystals: sharp angular crystal shards in vivid rainbow interference colours (electric blue, magenta, gold, green) on black. The crystal mass forms a gently convex curved edge crossing the full width at exactly mid-height; the upper half of the frame is pure empty black. Scientific, crisp. No text, no scale bar.

**216 — Hoja de helecho a contraluz**
> Extreme macro photograph of the edge of a fern frond backlit by the sun, luminous acid-green with a fine network of veins and tiny hairs. The leaf edge forms a gently convex arc crossing the full width at exactly mid-height; the upper half of the frame is an empty, flat, seamless pale cream backdrop. Shallow depth of field. No text.

**217 — Líneas de construcción en lápiz**
> Architect's pencil construction drawing on bright white drafting paper, photographed flat as a physical object: a rounded arch built from compass arcs, diagonals and grid lines in graphite, with a few lines traced in red and blue pencil. The outermost compass arc is a gently convex curve crossing the full width at exactly mid-height; the upper half of the frame is empty white paper. Extreme close-up. No text, no numbers.

**218 — Ilustración antigua de casa de bahareque**
> Hand-coloured antique book illustration (fine engraving tinted with soft watercolour) of a traditional Colombian bahareque house with a wooden balcony full of flowers and a family on the porch, printed on aged beige paper, photographed flat with visible paper fibres. The top of the illustration forms a gently convex curved line crossing the full width at exactly mid-height; the upper half of the frame is empty beige paper. Extreme close-up, cropped by the frame. No text.

**219 — Plano en tinta sobre kraft**
> Quick expressive black ink scribbles of a house floor plan and furniture, drawn fast with a fountain pen on rough mustard-yellow kraft paper, photographed flat with visible paper fibres and ink bleed. The drawing's upper boundary is a gently convex curved ink line crossing the full width at exactly mid-height; the upper half of the frame is empty kraft paper. Extreme close-up. No text, no numbers.

**220 — Panela derretida**
> Extreme macro photograph of melting sugar-cane panela bubbling in a pot, glossy deep amber and orange with round bubbles along its surface. The syrup surface forms a gently convex arc crossing the full width at exactly mid-height like a planet horizon; the upper half of the frame is an empty, flat, seamless burnt-orange backdrop. Warm light, shallow depth of field. No text.

**221 — Mota de algodón**
> Extreme macro photograph of a soft ball of raw white cotton fibres backlit, delicate translucent threads glowing. The cotton's top forms a gently convex arc crossing the full width at exactly mid-height; the upper half of the frame is pure empty black. Very shallow depth of field, calm, soft. No text.
