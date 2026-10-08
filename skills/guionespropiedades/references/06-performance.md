# 06 · Performance: el video existe para vender

## La jerarquía de métricas C&O
| Nivel | Métrica | Qué dice |
|---|---|---|
| 1 (manda) | **Visitas agendadas / ofertas** | Vendió o está cerca |
| 2 | **DMs calificados** (piden precio, plano, visita, forma de pago) | Hay comprador |
| 3 | **Comentarios de intención** (palabra clave, "¿precio?", "¿dónde queda?", "¿aún disponible?") | Hay interés real |
| 4 | **Shares por DM** | Lo mandaron a quien decide con ellos |
| 5 | Retención y vistas completas | El guion funciona |
| 6 (vanidad) | Vistas, likes, seguidores | Solo sirven si mueven 1–4 |

**Indicador norte:** `DMs calificados por cada 1.000 vistas` (DQ/1k). Con él se comparan videos, titulares y formatos.

## Cómo se diseña la conversión en el guion
1. **Precio en el video.** Filtra a quien no puede comprar y le ahorra tiempo al agente. Un comentario de "¿precio?" se ve como interés, pero casi siempre es curiosidad.
2. **CTA con palabra clave** (`DOMUS`, `PLANO`, `VISITA`). Se responde con una automatización o un mensaje plantilla y permite medir qué video generó el lead.
3. **Pedir el siguiente paso pequeño**, no la compra: "el plano y los pisos disponibles", "el video completo", "una visita de 20 minutos".
4. **Share de compra:** "Mándaselo a quien compra contigo". El share a la pareja o al socio tiene más intención que el share por entretenimiento.
5. **Responder la objeción principal dentro del video**, no en los comentarios.

## Referentes: cómo elegirlos (alta calificación de compra)
No se copia lo viral. Un video entra al banco de referentes cuando cumple **al menos 2 de estas 4**:
- Más del 30 % de los comentarios preguntan precio, ubicación, disponibilidad o visita.
- El creador responde "te escribo por DM" en muchos comentarios (señal de flujo de leads).
- Es de un agente o inmobiliaria con inventario real (no un creador de entretenimiento).
- Se publicó en una cuenta que repite el formato. Si lo repite, es porque le vende.

### Registro de referentes
Guardar en `propiedades/_referentes.md` con este formato:

| Link | Cuenta | Formato | Titular | % comentarios de intención | Patrón de marketing | Patrón de producto (qué tipo de inmueble piden) |
|---|---|---|---|---|---|---|

La última columna sirve para separar **producto** de **marketing**: si los comentarios piden "¿tienen algo así con 2 parqueaderos?", "¿hay de 3 habitaciones?" o "¿algo en Usaquén?", es demanda de producto, y va a `02-demanda-y-avatares.md`.

## Registro de resultados (cierra el ciclo)
Por cada video publicado, en `propiedades/_resultados.csv`:
`fecha, slug, formato, titular, plataforma, vistas, retencion_3s, vistas_completas, shares, comentarios_intencion, dms_calificados, visitas, oferta`

Cada 10 videos:
- El titular con mejor DQ/1k pasa a ser fórmula preferida en `05-titulares.md`.
- El formato con peor DQ/1k baja de prioridad.
- Los atributos que más se repiten en DMs actualizan la tabla de demanda.
