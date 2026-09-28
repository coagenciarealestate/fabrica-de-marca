# Dar el salto — planeación

**Frase:** "Existen momentos donde sabes, que es tiempo de: Dar el salto"
**Cierre:** C&O — *La Casa del Marketing*
**Formato:** 1080×1920 · 25.5 s · 30 fps

## La idea: una metamorfosis

Un conejo duda en la boca de su madriguera. Sabe que es el momento. Sale. Cruza un mundo que
cambia y se vuelve adverso (viento, lluvia, la ciudad, la nieve) hasta la cima. Y en la mitad
del mundo encuentra un sombrero de mago. Da el salto adentro: el conejo no sale del sombrero,
entra en él. Se vuelve la magia. La luz del fondo del sombrero se convierte en la marca.

## Dirección de arte (referencias de la usuaria)

- Fotografía de arte: luz dorada a contraluz, monocromo ámbar, bruma, halación, barrido de
  movimiento de larga exposición, grano de película. Un solo conejo (generado primero y usado
  como referencia en cada plano para que sea siempre el mismo).
- **Todo se funde:** disoluciones largas entre secuencias; la cámara respira; en el viaje la
  imagen "salta" con el conejo; grano y viñeta unifican.
- **El texto es parte del aire** (como en la referencia original): *Existen momentos* se
  acerca desde el desenfoque; *donde sabes,* entra fuera de foco y se enfoca (con el ojo);
  *que es tiempo de:* viaja con el conejo, el viento lo empuja y la lluvia lo desenfoca, y se
  aleja con el horizonte; *Dar el salto* sube con el arco del salto y cae dentro del sombrero.
- **Tinta que se funde:** sobre la luz, tinta cálida impresa (`multiply`); en la sombra (lluvia,
  ciudad), marfil que brilla (`screen`). Legible sin contrastar de golpe.

## Guion

| Tiempo | Plano | Texto | Sonido |
|---|---|---|---|
| 0–3.0 | Clip A (cámara lenta): duda en la madriguera | *Existen momentos* | Aire, pájaros, tres notas de piano que no resuelven |
| 2.7–5.3 | El ojo: el horizonte reflejado | *donde sabes,* | Un latido suave |
| 5.0–6.9 | Clip A: empuja y sale | — | Respiración, soplo, arpegio que asciende |
| 6.8–11.9 | Trigo · viento · lluvia · ciudad · nieve | *que es tiempo de:* | Un paso y una nota por mundo; cuerdas Re → Si m → Sol; el clima de cada lugar |
| 11.9–13.9 | La cima frente al mar de nubes | — | Las cuerdas se abren |
| 13.6–16.5 | El sombrero en la mitad del mundo | — | Silencio: aire y brillo de cristal |
| 16.2–20.0 | Clip B: se agacha, salta, entra | *Dar el salto* | Respira, vuelo, tela, cascada de campanas |
| 19.5–21.4 | Adentro del sombrero: la luz | — | Swell invertido, una respiración |
| 21.4–25.5 | C&O · *La Casa del Marketing* | — | Acorde cálido de piano, celesta, cuerdas bajas — sin sub-graves |

Master −16 LUFS, paso-altos a 45 Hz (nada revienta en el logo).

## Construcción

- `scripts/build-salto.mjs` — guion único: genera `compositions/story.html` y
  `assets/salto/salto-audio.m4a`. Edita ahí planos, tiempos, texto o sonido y corre `npm run build`.
- `scripts/sound.mjs` — motor de síntesis (piano de fieltro, cuerdas, campana, pasos, aire, reverb de convolución).
- `compositions/endcard.html` — cierre de marca (variable `tagline`).
- Medios en `assets/salto/`: `rabbit.jpg` (referencia del personaje), `201–211.jpg` (planos),
  `301.mp4` / `302.mp4` (clips Kling 3.0 de los dos saltos). `npm run fetch-media` los vuelve a bajar.

```bash
npm run build && npm run check
npm run render -- --quality delivery --output renders/dar-el-salto.mp4
```
