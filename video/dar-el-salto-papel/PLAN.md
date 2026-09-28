# Dar el salto — papel y stop motion

**Frase:** "Cuando ya no te gusta donde estás. Solo tienes que: Dar el salto"
**Cierre:** C&O — *La Casa del Marketing* · **Formato:** 1080×1920 · 24 s

## Idea

El conejo sale de la madriguera a buscar otro lugar donde vivir. Recorre el mismo planeta de
papel mientras cambian la hora, el clima y la casa posible. Ninguna lo convence: aterriza, mira,
mira hacia atrás (no) y sigue, cada vez más rápido. En la mitad del mundo hay un sombrero de mago
con luz adentro. Se decide, salta y entra de cabeza. Bajamos al fondo del sombrero: una luz
dorada, la marca.

## Lenguaje

- **Match cut:** la cima del planeta cae siempre a la mitad del cuadro (cada escenario se escala
  desde su propia cima y se alinea). Cambia el mundo, no la forma.
- **Stop motion real:** el conejo es un solo recorte de papel con 8 poses (asomarse, sentado,
  mirar atrás, agacharse, saltar, aterrizar, de espaldas, saltar hacia arriba) animadas a 12 fps
  sobre los escenarios. Todo "hierve" un pixel cada 2 cuadros, como en la mesa de animación.
  La cámara hacia el fondo del sombrero avanza en pasos, no suave.
- **Entrar al sombrero:** el frente del sombrero es una capa recortada por encima del conejo, así
  que el conejo desaparece adentro de verdad.
- **Texto:** Inria Serif sobre el cielo, se posa en 3 pasos como papel y cambia de tinta con el cielo.

## Guion

| Tiempo | Mundo | Conejo | Texto |
|---|---|---|---|
| 0–3.4 | Madriguera · noche | Asoma la cabeza desde el agujero, sale, mira su hogar, se va | *Cuando ya no te gusta* |
| 3.4–5.8 | Cabaña · amanecer | Aterriza, mira, duda, sigue | → *donde estás.* |
| 5.8–7.8 | Faro · viento | igual, más rápido | *donde estás.* |
| 7.8–9.5 | Edificio · tormenta | | *Solo tienes que:* |
| 9.5–11.0 | Casa del árbol · tarde | | *Solo tienes que:* |
| 11.0–12.3 | Iglú · nieve | | *Solo tienes que:* |
| 12.3–13.5 | Castillo · niebla | | *Solo tienes que:* |
| 13.5–18.0 | Sombrero · noche clara | Llega, lo mira de espaldas, se decide, salta y entra | *Dar el salto* |
| 18.0–20.0 | Adentro del sombrero | — | — |
| 20.0–24.5 | C&O · *La Casa del Marketing* | — | — |

**Música: violín solista y cuerdas (120 BPM, Si menor → Re mayor).** Todos los cortes caen en
un tiempo del compás (3.5 · 6 · 8 · 9.5 · 11 · 12 · 13) y el despegue al sombrero cae en el
tiempo fuerte de 16.0.
- La duda: el violín canta solo sobre chelos casi inaudibles.
- Sale al mundo: entran las cuerdas y un ostinato de violas en corcheas (el camino); cada lugar
  sube un escalón de armonía (Si m → Sol → Mi m → Re/Fa# → Sol → La).
- Desde la tormenta: tambores graves con cuerpo (sin sub) que se aceleran; en el sombrero los
  violines doblan la melodía, platillo que crece → **Re mayor en el salto** (el punto más alto).
- Cuando entra al sombrero la orquesta **respira** (baja sin cortarse) y resuelve cálida; bajo la
  marca, un Re add9 amplio que se queda. Sin silencios ni cortes: todo ligado.
- El violín es síntesis de cuerda frotada (sierra PolyBLEP → resonancias de caja, vibrato tardío,
  ruido de arco, portamento). Arco dinámico: −25 dB (duda) → −12 dB (salto) → −23 (respira) → −14 (marca).

## Archivos

- `scripts/build-papel.mjs` — guion único (escenarios, coreografía del conejo, texto, sonido).
- `scripts/cut-sprites.py` — recorta las 8 poses del fondo verde. `scripts/cut-hat.py` — frente del sombrero.
- `scripts/fetch-media.sh` — descarga escenarios y hojas de poses de Higgsfield.
- `PROMPTS.md` — los prompts usados en Higgsfield (Nano Banana, web).

```bash
npm run build && npm run check
npm run render -- --quality delivery --output renders/dar-el-salto-papel.mp4
```
