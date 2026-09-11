# Mando · Creativos

Primera solapa del tab Mando. Se abre el día 26, cuando el Escriba escribe el
primer guion, y no se cierra nunca más.

**Qué resuelve.** Hoy el cliente escribe guiones en notas del teléfono, graba en
la galería, edita en una app suelta y sube a Meta desde otro lado. Cuatro
lugares, ningún estado, y a las tres semanas no sabe cuál anuncio era cuál.

**La idea central: una pieza tiene estados y se ve dónde está cada una.**

---

## El estado de una pieza

```
idea → guion → aprobado → grabado → editado → listo → activo → ganador
                                                          ↓
                                                       retirado
```

| Estado | Qué significa | Quién lo mueve |
|---|---|---|
| `idea` | Un gancho suelto, una frase, una nota de voz | El cliente |
| `guion` | Escrito, sin revisar | El Escriba |
| `aprobado` | Revisado y con las pausas marcadas | La Cámara |
| `grabado` | Archivo crudo subido | El cliente |
| `editado` | Con subtítulos y sin cola | El cliente |
| `listo` | En la biblioteca de Meta | Automático al subir |
| `activo` | Corriendo en una campaña | Meta |
| `ganador` | Costo por agenda por debajo de su promedio | El Tablero |
| `retirado` | Apagado, con el motivo escrito | El cliente o el Tablero |

**Regla:** una pieza `retirada` nunca se borra. Su guion queda, y con el motivo
escrito al lado. **El banco de piezas retiradas es la única fuente real de
aprendizaje que va a tener.**

---

## Los tipos de pieza

| Tipo | Para qué | Dónde vive | Duración |
|---|---|---|---|
| `anuncio` | Traer a la página | Meta | 30 a 60 seg |
| `vsl` | Convertir en la página | Su página | 8 a 15 min |
| `preparacion` | Bajar el ausentismo a la llamada | Página de preparación | 2 a 3 min |
| `entrega` | Sus etapas, adentro de su app | Su app | 3 a 7 min |
| `organico` | Contenido del plan trimestral | Sus redes | libre |

**El tipo `organico` está bloqueado dentro de los noventa días.** Se puede
escribir, no se puede grabar ni publicar. Se desbloquea el día 91.

---

## Pantalla principal

Tres bloques, en este orden.

**1 · En cámara.** Lo que está esperando que lo grabe, con la cuenta. Si hay algo
en estado `aprobado`, es lo primero que ve. Con la fecha de rodaje al lado.

**2 · Corriendo.** Las piezas `activo`, con su costo por agenda al lado y los días
que llevan al aire. La `ganador` marcada con una tira dorada de un píxel.

**3 · El banco.** Todo lo demás, filtrable por tipo y por estado. Buscador por
texto del guion.

**Lo que no tiene:** carpetas, etiquetas libres, colores personalizables. Un
cliente que organiza su banco de creativos es un cliente que no está grabando.

---

## La ficha de una pieza

```
PIEZA
  id, tipo, titulo, estado, creada, actualizada

GUION
  texto            el guion completo, editable
  version          cuántas veces se reescribió
  marcas_camara    pausas y frases marcadas
  gancho           la primera línea, aparte y buscable
  formula          de qué estructura salió

ARCHIVO
  crudo            el archivo como salió de la cámara
  editado          con subtítulos
  duracion, peso

RENDIMIENTO        solo para tipo anuncio
  dias_al_aire
  gasto
  entradas
  agendas
  costo_por_agenda
  veredicto         ganador | promedio | retirado

APRENDIZAJE
  motivo_retiro     texto libre, obligatorio al retirar
```

---

## Las fórmulas

El Escriba escribe desde estructuras, no desde cero. La app trae un banco de
fórmulas con su nombre, su forma y un ejemplo.

**Decisión tomada:** entra al producto la parte del manual de anuncios que sirve
al embudo de página con VSL. **Queda afuera** todo lo que es de campañas de
mensajes, de sistemas de cupos con DM y de motores de recuperación, porque no es
lo que este cliente corre en estos noventa días y solo le agrega ruido.

Cada fórmula se muestra así:

```
NOMBRE DE LA FÓRMULA
Para qué sirve · en una línea
La forma · los bloques en orden
Un ejemplo · escrito con SU avatar, no genérico
```

**El ejemplo se genera con su ADN.** Una fórmula con ejemplo genérico se ignora;
una con su avatar adentro se copia.

---

## Modo rodaje

Se activa el día del rodaje y toma la pantalla completa.

**Qué hace**
- Una pieza por pantalla, en el orden de grabación que definió
- El guion en letra grande, avanzable con el pulgar
- Las marcas de la Cámara visibles: pausas y frase que queda
- Contador de tomas: **a la tercera, la app le dice que cambie la primera frase y
  deje el resto igual**
- Botón de una sola función: marcar como grabado y pasar a la siguiente
- Modo no molestar activado

**Lo que bloquea**
- No se puede reproducir lo grabado hasta terminar toda la jornada
- No se puede volver a una pieza ya marcada
- No hay notificaciones

**Al cerrar la jornada**, muestra el resumen: piezas grabadas, tomas totales,
tiempo real. Y recién ahí habilita la reproducción.

---

## Las dos jornadas tienen reglas distintas

| | Rodaje A · día 27 | Rodaje B · día 52 |
|---|---|---|
| Qué graba | VSL, 3 anuncios, preparación | 4 videos de entrega |
| Set | Armado, luz, ropa, micrófono | Ninguno. Teléfono o pantalla |
| Tomas | Hasta tres por pieza | **Una sola** |
| Edición | Corta, subtítulos, sin música | Ninguna. Se sube como salió |
| Por qué | Lo va a ver alguien que no lo conoce | Lo ve alguien que ya le pagó |

La app muestra esta tabla antes de cada jornada. **La regla de la toma única del
día 52 hay que defenderla:** quien intenta hacer perfectos los videos de entrega
nunca termina de cargar su app.

---

## La señal de fatiga

El Tablero avisa acá, no en Campañas, porque la acción es grabar.

**Cuándo aparece:** cuando el costo por agenda de una pieza `activo` sube más de
un tercio respecto de su mejor semana, sostenido tres días.

**Qué muestra:**
> *Tu anuncio 2 está cansado. Su costo por agenda pasó de $X a $Y en cinco días.
> Grabá una variante esta semana: mismo guion, gancho nuevo.*

**Qué ofrece:** el Escriba con el guion de esa pieza cargado y tres ganchos
nuevos para el mismo cuerpo.

**Lo que no hace:** apagar solo. La decisión es del cliente, el lunes, en el panel
de Campañas.

---

## Métricas de la pantalla

Tres números arriba, y ningunos más:

| Número | Qué dice |
|---|---|
| Piezas listas | Cuántas tiene para usar hoy |
| Piezas al aire | Cuántas están corriendo |
| Su mejor costo por agenda | De qué pieza, y de qué semana |

**Lo que se saca de la vista:** vistas, alcance, likes, guardados, compartidos,
reproducciones de tres segundos. Nada de eso decide nada y todo eso entretiene.
