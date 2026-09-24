# TAREA PARA CLAUDE CODE — "Sala de Mando" en el modo Admin de la app TCD (v3, final)

Reemplaza las versiones anteriores. Tab nueva en el modo Admin, visible solo para admins. No toca la experiencia del cliente ni la escalera de planes.

Todo lo que sigue está decidido. Cargalo tal cual como datos semilla.

---

## 0. LEER PRIMERO — cómo se conecta con lo que YA existe

Esta tab no arranca de cero. El modo Admin ya tiene **nueve tabs funcionando**: clientes, pipeline, mensajes, métricas, videos, equipo, campañas, creativos y tareas. Buena parte de lo que pide este documento ya está construido. **No lo dupliques: enchufate.**

### Lo que NO se crea de nuevo

| El documento pedía | Lo que YA existe | Qué hacer |
|---|---|---|
| Tabla `sala_tareas` | `admin_tareas` + `admin_tareas_checklist` + `admin_tareas_comentarios` + `admin_tareas_adjuntos`, con filtros, scopes y archivado (`src/lib/adminTasks.ts`) | **Usar `admin_tareas`.** Solo agregarle dos columnas: `origen` y `ref` |
| Tabla `sala_clientes` | `profiles`, que ya tiene plan, ADN, fecha de inicio y todo el recorrido | **Extender `profiles`**, no crear una tabla paralela |
| Vista "Tareas" | Tab `tareas` + `TasksPipeline.tsx` + `admin/tasks/` (Kanban, lista, filtros) | Reusar los componentes. La Sala filtra, no reimplementa |
| Vista "Campañas" | Tabs `campanas` y `creativos`, ambas con selector de cliente | La Sala aporta **la vista comparativa entre clientes**, que es lo único que falta |
| Vista "Equipo" | Tab `equipo` (visible solo para `owner`) | Sumarle roles, techos y el checklist de traspaso |

### Estados de tarea — usar los que ya existen

El documento inventaba `pendiente / en_proceso / listo / no_aplica`. El tipo real es `AdminTareaStatus` en `src/lib/supabase.ts`:

```
'por_hacer' | 'en_proceso' | 'en_revision' | 'completadas'
```

**Usá esos cuatro.** Cambiar el enum rompe el Kanban, los filtros y el pipeline que ya andan.

### Tablas que sí son nuevas

Solo estas siete, porque no existe nada equivalente: `sala_hitos`, `sala_roles`, `sala_traspaso`, `sala_rituales`, `sala_reuniones`, `sala_decisiones`, `sala_etapas`, `sala_riesgos`, `sala_alertas`, `sala_motor`.


### Lo que TAMBIÉN existe y descubrimos después (no duplicar)

| Ya construido | Dónde | Qué significa |
|---|---|---|
| **El checklist de lanzamiento entero** | `src/lib/preactivacionSteps.ts` — 14 bloques, 62 ítems, cada uno con responsable y 4 estados, más `PreactivacionMatriz.tsx` y la tabla `cliente_preactivacion_check` | La pregunta "cómo lanzamos verificando lo que falta" **ya tiene respuesta en la app**. La Sala lo lee, no lo reescribe |
| **Campañas y creativos por cliente** | tablas `campanas`, `creativos`, `creativo_assets` | La Sala aporta la **comparativa entre clientes**, nada más |
| **El progreso en El Camino** | `hoja_de_ruta`, `session_logs`, `profiles` | El semáforo sale de acá |

### Sobre MCD

**MCD no aporta datos y no hay que esperarlo.** Hoy la conexión es un `window.open` en el
menú lateral: un enlace, nada más. El repo `miclinica-app` es un esqueleto de ~13 archivos
con login, registro y un dashboard que muestra las 7 fases — sin Personas, sin receptor de
protocolo, sin bot. **El progreso real del cliente vive en TCD**, que es de donde la Sala
tiene que leerlo. Cuando MCD tenga contenido propio se conecta; antes no hay nada que traer.

### La carga de números: tres etapas, y la primera arranca ya

El orden de la sección 14 dice "conexiones primero". Se mantiene como **objetivo**, pero
no como bloqueo: la Sala tiene que servir desde el día uno con carga manual.

1. **A mano** — cinco números por anuncio, una vez por semana. Tabla `sala_metricas_semana`.
   Dos minutos por cliente. La app calcula y decide igual.
2. **Reporte programado de Meta** — Ads Manager manda un CSV por mail solo. Se configura
   una vez por cuenta, sin programar nada. Va **antes** que la API.
3. **API de Meta** — trae los números sola. Necesita acceso de socio en cada portafolio y
   un token de sistema.

**La condición de diseño:** el modelo de datos es el mismo en las tres etapas. Solo cambia
quién escribe la fila. Si la carga manual tarda más de dos minutos por cliente, está mal
hecha y hay que arreglar el formulario, no pedir más gente.

### SQL de conexión

El SQL completo, listo para pegar en Supabase, está en **`sala-de-mando.sql`**. Resumen:

```sql
-- Las tareas de la Sala son tareas normales, con procedencia
ALTER TABLE admin_tareas
  ADD COLUMN origen text
    CHECK (origen IN ('manual','matriz','diagnostico','riesgo','reunion'))
    DEFAULT 'manual',
  ADD COLUMN ref uuid;

-- El recorrido vive en el cliente, no en una tabla espejo
ALTER TABLE profiles
  ADD COLUMN ola smallint,
  ADD COLUMN fecha_venta date,
  ADD COLUMN fecha_activacion date,
  ADD COLUMN etapa_actual smallint,
  ADD COLUMN etapa_desde date,
  ADD COLUMN semaforo text CHECK (semaforo IN ('verde','amarillo','rojo')),
  ADD COLUMN dueno text;
```

**Regla:** todo campo nuevo de `profiles` que la app lea después desde el navegador tiene que sumarse al espejo de `syncProfileToLocalStorage` en `src/lib/auth.ts`, o la lente 8.1 revienta la batería. Eso ya pasó una vez: `plan_comercial` no estaba en el espejo y toda la escalera de planes quedó abierta.

### Fechas ya pasadas

Las tareas de la semana de conexiones (27–31 de julio) vencen antes de que esto esté desplegado. Cargalas con su fecha real, pero la vista **Hoy** tiene que distinguir *vencida* de *cargada ya cumplida*. Si no, la Sala de Mando abre en rojo el primer día por trabajo que ya se hizo.

---

## 1. El eje — leer esto antes que nada

**Esto no es un panel para gestionar 20 clientes. Es un producto que se instala solo, con un equipo que atiende excepciones.**

La diferencia no es semántica. Un panel es un lugar donde el equipo *anota lo que hizo*: cuantos más clientes, más gente hace falta. Una cola de excepciones es lo contrario: la app hace el trabajo y llama a un humano solo cuando algo se rompe. El primero tiene techo en once. El segundo escala a veinte con dos personas.

**La prueba de que está bien construida:** si el operador termina atendiendo a los veinte por igual, está mal. Con veinte cuentas, entre seis y siete deberían necesitar a un humano en una semana dada. Los otros trece los sostiene la app.

**De dónde sale el tiempo.** Hoy cada cliente consume unos 90 minutos semanales de humano: 30 de 1‑1, ~50 de contacto diario y ~10 de carga de datos. Once clientes son 16,5 horas — la semana entera de una persona, y por eso el modelo tiene techo ahí. Para que entren veinte, el promedio tiene que bajar a **30 minutos**. No se llega recortando: se llega sacándole el trabajo al humano.

| Trabajo | Hoy | Después | Cómo |
|---|---|---|---|
| Carga de datos de campaña | ~10 min | 0 | Meta Ads API |
| Contacto diario | ~50 min | ~5 min | La app avisa al cliente; el operador lee un resumen |
| 1‑1 semanal | 30 min | ~10 min promedio | Solo el que está en amarillo o rojo |

**Regla de diseño:** ningún dato que ya existe en un sistema lo escribe una persona. Si el operador transcribe lo que Meta ya sabe, el techo vuelve a once solo.

---

## 2. Los cargos — no las personas

Los sistemas no se arman alrededor de quién está hoy. Se define el cargo y después se busca quién lo ocupa. Los nombres de las personas son un dato en `sala_roles`, no una decisión de arquitectura.

### Dueño del criterio
Decide qué es un buen creativo, qué precio se sostiene y cuándo se apaga una campaña.

**Su criterio ya está escrito en código:** las 18 fórmulas de `formulasAnuncios.ts`, la regla 1 piedras + 1 dolor + 1 resultado, los 8 ingredientes con `auditarPieza()`, y los umbrales de `UMBRALES` y `veredictoAnuncio()`. La Sala de Mando **corre eso sobre las 20 cuentas todas las noches** y le muestra solo lo que la regla no resolvió.

Su trabajo deja de ser aplicar el criterio veinte veces. Pasa a ser corregirlo cuando falla. Entra solo por la cola.

### Operador de cuentas
No hace "seguimiento". **Trabaja la cola de excepciones.** Ve al que está en rojo, no a los veinte.

Sostiene: la cola del día · el 1‑1 de los que la app marcó · que el criterio del dueño se ejecute.
No toca: creativos, oferta, pauta, nada técnico.
La app le absorbe: la carga de datos, el contacto diario y la detección de riesgos.

### Instalador de sistemas
Conexiones, bot de DM, dominios, links de pago, automatizaciones.

**Su entregable NO es "conectar clientes". Es un snapshot de GHL** que se aplica a cada cuenta nueva: se construye una vez, se mejora una vez, se empuja a todos. El alta pasa de horas a minutos. Si cada cliente se conecta a mano, este cargo también tiene techo en once.

### Productor
Edita video, carruseles y portadas.

**Este es el cargo que hoy no existe y el que más libera al dueño**, porque el cliente que no produce es el que genera toda la cola. Ver la sección 2.6.


### El cargo que se cierra

Hay un puesto en transición: el que hoy sostiene la operación de TCD deja de existir el **31 de agosto**. Lo que sostiene no puede quedar sin dueño — cada ítem migra a un cargo, no a una persona.

| Qué se entrega | A qué cargo |
|---|---|
| Checkout, links de pago, botones | Instalador de sistemas |
| Bot de WhatsApp y automatizaciones | Instalador de sistemas |
| Embudo del $27 y sus páginas | Instalador de sistemas |
| Leads, triage y agendas | Dueño del criterio |
| Copy de mensajes y guiones de setting | Dueño del criterio |
| El número del negocio y el control de cobros | Dueño del criterio |

Mientras el traspaso no esté en cero, la app muestra cuántos ítems quedan y qué cargo los tiene. **Ningún ítem sin dueño.** Va en `sala_traspaso`.

Quien deja el puesto entra al recorrido **como cliente**, con el Dueño del criterio como responsable — y **no cuenta contra el techo del Operador**.

---

## 2.5 Las conexiones — sin esto no hay veinte clientes

| Conexión | Qué trabajo humano mata | Cargo |
|---|---|---|
| **Meta Ads API** | La transcripción manual de gasto, alcance, conversaciones y costo | Instalador |
| **Instagram Graph API** | Mirar veinte perfiles a mano para saber quién publicó | Instalador |
| **Bot de DM** (GHL o ManyChat) | La respuesta inmediata y las 3 preguntas de calificación | Instalador |
| **Snapshot de GHL** | Las horas de alta de cada cliente nuevo | Instalador |

Sobre el bot: la respuesta automática tiene que llegar en **menos de un minuto** — ningún humano llega siempre, y el lead de anuncios se enfría en minutos. Y el flujo de bienvenida decide la mitad del resultado: tres mensajes limpios convierten dos a cuatro veces mejor que diez de venta dura. El bot califica; el humano cierra.

---

## 2.6 Aliviar el tiempo del CLIENTE

Los trece riesgos de la sección 5 son todos el mismo problema: **el cliente no produce.** Si produce solo, la cola se vacía y el equipo alcanza de sobra. Por eso esto es la palanca más grande, y va antes que cualquier vista nueva.

**Landings dentro de la app — primero, es lo más barato.** La página de VSL y la del lead magnet son plantilla más relleno desde el ADN, que la app ya tiene sellado. El sistema de diseño ya existe (Fraunces, Sora, negro/oro/marfil) y ya hay páginas construidas para clonar. No es construir: es rellenar. El cliente elige plantilla, la app la completa con su método, su oferta y su palabra clave, y le devuelve el HTML.

**Carruseles, portadas y stories — está a medias.** Ya existen `CreativoStudio`, `CreativoEdicion`, `ImagenGenerator` y `CreativoGallery`. Hay que terminarlo, no empezarlo.

**Video — NO va dentro de la app.** Editar video en el navegador es caro, frágil y lento en teléfono, y la app es mobile‑first. Lo que sí rinde y se automatiza sin editor: **subtítulos, corte de silencios y armado desde plantilla**, con un servicio externo. Eso resuelve la mayor parte del reel. La edición fina la hace el Productor.

---

## 3. Módulos nuevos

### 3.1 Reuniones

Cada ritual de la sección 6 crea la reunión con la agenda ya cargada. Se abre, se completa y se cierra.

Campos: título · fecha y hora · tipo (Mesa de números / Mesa de plata / Sala de Creativos / 1‑1 / mentoría de producto / otra) · participantes · cliente asociado (opcional) · notas.

Al cerrarla: se cargan las **decisiones** que salieron y las **tareas** con dueño y fecha. Una reunión sin ninguna de las dos cosas se marca como "sin salida" y aparece en el Hoy de quien la convocó.

En la ficha de cada cliente se ven todas sus reuniones en orden, con lo que se decidió en cada una.

### 3.2 Decisiones

Un registro que se puede buscar. Campos: qué se decidió · fecha · quién decidió · área (equipo / plata / cliente X / TCD / CdL) · motivo en una línea · estado (vigente / revisada / revertida) · reunión de origen.

Regla: si alguien vuelve a abrir un tema, la app muestra primero la decisión vigente y cuándo se tomó. Para cambiarla hay que marcar la anterior como revisada y escribir por qué.

### 3.3 Campañas de clientes

Una fila por campaña, por cliente. Campos: nombre · objetivo (mensajes / lead magnet / venta directa) · creativo · fecha de inicio · presupuesto diario · estado del creativo (probando / ganador / muerto).

Carga semanal: gasto · alcance · comentarios · DMs · agendas · llamadas · ventas · facturado.

La app calcula sola: costo por conversación · costo por agenda · costo por venta · retorno.

Reglas que la app hace cumplir:
- Un creativo con tres días de gasto y cero conversaciones se marca **muerto** y genera la tarea de reemplazo.
- Un creativo con costo por venta por debajo del objetivo se marca **ganador** y genera la tarea de hacer más piezas parecidas.
- Un cliente con gasto en cero dos días seguidos dispara alerta de presupuesto.

Vista comparativa: todos los creativos de todos los clientes ordenados por costo por venta. Es el insumo de la Sala de Creativos del miércoles.

### 3.4 Mi Motor — el espacio de Javo en Admin

Sub‑tab propia, solo para él. Sus cinco ventas de TCD, de punta a punta.

- **El marcador:** cash collected contra $30.000 · lo que falta para los $5.000 del 10 de agosto · días hasta el 11 de septiembre.
- **Su pipeline:** conversaciones → calificados → agendas → llamadas tomadas → cerradas. Con el nombre de cada uno y el próximo paso.
- **Su producción:** qué grabar esta semana, qué editar, qué montar. Con estado.
- **Su pauta:** gasto del día y la regla de reinversión — de cada venta, $1.000 vuelven a pauta, con tope de $3.000 por mes.
- **El freno:** si a los siete días de pauta no hay agendas, la app avisa que se corta y no se gasta el resto.

Los dos precios: $5.000 al contado o tres pagos de $2.000. La app muestra los dos y cuál eligió cada cerrado, porque el financiado cambia cuándo entra la plata.

---

## 4. El recorrido del cliente — nueve etapas

Cada cliente vive en una sola etapa. Nadie avanza sin cumplir el criterio de salida.

| # | Etapa | Días | Dueño | Criterio de salida |
|---|---|---|---|---|
| 0 | **Bienvenida** | 1–3 | Lupe | Número nuevo de WhatsApp · número de respaldo comprado · acceso a la app · entró a Discord · primera llamada · checklist enviado |
| 1 | **Método y oferta** | 4–14 | Javo + cliente | Método con nombre cerrado · las tres armas con precio: low ticket, lead magnet, high ticket · sabe explicar qué entrega |
| 2 | **Activos** | 10–21 | Agencia | Perfil optimizado · landing con dominio y píxel · links de pago · carrusel "mi historia" con palabra clave · banco de doce piezas grabadas |
| 3 | **Conexiones** | 18–25 | Marcos | WhatsApp Business vinculado a Meta · portafolio y fan page · calendario de GHL · bot y automatización de palabra clave |
| 4 | **Prueba de cadena** | 2 | Marcos + Javo | Comentario → mensaje → link → checkout → cobro de prueba, completo y cobrado |
| 5 | **Activación** | día 0 | Javo | Campañas prendidas · tres historias diarias · guiones de setting y de llamada verificados |
| 6 | **Primeras ventas** | 1–30 | Cliente, con Lupe encima | Primera llamada tomada · primer pago cobrado |
| 7 | **Ritmo propio** | 30–90 | Cliente | Publica, agenda y cierra solo durante tres semanas seguidas |
| 8 | **Cliente satisfecho** | cierre | Lupe | Testimonio grabado · caso de éxito documentado · salida ordenada antes del 11 de diciembre |

**Regla dura:** de la etapa 4 no se sale sin el cobro de prueba. La app impide marcar "activado" y corre la fecha.

**Regla de ventana:** todo cliente nuevo llega a la etapa 5 en 21 días desde la venta. La app calcula los días de servicio que le quedan hasta el 11 de diciembre y avisa en rojo si el recorrido no entra.

---

## 5. Los desafíos previstos

La app evalúa esto todos los días y arma la lista de "atender hoy".

| Riesgo | Señal | Lo detecta | Protocolo |
|---|---|---|---|
| No graba | Banco de piezas por debajo de 6 | Lupe, lunes | Sesión de grabación con guion cerrado en 72 h |
| No sube las tres historias | Dos días seguidos sin historias | Lupe, contacto de la mañana | Llamada corta ese mismo día |
| Comentarios que no disparan el mensaje | Comentarios > 0 y DMs = 0 | La app | Revisar palabra clave y automatización — Marcos, mismo día |
| Número de WhatsApp restringido | DMs a cero de un día para el otro | La app | Número de respaldo, comprado en la etapa 0 |
| Meta rechaza o inhabilita | Campaña sin entrega 24 h | Marcos | Segundo portafolio, preparado desde la etapa 3 |
| El método no cierra | Más de 14 días en la etapa 1 | La app | Entra a la mentoría del miércoles 11:00 hasta cerrarlo |
| No contesta los DMs | Respuestas por encima de 1 hora | Lupe | Guion de setting + revisión en el 1‑1 |
| No agenda | DMs > 20 y agendas = 0 | La app | Roleplay de setting con otro cliente esa semana |
| Llega sin guion a la llamada | Llamadas > 3 y ventas = 0 | La app | Roleplay de llamada con Javo en la Sala de Creativos |
| Baja el precio | Venta por debajo de su escalera | La app, al cargar la venta | Se conversa en el 1‑1: se sostiene el precio o se cambia la oferta |
| Sin presupuesto de pauta | Gasto en cero dos días | La app | Se pasa a orgánico y se avisa el lunes |
| Desaparece | Sin actividad en Discord 5 días | Lupe | Llamada de Javo. A los 10 días se congela con fecha de corte |
| La instalación se estira | 30 días activado sin venta | La app | Entra a las tres cuentas en foco de la semana siguiente, sí o sí |

**Semáforo de estiramiento.** Verde: vendió antes de los 30 días de activado. Amarillo: 30 días sin venta, protocolo de rescate. Rojo: 60 días sin venta, se revisa la oferta completa con Javo y se fija fecha de corte real.

---

## 6. Rituales fijos

Cada uno crea su reunión con la agenda cargada.

| Día | Hora | Ritual | Quiénes | Presencial |
|---|---|---|---|---|
| Lunes | 9:30 | Mesa de números: los cinco números de cada cliente, qué tres cuentas entran en foco, qué se cambia | Javo, Lupe, Marcos | Sí |
| Lunes | 11:30 | Bloque de creativos y carga de campañas | Javo + Marcos | Sí |
| Martes | mañana | Producción de Javo: grabar | Javo | — |
| Martes | tarde | Editar y montar · 1‑1 de Lupe con clientes | Javo · Lupe | — |
| Miércoles | 11:00 | Mentoría de producto: los que están cerrando método | Javo | Sí |
| Miércoles | 16:00 | **Sala de Creativos**: 60 min con los once. Números, dos o tres casos en vivo, roleplay, tarea de grabación | Javo + clientes | Sí |
| Jueves | todo el día | Pauta, DMs y llamadas de Javo. Sin reuniones | Javo | — |
| Jueves | tarde | 1‑1 de Lupe · bloque de sistemas de Marcos | Lupe · Marcos | — |
| Viernes | 9:30 | Mesa de plata: qué entró, de dónde, qué se rompió camino al cobro. Supervisión de TCD y de la app | Javo, Lupe, Marcos (+ Ailu hasta el 31 de agosto) | Sí |
| Viernes | 11:00 | Traspaso de Ailu: 30 min, hasta que el checklist esté en cero | Ailu + Javo + Marcos | Sí, hasta el 31 de agosto |
| Viernes | 16:00 | Cierre: qué se pauta el fin de semana | Javo | Sí |
| Todos los días | 9:30 y 18:00 | Contacto por Discord con los once | Lupe | — |

Presenciales: lunes, miércoles y viernes. La Sala de Creativos corre del 5 de agosto al 9 de diciembre sin excepciones.

**Techos que la app hace cumplir:** Lupe, once clientes por 30 minutos son cinco horas y media más dos contactos diarios — es su semana completa, y no se puede sumar un cliente doce sin sacar otro. Pauta, tres cuentas en foco por semana, no deja marcar una cuarta. Javo, martes y jueves sin reuniones hasta el 11 de septiembre.

---

## 7. Supervisión

Lo que Javo tiene que poder ver en treinta segundos, sin preguntarle nada a nadie:

- **De Lupe:** 1‑1 hechos esta semana contra los once · contactos de Discord del día · clientes sin movimiento hace más de tres días · tareas suyas vencidas.
- **De cada cliente:** en qué etapa está y hace cuántos días · su semáforo · su cuello de botella calculado · la última decisión que se tomó sobre él · el creativo que está corriendo y a qué costo por venta.

Una sola pantalla: filas de clientes, columnas de estado. Lo rojo arriba.

---

## 8. Diagnóstico de cuatro pasos

Con los cinco números de la semana la app dice sola dónde se rompe cada cuenta:

| Señal | Cuello de botella | Qué se toca | Dueño |
|---|---|---|---|
| Sin comentarios | El contenido no llama | Gancho y creativo | Javo |
| Comentarios sin DM | La cadena está cortada | Automatización, palabra clave, copy | Marcos |
| DMs sin clicks | El mensaje no convence | La oferta y cómo se nombra | Javo |
| Clicks sin venta | Llega y no compra | Landing, precio, prueba, testimonios | Javo |

Cada diagnóstico genera con un clic una tarea con dueño y vencimiento el viernes de esa semana.

---

## 9. Las vistas

1. **Hoy — la cola de excepciones.** NO es una lista de tareas para llenar a mano: es la cola que escribió el job de anoche, **ordenada por dinero en riesgo**, no por fecha. Arriba, la cuenta que más factura y peor está. Cada fila trae el veredicto de la regla y la acción sugerida con su dueño. Debajo: reuniones del día y tareas que vencen.
2. **Recorrido.** Clientes como tarjetas en columnas por etapa. Arrastrar mueve de etapa y pide el criterio de salida.
3. **Supervisión.** La pantalla de la sección 7.
4. **Campañas.** La vista COMPARATIVA entre clientes: todos los creativos de todos los clientes ordenados por costo por venta. Las tabs `campanas` y `creativos` del Admin ya cubren el detalle por cliente — esta no las reemplaza, las corona.
5. **Reuniones.** Calendario y archivo, con sus decisiones y tareas.
6. **Decisiones.** El registro buscable de lo vigente.
7. **Tareas.** Reusa `TasksPipeline` y los componentes de `admin/tasks/` filtrando por origen. Por dueño, por cliente y por día. Vencidas siempre visibles.
8. **Equipo.** Roles, semana tipo, carga contra el techo, y el checklist de traspaso de Ailu.
9. **Mi Motor.** Solo Javo. La sección 3.4.
10. **Marcador.** Cuatro números: cash collected contra $30.000 · lo que falta para los $5.000 del 10 de agosto · ventas de los clientes en el mes · clientes en amarillo o rojo.

---

## 10. Calendario maestro

| Fecha | Hito |
|---|---|
| 27–31 de julio | Semana de conexiones |
| **Martes 4 de agosto** | Activación ola 1: José Luis Valle, Martina Moe, Jennifer Gri, Adrián Mahl, Solange Arce, Mariana, Sol Peirano |
| **Lunes 10 de agosto** | Pago del equipo. Antes tienen que haber entrado $5.000 |
| **Martes 18 de agosto** | Activación ola 2: Maxi, Mayra |
| **Lunes 31 de agosto** | Traspaso de Ailu completo. Pasa a clienta |
| **Martes 1 de septiembre** | Activación ola 3: Rosana, Roberto |
| Septiembre | Sale Refugio a $300 · Ailu prepara su campaña de eventos high ticket |
| **Viernes 11 de septiembre** | Última venta de TCD. La pauta de captación se muda a CdL y al evento |
| Octubre · noviembre · diciembre | Lanzamientos de la Clínica del Líder · campaña de eventos de Ailu |
| 8–11 oct · 8–9 nov | Ailu en Buenos Aires, sin reuniones |
| Diciembre | Evento propio en la Patagonia |
| **Viernes 11 de diciembre** | Último día de servicio. Al equipo se le paga diciembre completo |
| 15 de diciembre | Deuda cero |
| Febrero 2027 | Segundo evento |

Dos pautas distintas: la de captación de TCD se corta el 11 de septiembre; la de los clientes sigue hasta el 11 de diciembre.

---

## 11. Modelo de datos

Tablas nuevas en Supabase, todas con RLS solo para admins:

- `sala_hitos` (id, fecha, titulo, detalle, tipo, estado)
- `sala_roles` (id, persona, funcion, sostiene[], no_toca[], entregable_semana, techo, activo_desde, activo_hasta)
- `sala_traspaso` (id, item, de_persona, a_persona, fecha_limite, estado)
- `sala_rituales` (id, dia_semana, hora, titulo, agenda, participantes[], presencial, vigente_desde, vigente_hasta)
- `sala_reuniones` (id, ritual_id nullable, titulo, fecha, tipo, participantes[], cliente_id nullable, notas, cerrada bool)
- `sala_decisiones` (id, texto, motivo, fecha, decidida_por, area, cliente_id nullable, estado: vigente/revisada/revertida, reunion_id nullable, reemplaza_a nullable)
- `sala_etapas` (id, numero, nombre, dias_min, dias_max, dueno, criterios_salida[])
- ~~`sala_clientes`~~ — **NO se crea.** Esos campos se agregan a `profiles` (ver el SQL de la sección 0)
- ~~`sala_campanas`~~ — **NO se crea.** Ya existen `campanas`, `creativos` y `creativo_assets` (ver sección 0)
- ~~`sala_campana_metricas`~~ — **NO se crea con ese nombre.** La carga semanal va en `sala_metricas_semana`, que además guarda con qué objetivo se juzga la campaña (ver el SQL)
- `sala_riesgos` (id, nombre, senal, detector, protocolo, activo)
- `sala_alertas` (id, cliente_id, riesgo_id, disparada_en, resuelta_en, tarea_id)
- ~~`sala_tareas`~~ — **NO se crea.** Se usa `admin_tareas`, que ya existe con checklist, comentarios, adjuntos y filtros. Solo se le agregan las columnas `origen` y `ref` (ver sección 0)
- `sala_motor` (id, fecha, tipo: lead/agenda/llamada/cierre, nombre, monto, forma_pago: contado/tres_pagos, proximo_paso, estado) — solo Javo

Un job diario que evalúa los riesgos de la sección 5 y las reglas de creativos de la 3.3, y escribe en `sala_alertas`. Sin alertas duplicadas mientras la anterior siga sin resolver.

---

## 12. Reglas de la casa

- Estética TCD: marfil cálido, oro, Fraunces para títulos y Sora para texto. Mismo lenguaje visual que la matriz de pre‑lanzamiento.
- Todo el copy de tú. Cero voseo — lo verifica la lente 6.4 de `auditoria.py`.
- **Los umbrales YA están corregidos en el código y no se re-inventan.** `UMBRALES` en `src/lib/formulasAnuncios.ts` tiene tres reglas según lo que compra la campaña: perfil (tope $0,07 por visita), mensajes LATAM (sano $0,25–0,70, se apaga arriba de $1,50) y mensajes de ticket alto (sano $1,20–2,50, tope $3). El veredicto sale de `veredictoAnuncio()` y los días de medición de `diasDeMedicion()`, que se acorta a 7 cuando el gasto diario pasa de $50. La Sala de Mando **importa esas funciones** — no escribe umbrales propios.
- Cuatro estados en un solo clic, y son los que YA existen en `AdminTareaStatus`: por hacer → en proceso → en revisión → completadas. No inventar estados nuevos.
- Ningún campo mudo: si falta un dato, la pantalla dice qué falta.
- Ningún botón deshabilitado sin explicar por qué.
- Toda frase del tipo "lo trajimos de tu tablero" va dentro de un condicional que verifique el dato (lente 8.4).
- Todo campo que la app lea del perfil tiene que estar en el espejo de `syncProfileToLocalStorage` (lente 8.1).
- La carga tiene que ser rápida desde el teléfono: cargar los cinco números de un cliente no puede llevar más de treinta segundos.

---

## 13. Datos semilla

**Clientes.** Ola 1 (activa 4 de agosto): José Luis Valle · Martina Moe · Jennifer Gri · Adrián Mahl · Solange Arce · Mariana · Sol Peirano (única con app de low ticket). Ola 2 (18 de agosto): Maxi · Mayra. Ola 3 (1 de septiembre): Rosana · Roberto. Ailu entra desde el 1 de septiembre con Javo como dueño.

Maxi y Mayra en etapa 1. Los demás, en etapa 3.

**Tareas de la semana de conexiones:**

| Fecha | Tarea | Dueño |
|---|---|---|
| Lun 27 jul | Última tanda de grabación pedida con guion cerrado y fecha | Lupe |
| Lun 27 jul | Conexiones de los siete: número nuevo, Meta, bot, links de pago, dominio | Marcos |
| Lun 27 jul | Comprar el número de respaldo de cada cliente | Marcos |
| Lun 27 jul | Armar el checklist de traspaso de Ailu con fechas | Ailu + Javo |
| Mar 28 jul | Editar piezas y revisar carruseles: tres por cliente | Lupe |
| Mié 29 jul | Prueba de cadena, cliente por cliente, hasta el cobro de prueba | Marcos + Javo |
| Jue 30 jul | Campañas de los clientes cargadas en borrador | Javo |
| Jue 30 jul | Campaña propia de mensajes al high ticket lista para prender | Javo |
| Vie 31 jul | Repaso de sala y reparto de guardia para las primeras 48 horas | Los cuatro |
| Lun 3 ago | El que no pasó la prueba de cadena no activa | Marcos |
| Mar 4 ago | Activación ola 1 | Javo |

---

## 14. Entrega

### El orden importa y no es negociable

1. **Meta Ads API + Instagram Graph.** Sin esto no hay veinte clientes, hay once. Todo lo demás decide sobre datos que alguien tipeó.
2. **Landings en la app.** La palanca más grande sobre el tiempo del cliente y la más barata de construir.
3. **Snapshot de GHL.** Convierte el alta en minutos.
4. **La cola de excepciones.** Recién sirve cuando los datos entran solos; antes es una lista más para llenar a mano.
5. El resto de las vistas.

Construir la cola primero, sin las conexiones, es el error que hay que evitar: queda un tablero lindo que alguien tiene que alimentar a mano.

- Archivos en `src/components/admin/salaDeMando/`
- Al terminar: `tsc` en cero, `vite build` ✓ y `auditoria.py` con la batería completa en verde.
- Decime qué archivos tocaste y qué SQL hay que correr en Supabase.
- Antes de dar por terminado: confirmá que NO creaste `sala_tareas` ni `sala_clientes`, y que los estados de tarea son los cuatro de `AdminTareaStatus`.
