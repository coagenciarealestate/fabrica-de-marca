# 03 · Estructura maestra · Recorrido narrado con agente a cámara

> Estilo aprobado por C&O (octubre 2026). Base: el libreto del agente para DOMUS San Patricio (`examples/domus-san-patricio.md`).
> El agente **recorre el inmueble y lo describe**, en el orden en que se camina, con lenguaje simple y cercano. Nada de frases ingeniosas, juegos de palabras ni cuentas creativas ("117 → 600"): el valor está en los datos y en el recorrido.

Cada inmueble lleva **dos guiones**, con el mismo recorrido y distinto manejo del precio:

| | Guion 1 · Precio primero | Guion 2 · Suspenso |
|---|---|---|
| Objetivo | Segmentar: quien no tiene el presupuesto se va en 3 s | Retener: el precio se revela al final |
| Primera frase | Precio + sector | Metraje + zonas comunes + sector |
| Loops | 0–1 | 5–6 |
| Duración | 50–60 s | 65–80 s |
| Mejor para | Pauta, Facebook | TikTok e Instagram orgánico |

---

## Guion 1 · Precio primero

| Bloque | Plantilla | Imagen |
|---|---|---|
| **Precio** (0–4 s) | "Por `{precio}`, este es el apartamento que te puedes llevar en `{sector}`, `{frase de deseo del sector}`." | Agente a cámara en la puerta. Texto: precio + sector |
| **Datos + escasez** (4–8 s) | "`{m²}` metros cuadrados, `{dato fuerte 2}`, y `{escasez}`. Acompáñame." | El agente abre y entra |
| **Recorrido** (8–34 s) | Espacio por espacio, en el orden en que se camina: "Al entrar te recibe… Sigues y llegas a… En la principal…" | Un plano por espacio |
| **Extras** (3–4 s) | "Además, `{parqueaderos}` y `{depósito}`." | Corte rápido al sótano |
| **Zonas comunes** (10–12 s) | Lista con el uso de cada una: "coworking para trabajar, teatrino para maratonear tu serie…" | 2 s por zona |
| **Cierre** (5–7 s) | "`{precio}`, `{escasez}`. Escríbenos y agendamos tu visita." | Agente a cámara |

## Guion 2 · Suspenso

| Bloque | Plantilla | Imagen |
|---|---|---|
| **Titular** (0–7 s) | "Este apartamento en venta tiene `{m²}`, `{dato fuerte 2}`, y está en `{frase de deseo del sector}`: `{sector}`." | Agente a cámara en la puerta |
| **Promesa** (5 s) | "Acompáñame a descubrir por qué no hay otro apartamento así en este sector, ni por este precio." | Abre la puerta. Texto: "¿Y el precio?" |
| **Espacio 1** | Lo que te recibe al entrar | Plano abierto |
| **Loop** | "Pero esto es apenas la entrada." | El agente sigue caminando |
| **Espacio 2** | Zona social / habitaciones | Recorrido |
| **Loop** | "Y la habitación principal guarda una sorpresa." | Se detiene frente a la puerta |
| **Espacio 3** | Lo mejor de la principal (walking closet, baño, balcón) | Revelación |
| **Loop** | "Y eso no es todo lo que tiene este apartamento." | Corte seco |
| **Extras** | Parqueaderos, depósito | Sótano |
| **Loop** | "Ahora sí, lo que hace que no tenga comparación: `{zonas comunes / diferencial}`." | Ascensor que se abre |
| **Zonas comunes** | Lista con el uso de cada una | 2 s por zona |
| **Precio** | "¿Y el precio? `{escasez}`, y puedes comprarlo por `{precio}`." | Agente a cámara |
| **Cierre con loop** | "Aún quedan espacios por mostrarte. Si quieres verlos todos, comenta  y te enviamos el recorrido completo." | Camina hacia una puerta cerrada |

---

## Reglas del estilo C&O

1. **Recorrido en orden real.** Se describe como se camina: "al entrar", "al continuar", "en esta misma habitación".
2. **Cada espacio con su dato concreto:** "ventana de piso a techo insonorizada", "walking closet amplio", "balcón privado". Un adjetivo como máximo por espacio.
3. **Las zonas comunes llevan su uso:** "coworking *para trabajar cómodamente*", "teatrino *para maratonear la serie que quieras*".
4. **Frase de deseo del sector** en la apertura: "el sector donde todos quieren vivir en Bogotá".
5. **Escasez y privilegio reales:** "la única unidad que nos queda disponible", "el último de la colección", "entrega inmediata", "las demás unidades ya tienen dueño", "visita privada", "un privilegio que solo disfrutan los residentes". Solo si es cierto.
6. **CTA con loop abierto + comentario (los dos guiones):** el cierre deja algo sin mostrar y pide la palabra clave en comentarios. Ej.: "**Y aún hay espacios que no te he mostrado.** Comenta  y te envío el recorrido completo para tu visita privada." Así los comentarios piden información y activan la respuesta automática.
7. **Loops cortos (3–8 palabras)**, dichos mirando a cámara, siempre justo antes de un espacio mejor que el anterior. Si lo que sigue no es mejor, no se pone loop.
8. **Voz cercana:** tutea, "acompáñame", "tendrás", "te recibe". Frases que suenan habladas, no escritas.
9. **Frases de sector aprobadas:** "el sector donde viven las personas más exclusivas de Bogotá" (Guion 1, segmento alto), "el sector donde todos quieren vivir en Bogotá".

## Formato de salida
Tabla de 3 columnas: **Tiempo | Lo que dice el agente | Lo que se ve**. Los loops van en **negrita**. Texto en pantalla en negrita dentro de "Lo que se ve".
