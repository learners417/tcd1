# Modelo de datos

Todo lo que la app guarda. Un cliente, noventa jornadas, un ADN.

**Principio.** El seed es inmutable y el progreso es del cliente. `roadmap.seed.json`
define el camino para todos; `progreso` guarda lo que cada uno hizo. Cambiar el
camino nunca toca el progreso de nadie.

---

## Colecciones

```
cliente
  id, nombre, profesion, pais, email, telefono
  dia_actual                 entero 0..90+
  fecha_inicio
  cinturon_actual            id del grado
  hora_bloque_1              cuando arranca su jornada, elegida el día 1
  mentoria                   bool · habilita la cuarta opción del SOS
  sistema_subcuenta_id       id de GHL
  mcd_cliente_id

adn                          documento único por cliente · ver 00-MAESTRO §7
  actualizado_en
  campos_completos[]         qué secciones ya tienen datos

progreso                     una fila por jornada por cliente
  cliente_id, dia
  estado                     pendiente | en_curso | evidencia | en_revision
                             | a_corregir | completa | frenada | campo
  abierta_en, completada_en
  pasos_tildados[]
  minutos_reales             cuánto tardó de verdad

evidencia                    una fila por evidencia entregada
  cliente_id, dia, nombre, tipo
  valor                      número, texto o referencia a archivo
  estado                     pendiente | en_revision | aprobada | a_corregir
  intentos                   entero
  motivo_rechazo             máximo tres puntos
  validada_por               regla | agente | webhook
  validada_en

cinturon_otorgado
  cliente_id, cinturon_id, otorgado_en, en_ventana

cuaderno                     privado · nunca se edita, solo se agrega
  cliente_id, dia, tipo, contenido, creado_en

pieza_creativa               el banco de Creativos
  cliente_id, id, tipo, titulo, estado
  guion, version, gancho, formula, marcas_camara
  archivo_crudo, archivo_editado, duracion
  meta_ad_id
  dias_al_aire, gasto, entradas, agendas, costo_por_agenda
  veredicto                  ganador | promedio | retirado
  motivo_retiro              obligatorio al retirar

campana
  cliente_id, meta_campaign_id, rama
  encendida_en
  objetivo_costo_agenda
  escalones[]                { semana, presupuesto, costo_por_agenda, decision }

ring                         historial de sparring
  cliente_id, fecha, tipo
  minuto_precio, preguntas_antes, segundos_silencio, pidio_decision
  resultado, una_cosa

conversacion_agente
  cliente_id, agente_id, dia, mensajes[], resultado_guardado_en

sos
  cliente_id, dia, opcion, resuelto_con
```

---

## El seed

`roadmap.seed.json` tiene seis bloques.

| Bloque | Filas | Qué define |
|---|---|---|
| `sistemas` | 5 | Los cinco bloques del camino |
| `piezas` | 43 | Los videos de Javo |
| `tutoriales` | 21 | Los de Lupe |
| `cinturones` | 11 | Los grados, con color y punta |
| `agentes` | 8 | Día de apertura y condición |
| `frenos` | 9 | Reglas duras con su mensaje |
| `jornadas` | 91 | Del día 0 al 90 |

### Estructura de una jornada

```json
{
  "dia": 25,
  "tipo": "sesion",
  "titulo": "Tu página, publicada",
  "sistema": 3,
  "minutos": 120,
  "piezas": ["P4.2d"],
  "tutoriales": ["L-05", "L-06"],
  "agente": "escriba",
  "manual": null,
  "acceso": null,
  "pasos": ["...", "..."],
  "evidencias": [
    { "tipo": "url", "nombre": "El enlace vivo",
      "valida": "200, contiene la promesa, botón de agenda, carga en móvil" }
  ],
  "adn_escribe": ["sistema.url_pagina"],
  "freno_activa": ["F-PAGINA"],
  "freno_levanta": [],
  "cinturon": "5gup",
  "jornada_larga": true,
  "acciones_campo": [],
  "nota": null
}
```

### Tipos de jornada

| Tipo | Cantidad | Qué muestra la pantalla Hoy |
|---|---|---|
| `entrega_tecnica` | 1 | No la ve el cliente |
| `sesion` | 42 | Tarjeta con video, pasos y evidencia |
| `protocolo` | 6 | Tarjeta del Espejo, sin video, 20 min |
| `rodaje` | 2 | Modo rodaje a pantalla completa |
| `campo` | 10 | Tres acciones concretas |
| `ciclo` | 29 | Las cinco tarjetas de la semana |
| `cierre` | 1 | La forma final |

---

## Los números verificados del camino

Contados sobre el seed, no estimados.

| | |
|---|---|
| Jornadas | 91 (día 0 al 90) |
| Piezas de video de Javo | 43 · **279 minutos** |
| Tutoriales de Lupe | 21 · 106 minutos |
| Evidencias | 69 |
| Cinturones | 11 |
| Agentes | 8 |
| Frenos | 9 |
| **Trabajo total del cliente** | **4.265 minutos ≈ 71 horas** |

**71 horas en noventa días** son unas cinco horas y media por semana. Es la cifra
honesta para la bienvenida, y es la que hay que decir en vez de un promedio
diario que se rompe en la semana 5.

---

## Máquina de estados de una jornada

```
                    ┌──────────┐
   día llega  ──→   │ pendiente│
                    └────┬─────┘
                         │ abre
                    ┌────▼─────┐
                    │ en_curso │ ←─────────┐
                    └────┬─────┘           │
                         │ tildó pasos     │
                    ┌────▼─────┐           │
                    │ evidencia│           │
                    └────┬─────┘           │
                         │ sube            │
                   ┌─────▼──────┐          │
                   │ en_revision│          │
                   └──┬──────┬──┘          │
              aprueba │      │ rechaza     │
                      │      └─────────────┘
                 ┌────▼────┐         a_corregir
                 │ completa│
                 └─────────┘
```

**Frenada** es transversal: cualquier estado puede pasar a `frenada` si se activa
un freno, y vuelve al estado anterior cuando se levanta.

---

## Validación de evidencias

| Tipo | Cómo se valida | Quién |
|---|---|---|
| `numero` | Rango, formato, coherencia con otro campo del ADN | Regla |
| `texto` | Rúbrica del agente correspondiente | Agente |
| `imagen` | Lista de elementos que tienen que aparecer | Agente de visión |
| `url` | Se visita: 200 + elementos requeridos + carga en móvil | Regla |
| `archivo` | Duración mínima, audio presente, transcripción contra rúbrica | Regla + agente |
| `evento` | Webhook desde GHL o desde Meta | Sistema |

**El rechazo devuelve como máximo tres puntos y la sesión a repasar.** A la
tercera corrección seguida, la app sugiere el agente correspondiente.

---

## Eventos que entran desde afuera

| Evento | Origen | Qué dispara |
|---|---|---|
| `pago_recibido` | GHL | Evidencias de los días 9, 12, 45, 53. Cuenta para el negro |
| `agenda_completada` | GHL | Evidencia del día 28. Alimenta el tablero |
| `formulario_respondido` | GHL | Parte de la agenda calificada |
| `grabacion_activada` | GHL | Evidencia del día 39 |
| `llamada_grabada` | GHL | Alimenta el Ring y la autopsia |
| `pixel_activo` | Meta | Evidencia del día 29 |
| `campana_activa` | Meta | Evidencia del día 31. Otorga 3.º gup |
| `metricas_diarias` | Meta | Gasto, entradas. Alimentan el tablero |
| `consultante_alta` | MCD | Cuenta para el cinturón negro |

**Si una integración cae, la app pide el dato a mano y sigue.** Ninguna pantalla
del camino puede depender de que un tercero esté disponible.

---

## Reglas de escritura del ADN

1. **Cada jornada declara qué escribe.** El campo `adn_escribe` del seed.
2. **Nada se pide dos veces.** Si un campo ya tiene valor, la sesión lo muestra y
   pregunta si cambió.
3. **El precio sellado no se edita sin pasar por el Espejo.** Es el único campo
   con esa regla.
4. **El cuaderno nunca escribe al ADN automáticamente.** Es privado. Solo el
   permiso del día 43 y los tres que formaron pasan a `historia`, y con aviso.

---

## Versionado del camino

El seed lleva `version`. Cuando cambia:

- **Clientes en curso siguen con su versión.** Nunca se migra a alguien a mitad
  de camino.
- **Clientes nuevos arrancan con la última.**
- **Un cambio de piezas de video no cambia versión** si el día y la evidencia son
  los mismos: se reemplaza el archivo y listo.
- **Un cambio de orden, de evidencia o de cinturón sí cambia versión.**
