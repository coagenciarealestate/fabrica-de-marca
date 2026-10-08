# 01 · Ficha de propiedad (el CONTEXTO del guion)

La ficha contiene las variables que cambian en cada guion. La estructura es fija; la ficha llena sus espacios.

## Plantilla

```yaml
slug: domus-san-patricio-5a          # carpeta en propiedades/
nombre_comercial:                     # proyecto / edificio
tipo:                                 # apartamento | casa | penthouse | dúplex | lote
estado:                               # entregado | en obra (fecha de entrega) | sobre planos   ← CRÍTICO
precio:                               # el que pide el cliente                                  ← CRÍTICO
precio_referencia:                    # lo que piden la constructora o comparables
area_m2:
precio_m2:                            # calcular: precio / área
ubicacion:
  direccion:
  barrio:
  localidad:
  conectividad: []                    # vías, solo las confirmadas
  referentes_cercanos: []             # parque, centro comercial, colegios (verificar)
distribucion:
  habitaciones:
  banos:
  estudio:                            # sí/no — muy valorado en el segmento
  terraza_balcon:
  cocina:
  lavanderia:
  parqueaderos:
  deposito:
edificio:
  unidades:                           # pocas unidades = exclusividad
  amenidades: []
  seguridad: []
  sostenibilidad: []
lo_unico:                             # lo que ningún comparable de su precio tiene               ← CRÍTICO
material_visual:                      # qué se puede grabar: apto real, apto modelo, renders, drone, rooftop
cliente:
  objetivo:                           # vender en X tiempo, precio mínimo, etc.
  restricciones:                      # no mostrar precio, no mostrar fachada, etc.
por_verificar: []                     # todo dato que no esté confirmado
```

## Reglas de extracción

1. **Confirmado vs. por verificar.** Si un dato viene de la página de otra tipología, de un portal de terceros o de una suposición, va a `por_verificar` y se marca ⚠ en el guion.
2. **El estado manda el formato.** Entregado → recorrido real. En obra o sobre planos → apto modelo, renders, sala de ventas, avance de obra. Nunca grabes "recorrido" de un inmueble que no existe todavía sin aclararlo.
3. **Precio vs. referencia.** Si el cliente pide más que la constructora o que los comparables, hay que saber por qué (piso, vista, acabados, entrega inmediata). Esa razón suele ser *Lo único*.
4. **Lo único** se encuentra con tres preguntas:
   - ¿Qué tiene este inmueble que no tiene otro del mismo precio en la misma zona?
   - ¿Qué resuelve que al avatar le duela hoy?
   - ¿Qué se ve en un solo plano, sin explicación?
5. **Nada de adjetivos en la ficha.** Solo hechos. Los adjetivos los pone el espectador.
