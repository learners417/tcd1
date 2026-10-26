# El historial del trabajo

Este archivo existe porque el código viaja en un ZIP, y un ZIP no lleva el
historial de Git. Lo que se pierde ahí es la trazabilidad: qué se tocó,
cuándo y por qué. Eso queda acá, en orden, del primero al último.

Son 51 registros. Cada uno se cerró con la batería completa: TypeScript
limpio, el build, el medidor en 54 vistas a 390 píxeles con sus veinte lentes —las 23
de la cuenta andando, las 16 del primer día y del escalón de entrada, las dos
del final, el fondo del scroll, las vistas internas de Campañas y las seis de
la cuenta CON DATOS— y las 105 pruebas escritas.

---

## 09/10/2026 · Cirugías 1-9: lógica construida que ninguna pantalla usaba

El patrón que apareció nueve veces: código escrito, probado y nunca
conectado. Peor que código faltante — pasa la auditoría, tiene su
prueba en verde, y la pantalla muestra ceros que parecen datos.

LA PAUSA DE DICIEMBRE HACÍA LO CONTRARIO
Paraba el Camino de todos: congelaba el día de cada cliente, le corría
el cierre 35 días, movía la hoja de ruta y apagaba el semáforo un mes.
Con el semáforo callado, el cliente que dejaba de entrar el 16 de
diciembre reaparecía en rojo a fin de enero, cuando ya se había ido.
La app no corta nunca: lo que se cierra es el soporte. pausaGlobal.ts y
pausasDatos.ts se reemplazan por ventanaSinSoporte.ts; lo único que
cambia es que esos días no se le reclaman al equipo.

LA SEMANA MOSTRABA UNA ALERTA FALSA TODOS LOS DÍAS
La tabla mide seis funciones y recibía datos de una. «Absorber» en cero
—la única con destino crecer— disparaba su alerta a diario contra un
equipo que no tenía dónde registrarlo. La jornada guardaba los minutos
de reloj pero no en qué se gastaban: ahora se marca al cerrar el día y
se piden cuatro semanas para poder comparar.

EL ASISTENTE DE CAMPAÑAS NO GUARDABA NADA
Seis fases con KAI y al cerrar la pantalla no quedaba nada. saveCampana
se importaba y no se llamaba nunca; onComplete estaba sin invocar.

LOS AVISOS SE REPETÍAN Y NUNCA ESCALABAN
El cron insertaba directo, salteándose planificarAvisos. El cliente
recibía el mismo aviso a diario y la regla de escalar a una persona no
se aplicaba. El historial se deriva de las notificaciones ya enviadas.

LA MITAD DE LA GARANTÍA QUE ERA NUESTRA
El cierre de cuentas verificaba lo que entregó el cliente y daba por
hecho lo que le dimos. Ahora mide las dos, y «no consultado» ya no se
confunde con «no cumplido».

LA COLA DEL DÍA Y EL COSTO POR CLIENTE
armarCola (250 líneas, por dinero en riesgo) recibía items={[]} fijo, y
las rachas iban en cero: un cliente fallando cinco semanas no escalaba
nunca. gasto_ia_por_cliente existía en la base sin un solo caller.

FALSOS VERDES EN LA PROPIA AUDITORÍA
El medidor pedía una pestaña borrada y medía dos veces la anterior.
Nueve lentes certificaban el bug de la pausa. Y puntoDePartida.ts era
código muerto con prueba en verde que daba 80 jornadas por hechas, algo
que el producto ya había descartado.

UN SOLO CALENDARIO
Los cinco sistemas tenían dos nombres y dos calendarios: manda el
roadmap, el maestro se regenera desde el seed y una lente los compara.

Verificado: tipos limpios · 60 pruebas en verde · auditoría sin fallas
· build pasa · 38 vistas en Chromium con 0 faltas de diseño.

Pendiente de correr a mano: las 7 migraciones de supabase/migrations.

---

## 10/10/2026 · Cirugías 10-16: lo que no se podía usar, lo que no se podía leer, y el relato

Seis turnos de cirugía sobre la app. El patrón que más se repitió:
código construido, probado y con su prueba en verde, que ninguna
pantalla importaba nunca.

CAMPAÑAS
- La auditoría de anuncios no tenía salida: `listaParaPublicar` se
  derivaba de ocho expresiones regulares y no existía forma de que una
  persona aprobara nada. Ahora la política de Meta bloquea y los ocho
  ingredientes se aprueban a mano, atado a la huella del texto.
- `candadosQueAplican` estaba escrita desde el turno 11 y la pantalla
  seguía pidiendo 8 candados fijos: la campaña al VSL no podía encender.
- El asistente de seis fases ofrecía intereses y lookalikes con 30 USD
  al día. Reemplazado por el asesor de montaje: receta cerrada en nueve
  pasos, restrictivo, con los países por grupo de poder de compra.
- Los tres campos que Meta pide (titular y descripción no existían).

ACOMPAÑAMIENTO
- Mensajes no miraba `servicio_contratado`: el de $1.000 tenía el mismo
  chat que el de $3.000. Ahora reporte por turnos vs. chat, con la regla
  en RLS y no en un cartel.
- Los cinco canales de Discord, las mentorías con su link y la
  asistencia que se marca sola.

EL PRIMER DÍA
- HOY afirmaba «Hecha — el dojo te vio hoy» mientras esperaba una red
  sin timeout.
- El primer tap del Camino reescribía `fecha_inicio` al lunes siguiente.
- Sin fila en `profiles` se salteaba el wizard entero.
- El botón de cerrar sesión estaba deshabilitado en TODO el Camino.
- Campañas invitaba a montar Meta el día 1.

SEGURIDAD (20261018, obligatoria antes de dar acceso)
- La política de UPDATE sobre `profiles` no tenía lista de columnas: el
  cliente podía marcarse `servicio_contratado = 'instalacion'` y
  `rol = 'admin'`. Cerrado con trigger, verificado contra Postgres 16.
- Tres migraciones abortaban por cambio de tipo de retorno, dejando viva
  una función `security definer` sin control de llamador.
- `marcar_biblioteca` confiaba en un uuid que mandaba el navegador.

DIAGNÓSTICO
- `bandaDe(n.mercados ?? [])` recibía siempre una lista vacía: el CPM de
  toda la cartera se juzgaba contra la banda de México. Los países ahora
  son argumento obligatorio y salen del montaje del cliente.

FILOSOFÍA Y ESTÉTICA
- Los cinco sistemas del Camino son los cinco libros de «Lo que el sur
  te enseña»: cada uno con su paisaje, su dato real y su ilustración.
- Lora donde se lee, Sora donde se opera. Capitular, versalitas, la
  regla de 1px y el bloque de acción del libro.
- Contraste medido en los cinco: el lecho del texto es el color de tapa
  oscurecido hasta 10:1 en blanco y 4,5:1 en el oro.

VERIFICADO
69 pruebas de escenario · 741 lentes de auditoría · 39 vistas en
Chromium real con 0 faltas de diseño · las 12 migraciones corridas en
un Postgres 16 local, en orden y dos veces cada una.

---

## 11/10/2026 · Revisión final: el agujero de los avisos, las migraciones que se cortaban, y lo que se veía mal

Lo que apareció mirando otra vez, y que no se ve desde la app:

· crear_notificacion era SECURITY DEFINER sin mirar quién llamaba:
  cualquier cliente podía meterle a otro un «Lupe te dejó una nota»
  con el enlace que quisiera. Ahora el equipo escribe a cualquiera,
  cualquiera se escribe a sí mismo o al equipo, y nada más.

· Tres migraciones se detenían al correrlas de arriba hacia abajo,
  por choques de firma contra sala-de-mando.sql (marcar_respondido,
  jornadas_recientes, marcar_biblioteca). Y la 20261011 daba por
  hecha una columna que ninguna migración crea. La prueba de SQL
  ahora corre las 12 en orden, dos veces, contra Postgres real.

· De los 20 avisos al cliente solo 4 podían dispararse: el cron
  decidía el cuello con cuatro condiciones a mano. Ahora usa la
  misma cadena de valor que la cola del Admin, y guarda la clave
  del aviso para que reescribir un texto no borre el historial.

· La cola del Admin se calculaba y se mostraba sin que saliera
  nada de ahí. Ahora lo que un aviso no resuelve queda como tarea
  de una persona.

· La frecuencia salía en verde sin estar medida: las impresiones
  no se pedían en ninguna parte y dividir cero da cero. Dos campos
  nuevos en la carga, y mientras estén vacíos el indicador dice
  «sin datos».

· En el teléfono: «El Camino» salía partido en tres renglones y
  montado sobre un botón, y las cinco pestañas de abajo estaban a
  14 px y pegadas entre sí. Medido y corregido a 390 px.

Verificado: 69 pruebas, 747 lentes, build, 39 vistas con 0 faltas,
las 12 migraciones dos veces contra PostgreSQL 16.

---

## 12/10/2026 · Anuncios que Agendan: la herramienta de anuncios, adentro de la app

Entra como pestaña nueva de Campañas, delante de «Tus 3 anuncios»:
primero se escribe con criterio, después se aprueba y se monta en Meta.

No reemplaza al Constructor. «Tus 3 anuncios» es el que aprueba las
piezas y arma los campos de Meta; sacarlo dejaba los anuncios sin forma
de salir.

Qué cambia respecto del archivo suelto:

· La ficha se abre con el ADN del cliente cargado —rubro, cliente ideal,
  método, material propio, prueba y frases—. Lo que ya selló en el
  Camino no lo escribe dos veces.
· Guarda en la cuenta y no en el navegador: antes el trabajo vivía en la
  computadora donde se escribió.
· Usa el motor de IA de la app, declarando su herramienta, para que cada
  generación se cuente donde se cuentan todas.
· Copia con el helper de la casa, que cae a un respaldo donde el
  portapapeles está bloqueado.
· El equipo puede abrir la ficha de cualquier cliente.

Y una regla que faltaba: el archivo prometía 20 y traía 19. La que entra
es la que el prompt ya exigía sin que ninguna pantalla la enseñara —
hablado, como lo dirías en voz alta.

Verificado: 70 pruebas, 747 lentes, build, 40 vistas con 0 faltas, y las
13 migraciones dos veces contra PostgreSQL 16.

---

## 12/10/2026 · Los 90 días alineados: el día que manda es el del trabajo

Seis cosas que hacían que el cliente no pudiera llegar solo del punto A
al punto B, y que ahora están cerradas.

1. EL DÍA QUE MANDA ES EL DEL TRABAJO
   La app contaba días de calendario. A quien se atrasaba le hablaba de
   un camino que no era el suyo: "enciende tus campañas" sin tener la
   página. Ahora `dondeVa()` devuelve los dos números —el del almanaque
   y el de su próxima sesión— y todo lo que se abre se abre por el
   segundo. Quien adelantó trabajo no espera al almanaque.
   Lo que falta se cuenta en SESIONES, no en días: "faltan 3 días" no
   depende de él, "faltan 3 sesiones" se puede hacer hoy.

2. EL CUARTO DESTINO CAMBIA SOLO
   Campañas ocupaba un lugar fijo en las dos navegaciones durante el
   primer tercio del programa, sin servir para nada. Ahora ese lugar lo
   ocupa Mi ADN mientras construye, y se convierte en Campañas el día
   que le toca montar. Las dos navegaciones preguntan lo mismo, así que
   dicen lo mismo.

3. LAS ENTREGAS DEL EQUIPO AVISAN SOLAS
   Las tres entregas estaban escritas y nadie las disparaba. El cron las
   dispara por el día del trabajo —montarle los formularios a quien no
   escribió su oferta es trabajo que se hace dos veces—, le dice al
   cliente qué recibe y qué va a poder hacer, y le deja la tarea al
   equipo con el nombre adelante.

4. LA SEGUNDA MITAD DEL CAMINO
   Del día 50 al 90 había 24 días vacíos y 735 minutos de trabajo. Doce
   sesiones nuevas de 20 a 30 minutos: quedan 12 días libres para
   atender y 1.040 minutos. Ninguna pasa de media hora, porque son días
   de atender, no de construir. Cinco traen su rúbrica.

5. EL DÍA QUE ENCIENDE, CAMBIA DE ETAPA
   Encender las campañas no cambiaba nada en la app. Ahora hay una
   ceremonia que lo marca —hasta hoy construiste, desde hoy sostienes—
   y la pantalla de Hoy abre con sus seis números, con la flecha contra
   la semana previa y la frase que dice dónde se corta. Seis números sin
   esa frase son seis números.

6. SUS NÚMEROS SON SUYOS
   La tabla de la semana tenía una sola política: solo el equipo. El
   cliente no podía leer los números de su propio negocio. Ahora cada
   uno lee y carga los suyos, el equipo sigue viendo todos, y nadie
   puede escribirle los números a otro.

El seed se regeneró desde `hoja_de_ruta.py`: editarlo a mano se pierde
en la próxima corrida del generador.

Verificado: tsc limpio · 71 pruebas de escenario · build · 748 lentes de
auditoría con 0 faltas · las 14 migraciones dos veces contra Postgres 16
· 40 vistas medidas sin faltas de diseño.

---

## 12/10/2026 · El plan de los 90 días, por escrito y generado desde el seed

Pediste el plan exacto paso a paso. Está en EL-CAMINO-DIA-POR-DIA.md:
las 90 jornadas en el orden en que se abren, con qué hace cada día,
cuántos minutos, qué queda hecho, qué se le habilita, qué queda trabado
hasta cumplirlo, qué cinturón gana y el veredicto con el que cierra.

No está escrito a mano. Lo genera `scripts/generar-plan-90-dias.py`
leyendo `src/lib/roadmap.seed.json`, que es exactamente lo que la app le
sirve al cliente. Un plan escrito a mano es una segunda verdad: el día
que una jornada cambia, el documento sigue diciendo lo de antes y
alguien lo lee.

La lente nueva de la auditoría regenera el documento aparte y lo compara,
así que un cambio en una jornada sin regenerar el plan no pasa.

Los sistemas no se usan como títulos de sección a propósito: una jornada
del día 70 puede pertenecer al sistema 3, así que agruparlos partiría el
orden de los días, que es el orden en que el cliente los vive.

Verificado: 749 lentes, 0 faltas.

---

## 14/10/2026 · La antesala: el protocolo lo diseña él, y la sesión 1 abre después

Lo que vendiste en la llamada no era lo que la app tenía. Prometiste mindset
y bodyset: alimentación, sueño, descanso y pantallas, cinco a siete días
antes de empezar. El día 4 del Camino es un protocolo de disparadores y
cierra diciendo «nadie te va a decir qué comer ni a qué hora levantarte». En
los 90 días no había nada de sueño ni de descanso.

LA ANTESALA

El Camino abría con 75 minutos que piden cabeza: diez números de medición,
el pacto, la hora real neta. Eso a alguien que llega agotado —que es la
mayoría, porque por eso compra— lo deja haciendo la mitad de la primera
sesión, y al otro día la app le muestra una jornada pendiente. Una más. La
fatiga que lo trajo ahora también la produce la app.

Ahora antes del día 1 hay cinco a siete días que no construyen nada.

Lo diseña él: elige de tres a cinco movidas entre seis áreas —sueño,
pantallas, alimentación, movimiento, silencio, agua—, escribe qué va a hacer
en cada una con una hora o un número, y las tilda un día por día. Al quinto
se abre su sesión 1; al séptimo se cierra sola, porque sin techo descansar
es la forma más cómoda de no empezar.

El techo de cinco movidas es tan importante como el piso de tres: el que
elige las seis se armó una semana más exigente que la que tiene hoy.

Y la fecha en que la cierra es la que sella fecha_inicio. Sin eso sale de su
semana de descanso con una semana de diferencia encima: exactamente la carga
que esa semana vino a quitarle.

EL TOPE POR ESCALÓN

`servicio_contratado` separaba qué debe el equipo de qué ve el cliente, pero
el Camino no la miraba. Quien pagó la primera etapa de $1.000 tenía los 90
días completos, incluidos los sistemas que el equipo instala. Y las entregas
que agregué la semana pasada lo empeoraban: el cron le mandaba a Lupe, a las
dos semanas, la tarea de montarle la instalación de $5.000.

Ahora `base` abre los sistemas 1 y 2 —días 1 al 10 y el 12, que es con lo
que cierra su primera etapa— y las entregas son solo de `instalacion`.

El corte es por sistema Y por día: los sistemas se intercalan hasta el
final, así que cortando solo por sistema se abrían jornadas sueltas hasta el
día 80 con el medio cerrado.

Y el tope corre con el escalón MARCADO, no con el valor suelto. La columna
es `not null default 'base'`, así que mirar el valor le habría cortado el
Camino en el día 12 a todos los clientes de hoy, que están en base porque
nadie los marcó. Un trigger sella la fecha cuando alguien cambia el escalón;
sin fecha, el Camino abre completo y las entregas no se disparan.

LOS CUATRO NÚMEROS DE DÍA VIEJOS

El precio se sella el día 5, y el paso del día 10 decía «el que sellaste el
día 8». F-PRECIO nombraba los días 17 y 9, F-PAGINA el 26 cuando traba el
16, y F-RODAJE el 19 cuando el rodaje es el 15.

Corrección de lo que te dije: los frenos no los lee ninguna pantalla, solo
el documento del plan. El único que veía el cliente era el del día 10.

Y el documento dejó de imprimir los frenos por día: el seed guarda en qué
jornada se activa y en cuál se levanta cada uno, y esos dos campos tienen
ruido —F-RODAJE figura activándose el día 46, que es «Tus cinco niveles»—.
Imprimirlos por día convertía ese ruido en una frase afirmada. Van juntos en
su propia sección, que es lo que el seed sí sostiene.

DOS LENTES MÍAS QUE ESTABAN MAL

La de «los títulos de fase no llevan una letra inventada» corría con re.I,
así que cazaba cualquier «método» seguido de una palabra de una letra:
«tienes precio, método y oferta» le disparaba. Ahora pide mayúscula de
verdad y descarta las siglas.

Y el medidor de diseño preparaba la cuenta sin antesala, así que al entrar
este cambio dejó de medir el Camino y medía la antesala en su lugar. Ahora
mide las dos: 41 vistas.

Verificado: tsc limpio · 72 pruebas de escenario · build · 757 lentes con 0
faltas · las 16 migraciones dos veces contra Postgres 16, con el trigger del
escalón probado en sus tres casos · 41 vistas en Chromium sin faltas de
diseño.

---

## 14/10/2026 · Las tres ofertas, cargables sin errores

EL ASCENSO LO MONTA ÉL

Decidiste: en El Ascenso, sin entregas. Lo hacen todo ellos. El criterio del
escalón ya lo decía —«si el equipo termina haciéndolo por él, dejó de ser una
mentoría»— y la app no lo decía en ninguna parte.

Lo que faltaba NO era una promesa que reemplazar: el campo `acceso` de las
jornadas, que dice «Se le habilita: Entrega 2 del Sistema», no lo lee ninguna
pantalla. Faltaba lo otro, y era peor.

EL BUG QUE HACÍA IMPOSIBLE MONTARLO SOLO

La app busca el paso a paso de cada jornada por `tutorial.dia`. Ese número
estaba escrito a mano en el generador y se desfasó en 14 de los 21:

  · L-05 y L-06 decían día 25. La página se publica el día 16.
  · L-07 a L-10 decían 28. El formulario y el calendario son el 17.
  · L-18 y L-19 decían 44. La bandeja es el 25.
  · L-02 decía 2. L-17 decía 39. L-20 y L-21 decían 67.

O sea que al cliente que publicaba su página el día 16 no le aparecía ningún
tutorial, y al del día 25 le ofrecía subir una página que ya tenía.

Y dos grabados —L-03, el link de pago, y L-04, facturar— no los pedía ninguna
jornada, así que nadie se enteraba nunca de que existían.

Ahora el día SALE de la jornada que pide el tutorial. No puede volver a
desfasarse. Y si alguno queda huérfano, el generador se niega a escribir el
seed y dice cuál. L-03 entró en el día 5, donde el paso dice «crea tu link de
pago», y L-04 en el 17, «Tu agenda y tu cobro, andando».

Los ocho tutoriales escritos de Lupe traían el día viejo. Alineados.

EL PANEL DE QUIÉN MONTA

Arriba de su Camino, plegado: La Base y El Ascenso leen qué montan ellos, con
el día de cada pieza y el nombre de sus tutoriales; La Instalación lee que lo
monta el equipo. Tocar un día lleva a esa jornada.

Sin escalón marcado el panel se calla: decirle «lo montas tú» a quien compró
La Instalación es peor que no decir nada.

EL ALTA

El alta escribía `servicio_contratado` en el update directo, así que un alta
en La Base quedaba SIN MARCAR —el valor es el mismo que el default— y el
cliente abría los 90 días completos. Justo el caso del que paga la primera
etapa, que es el que hay que topear.

Ahora marca con `marcar_servicio`, que ya existía y sella el escalón, quién lo
marcó y cuándo. Probado contra Postgres: sella incluso cuando el escalón
elegido es el mismo que el default, y un cliente no puede marcarse a sí mismo
la instalación de $5.000.

Y debajo del selector se lee qué abre lo que acaba de elegir: hasta dónde
llega su Camino, quién monta lo técnico, si el equipo recibe tareas, y el
criterio del escalón.

UNA COLUMNA QUE INVENTÉ Y YA EXISTÍA

Agregué `servicio_marcado_en` con su trigger. `servicio_marcado_el` y
`servicio_marcado_por` estaban desde el 9 de octubre, y `marcar_servicio` ya
las sellaba. La migración y el trigger salieron; manda la columna que estaba.

Verificado: tsc limpio · 73 pruebas de escenario · build · 764 lentes con 0
faltas · las 15 migraciones dos veces contra Postgres 16 · 41 vistas en
Chromium sin faltas de diseño.

---

## 15/10/2026 · Revisión final: once cosas que fallaban en silencio

Ninguna rompía una pantalla, ninguna aparecía en la consola, y la batería
entera estaba en verde con las once adentro.

1 · EL CLIENTE NO TENÍA POR DÓNDE CERRAR SESIÓN
El modal de su cuenta existe completo, con sus pestañas y su botón de salir.
La única función que lo abría se le pasaba al Sidebar, que no la usaba. Nada
en toda la app lo abría. Entrada en el Sidebar y botón en la barra de arriba
—en pantalla grande, porque en el teléfono 48 px más cortaban el título.

2 · TRECE DE LOS 21 TUTORIALES NO TENÍAN NI TEXTO NI PDF
Cuatro jornadas abrían sin ningún paso a paso: el día 1, el 23, el 29 —Meta y
el pixel— y el 31 —encender las campañas—. Las dos más técnicas, y las que La
Base y El Ascenso hacen solos. Escritos los 13.

3 · Y LA JORNADA MOSTRABA UNO SOLO
El día 17 tiene seis tutoriales y el cliente veía uno. El 29 tiene cuatro.
Ahora muestra todos los de su día con el tiempo total.

4 · LA PESTAÑA HOY DEL ADMIN SE ROMPÍA CON TRES ROLES
Había dos sistemas de permisos vivos que traducían el rol distinto, y
`Jornada.tsx` llamaba al cálculo de carga con un `as never`. Un compañero con
rol produccion, dev o editor abría la pestaña y el panel se caía con «Cannot
read properties of undefined (reading 'techoHoras')». Un solo rolDe, el
cuarto rol agregado, el `as never` fuera.

5 · LOS NÚMEROS DEL CLIENTE NO LLEGABAN A LA BASE
`tableroSync.ts` llamaba al RPC con `p_cliente` y `p_semana`; la función los
declara `p_cliente_id` y `p_semana_iso`. PostgREST resuelve por nombre de
argumento, así que la llamada fallaba y el `return !error` la daba por buena.
Su tablero le decía «todavía no cargaste tus números», la cola del equipo lo
marcaba sin datos todas las semanas y el cron le mandaba el aviso. Existían
solo si alguien los copiaba a mano. Probado contra Postgres, con una lente
nueva que compara los nombres del código con los de la base.

6 · SEIS SUSCRIPCIONES ESCUCHABAN UNA TABLA SIN PUBLICAR
Solo `notificaciones` estaba en la publicación de tiempo real. Las seis de
`mensajes` —los dos contadores, las dos conversaciones del cliente y las del
equipo— nunca recibían nada. Migración 20261024.

7 · EL AVISO DEL EQUIPO AL CLIENTE NO SALÍA
`cerebroStorage.ts` insertaba directo en `notificaciones`, que tiene RLS sin
política de insertar —a propósito, y el propio código lo documenta—. El
mensaje entraba en la bandeja y la campanita no sonaba nunca. Por el RPC.

8 · EL CONTADOR SE APAGABA ANTES DE QUE LEYERA
Decía «2 sin leer» sobre Contacto, el cliente entraba, aterrizaba en el canal
de comunidad —la pestaña por default— y el globo desaparecía por estar en la
pantalla. Se iba sin ver la respuesta, y el globo volvía al recargar. Ahora
abre en Contacto si tiene algo sin abrir, y el contador sale de la base.

9 · LA GARANTÍA SE DECIDÍA CON UNA COLUMNA QUE NADIE ESCRIBÍA
`profiles.entregas` no tiene un solo escritor en la app, y de ahí salía el
atraso de cada jornada. Con el objeto vacío el atraso daba cero, así que a
TODO cliente que subió sus evidencias se le decía «entregaste todo completo y
a tiempo» — la frase que decide si la garantía corre a nuestro cargo. Ahora
sale de `hoja_de_ruta.fecha_completada`, que ya se guardaba.

10 · Y ESE CÁLCULO TENÍA UN DÍA DE ERROR
Comparaba mediodía contra medianoche, así que entregar en la fecha exacta
contaba como un día de atraso. Con las fechas llegando, eso marcaba a todos.
Ahora se cuenta en días de calendario.

11 · QUINCE FECHAS ARMADAS EN UTC
`toISOString().slice(0,10)` en UTC−3 da el día siguiente de las 21:00 en
adelante. Tres de los quince guardan la fecha en la base: la jornada que el
cliente cerraba a la noche quedaba fechada mañana. Y en la antesala, el que
tildaba su día de descanso a la noche marcaba mañana y hoy le quedaba sin
marcar. Un solo helper, `hoyISO()`.

LO QUE SOBRABA

Nueve archivos que ninguna pantalla podía alcanzar —604 líneas, una tanda
entera escrita y nunca enchufada— y 104 imports muertos. Dos rutas a la misma
pantalla de Entrenadores, con su título fantasma. Los nueve videos del método
dos veces en la Biblioteca, con el título de la página repitiendo el de la
barra. Dos bloques en App.tsx que leían el progreso, no lo usaban y devolvían
null siempre. Y nueve textos que anunciaban lo que falta o adelantaban un
problema que nadie había preguntado.

TRES LENTES MÍAS QUE NO SERVÍAN

La de «construido y sin cablear» era una lista escrita a mano de cuatro
funciones ya arregladas: seguía en verde con los nueve archivos sueltos. Ahora
camina el grafo de imports (scripts/alcance.py).

La de los títulos de fase corría sin distinguir mayúsculas y cazaba cualquier
«método» seguido de una palabra de una letra.

Y dos pruebas de fecha usaban UTC, así que pasaban de mañana y fallaban de
noche sin que nada hubiera cambiado.

Lo repetido se mide ahora en el navegador (scripts/prueba-repetido.py):
buscarlo leyendo el código me dio «roadmapSeed» como id de YouTube.

Verificado: tsc limpio · 74 pruebas de escenario · build · 779 lentes con 0
faltas · 31 pruebas SQL contra Postgres 16 con las 16 migraciones dos veces ·
23 vistas en Chromium con 0 faltas de diseño · ninguna pantalla repite nada.

---

## 15/10/2026 · El veredicto de la evidencia queda, y dos verificadores que no verificaban

EL AGUJERO ERA DE RECARGA

La visión IA ya juzgaba la foto. Su veredicto vivía en un useState, y el
archivo rechazado quedaba en Storage. `listarEvidencias` cuenta los archivos
de la carpeta.

O sea: el cliente subía la foto equivocada, la IA la rechazaba, la pantalla
le pedía otra, él recargaba, y la jornada se destrababa con la foto que la IA
había rechazado. Y al otro día la pantalla le pedía una evidencia sin decirle
qué tenía de malo la que ya había subido, porque el motivo también se había
ido con el estado de React.

CÓMO QUEDA

Juzga la IA y su veredicto se guarda con su firma. Lo que rechazó —y todo lo
que no mira: el audio, el video, el PDF— le cae al equipo en una cola, con el
motivo al lado, y ahí se aprueba o se confirma el rechazo en un toque.

La regla de la puerta: aprobada cuenta · pendiente cuenta también, para que
nadie quede trabado esperando que alguien abra el Admin · rechazada no cuenta
· sin fila cuenta, así nadie pierde lo que ya tenía subido.

Una jornada ya cerrada NO se reabre: poner una jornada vencida de hace cinco
semanas en una pantalla que venía en verde es la fatiga que esta app existe
para no producir. La cola lo avisa y la conversación la tiene una persona.

- 20261025_el_veredicto_queda.sql: la tabla, su RLS, y los tres RPC. El
  cliente LEE sus veredictos y no los escribe; `guardar_veredicto_ia`
  comprueba que el archivo esté en su carpeta y no pisa lo que ya decidió una
  persona; el aviso al cliente sale adentro de `decidir_evidencia`, así no
  existe el caso de la decisión guardada y el aviso que no salió.
- src/lib/veredictoEvidencia.ts, src/components/admin/ColaDeEvidencias.tsx
- TaskCoach: el conteo sale de la base, y el motivo sobrevive a la recarga
- Admin: la cola en Hoy, y el veredicto de cada archivo en la ficha
- src/lib/avisoVisual.ts: los mapas de icono y color estaban idénticos en el
  Topbar y en la campana. Lo descubrió el compilador al entrar el tipo nuevo.

Y DOS VERIFICADORES QUE NO VERIFICABAN

1. El andamiaje de prueba-sql.sh declaraba `hoja_de_ruta` con (user_id,
   codigo, estado). La tabla real tiene (usuario_id, pilar_numero,
   meta_codigo, completada, fecha_completada). Una función que la tocara bien
   fallaba, y una que la tocara mal podía pasar.
2. El verificador de nombres de RPC tenía la lista escrita a mano: cuatro de
   las cincuenta y seis llamadas que hace la app. Las tres nuevas pasaron sin
   que las mirara. Ahora la lista sale del código, y hay una segunda prueba
   que las cubre todas contra el SQL del repo, `sala-de-mando.sql` incluido.
3. Las cuentas de prueba vivían solo en `profiles`, no en `auth.users`, y el
   andamiaje no daba los permisos que Supabase da por defecto: una prueba de
   RLS daba verde porque faltaba el permiso, no porque la política funcionara.

MEDIDO

tsc limpio · 75 pruebas de escenario · build · 797 lentes con 0 faltas · 44
pruebas SQL contra PostgreSQL 16 real, las 17 migraciones dos veces · 56 de 56
llamadas RPC verificadas nombre por nombre · 23 vistas en Chromium con 0
faltas · ninguna pantalla repite nada.

---

## 15/10/2026 · Los números finales del paquete

798 lentes y 44 pruebas SQL, que es como quedó medido.

---

## 15/10/2026 · Que se migren solos: el alta abre la llave, y el cierre vuelve a funcionar

LA MIGRACIÓN DEL CLIENTE NO SE PODÍA COMPLETAR DESDE EL 18 DE OCTUBRE

La migración del cliente entró el 17 (20261017). Al otro día entró el
disparador que impide que un cliente se cambie a sí mismo lo que compró
(20261018), y ese disparador prohíbe tocar `migrado_en` — que es justo la
columna que escribe `cerrar_mi_migracion()`.

`cerrar_mi_migracion` es SECURITY DEFINER, pero el disparador no mira con qué
rol corre: mira `auth.uid()`, que sigue siendo el cliente. Así que el
disparador bloqueaba a la función que él mismo señala como la única forma de
hacerlo.

El efecto: el cliente pegaba su material, su ADN se guardaba —esas columnas el
disparador no las mira—, el cierre fallaba, recibía un error, quedaba sin
fechar, y la tarjeta «Trae tu trabajo» le seguía apareciendo. Para siempre.

Lo encontró la prueba contra PostgreSQL real, EJECUTANDO la función. Ninguna
lente de texto podía verlo: las dos migraciones están bien por separado.

- 20261027: la función avisa dentro de su propia transacción que la escritura
  viene de ella, y el disparador deja pasar esa columna. El candado no se
  afloja: un update a mano no trae el aviso y rebota igual. Las dos cosas
  probadas contra Postgres, con `set role authenticated`.

CREAR LA CUENTA Y ABRIRLE LA MIGRACIÓN, EN UN SOLO MOVIMIENTO

La llave estaba solo en Hoy, en otra lista: dar de alta a alguien que ya trae
su plan y su método hechos eran dos pantallas, y el segundo paso es el que se
olvida. Ahora es una decisión del alta, apagada por defecto.

- 20261026: la lista de migraciones deja fuera al equipo. Mostraba a Lupe con
  cero de cinco piezas y un botón para migrarla.

LA PROMESA QUE NO CUMPLÍA

Cuatro pantallas le decían al cliente que traer su trabajo le ponía «el Camino
al día». Ese flujo carga su ADN y no toca el Camino. La peor era la última:
con piezas faltantes lo mandaba a buscarlas «como sesiones pendientes en tu
Camino», donde no están. Las cuatro dicen ahora lo que sí hace. Y un voseo
menos («completalas» → «complétalas»).

MEDIDO

tsc limpio · 76 pruebas de escenario · build · 809 lentes con 0 faltas · 52
pruebas SQL contra PostgreSQL 16 real, las 19 migraciones dos veces · 56 de 56
llamadas RPC verificadas · 23 vistas en Chromium con 0 faltas · ninguna
pantalla repite nada.

---

## 16/10/2026 · La revisión antes de dar acceso a todos: nueve fallas silenciosas

Buscadas por la clase de falla de los dos bugs del turno anterior —piezas
correctas por separado que juntas se bloquean, y escrituras que declaran éxito
sin comprobarlo— en vez de volver a correr lo que ya estaba en verde.

1 · EL ONBOARDING DEL QUE NO SE PODÍA SALIR. El wizard se dibuja según la
    BASE: App.tsx pregunta `onboarding_completed === false`. Y la escritura
    que lo cierra no se comprobaba. Con un corte de red de un segundo el
    cliente terminaba su wizard, entraba, recargaba y lo encontraba otra vez.
    Para siempre. Lo cruza cada cliente nuevo. Ahora se comprueba la fila, se
    reintenta una vez, y si no se puede se le dice en vez de entrar.

2 · «TU CUENTA» LE PISABA EL CAMINO. Esa pantalla edita nombre y
    especialidad, y al guardar mandaba también `fecha_inicio` y `plan`, leídos
    de la copia del navegador. De `fecha_inicio` salen el día del Camino, los
    colores y el atraso de la garantía: un cliente en el día 60 sin esa copia
    cargada volvía al día 1 al corregirse el nombre. Y la copia local se
    reemplazaba entera, perdiendo su id, su plan_comercial y su ventana.

3 · EL ALTA DECÍA «CUENTA CREADA» SIN HABER ESCRITO. La ficha la crea un
    disparador; el alta esperaba 1500 ms fijos y escribía sin mirar el
    resultado. Perdida la carrera, cero filas sin error: el cliente quedaba
    sin ventana de acceso y con la fecha de inicio del disparador.

4 · LA VENTANA CERRADA EL DÍA DEL ALTA. Con la fecha real de un cliente de
    hace meses, su acceso ya está vencido y ve la pantalla de cierre, no la
    app. No es un bug: son dos cosas distintas y la app ya las separa. El alta
    ahora lo avisa donde se toma la decisión.

5 · CINCO PANTALLAS MOSTRABAN EL ERROR CRUDO. «IA API error: 500», «new row
    violates row-level security policy». En su migración, su Soporte, su
    onboarding y su COMPRA DE CRÉDITOS. Ahora pasan por `mensajeDeFalla`.

6 · SEIS VOSEOS, CINCO ESCONDIDOS SIN TILDE. «No tenes creditos suficientes»
    en el cobro de imágenes, «Si subis», «Tú escribis». Mi propio barrido no
    los veía: buscaba con tilde y miraba src/, no api/.

7 · CUATRO INTERRUPTORES QUE NO GUARDABAN NADA en la pestaña de avisos, y la
    facturación mostrando «DWY», un código interno de la escalera vieja.

8 y 9 · DOS VERIFICADORES MÍOS QUE DABAN VERDE DE MENTIRA. La prueba SQL no
    cargaba la RLS real de `profiles` —la activa fix-supabase.sql— así que
    «un cliente no lee la ficha de otro» salía verde por falta de RLS, no por
    la política: lo descubrí porque la prueba PASÓ cuando no debía. Y el
    filtro por fecha del andamiaje descartaba todo el SQL de la raíz, porque
    una letra es «mayor» que un dígito: la columna `pais` nunca entraba.

Y ahora la prueba hace el PRIMER DÍA COMPLETO de un cliente nuevo: doce pasos
con el rol real, de la ficha al veredicto de su evidencia.

VERIFICADO Y CORRECTO (también es resultado): las 30 tablas del cliente tienen
su política de dueño · el reparto por escalón coincide entre el frente y el
SQL · ningún otro disparador bloquea una escritura legítima · ninguna pantalla
del cliente queda en blanco · sin fecha de inicio no se bloquea a nadie · las
10 escrituras que no miran su resultado tienen su razón escrita.

MEDIDO: tsc limpio · 77 pruebas de escenario · build · 822 lentes con 0 faltas
· 64 pruebas SQL contra PostgreSQL 16 real · 56 de 56 llamadas RPC · 23 vistas
en Chromium con 0 faltas · ninguna pantalla repite nada.

---

## 19/10/2026 · «Lo monta tú» en el alta, y el PDF de los 90 días generado desde el seed

EL ERROR DE COPY

En el alta, debajo del selector de qué contrató, se leía «Lo técnico —su
página, sus formularios, su WhatsApp, sus automatizaciones— lo monta tú».

`loQueAbre()` reusaba `quienMonta()`, que devuelve 'tú' porque está escrita
para la pantalla DEL CLIENTE, donde «lo montas tú» se lee bien. En el alta esa
frase va en tercera persona y habla de un cliente, así que quedaba rota.

Ahora toma `TICKETS[t].quienInstala`, que ya dice exactamente eso: «el
cliente, con los tutoriales», «el cliente, con acompañamiento», «el equipo».

EL PDF

`scripts/pdf-noventa-dias.py` arma el resumen de los 90 días y los accesos
LEYENDO el seed del Camino y el cuadro de tickets. No está escrito a mano: el
día que cambie una jornada, un grado o un precio, se regenera y queda al día.
Un resumen escrito a mano miente a los dos meses.

Diez páginas, A4 apaisado: la promesa, las trece semanas de una mirada, cinco
páginas de etapas con lo que deja hecho cada semana, los once grados con su
día y su evidencia, los tres accesos con hasta dónde llega cada uno, y La Cima
con la garantía.

Lo único escrito a mano es la línea de «qué logra» de cada semana, y cada una
nombra lo que esa semana hace en el seed.

Verificado: tsc limpio · 77 pruebas de escenario · build · alcance · sin voseo
ni errores en crudo · ninguna página del PDF desborda · el texto más chico es
de 15px, que es el piso.

---

## 19/10/2026 · La escalera que ve el cliente es la de hoy, y el que paga sube

Los cinco puntos donde la app le ofrecía seguir decían «Tu Sistema ·
$497» y «El Programa Completo · $997»: la escalera de cuando los
planes se llamaban por color. El que pagaba EL NÚMERO llegaba al día
6 enganchado y veía un nombre y un precio que ya no se venden.

Y debajo había algo peor. `plan` dice por dónde entró ('ELNUMERO') y
nadie la limpia nunca; cuatro lugares la preguntaban sin mirar
`plan_comercial`. Así que el que pagaba La Base seguía viendo el
Camino cortado en el día 5, con el candado del día 6 puesto, justo
después de pagar. Pasaba igual si el equipo le abría el acceso a
mano.

Y el webhook de pago solo aceptaba los cuatro colores: un producto de
GHL que mandaba plan:"base" recibía PLAN_INVALIDO y el cliente pagaba
sin que se le abriera nada.

- src/lib/laOfertaQueSigue.ts — la escalera de hoy, en un solo lugar
- planes.ts — lo que pagó le gana a por dónde entró; enElTramoDelNumero
- ghl-webhook.ts — acepta los tres tickets y escribe el servicio
- Admin.tsx — reserva cupo con las ofertas de hoy, y avisa de lo viejo
- dos pruebas de escenario y nueve lentes nuevos

---

## 19/10/2026 · El PRIMERO-LEE-ESTO de la venta en automático



---

## 23/10/2026 · Turno 0.1 · el tramo de cinco días entra hoy, no en seis

La antesala es un detox de cinco a siete días antes del día 1, y existe
por una razón buena: el que compra noventa días llega agotado y la primera
sesión le pide claridad. Para ese cliente está bien y no se toca.

Para el tramo de cinco días se daba vuelta entero. Su acceso dura lo mismo
que la antesala, así que descansar primero le consumía la compra completa:
la página le promete su primera sesión para hoy y la app le contestaba «te
faltan cinco días para que se abra tu sesión 1». Lo prometido llegaba el
día seis, con el acceso por vencer.

- `leToca` toma el tramo corto y, en ese caso, no se activa nunca.
- Dashboard y las dos puertas del Camino se lo pasan.
- Como era la antesala la que sellaba `fecha_inicio` al cerrarse, el tramo
  corto se quedaba sin día uno: el ritmo caía al día 1 por defecto y la
  alarma de inactividad del equipo lo salteaba, porque se corta en los
  clientes sin fecha. Ahora se sella en el alta, y el panel la repone si
  falta. Una fecha anterior nunca se pisa.
- El tercer parámetro entró con valor por omisión: un llamador sin
  actualizar se comporta igual que antes, y la prueba lo sostiene.

---

## 23/10/2026 · Turno 0.2 · la franja del reloj deja de tapar el encabezado

La app declara pantalla completa, así que ocupa también la franja donde
viven el reloj, la señal y la batería. Nunca se reservó ese alto: había
cuatro zonas seguras en todo el código y las cuatro eran de abajo. En el
iPhone con la app instalada, el encabezado quedaba justo debajo del reloj.
Primera pantalla, primer segundo, del cliente que acaba de pagar.

Del mismo origen venían otras dos: la barra de estado estaba en modo
translúcido, que pinta el reloj en blanco —ilegible sobre el crema de la
app—, y el color de arranque era negro, así que la pantalla de inicio
abría en negro para entrar a una app clara.

- La zona segura de arriba se reserva en la raíz, no en el encabezado, para
  que valga también en el ingreso, la bienvenida, la carga y el cierre.
- La barra de estado pasa a modo normal: el sistema reserva el alto y el
  reloj se lee en oscuro.
- Los tres colores de arranque pasan al crema del tema claro, que es el
  único que ve el cliente.

Esto no se puede medir en el navegador de pruebas, donde la zona segura
siempre vale cero. La prueba nueva mide lo que sí se puede: que la
configuración sea coherente consigo misma. Comprobado que falla con cinco
fallas sobre el código anterior.

---

## 23/10/2026 · Turno 0.3 · la pantalla del peor momento pasa al lado de la app

Hay una pantalla que se dibuja cuando ya falló todo lo demás, y por eso
lleva los colores escritos a mano: si el error ocurrió antes de que
cargara la hoja de estilos, las variables del tema no existen.

Por eso mismo se había quedado fuera de todos los arreglos de tema. Era
negra, con el texto en blanco y un botón en el dorado brillante que el
sistema visual descarta por escrito. Aparecía así en medio de una app
crema, justo cuando el cliente ya está molesto.

- La pantalla de error pasa al crema, la tinta y el oro oscuro del tema
  claro, que es el único que ve el cliente. Botón de 48 px, esquina
  redonda, y la franja del reloj respetada, porque también va a pantalla
  completa.
- El copy deja de ser «algo salió mal» y dice qué pasó: la pantalla se
  trabó, el aviso ya llegó. Sin prometer nada que no se pueda cumplir.
- Los avisos pasan de oscuros a claros, y de abajo a la derecha —donde
  está la barra de pestañas del teléfono— a arriba al centro. Los colores
  vivos se quedan: el rojo y el verde de un aviso son color con
  significado.

La prueba nueva cubre además todo el código del cliente, para que ni el
dorado brillante ni un fondo negro escrito a mano vuelvan por otra puerta.
Comprobado que falla con ocho fallas sobre el código anterior.

---

## 23/10/2026 · Turno 0.4 · el error técnico deja de llegarle al cliente

La auditoría había encontrado seis pantallas que le mostraban al cliente
el error tal como viene del servidor. Al arreglarlas quedó claro que la
prueba que debía cuidar esto daba verde igual: miraba solo
`toast.error(err.message)`, y el error llegaba por otras tres puertas.

El lente nuevo las cubre, y encontró 29 lugares en nueve archivos, no
seis:
  · interpolado entero en el texto      → toast.error(`Error: ${error}`)
  · guardado antes en una variable      → const msg = …; toast.error(msg)
  · en una función de estado sin listar → setFallo(err.message)

Y un caso aparte: en la pantalla del manual de negocio, cuando faltaba una
columna en la base, al cliente se le mostraba la sentencia SQL para
crearla. El cliente no puede correr una migración: ahora eso va al
registro de errores y él ve qué hacer.

Los 29 pasan a usar el traductor de fallas que ya existía, cada uno con
su verbo: «no pudimos guardar tu entrada», «no pudimos generar el texto».
Siete de los nueve archivos son pantallas de piezas visuales, que la
cirugía 4 va a destapar al cliente: era el momento de limpiarlas.

Los reportes a Sentry siguen yendo enteros; lo que cambia es que su texto
ya no se le muestra a quien no puede hacer nada con él.

---

## 23/10/2026 · Turno 0.5 · el cliente ve días, no códigos

Cada jornada tiene un código —P1.3, P2.5— que es como el equipo se refiere
a ella. El Camino ya lo tenía resuelto: muestra «Día 7» y tiene escrito al
lado por qué. Tres pantallas se habían quedado fuera de esa regla:

- El espejo de identidad decía «Vuelve a P1.3», «Vuelve a P2.3», «Vuelve a
  P3.3» y «Vuelve a P2.5»: cuatro destinos que no existen para el cliente
  en ninguna parte de la app.
- El mapa de muñecas encabezaba con el código de la meta.
- La biblioteca etiquetaba cada video con «P1» o «r-dinero», y encima
  dibujaba la pastilla de duración con el contenido borrado adentro: un
  rectángulo oscuro con nada.

HALLAZGO DE PRODUCTO, PARA DECIDIR: al traducir los cuatro códigos del
espejo salió que solo P1.3 —tu historia, día 2— sigue en el Camino. El
propósito, el legado y los cinco NO no se escriben hoy en ninguna jornada:
esa pantalla quedó de una versión anterior del método. No se borra nada;
mientras se decide, el texto dice lo cierto y no manda a un lugar que no
existe. Si esas jornadas vuelven, el día aparece solo.

La prueba nueva tuvo que corregirse dos veces para no mentir: contaba las
líneas sobre el texto sin comentarios, así que señalaba lugares
equivocados, y tomaba por pantalla una lista de parámetros y el
identificador de un elemento. Comprobada contra el código anterior: marca
las seis líneas exactas que había encontrado la auditoría.

---

## 23/10/2026 · Turno 1.1 · desde el teléfono se llega a todo

La app tiene quince pantallas y cinco destinos en la navegación. Esos
cinco están elegidos a propósito —el menú y la barra de abajo dicen lo
mismo, y el cuarto cambia con el avance— y no se tocan.

Lo que faltaba era la puerta para las otras diez. Vivían en una lista
privada del encabezado que solo alimenta al buscador, y el buscador se
esconde en pantalla chica. En el teléfono, que es desde donde entra el
cliente, El Método, el Diario, Métricas, Mi Clínica, el Creador y Mi
Número no tenían ninguna forma de abrirse. La biblioteca, donde vive el
libro que la página de venta promete, tenía cero entradas.

- La lista sale del encabezado y pasa a `lib/destinos`, con el pilar y el
  cinturón que cada pantalla pide de verdad. La usan las dos puertas: el
  buscador en pantalla grande y el cajón del menú en el teléfono.
- El cajón suma una sección «Todo lo demás» con los siete que faltaban.
  El filtro que ya tenía respeta el plan, así que no ofrece nada que al
  tocarlo lleve a otro lado.

Medido en el teléfono de verdad, a 390 px: el menú mostraba 364 px de
alto para 857 px de contenido, con la barra de desplazamiento escondida.
Es decir, la sección nueva quedaba invisible y sin ninguna señal. Dos
arreglos: la tarjeta de progreso se va en el teléfono —su dato ya está en
Hoy— y la barra de desplazamiento se deja a la vista salvo en pantalla
grande. Ahora se ven los cinco, el título y el primer destino: el corte a
media lista es la señal.

Verificado con el medidor: 23 pantallas, cero faltas.

---

## 23/10/2026 · Turno 3.1 · la app toma la estética de la tapa del libro

La tapa de «Las 7 libertades fundamentales» tiene el 7 construido como un
edificio, por capas de color, sobre el paisaje de la Patagonia y un papel
crema con grano. Esa es la estética que la app pasa a tener, con los
valores muestreados del archivo, no elegidos a ojo:

  papel #EAE4D9 · tinta #2B2724 · montaña #B6BCBD · bosque #959F9F
  lago  #D4CDBC · sol   #E3CB9D

Y las siete capas del 7 —de los cimientos al eje— quedan como tokens
propios: son las siete libertades y los siete libros.

- La letra de los títulos pasa a Cormorant Garamond, la de la tapa.
  Empaquetada con la app, como las otras tres. Sora sigue en la interfaz:
  una app entera en serif fina se lee como un PDF, y esa decisión ya
  estaba razonada en el código.
- El papel suma el grano de la tapa: ruido dibujado por el navegador, al
  3,5%, en una capa fija que no intercepta el dedo. Un color liso, por
  bien elegido que esté, se lee como pantalla.
- Los colores de arranque siguen al papel nuevo.

Y el arreglo de fondo que esto obligó: los remapeos del tema claro usaban
colores escritos a mano, no las variables. Cambiar la paleta no alcanzaba:
80 reglas seguían pintando el crema anterior. Ahora apuntan a los tokens,
así que la paleta se cambia en un solo lugar.

Dos contrastes cayeron por debajo del piso con el papel más cálido, y los
encontró el medidor: el verde del tilde (4,4:1) bajó un tono, y un amarillo
de catálogo (4,3:1) pasó al oro de la casa. Medido de nuevo: 23 pantallas,
cero faltas.

---

## 23/10/2026 · Las veinticinco jornadas que llegaban sin su enseñanza

El Camino tiene 43 jornadas con video y 12 están grabadas. Las otras 31 no
quedaban vacías, que es lo que las volvía difíciles de ver: la pantalla decía
«Tu sesión, escrita» y abajo los pasos del día. El cliente leía QUÉ hacer. La
razón por la que se hace —la clase, lo que justifica el precio— no estaba en
ninguna parte. Veinticinco no tenían ni video ni lección.

Una jornada así se completa igual: el cliente tilda, avanza, y nunca se enteró
de que faltaba algo. Por eso no lo reporta nadie.

Las veinticinco escritas, con su guión de grabación y su lección:

  día  3 · Tu hora real neta
  día 12 · La prueba de tu método (los tres exámenes de la arquitectura)
  día 12 · Tu primer cobro al precio nuevo
  día 17 · Antes del formulario
  día 18 · Tu garantía de extensión
  día 23 · Frío o tibio, tu camino
  día 23 · Antes de grabar llamadas
  día 24 · Tu perfil en veinte minutos
  día 25 · Crear tu página pidiéndola en castellano
  día 26 · Cómo se arma tu video de venta
  día 31 · Tu campaña única
  día 31 · Crear tu campaña, paso a paso
  día 33 · Leer tu tablero
  día 38 · La venta empieza en la agenda
  día 39 · Traer tu método y armar tus etapas
  día 40 · Invitar a tu primer consultante
  día 42 · La autopsia de tu llamada
  día 45 · Tu primer consultante nuevo
  día 48 · El alta, siete pasos y tres límites
  día 50 · Tu app con tu marca
  día 55 · Apertura de la máquina de diez
  día 61 · Por qué la marca va última
  día 67 · Las doce semanas escritas
  día 87 · Tu foto de llegada
  día 88 · Qué sigue

Escritas con la vara que la app se impone a sí misma: sin jerga, sin símbolos,
sin códigos internos y ninguna frase de más de veintidós palabras.

El día 88 cuenta lo que se decidió hoy: lo que sigue el día 91 es esta misma
app con su cuota, para sostener y expandir lo construido. MiClínica queda
aparte.

La pantalla que las muestra, arreglada en dos cosas:
  · pintaba fondo negro y un degradé oscuro detrás de la lección. El
    reproductor de video viene negro de fábrica y ahí corresponde; cuando lo
    que va adentro es texto de la app, lleva el papel de la app.
  · no pasaba la lección por el vocabulario, así que los tokens se iban a ver
    crudos. Un entrenador no tiene pacientes.

Y el guardián: prueba-lecciones-escritas.ts exige que toda jornada tenga video
o lección, y mide cada lección con las reglas del lente de lenguaje —ahora con
una guarda para que el lente no imprima su informe cuando otra prueba le pide
las reglas.

---

## 23/10/2026 · Se va el dojo, se quedan los cinturones

Decisión de Javo: el dojo quedó fuera de escena y todo se armoniza con la
narrativa de los libros. Los cinturones se quedan, que además están en
Sanadores Libres.

El dojo vivía en veintiocho lugares, y entre ellos los tres primeros segundos
del cliente: la pantalla de entrada decía «El dojo de tu práctica», la de
carga «Preparando tu dojo…» y la bienvenida «Bienvenido al dojo». También el
tono del Mentor estaba escrito como «TU TONO ES EL DEL DOJO… como el
taekwondo», y los entrenadores explicaban los cinturones como
«(taekwondo/planta)».

Lo que queda en su lugar es el Camino, que es como la app ya se llama a sí
misma en todas las demás pantallas:

  entrada          El camino de tu práctica · 90 días
  carga            Preparando tu Camino…
  bienvenida       Bienvenido/a al Camino
  el pacto         Tu palabra empeñada es el primer cinturón
  sesión hecha     Hecha — hoy avanzaste
  descanso         el Camino también respira
  el Mentor        el respeto por el proceso ES el método, como en
                   cualquier obra que se levanta por orden

Y sale el kimono: ocho pantallas lo usaban como ícono. En las del cliente no
se reemplaza, porque la estética de la app es oro mate en versalitas y líneas,
no emojis. En los dos selectores del Admin pasa a un círculo, para que haga
juego con los que ya tenía al lado.

Los cinturones no se tocan: siguen sus nueve nombres y sus colores, y siguen
ganándose con hitos verificables.

---

## 23/10/2026 · La rueda pasa a las siete libertades, y encuentra dónde mirarse

Decisión de Javo: que quede alineado. La rueda medía ocho dimensiones
genéricas —cuerpo, mente, espíritu, profesión, dinero, familia, amigos,
naturaleza—, las mismas que usa cualquiera, y por eso no decía nada sobre
esta casa.

Ahora mide las siete libertades, que son la cosmovisión detrás de sus libros,
más el terreno donde se apoyan. Siguen siendo ocho rayos:

  Libertad física        tu cuerpo, tu salud, tu descanso
  Libertad energética    con cuánta energía te levantas
  Libertad mental        cuánto te ocupa la cabeza el trabajo
  Libertad emocional     tu pareja, tu familia, los tuyos
  Libertad financiera    cuánto te alcanza y cuánto te sobra
  Libertad de tiempo     cuántas horas son tuyas de verdad
  Libertad espiritual    para qué haces lo que haces
  Tu terreno             dónde estás parado: tu lugar y los tuyos

Cada una lleva su color del paisaje de la tapa, en lugar del emoji que tenía.
El canal vacío de cada barra es un surco y no el papel, así una libertad de
color claro igual se distingue de lo que falta.

Y el hueco que apareció mirando esto: el onboarding le prometía al cliente
«el día 90 las vas a mirar», y no había dónde. En el Diario del Director
había un comentario que anunciaba la sección —«S5 — La Rueda de la Vida: el
registro del fin, no solo del medio»— y debajo no había nada. El cliente
contestaba ocho preguntas sobre su vida el primer día y no volvía a ver una.

Ahora está la pantalla: los ocho rayos con su color, lo que se movió desde la
foto de partida, su Para Qué, y un botón para volver a medirse sin pasar otra
vez por el onboarding. En barras y no en rueda redonda, porque ocho etiquetas
alrededor de un círculo a 390 puntos piden letra chica, y acá la letra chica
no entra.

Lo medido con los nombres viejos queda en su clave y no se borra, pero
tampoco se lee: «familia» no es «emocional», y mostrar una medición vieja
bajo un nombre nuevo sería decirle al cliente que midió algo que no midió. El
Para Qué sí se trae, porque significa lo mismo que antes.

prueba-siete-libertades.ts exige los ocho rayos, que cada color exista en el
tema, que la clave sea nueva, y —la que importa— que alguna pantalla monte el
componente: un módulo que nadie monta no existe para el cliente y no deja
rastro, porque compila y nadie lo reporta.

Medidor: 23 vistas, cero faltas.

---

## 23/10/2026 · Los libros entran a la Biblioteca, y la app deja de vosear

Decisión de Javo: que los libros estén, respetando su estética y el tamaño de
letra. La Biblioteca juntaba los videos del Camino, las clases del método y
los pasos escritos, y no tenía concepto de libro. Pero los libros son la
fuente: Sanadores Libres explica esta app, y las siete libertades son lo que
hay detrás de todo. El cliente que quería entender por qué el Camino está en
este orden no lo encontraba en ninguna pantalla.

El estante va primero, antes del buscador, porque de ahí sale todo lo demás:

  La raíz de todo        Las siete libertades fundamentales
  El libro de esta app   Sanadores Libres
  Lo que el sur te       Lo que el bosque te enseña
  enseña · 1
  Para leer al lado      Héroe descapado

Dos decisiones sobre qué NO hace el estante.

No inventa títulos. La colección del sur son cinco libros —los cinco sistemas,
los mismos del Camino— y acá están los que ya tienen nombre. El estante dice
en pantalla que faltan cuatro por salir, así el cliente ve el mapa entero
aunque falten piezas. Un estante con un título inventado es peor que uno
corto.

Y no vende. Dice qué libro es, qué explica y lleva a donde vive. Lo que cuesta
y cómo se entrega se decide fuera de la app y cambia más seguido que esta
pantalla; una cifra vieja adentro es peor que ninguna. La prueba lo exige.

De paso, el guión del día 1 decía «te dejo de regalo el libro», que dejó de
ser cierto cuando el libro pasó a cobrarse. Ahora solo dice dónde está.

Y el castellano neutro, que se había colado ocho veces justo donde más caro
sale: dentro de los pasos técnicos, que son los que el cliente lee despacio y
siguiendo con el dedo. «Copialo», «Pegalo», «Identificá», «Pausá», «subile»,
«frená», «bajá», «avisá». Un paso a paso que suena de otro país es el peor
lugar para sonar raro, porque es el momento en que la persona duda de si lo
está haciendo bien.

prueba-castellano-neutro.ts revisa los 327 archivos y marca el voseo solo en
texto entre comillas. Deja fuera el mapa de dialectos, donde el voseo es un
dato y no una voz, y deja fuera los imperativos de los verbos en -ir
—escribí, seguí, elegí—, que son idénticos al pretérito: «la escribí yo» es
castellano perfecto, y una prueba que se equivoca seguido enseña a ignorarla.

El comentario de vozLocalizada.ts decía que el Mentor podía vosear por ser la
voz de la casa. El código ya hacía lo correcto desde hace tiempo; el
comentario era el que había quedado viejo.

Medidor: 23 vistas, cero faltas.

---

## 23/10/2026 · El Espejo de Identidad se completa solo

Decisión que Javo delegó: lo que haga la app más clara, más fácil, más útil y
más práctica.

El Espejo muestra las cuatro piezas de la identidad —historia, propósito,
legado y los cinco NO— y pregunta si el cliente se reconoce. Cuando una
faltaba, mandaba a buscarla a la jornada donde se escribía. Tres de esas
cuatro jornadas ya no existen: el propósito, el legado y los cinco NO
quedaron de una versión anterior del método y hoy no se escriben en ningún
día del Camino.

Es el error que más tarda en verse. La pantalla se abre, se lee entera, y el
único que descubre que el destino no está es el cliente que intenta ir.

Tres salidas posibles:

  volver a crear las tres jornadas → el Camino se alarga tres días
  sacar las piezas del Espejo      → se pierden las tres que más dicen quién es
  escribirlas ahí mismo            → cero días nuevos, cero pantallas nuevas

Se escriben ahí. Es menos pasos que ir a buscarlas, no suma un solo día, y es
el momento en que el cliente sabe qué poner: se está mirando entero, que es
para lo que existe esa pantalla.

Cada pieza vacía pide lo suyo en una línea y ofrece escribirla:

  Tu historia    De dónde vienes y por qué esta profesión, en cincuenta palabras
  Tu propósito   Para qué haces lo que haces: lo que sostiene tu precio
                 cuando tiemblas
  Tu legado      Qué quieres que quede cuando tú ya no estés en la sala
  Tus cinco NO   A quién no atiendes, qué no haces, en qué horario no estás

Los cinco NO se guardan los cinco o ninguno: tres NO dejan pasar justo lo que
el cuarto hubiera frenado. Y una pieza ya escrita se puede cambiar desde la
misma tarjeta.

Lo escrito va al perfil, al teléfono y a la base, y la escritura MIRA el
error: Supabase lo devuelve en vez de lanzarlo, así que un try/catch no
alcanza — ese fue el bug de fecha_inicio de esta misma semana. Si falla, el
cliente se entera en el momento y no cuando vuelve y su legado no está.

prueba-espejo-escribible.ts exige que ninguna pieza apunte a un código de
jornada (una jornada puede dejar de existir, y ya pasó), que las cuatro
tengan por dónde escribirse, y que lo guardado llegue a la base mirando el
error. Si alguna de esas tres jornadas vuelve al Camino, la prueba lo avisa
para revisar si el Espejo debe seguir pidiendo esa pieza.

Medidor: 23 vistas, cero faltas. Las diez pruebas del paquete, en verde.

---

## 23/10/2026 · Los cinco libros del sur, y los tres pases del día 91

Los cinco libros, con los nombres y el orden que ya tenían: el lago es tu
reset, la montaña tu programa, el viento tu captación, el río tu propia app y
el bosque tu ecosistema. El número del lomo sigue el orden del método, que es
el mismo del Camino — por eso esta colección sí tiene orden y los otros
libros no. Y Sanadores Libres queda con su subtítulo: de autoempleado a
director de tu clínica digital.

Los tres pases de renovación, con los precios de Javo:

  La app              97 al mes   sostener lo que ya construiste
  La app y el grupo  497 al mes   mentoría grupal en vivo, todas las semanas
  La app y yo        997 al mes   mentoría uno a uno con Javo

Lo único que cambia entre ellos es cuánto de Javo viene adentro; la app es la
misma en los tres. Por eso se leen como una escalera y uno solo lleva la
marca.

Van en la pantalla del cierre del Camino, debajo del cierre de cuentas. Es el
único momento en que la persona tiene delante, al mismo tiempo, todo lo que
construyó y la pregunta de qué hace con eso — y hasta hoy esa conversación
dependía de que alguien se acordara de escribirle.

El enlace de cobro se carga por variable de entorno, sin tocar código
(VITE_RENOVACION_APP, _GRUPAL, _PRIVADO). Sin enlace, el botón escribe por
WhatsApp, que es lo que pasa hoy y es mejor que un botón que no lleva a
ningún lado.

CUIDADO CON 497 Y 997: son también los precios de entrada al Camino en
planes.ts, y significan otra cosa —allá se paga una vez, acá por mes—. La
prueba exige que cada pase diga «al mes» en pantalla, que el precio se
escriba en dólares y no con signo, y que las dos escaleras nunca aparezcan
juntas: el mismo número significando dos cosas es lo que hace que alguien
crea que ya pagó lo que no pagó.

---

## 23/10/2026 · El cuadernillo de rodaje, y dos voseos que se escondían en los guiones

Javo graba con la lista, así que la lista es un PDF: «Lo que falta grabar»,
75 páginas, con la estética de la tapa del libro.

Lo que lleva adentro:

  31 videos suyos · 210 minutos
   8 pasos a paso de pantalla, de Lupe · 45 minutos

Agrupadas por DÓNDE se graba, no por día: en un día de pizarra están las ocho
de pizarra seguidas. Seis sets, en el orden que conviene — primero la montaña
y el lago, que dependen del clima; la pantalla al final, que es el bloque más
grande y el único que se puede partir en dos.

Cada pieza ocupa su hoja: el día, la duración, qué movimiento produce, y el
guión completo en beats con sus tiempos. Los de Lupe llevan sus pasos
numerados y su «si algo falla».

Decisiones de armado que costaron dos vueltas:

  · El margen vive en la página, no en la caja. Con el padding en la caja, lo
    que desbordaba de un guión largo empezaba pegado al borde y sobre papel
    cortado por la mitad.
  · Los guiones no se parten a mano. Se probó, y el cálculo de cuánto entra
    partía piezas de dos minutos que entraban de sobra. Ahora fluyen, cada
    hoja lleva al pie de qué video es, y un beat nunca queda solo al final de
    una página: se va entero con lo que anuncia.

El PDF se rearma solo: scripts/datos-grabacion.ts lee el Camino y deja afuera
lo que ya tiene video, y pdf-lo-que-falta-grabar.py arma el cuadernillo. A
medida que Javo grabe, el PDF se achica.

Y lo que apareció leyéndolo impreso: la lección del día 4 terminaba en
«Sostené» y el Admin le decía al equipo «pegalo abajo y ajustalo». Dos
voseos, en un paquete que ya decía estar limpio.

La prueba de castellano neutro tenía dos agujeros, y por eso no los vio:

  · Miraba solo texto entre comillas de una misma línea, y los guiones de los
    videos son textos de muchas líneas dentro de un template. Ninguno se
    revisaba. Ahora mira todo lo que no es comentario.
  · No conocía los imperativos de los verbos en -er, que son inequívocos: el
    pretérito de esos verbos termina en -í («sostuve», «respondí»), nunca en
    -é, así que una palabra así solo puede ser voseo.

Y quedaron fuera dos que daban falta sin serlo: «creé» («las que creé yo») y
«dale», que en neutro es «da» con su pronombre («dale por escrito lo que se
lleva»). Una prueba que se equivoca seguido enseña a ignorarla.

329 archivos, sin voseo.

---

## 23/10/2026 · Veintinueve voseos más, y la fecha de la que vive toda la app

Tres auditorías de solo lectura sobre el paquete entero: lenguaje, estética y
huecos funcionales. Este commit cierra lo que no admite espera.

EL VOSEO QUE LA PRUEBA NO VEÍA

prueba-castellano-neutro.ts daba verde con veintinueve voseos adentro, por dos
defectos míos.

El primero: enumeraba los verbos uno por uno. Una lista encuentra solo lo que
alguien se acordó de poner, así que pasaban «respirá», «andá», «escuchá»,
«optimizá», «destrabá», «ampliá», «retomá», «automatizá», «administrá». Ahora
usa el patrón real del voseo en los verbos en -ar —la raíz con la tilde al
final— con dos listas de excepciones: las palabras comunes que terminan en -á
y el futuro de tercera persona.

El segundo, más fino: en JavaScript `\b` no reconoce las vocales acentuadas
como letra, así que `\b…á\b` encontraba «atrá» dentro de «atrás» y «automá»
dentro de «automático». La primera versión del patrón marcó veintiocho faltas
de ese tipo. El límite se escribe ahora a mano, con la clase de letras
completa a los dos lados.

Con eso, los veintinueve. Los que más caro salían:

  · «Usa tono rioplatense» en dos herramientas vivas: le pedían a la IA que
    escribiera EN VOSEO la historia que una nutricionista de Panamá después
    publica. Ninguna prueba podía verlo, porque el voseo se generaba en
    tiempo de ejecución.
  · «TRATO: espejá el voseo o tuteo del usuario» en los entrenadores: la
    instrucción autorizaba lo que la regla prohíbe.
  · «¿Quieres el durazno? Bancate la pelusa» en la lista de frases del
    Mentor, veintidós líneas antes de «hablas SIEMPRE en castellano neutro,
    nunca voseo». El prompt se contradecía consigo mismo.
  · «comprá uno simple», «al toque», dentro de los pasos técnicos.
  · birome, pileta y heladera en el ritual de LA QUEMA. Si no entiende qué
    buscar, no hace el ritual.

Y un texto roto que el Mentor venía enseñando: la lección del día 22 decía
«lo di s y te callas», un reemplazo que se comió letras.

LA FECHA DE INICIO

`marcarPartida` escribía `fecha_inicio` sin mirar el error, veinte líneas
debajo de `guardarPiezaDeIdentidad`, que lo hace bien bajo un comentario que
explica por qué un try/catch no alcanza. Mismo archivo, mismo patrón, uno
arreglado y el otro no.

Esa fecha es de la que vive todo: el día del Camino, el acceso y la garantía
se cuentan desde ahí. Y como antes se escribe en el teléfono, la pantalla
queda bien aunque la base quede vacía — el cliente ve un día y su ficha otro.

DE PASO

  · Las tres etiquetas «Coach» del Diario, que la app ya llama «Tu Mentor» en
    todas las demás pantallas.
  · El título del día 31: «Escalar tu campaña ganadora (sin quemar plata)»
    tenía dos palabras prohibidas y una promesa por la negativa.
  · El signo igual usado como prosa: «Foto del estandarte = tu evidencia».

329 archivos sin voseo. Medidor y batería, en verde.

---

## 24/10/2026 · Cirugía 1 · Lo que la app promete y no cumplía

Cinco cosas que el cliente pagó y no recibía. Todas de la misma familia: el
error que compila, pasa las pruebas y nadie reporta, porque el cliente no sabe
que le falta algo.

DOS ENTRENADORES QUE NO SE ABRÍAN NUNCA

Diego pedía cuatro columnas de oferta y Lucas pedía el guion de venta.
Ninguna jornada del Camino escribe esas cinco: quedaron de la versión anterior
del método, y el único escritor del guion vivía en el catálogo de herramientas,
que está apagado.

El cliente los veía bloqueados, tocaba, y la app le decía «se abre al cerrar
tu jornada del día 9». Cerraba el día 9 y seguía igual. Dos de los ocho
entrenadores, y el mensaje lo mandaba a hacer algo que ya había hecho.

El desbloqueo correcto ya existía: el seed sabe en qué jornada aparece cada
entrenador —la que exige su evidencia— y se abre al cerrarla. Para Diego es el
día 9 y para Lucas el 17, que es exactamente lo que prometen. Lo que sobraba
era la condición vieja encima.

Y el mensaje de Lucas decía que el día 17 se escribe el guion de venta. El día
17 es cuando la agenda queda lista para recibir llamadas, que es cuando
entrenarlas empieza a servir. Ahora dice eso.

LOS CINCO DATOS QUE NO LLEGABAN A LA BASE

Eneagrama, bonos de preventa, medición de salida, mapa de obstáculos y foto de
partida se guardaban con `onProfileFieldUpdate`, que es solo estado de React.
El cliente no lo notaba porque cada componente guarda su copia en el teléfono;
lo que no existía era el dato del lado del equipo y del Mentor.

La foto de partida era la peor de las cinco. El día 1 promete compararla, y el
panel del día 45, la graduación y la foto del día 90 la leen del perfil. Las
tres devolvían vacío — y como el vacío no dibuja nada, la promesa se rompía sin
que nadie se enterara. Al recargar, además, los puntajes volvían a tres.

Las cinco pasan por la función que escribe en el estado, en el teléfono y en la
base, y que mira el error.

LA GRADUACIÓN LLEGABA POR LAS VENTAS, NO POR EL DÍA

Abría solo al registrar la décima venta en su modal. Quien llegaba al día 90
con nueve —o con diez cobradas fuera de ahí— no veía nunca su certificado, su
foto de llegada ni el mensaje que se grabó a sí mismo el primer día. Y es un
caso previsto: la app contesta «¿qué pasa si al día 90 no llegué a los diez?».

Ahora la abre el día 90, una sola vez, y las diez ventas la siguen abriendo
antes si llegan primero. La ceremonia cuenta lo que de verdad pasó.

LA MEDICIÓN TENÍA TRES CUENTAS DEL MISMO INSTRUMENTO

Seis campos en el asistente, «las diez preguntas» el día 1, «tus seis números»
el día 82. Y el día 1 mandaba a medirse de nuevo el día 87, cuando la medición
de salida está montada en el 82. Siete textos alineados a seis y al día 82.

EL GUARDIÁN

prueba-lo-prometido.ts exige que los ocho entrenadores tengan su jornada en el
seed, que ninguna condición extra dependa de un campo que el Camino no escribe
—la de Ramiro sí pasa, porque mira el contexto y no el perfil—, que ninguna
pieza del ADN se guarde solo en la pantalla, que el día 90 abra la graduación,
y que el número de la medición y el día al que manda coincidan con la realidad.

Probada en los dos sentidos: falla al devolverle a Lucas su condición muerta.

Medidor: 23 vistas, cero faltas. La batería, en verde.

---

## 24/10/2026 · Cirugía 3 · La piel: que la app se vea de la casa

El medidor daba cero en 23 pantallas y era cierto: mide el reposo y no
tenía lente para nada de esto. La auditoría visual encontró lo que no se
medía, y esta cirugía lo cierra con un lente nuevo que lo sostiene.

EL ORO
· El botón del Mentor era relleno de oro macizo en las 23 pantallas, en un
  quinto tono escrito a mano que ninguna regla del tema alcanzaba. Siendo
  lo único relleno de oro en reposo, el oro de la marca pasó a significar
  «chat». Ahora es línea de 1px con la palabra en versalitas — y la palabra
  se lee también en el teléfono, donde antes quedaba una pastilla dorada
  con un ícono en el lugar de más jerarquía. Su tono es --oro-t: apoyado en
  el panel de la barra, el oro medio daba 4,0:1.
· 288 bordes con el oro viejo escrito a mano pasaron a --line, --line2 y
  --oro según su intensidad, en 51 archivos.
· Las 8 reglas de index.css que los corregían apuntaban a un color que
  aparecía CERO veces en el código. Fuera.
· 7 oros más escritos a mano (#C79A45, #E09040, #C8893A) al token.
· 15 fondos casi negros (#0d0d0d, #0f0f0f, #0d0a06) al panel del tema.

LOS EMOJIS
Un emoji lo dibuja la tipografía del teléfono: cambia de forma y de color
en cada aparato y nunca es de la casa. La app tenía uno de 72 píxeles en
el corazón de la sesión diaria mientras le prohibía al Mentor usarlos.
· Las 48 misiones de los ocho entrenadores llevaban su ícono como emoji.
  Ahora el dato trae el NOMBRE del ícono y la pantalla lo resuelve con
  MISION_ICON_MAP, con el mismo trazo que el resto de la app.
· ~70 emojis más salieron de los textos de pantalla.
· 19 campos `emoji` que NINGUNA pantalla pintaba salieron del dato y del
  tipo: los ánimos de la sesión y los hábitos del diario los tenían por
  herencia.
· La energía del diario se dice con su numeral, que es la vara de la casa:
  oro en versalitas y numerales.

LO DEMÁS
· «Mi ADN» llevaba un megáfono y «Entrenadores» una hélice de ADN: las dos
  metáforas intercambiadas, por una línea que cambiaba la etiqueta y
  heredaba el ícono.
· 9 letras bajo el piso de 15 píxeles, escondidas dentro de bloques
  plegados — por eso el medidor no las veía: salta lo que está oculto.

EL VOSEO, TERCER HUECO
El imperativo con el pronombre pegado no lleva tilde al final, así que
ningún patrón anterior lo veía: «ayudame», «traeme», «pensala»,
«enseñame» estaban en los botones de los entrenadores, que es lo primero
que el cliente lee al abrir un chat. Lente nuevo y 7 arreglados.

DOS PRUEBAS QUE MENTÍAN EN ROJO
prueba-canal-soporte y prueba-soporte-visible buscaban los destinos en
Topbar.tsx, de donde se mudaron a destinos.ts, y «Soporte», que pasó a
llamarse «Acompañamiento». Marcaban rojo con el canal funcionando.

UNA DECISIÓN QUE QUEDA PARA JAVO
El catálogo de herramientas de la Biblioteca está apagado con un
`{false &&`, y el apagón dejó más de lo que se ve: las 22 herramientas de
IA del catálogo V3, las 34 del anterior, HerramientaDetalle.tsx entera
—este bloque es lo único que la abría— y dos caminos de rescate que
cruzan contra meta.herramienta_id, que está en undefined en las 91
jornadas del seed. Ninguna meta del Camino apunta a una herramienta.
Encenderlo o sacarlo son las dos opciones, las dos legítimas, y la
segunda no se deshace desde un ZIP. Queda escrito en el código, sin
tocar.

Batería: tsc limpio · build 17,9s · medidor 23 vistas, 0 faltas ·
92 pruebas en verde · prueba-la-piel.ts nueva, con el lente de emoji
calibrado para no tomar ✓ ✗ (tipografía, no emoji) ni las paletas
propias de los paisajes.

---

## 24/10/2026 · El historial del trabajo, en un archivo que viaja con el código

El código sale en un ZIP y un ZIP no lleva el historial de Git. Lo que se
pierde ahí no es producto: es la trazabilidad —qué se tocó, cuándo y por
qué—, y eso tiene valor cuando alguien vuelve a mirar una decisión en seis
meses. Los 33 registros quedan en HISTORIAL-DEL-TRABAJO.md, en orden, con
el cuerpo completo de cada uno y sin las líneas de firma, que en un
documento de lectura son ruido.

---

## 24/10/2026 · La puerta del repositorio: veinte documentos sueltos a su carpeta

La raíz tenía veinticuatro archivos de texto —planes, LEEMEs, PRIMERO-LEE-
ESTO, DONDE-VA— de etapas distintas, y era lo primero que se veía al abrir
el repositorio: veinte puertas y ninguna señal de cuál es la de entrada.
Los veinte que ningún script lee pasaron a docs/historico/. Quedan los
cinco que se usan: README, COMO-FUNCIONA, EL-CAMINO-DIA-POR-DIA,
SALA-DE-MANDO y MANUAL-OPERATIVO, que son los que leen roles.ts,
verificar-sala.py, auditoria.py y generar-plan-90-dias.py — más el
historial del trabajo.

Verificado después de mover: tsc limpio, build 18,5s, el generador del
plan de 90 días corre, y verificar-sala.py da 49 verdes y 0 rojos.

---

## 24/10/2026 · Cirugía 2 · El vocabulario de la casa, y los avisos que no llevaban a nada

EL VOCABULARIO

Javo tiene una lista de palabras prohibidas en su comunicación y la app la
rompía en 44 textos que el cliente lee. El lente de lenguaje no las
buscaba: su lista es de tecnicismos en inglés —lead, KPI, CTR,
retargeting—, no del vocabulario de la casa. Y solo recorría los DATOS del
Camino, las sesiones y las herramientas: el texto escrito dentro de las
pantallas no lo miraba nadie.

Lo que decía, y ya no:
  «Contacta a tu coach por WhatsApp»        en la pantalla de entrada
  «Validado con el Coach»                   en cada cinturón
  «dónde se corta tu embudo»                en el montaje de la campaña
  «Auditoría completa de mi embudo»         en un botón de Ramiro
  «producto los martes, marketing los…»     en la vía de contacto
  «Día 30: escalas al ganador»              en la activación
  «más plata por minuto»                    en la misma jornada
  «El embudo de siete pasos»                en La Casa
  «Fase 4 — Servicio y Escala»              en Entrenadores
  «Eres un coach de ventas»                 en cuatro prompts

El reemplazo no es un sinónimo al azar: sale de sus propios libros.
Captación es el libro 3 de la colección del sur, el Mentor es como se llama
el acompañante en todas las pantallas, crecer es lo que el programa promete.

Y queda el lente que lo sostiene: prueba-el-vocabulario-de-la-casa.ts, que
revisa los 9.382 textos del cliente —incluidos los prompts de backtick de
treinta líneas, que ninguna prueba leía— con 28 excepciones escritas una por
una y con su razón al lado. Tres palabras tienen un segundo sentido que es
legítimo: escalar un caso a una persona, una escala de medición, y la
palabra dentro de una prohibición («Prohibido usar: coach, escalar,
embudo») — borrarla de ahí sería borrar la regla.

EL VOSEO, CUARTO Y QUINTO HUECO

· En MAYÚSCULAS: los prompts escriben sus reglas en versalitas y ni el
  patrón de la tilde ni la lista los veían. «ALERTÁS», «la FABRICÁS», «QUE
  GENERÁS», «LO DECLARÁS». Y volvió a morder lo mismo de antes: `\b` no
  cuenta las vocales acentuadas como letra, así que la primera versión
  encontró «PAÍ» dentro de «PAÍSES» y «PRUÉ» dentro de «PRUÉBALO» — 84
  faltas falsas. El límite va escrito a mano.
· Cinco enclíticos más: «invitalo», «incorporalo», «cambialos», «subila»,
  y «Cubrí» y «Resumí» en el prompt del resumen de la conversación.

LOS AVISOS QUE NO LLEVABAN A NINGÚN LADO

Un aviso con destino dibuja un botón «Ver». Si el destino no resuelve, el
botón no se dibuja: el aviso llega, suena, se ve, y el clic no hace nada.
Sin error en pantalla ni en la consola.

Los avisos de tarea del equipo arman `/admin?tab=tareas&tareaId=…` y la
búsqueda era por clave exacta: con parámetros nunca encontraba nada. El
panel del Admin ya lo resolvía con `includes`; la barra de arriba, no.
Ahora la dirección se parte antes del `?`, como hace cualquier navegador.

Y prueba-los-avisos-llevan-a-algun-lado.ts cierra la clase entera: lee los
destinos que la app ESCRIBE y exige que cada uno exista en el mapa, con o
sin parámetros, más el revés —una entrada del mapa que apunte a una
pantalla que ya no existe—. Verificada rompiéndola: sacando `/metricas` del
mapa, marca rojo y nombra los dos archivos que lo emiten.

Batería: tsc limpio · build 22,3s · medidor 23 vistas, 0 faltas · 94
pruebas en verde. Dos pruebas se actualizaron al vocabulario nuevo
(prueba-funciones y prueba-jornada esperaban «escalando» y «no escala»).

---

## 24/10/2026 · Cirugía 4 · Ningún pago se registra en silencio

Supabase DEVUELVE el error, no lo lanza. Una escritura así se ve igual
cuando funciona y cuando falla:

    await admin.from('paypal_orders').update({ status: 'captured' }).eq(…)

No hay excepción, no hay nada en la consola, el await termina contento.
Seis escrituras del cobro estaban escritas de esa forma.

LA PEOR

La que marca la orden como capturada corre DESPUÉS de acreditar. Si se
pierde:

  · el cliente ya tiene sus créditos (acreditar es idempotente)
  · PayPal ya cobró
  · la orden queda en «pending», así que el registro dice que no pagó
  · y si el cliente vuelve a apretar, la guarda de idempotencia no entra
    —mira justamente ese campo, que no se escribió— así que se intenta
    capturar de nuevo en PayPal, que responde error porque ya está
    capturada. El cliente ve un error con el pago hecho.

LA SOLUCIÓN

`api/_lib/escritura-de-pago.ts`: mira el error, reintenta una vez —casi
siempre es un corte de red de un segundo— y si vuelve a fallar deja en el
registro del servidor todo lo necesario para reconstruir la fila a mano,
en una línea buscable por [PAGO-SIN-REGISTRAR]. Una excepción de red se
trata igual que el error devuelto.

Y la respuesta al cliente sigue siendo 200 con sus créditos, porque para
él el pago salió bien: salió bien. Lo que se agrega es `registroPendiente`
para el equipo.

Las seis quedaron cubiertas: tres en capture-order (la captura que no
completó, el monto que no coincide, y la crítica) y tres en el webhook (el
monto por aviso, la captura por aviso, y el rechazo). La de create-order ya
miraba su error desde antes, con su razón escrita.

LA PRUEBA

prueba-los-pagos-se-registran.ts no mira el texto: CORRE el ayudante contra
escrituras que fallan a propósito, que es la única forma de saber que el
reintento y el registro funcionan. Verifica que una escritura buena se haga
una sola vez, que una que falla y después funciona quede escrita, que una
que falla siempre lo diga y registre con la marca y con los datos
completos, y que una excepción no se escape. Después revisa que ninguna
escritura a paypal_orders cuelgue directo de un `await admin`. Verificada
rompiéndola: volviendo a poner una escritura suelta, marca rojo y la cuenta.

Batería: tsc limpio · build 21,7s · 95 pruebas en verde.

---

## 24/10/2026 · Cirugía 5 · El ADN completo tenía 568 líneas y ninguna puerta

App.tsx manda las rutas viejas a su lugar nuevo:

    const ALIAS = { agentes: 'entrenadores', manualNegocio: 'adn' };

Con eso `setCurrentPage('manualNegocio')` nunca llega, así que la condición
del render no se cumple jamás y ManualNegocio.tsx quedó sin ninguna puerta.
El alias fue una decisión: el Manual del Negocio se fusiona con Tu ADN.

El problema es que la fusión nunca se hizo. Son dos pantallas distintas, no
una versión ampliada de la otra. Lo verificado campo por campo:

· ManualNegocio muestra 28 campos del perfil con su contenido. Tu ADN tiene
  14 piezas, y de esos 28 campos solo TRES se ven con su texto —propósito,
  nombre del método y oferta media—, seis quedan como tilde sin contenido y
  DIECINUEVE no tienen ninguna vista. El cliente los genera en el Camino
  —el texto de su página, sus anuncios, su matriz ABC, sus ofertas alta y
  baja, su protocolo de entrega, sus tres versiones de la historia— y
  después no tiene dónde leerlos juntos.
· El selector del PAÍS del profesional vivía ahí, y es de donde sale el
  tono de todo lo que la app le escribe para publicar: páginas, anuncios,
  textos. El único otro lugar que lo pregunta es el asistente del primer
  día, que corre una sola vez. Sin esa pantalla el cliente no podía
  corregir su país nunca más — que es exactamente el problema que originó
  vozLocalizada.ts.
· Y los enlaces al paso exacto del Camino que completa cada campo, los
  únicos que leen `tcd_auto_open_adn_field` en Roadmap.tsx, que quedó
  esperando del otro lado.

ADEMÁS, TU ADN IGNORABA SUS PROPS

`export default function ADN({ setCurrentPage }: ADNProps)` — recibía
`perfil`, `userId` y `onProfileFieldUpdate` desde App.tsx y desestructuraba
solo uno. Las piezas leen de localStorage, que espeja apenas tres campos
del perfil, así que en un dispositivo nuevo el ADN se ve más vacío de lo
que está.

LO QUE SE HIZO

Tu ADN sigue siendo la pantalla del menú —la decisión de producto no
cambia— y el ADN completo vive un toque más adentro, con lo que ya estaba
construido y probado. Un botón, su camino de vuelta, y las cuatro props
que ya llegaban. El alias se queda: los avisos y enlaces viejos siguen
llegando a Tu ADN, que ahora sí lo contiene.

MÉTRICAS Y DIARIO, LAS DOS PEORES PANTALLAS DE LA AUDITORÍA

· Métricas tenía 22 de sus 24 bloques en el piso de 15 píxeles: sin
  jerarquía no hay qué leer primero. El número de cada tarjeta pasa de 24 a
  30, que contra una etiqueta de 15 se lee de un saque, con numerales de
  ancho fijo. Y el oro estaba en «Semana actual», el único dato de esa fila
  que el cliente NO puede mover: se mudó a «Tareas completadas», que es lo
  que se mueve trabajando hoy. La pestaña se llamaba TabEmbudo en el código
  y «Mi Sistema» en pantalla; ahora coinciden, y el validador acepta el
  valor viejo para que a nadie se le mueva la pestaña abierta.
· El Diario tenía el punto medio de la fecha dentro del span del día: con
  el gap del flex quedaba pegado al día y separado de la fecha, y a 390
  píxeles arrancaba la segunda línea solo. Ahora el separador es del texto.
  Sus tres píldoras tenían la misma sangría y distinta altura, porque la
  ponía el contenido —una lleva dos números, otra uno, otra un ícono—: todas
  a 44, que es el piso táctil que el botón de Historial tampoco alcanzaba. Y
  la misma forma: el cronómetro era el único redondo entre tres cuadradas.

EL ORO NO SE DEGRADA · LENTE NUEVO

«Oro mate en líneas de 1px, versalitas y numerales: nunca relleno, nunca
degradé, nunca glow» es la vara escrita, y había 17 degradés de oro. El
medidor tiene lente de degradé, pero mide el color calculado en reposo y un
`from-gold/[0.06] to-transparent` sobre el panel le da un color plano:
pasaban sin que nadie los viera. Todos a relleno plano, y la línea
decorativa del creador de contenido a 1px de oro liso.

Y cinco emojis más que el lente no alcanzaba: el ⏱ del cronómetro del
Diario está en U+23F1, fuera de los dos rangos que miraba — en ese mismo
bloque vive el ⌘ de «⌘K», que sí es tipografía, así que entran solo los
relojes. Igual el ⏳ y el ✅ del tablero de cupos y el ❌ de Bruno.

Batería: tsc limpio · build 21,7s · medidor 23 vistas, 0 faltas · 96
pruebas en verde, con prueba-el-adn-completo-se-llega.ts nueva.

---

## 24/10/2026 · Cirugía 6 · Entrenadores, los avisos dormidos, y lo que el oro no hace

ENTRENADORES, LA TERCERA PEOR PANTALLA

· Sus tres tarjetas tenían tres fondos distintos —verde traslúcido, oro al
  diez, oro al cinco— y ninguno era la superficie de la casa: la pantalla no
  tenía paneles, tenía manchas de color. Ahora la superficie es una sola y
  el estado lo dice la LÍNEA y el color del título, que es la vara.
· El pie eran dos textos con `justify-between` y sin hueco de reserva: a 390
  píxeles «Bloqueado» y «Ver requisitos» no entran en una línea y el flex
  los pegaba, así que se leía «BLOQUEADOVER REQUISITOS». Y decían lo mismo
  dos veces: el candado de arriba ya dice que está cerrada. Cerrada muestra
  una sola cosa; abierta, el nivel a la izquierda y la acción a la derecha.
· La tarjeta bloqueada llevaba `opacity-60` encima de TODO, incluido el
  texto que explica qué falta para abrirla — que es lo único que el cliente
  necesita leer ahí.
· El título decía «Entrenadores IA» y la barra de abajo dice «Entrenadores»:
  dos nombres para la misma pantalla.
· Y un `hover:from-gold/20` sin degradé, que no pintaba nada.

LOS AVISOS QUE NADIE DISPARA

Ocho de los dieciséis avisos no los llama ninguna pantalla. No están rotos:
están esperando. Quedan explicados en el código, porque son dos casos
distintos. Cuatro son PERIÓDICOS y necesitan un reloj del lado del
servidor: avisar «hoy no escribiste tu diario» pide algo que corra cuando
la persona NO entró, y desde el navegador eso no existe. Cuatro son POR
EVENTO y les falta el llamado donde pasa el evento.

El noveno sí se conectó: `notificarPilarDesbloqueado` estaba escrito al
lado del que sí se usa, y va justo donde el código ya sabe cuál es el pilar
que sigue y si quedó abierto — el mismo dato que alimenta el modal.

Y prueba-los-avisos-llevan-a-algun-lado.ts ahora los cuenta: si aparece uno
más sin conectar, avisa. Un aviso escrito y sin llamar no está roto, pero
si nadie los cuenta el montón crece y un día no se distingue el que falta
conectar del que ya no va.

EL EMOJI EN EL MOMENTO MÁS IMPORTANTE

El modal que se abre al completar un pilar mostraba el emoji del grado a 36
píxeles. Los once grados del Camino están escritos en el seed como escapes
—'\u{1F311}' es 🌑— así que el lente los buscaba como carácter y pasaban
enteros. El grado ahora se dice con su nombre y su metáfora, que es lo que
significa, y la ceremonia la pone la línea de oro. El emoji sigue en el
dato porque el Admin lo usa para reconocer de un vistazo en qué grado va
cada persona, y el título del aviso del cinturón tampoco lo lleva más.

MÁS VOCABULARIO DE LA CASA

· «setup» ×13 en Mateo, donde significa una forma de grabar: en la casa eso
  es una ESCENA, que además es como están agrupados los videos del PDF de
  rodaje. Y «¿Qué setup uso?» era un botón, lo primero que se lee al abrir
  ese chat.
· «screenshot» ×34 → captura, que es la palabra que la app ya usaba.
· «gratis» y «gratuito» ×36. Él los cobra: se puede decir que se prueba la
  primera semana a un costo mínimo o que el primer capítulo se ve sin
  costo, pero la palabra no va. Estaban sobre todo en los prompts de los
  entrenadores, que son los que después se lo dicen al cliente con esas
  mismas palabras — incluido un ejemplo que le sugería al modelo poner
  «GRATIS» en el sticker de un anuncio.
· Y «Veninme», un voseo mal escrito que ningún patrón podía adivinar.
· Siete tildes en avisos que el cliente lee: métricas, números,
  transformación, las tres versiones de la historia.

Las tres palabras quedan en el lente, con las prohibiciones y los malos
ejemplos como excepciones escritas. «brief» quedó afuera a propósito: sus
sesenta apariciones son el nombre de una variable y el lente no puede
separarlas del texto sin dar sesenta faltas falsas.

Batería: tsc limpio · build 19,9s · medidor 23 vistas, 0 faltas · 96
pruebas en verde.

---

## 24/10/2026 · El historial, al día con las seis cirugías



---

## 24/10/2026 · Cirugía 7 · El medidor tenía cinco puntos ciegos, y su cero valía menos

El medidor daba cero en 23 pantallas y era cierto. Lo que la auditoría
encontró es que medía menos de lo que parecía: cinco puntos ciegos, y cada
uno dejaba pasar una clase entera de falla.

1 · LO PLEGADO NO SE MEDÍA

El lente salta lo que está `display:none`, así que todo lo que vive dentro
de un `<details>` cerrado o de un acordeón plegado quedaba fuera. Ahí
estaban las nueve letras por debajo del piso que la auditoría visual
encontró a mano. Ahora se abre primero y se mide después: los `<details>`
y todo lo que tenga `aria-expanded="false"`.

2 · LAS TILDES ERAN UNA LISTA DE VEINTE PALABRAS

Medía veinte y dejaba pasar el resto del castellano. Ahora son reglas de
terminación —ninguna palabra termina en -ción, -sión, -logía, -grafía sin
su tilde— más la lista de las que no siguen regla. Dos trampas: los
PLURALES no llevan tilde (sesión → sesiones), y la primera versión los
incluía: catorce faltas falsas de una. Y un ACRÓNIMO tampoco (CLINICA es el
nombre del método), así que lo que viene todo en mayúsculas se descarta.
Encontró 20 tildes reales en el repositorio, entre ellas «Optimizacion -
Carga manual de metricas», que era un título de pantalla.

3 · LA INSIGNIA SOLO CAZABA EL ROJO

Una pastilla ámbar o verde con un contador pasaba sin que nadie la viera,
aunque grita igual. Ahora se mide la saturación del fondo: cualquier color
fuerte detrás de un número chico es una insignia, sea del color que sea.

4 · NO HABÍA LENTE DE COMPOSICIÓN

Los trece lentes miden de a un elemento: esta letra es chica, este borde es
de este color. Ninguno miraba la pantalla ENTERA, y por eso pasaban los
hallazgos que solo se ven de lejos. El lente nuevo cuenta los lenguajes que
cada pantalla habla a la vez:

  escala       cuántos TAMAÑOS de letra distintos (techo 5)
  pesos        cuántos pesos sobre un MISMO tamaño (techo 3)
  superficies  cuántos fondos de panel distintos (techo 5)
  esquinas     cuántos radios distintos (techo 4)

Escala y pesos van separados porque son dos problemas distintos: muchos
tamaños es una escala rota, muchos pesos sobre el mismo tamaño es
indecisión. La Biblioteca tenía cuatro tamaños —22, 18, 17, 15—, que es una
escala correcta, y ocho combinaciones con sus pesos, que no lo era.

Lo que encontró y se arregló:
· El Camino y la Biblioteca tenían CUATRO pesos sobre el mismo cuerpo de 15
  píxeles: 400, 500, 600 y 700. El 500 salió — en el mismo tamaño, 500 y 600
  son el mismo gesto.
· Lo mismo en Métricas, con cuatro.
· «Escribir» de Campañas tenía SEIS tamaños, tres de ellos escritos a mano
  fuera de la escala: 16, 20 y 21. El 16 no se distingue del 17 ni el 21 del
  20: lo único que hacen es obligar al ojo a resolver dos renglones que
  quisieron ser el mismo. Van a los de la escala.
· Y el radio: una píldora se escribe con un número enorme que el navegador
  devuelve resuelto, y daba «33554400» como si fuera un radio más. Cualquier
  radio mayor a media caja es la misma figura, y cuenta como una.

El techo de pesos quedó en 3 —cuerpo, énfasis y versalita, que es lo que la
app usa y cada uno hace un trabajo distinto— y no en 2. Bajarlo es una
decisión de sistema de diseño sobre mil usos, no un barrido, y merece su
propio turno con las 23 capturas al lado. Queda escrito en el medidor.

5 · Y «PASO A PASO L-01»

El catálogo de la Biblioteca usaba el código interno de respaldo cuando un
video todavía no tiene título cargado, así que el cliente leía «Paso a paso
L-01» justo en la pantalla donde elige qué mirar. Ahora dice el día, que es
con lo que se ubica. Y `L-01` entró al lente de códigos.

Lo que NO se hizo, y por qué: medir el hover y el foco. Es el punto ciego
que queda, y es el más caro —cada botón de cada pantalla, con su pasada— y
el de menos valor relativo: el reposo es lo que el cliente ve el 99% del
tiempo.

Batería: tsc limpio · build 19,9s · medidor 23 vistas, 0 faltas — y ahora
ese cero cubre cuatro lentes más, los bloques plegados abiertos, las tildes
por regla y la insignia de cualquier color · 96 pruebas en verde.

---

## 24/10/2026 · Cirugía 8 · El lente de lenguaje daba 55 hallazgos y 34 eran falsos

Un lente con el 62% de ruido es un lente que se ignora. Este no se corría
en la batería —ni siquiera salía con error— justamente por eso.

LOS 34 FALSOS, UNO POR UNO

· 27 eran el CÓDIGO de la sesión marcándose a sí mismo: «[código] Sesión
  P0.3: P0.3». El recorrido tomaba todo string del objeto, incluido el campo
  que guarda la clave. El cliente nunca ve «P0.3»: lo ve la app para saber
  de qué sesión habla. Igual `requiere_datos_de`, que es una lista de
  referencias entre herramientas.
· 5 eran el «Pixel» de Meta, que es el nombre propio del producto: el
  cliente tiene que buscarlo con esa palabra dentro de Meta, y llamarlo de
  otra forma lo dejaría sin saber qué está instalando. Es la única palabra
  en inglés que se queda, y queda con su razón escrita al lado.
· 12 eran párrafos perfectamente legibles que el lente partía mal. La regla
  es «una idea por frase, máximo veintidós palabras», pero la frase no
  termina solo en punto: un guion largo, un punto medio, dos puntos o una
  flecha cortan igual de fuerte, y esta app los usa a propósito — «Tres
  reglas y ninguna se negocia: UNA campaña (la fuerza no se divide) · el
  presupuesto de tu Plan · público amplio» se lee de corrido.

LOS 21 REALES, ARREGLADOS

· «Tu embudo dibujado» y «Sube la foto de tu embudo» en la evidencia del
  día 11 → tu captación.
· «Campaña 2, retargeting: quienes vieron tu recurso» → «Campaña 2, para
  quienes ya te vieron» — la frase ya se explicaba sola, la palabra sobraba.
· «Hoy un lead de prueba recorre TODO tu circuito» ×2 → un interesado.
· «Generador de Oferta High + Low + Lead Magnet» → «Generador de tus tres
  ofertas y tu recurso de entrada».
· «Generador de Copy de Landing Page», «Copy completo usando Avatar +
  Matriz + Oferta Mid» y «Copy de landing page» → el texto de tu página.
· «tono de voz y brief completo» → el resumen de tu marca.
· «Captura de tu perfil terminado = tu evidencia» → el signo igual fuera.

Y QUEDÓ SOSTENIDO

Desde que está en cero, el lente SALE CON ERROR cuando encuentra algo, y
`prueba-el-lenguaje-de-las-sesiones.ts` lo corre dentro de la batería. Vive
aparte porque otras pruebas le importan sus reglas y ejecutarlo al
importarlo imprimiría su informe entero cada vez; por eso tiene su guarda de
«ejecutado directo» y por eso la prueba lo llama como proceso. Verificada
rompiéndola: devolviendo «lead» a su sesión, marca rojo y nombra la zona.

Batería: tsc limpio · build 18,6s · medidor 23 vistas, 0 faltas · 97
pruebas en verde · el lente de lenguaje en 0 de 1.004 textos.

---

## 24/10/2026 · Cirugía 9 · Un gesto para «elegido», un nombre para cada destino

NUEVE FORMAS DE DECIR QUE ALGO ESTÁ ELEGIDO

Cada una escrita a mano por quien la necesitó ese día:

    border-gold bg-gold/10 text-cream        en la sesión guiada
    bg-gold/20 text-gold border-gold/30      en las pestañas de Métricas
    border-gold/50 bg-gold/10                en el generador de imagen
    bg-gold/15 border-gold/40 text-gold      tres líneas más abajo
    border-gold bg-gold/[0.12]               en el Diario
    border-gold bg-[var(--card,#FFFDF7)]     en el punto de partida
    bg-gold/15                               en el menú lateral
    bg-gold/12                               en el editor
    border-gold/60                           en los anuncios

Ninguna se ve mal por separado. Se ven mal en conjunto, porque el cliente
aprende qué significa cada forma y en la pantalla siguiente significa otra.

Quedan dos clases en el tema, y la diferencia entre ellas es de función y no
de gusto: `.elegido` para una opción, una tarjeta o una fila —el texto es del
cuerpo, porque es contenido— y `.elegido-etiqueta` para una pestaña o una
píldora en versalitas, donde el texto sí va en oro. El gesto es línea de oro
de 1px con el fondo al 10%, que es la vara: el 10% no es un relleno, es lo
que hace que la caja se distinga de sus vecinas sin pintarse de dorado.
Treinta y cinco lugares pasaron a usarlas.

El verde y el ámbar quedaron fuera: no dicen «elegido», dicen «completado» y
«atención». Y nueve lugares más usan oro en una caja por OTRO motivo —el
nivel del freno, los puntos de progreso del asistente, el dato que Métricas
destaca, la burbuja de quien habla en el chat, el nivel de energía— y van
nombrados uno por uno con su razón en la prueba: un lente que los marcara
daría dieciocho faltas de cosas correctas, y uno que los adivinara con un
patrón dejaría pasar las de verdad.

prueba-asi-se-dice-elegido.ts lo sostiene, y su primera versión tenía el
hueco clásico: exigía que la condición se llamara `on`, `activo` o
`seleccionado`, así que no veía `tab === 'progreso' ? …`, que es justo el de
las pestañas de Métricas — daba verde con el gesto escrito a mano adentro.
Ahora mira cualquier ternario y lo que acota es el filtro: solo cuenta si
pinta el FONDO o el BORDE en oro. Un `text-gold` suelto es el color del
contenido, y ese oro está bien.

TRES NOMBRES PARA LA MISMA PANTALLA

El nombre de cada destino se escribe en tres lugares —la barra de arriba, el
buscador y la barra de abajo— y nada obligaba a que coincidieran:

  mensajes   arriba «Soporte» · buscador «Acompañamiento» · abajo «Contacto»
  campanas   «Campañas» en dos lados y «Campañas y piezas» en el buscador
  creador    «Contenido» con mayúscula en un lado y minúscula en el otro

El cliente tocaba «Contacto» abajo, la barra de arriba le decía «Soporte» y
el título de la pantalla «Acompañamiento»: tres palabras para el mismo lugar,
en la misma pantalla, al mismo tiempo. Es la clase de cosa que hace que
alguien no encuentre lo que ya encontró ayer.

«Soporte» —palabra de mesa de ayuda— salió. Las barras dicen «Contacto», que
es donde se toca, y el encabezado de la pantalla dice «Acompañamiento», que
es lo que es: cada palabra contesta algo distinto, y por eso conviven.

Las formas CORTAS son legítimas —con cinco pestañas en 390 píxeles no entra
«Acompañamiento» ni «El Camino»— pero ahora están DECLARADAS: el Tab de la
barra de abajo lleva su `nombreCompleto`, así la relación vive en el dato.
Declaradas son un sistema; sueltas, un desacuerdo.
prueba-un-destino-un-nombre.ts compara los tres lugares y solo deja pasar la
diferencia que está escrita. Verificada rompiéndola: devolviendo «Soporte» al
buscador, nombra los tres.

Batería: tsc limpio · build 22,1s · medidor 23 vistas, 0 faltas · 99 pruebas
en verde.

---

## 24/10/2026 · El historial, al día con las nueve cirugías



---

## 24/10/2026 · Cirugía 10 · Lo primero que ve el que acaba de pagar

El medidor medía la app con veinte días de programa y la cuenta ya andando.
Nunca midió lo PRIMERO que ve el que acaba de pagar —el día 1, sin una sola
tarea hecha, sin diario, sin números— que es justo la pantalla que decide si
vuelve mañana. Ni lo que ve quien compró el escalón de entrada, que tiene
casi todo el Camino cerrado y lo único que mira son las puertas.

Ahora las ocho pantallas que se pisan el primer día se miden también en esos
dos estados: 39 vistas en vez de 23.

EL CANDADO COMERCIAL SE ABRÍA SOLO SIN BASE

El Camino hace bien lo difícil: distingue el tramo cerrado POR FECHA —«Se
abre el día 8», que llega solo— del cerrado POR PLAN, donde pone la puerta
que vende el escalón siguiente con su precio.

Lo que no hacía bien es de dónde sacaba el plan. Tres pantallas lo decidían
con `planDe(perfil)`, y ese perfil viene de Supabase: en App.tsx es `null`
mientras la base no contesta y queda en `null` si no contesta nunca. Con el
perfil vacío, `planDe` cae en su respaldo de 'completo' y el candado se abre:
sin internet, con un error de red, o en el modo sin base. Y el contenido de
las 91 jornadas viaja en el paquete de la app, así que ahí quedaba todo a la
vista — medido: 10 puertas de fecha y 0 de plan donde tenían que ser 9 de
plan y 1 de fecha.

`planDelCliente` mantiene el orden de siempre —lo que pagó manda— y agrega el
respaldo que faltaba: si el perfil no llegó, vale el espejo que auth.ts
escribe en localStorage al entrar. Y si no hay ninguno de los dos se abre,
porque a nadie se le cierra el Camino por un fallo técnico: ese bug ya pasó,
con el que pagaba La Base y seguía viendo el día 5 con candado justo después
de pagar.

LO PRIMERO QUE LEE, Y QUE NOMBRABA LO QUE NO ES SUYO

«¿Qué ya tienes andando?» es la primera pantalla del Camino y tiene once
cosas repartidas por los noventa días. A quien compró el escalón de entrada
se le mostraban las once, así que lo primero que leía al abrir la app era una
lista de diez cosas que su plan no incluye: «tengo campañas corriendo»,
«tengo Meta conectado y mi pixel midiendo». Marcar cualquiera no le cambiaba
nada, porque esas jornadas no son suyas todavía. Las puertas del Camino ya le
dicen con qué se abre cada tramo y cuánto cuesta; esta pantalla pregunta por
lo que SÍ va a hacer esta semana. Ahora escala con el plan: 1, 5, 9 y 11.

Y `pilarDelDia` vive en el seed, que es donde está la correspondencia: los
planes razonan en pilares y esta lista razona en días.

DOS VECES SE EQUIVOCÓ LA PRUEBA ANTES DE ACERTAR

La primera medición del escalón de entrada salió idéntica a la del programa
completo, y las dos primeras veces el error era mío: el medidor escribía
`plan: 'DWY'` fijo en el perfil —así que `planDe(perfil)` nunca veía el plan
de la corrida— y después lo escribió en `plan`, que es un campo que `planDe`
solo entiende para 'ELNUMERO'. Recién con `plan_comercial`, que es el que
escribe el checkout, se vio que el hueco era de verdad. Las dos
equivocaciones quedan escritas en el medidor, al lado del campo que importa.

Batería: tsc limpio · build 22,8s · medidor 39 vistas, 0 faltas · 100 pruebas
en verde, con prueba-el-candado-no-depende-de-la-base.ts nueva, verificada
rompiéndola.

---

## 24/10/2026 · El historial, al día con las diez cirugías



---

## 24/10/2026 · Cirugía 11 · El final del Camino estaba roto en el teléfono

Las dos pantallas del final no se habían medido nunca, y la segunda es el
momento comercial más importante del programa.

EL CIERRE DE CUENTAS, PARTIDO EN DOS COLUMNAS

Es lo que ve quien terminó sus noventa días o se quedó sin ventana: su cierre
de cuentas y, debajo, los tres pases de renovación. Lo único que tiene
delante, al mismo tiempo, todo lo que construyó y la pregunta de qué hace con
eso.

Su contenedor era un `flex` sin dirección —que pone en FILA— y sus dos hijos
son el cierre y los pases. A 390 píxeles cada uno se quedaba con medio ancho:
el texto salía en columnas de tres palabras por renglón, los dos numerales se
montaban uno sobre otro —«jornadasquedaro» / «completasdias»— y los precios
de los pases se cortaban por la derecha. El medidor daba cero en 39 vistas
porque esta no era una de ellas.

LO DEMÁS QUE APARECIÓ AL MIRARLAS

· «Se cerró el 2026-10-14»: la fecha cruda de la base, en la pantalla donde
  se le cuenta a alguien qué hizo con sus noventa días. Ahora va en palabras,
  y la decisión de cómo se escribe una fecha vive en un solo lugar —cada
  pantalla tenía su propio `toLocaleDateString` con sus propias opciones. Se
  parte a mano, porque `new Date` sobre una fecha sin hora la lee como
  medianoche UTC y en Argentina devuelve el día anterior.
· «Tu atraso más grande fue de 0 días» con cero jornadas hechas: no hay
  atraso que medir cuando no se empezó. La frase aparece cuando hubo uno.
· La garantía dicha dos veces seguidas con distintas palabras —«la garantía
  corre a nuestro cargo» arriba y «La garantía corre: seguimos sin costo»
  abajo— que suena a que se está justificando algo. El dato va arriba, lo que
  significa abajo.
· La graduación del día 90 con el telón en negro al 90% y la tarjeta en
  degradé, dos cosas que la casa no usa, y «Cinturón negro» escrito dos veces
  seguidas, en dos tamaños y dos tonos de oro. El único negro que queda es la
  caja del video, que va sobre negro porque el video trae sus propias barras.
· Y cuatro pesos sobre el mismo cuerpo de 15 píxeles, que el lente de
  composición cazó apenas la pantalla entró a medirse.

EL MODO SIN BASE DEJABA MEDIO PRODUCTO INVISIBLE

`supabaseProfile` quedaba en `null` cuando no hay base configurada, así que
todo lo que lo recibe como prop se comportaba como si el cliente no tuviera
nada: el candado comercial abierto, el cierre de la ventana sin mostrarse
nunca, el ADN completo vacío. En el único modo en que se puede medir sin una
cuenta de verdad. Ahora el perfil de la memoria ES el perfil en ese modo. Con
base configurada no cambia nada: ahí manda la sesión, y si el perfil no llega
la app lo dice en vez de entrar a medias.

Esa es la razón de fondo por la que la ventana vencida no la había visto
nadie, y por la que hubo que arreglar primero el modo para poder medirla.

Batería: tsc limpio · build 23,8s · medidor **41 vistas**, 0 faltas · 101
pruebas en verde, con prueba-el-final-del-camino.ts nueva, verificada
rompiéndola — y el medidor también: devolviendo el `flex` en fila, el cierre
vuelve a dar 4 faltas y la corrida falla.

---

## 24/10/2026 · Cirugía 12: la barra no tenía nombre, y el serif no obedecía

EL NOMBRE DE LA PANTALLA NO SE VEÍA EN NINGUNA

La barra de arriba tiene dos grupos con `justify-between`: el título a la
izquierda, los botones a la derecha. El de la derecha lleva `shrink-0`; el del
título llevaba solo `min-w-0`, que lo deja achicarse pero no le reserva nada.
Medido en la barra de verdad: la derecha ocupaba 355 de los 358 píxeles útiles
y el h1 quedaba con clientWidth CERO, en los catorce destinos del teléfono.

Lo que llenaba la barra era el contador de créditos: 130 píxeles diciendo «0
créditos», con un comentario al lado que afirmaba estar «oculto via flag
mientras el sistema esta apagado». El flag apagaba solo si alguien escribía
VITE_CREDITS_ENABLED=false, y esa variable no está declarada en ningún lado.
En todo entorno estaba ENCENDIDO. Más 53 píxeles en la inicial del cliente,
que no es un botón: no tiene acción y al tocarla no pasa nada.

EL SERIF NO OBEDECÍA A SUS PROPIAS CLASES

`h1, h2, h3 { font-family: display; font-style: italic }` estaba FUERA de
capas, y una regla sin capa vence a cualquier capa, utilities incluida. En un
encabezado, `font-sans` y `not-italic` no hacían nada. Dos lugares lo pedían:
el título de la barra salía en itálica pidiendo `not-italic`, y el nombre de
cada entrenadora salía en la Garamond de display a 18 px pidiendo `font-sans`.

DOS LENTES MÁS, Y UNO CALIBRADO

`aplastado` caza el texto que el layout deja en cero de ancho — era el peor
punto ciego, porque `vis()` pide ancho > 0 y lo aplastado no entraba en NINGÚN
lente. `serifChico` deja fuera las versalitas: en caja alta no hay altura de x
y la versalita del libro a 15 es una pieza de la casa. De los 12 que marcaba,
9 eran eso.

---

## 24/10/2026 · Cirugía 13: la piel de la conversación

LA LÍNEA DE 1PX ERA CASI NEGRA EN CASI TODA LA APP

La app escribía la línea así: `border-[var(--line, rgba(142,104,36,0.18))]`. Y
eso NO es una clase: dentro de los corchetes un espacio literal termina el
nombre, así que llegan dos clases sueltas y ninguna declara color. El borde se
quedaba en `currentColor`, que en el tema claro es la tinta. 224 bordes así.
Se supo midiendo el color CALCULADO: daba la tinta y no el respaldo de oro.

EL MENTOR ERA LA PANTALLA MÁS LEJOS DE LA VARA

Y es el botón que está en las 23. Burbujas con sombra de negro puro al 30 y al
35% —siete veces la de la casa, porque `--shadow-card` no se redefinía en el
tema claro—, la burbuja del cliente en oro macizo, el botón de enviar un
círculo de oro escrito a mano, los tres atajos comprimidos a cuatro renglones
cada uno, el campo de escribir DEBAJO de las pestañas, un encabezado de cuatro
renglones en mayúsculas con dos retratos para una sola voz, y «Tu coach está
conectando ideas», con la palabra que la casa tiene prohibida.

UNA PALABRA PARA LA UNIDAD DEL CAMINO

Se contaba con tres: «de 91 PASOS» en el numeral más grande de la app, «de 65
JORNADAS hechas» en la Hoja de Ruta, «TAREAS completadas» en Métricas. Y
«paso» ya nombra los cinco o seis que hay DENTRO de cada jornada.

---

## 24/10/2026 · Cirugía 14: un destino, un nombre, en cuatro lugares

EL CUARTO LUGAR

La prueba comparaba la barra, el buscador y las pestañas. Falta el título que
la pantalla pinta adentro, y ahí sobrevivió el bug original: «Contacto»
arriba, «Acompañamiento» en el buscador, «Soporte» en el encabezado. Y un
quinto: el mapa del menú que el Soporte le da al cliente, con cuatro nombres
que ya no existen.

LA PIEL DEL CAMPO

Cinco pieles para un campo, y la dominante daba un rectángulo HUNDIDO con su
línea más clara que él mismo. En Contacto eran tres bloques grises sin ninguna
línea a la vista. La casa no hunde: apoya.

Y veinte cosas más que salieron de mirar las 48 capturas una por una: los
numerales de Métricas a cuatro alturas distintas, «Desbloquea siguiente pilar»
en el Camino, el párrafo del Diario envolviendo a la mitad del ancho por el
mismo bug de la barra, «MiClínica Digital» sin espacio en la pantalla del día
90, el cierre de cuentas con un numeral de 34 contando las faltas al lado de
otro contando los logros.

---

## 24/10/2026 · Cirugía 15: el medidor abría la app vacía, siempre

EL PARÁMETRO QUE NADIE LEÍA

`preparar()` declaraba `hechas=12`, lo pasaba a la función del navegador, lo
destructuraba allá… y nadie lo usaba. Estaba muerto desde que se escribió, así
que las cuarenta y ocho vistas midieron siempre la app del día uno: cero
jornadas cerradas, cero piezas del ADN, cero en cada contador.

Es el mismo patrón que esta casa ya encontró tres veces —código escrito,
probado y nunca conectado— pero una capa más abajo: en la herramienta que
mide, que es la que debería encontrarlo.

LO QUE SOLO EXISTE CON DATOS

Los numerales de cinco y seis cifras, que es donde se ve si la caja aguanta.
Los textos que el cliente escribió —su historia, su método, su avatar— que son
párrafos y no dos palabras. Las listas de setenta jornadas. Las barras llenas.

Seis vistas nuevas abren la cuenta en el día 72: setenta y una jornadas
cerradas, los veintiocho campos del ADN escritos, cuarenta y cinco días de
diario y los números de un mes bueno. Las claves de jornada salen del seed,
porque son `${pilar.numero}-${meta.codigo}` y esa correspondencia vive ahí.

Y A LA PRIMERA CORRIDA

El ADN completo —los veintiocho campos del negocio, el corazón de lo que la
app construye— se mostraba a 14 píxeles. `prose-sm` del plugin de tipografía
fija el cuerpo en 0.875rem y lo hace con su propia clase, que vence a las
utilidades. Trece lugares lo usan. Con el ADN vacío no hay nada que renderizar,
así que el lente de letra chica no tenía qué medir.

Y un error del propio estado de prueba, que la prueba nueva ahora caza: la
primera versión inventó diez claves de ADN que la app no lee, y el Manual
seguía diciendo «1 de 28» con el ADN supuestamente lleno. Un estado de prueba
que no coincide con el dato real mide la pantalla vacía creyendo que la mide
llena.

---
## 24/10/2026 · Cirugía 16: el progreso del cliente se borraba solo

LO QUE SE MIDIÓ

Setenta y una jornadas guardadas. Se abre El Camino. A los trescientos
milisegundos: cero. A los tres segundos: cero. Y no vuelven.

El cliente tampoco puede entender qué pasó, porque con cero jornadas vuelve a
aparecer «¿Qué ya tienes andando?», la pregunta del día cero. Lo que ve es la
app recién estrenada, con su trabajo de setenta días adentro y sin forma de
llegar a él.

DOS COSAS AL MISMO TIEMPO, EN EL MISMO ARRANQUE

El efecto que guarda corría en el primer render, cuando `completadas` todavía
es el conjunto vacío con el que arranca, y escribía ese vacío encima de lo
guardado.

Y la carga desde la base hacía lo que su comentario decía —«la DB es la fuente
de verdad»— y escribía su resultado tal cual encima del espejo local. Con la
base devolviendo menos filas que el espejo —una cuenta nueva allá con progreso
acá, un dispositivo que trabajó sin conexión, una escritura que no llegó— eso
borra el trabajo del cliente. Y en el modo sin base ese espejo es su única
copia.

HACEN FALTA TRES COSAS, NO UNA

Un `yaCargo` que marque cuándo terminó la carga no alcanza solo: se marca al
terminar, pero el estado no se refleja hasta el render siguiente, y entre medio
el efecto corre con el conjunto todavía vacío. Con el flag puesto, las setenta
y una se perdían igual.

Así que: el flag, la base que une en vez de reemplazar, y un conjunto vacío que
nunca se escribe cuando hay jornadas guardadas. Queda un solo lugar en El
Camino que guarda el progreso. Dos lugares escribiendo la misma clave en el
mismo arranque es exactamente cómo se perdía.

Y LO MISMO ESTABA EN DOS PANTALLAS MÁS

Arreglado El Camino, quedaba la pregunta de quién más escribe esa clave. Son
siete lugares. Cinco están bien: El Número suma su jornada sin tocar las demás,
la graduación reabre los cinco días y solo si el cliente lo confirma, y App.tsx
siempre unió.

Los otros dos tenían el mismo borrado. HOY —que es la pantalla de inicio, la
que corre en CADA apertura de la app— y el CREADOR. Los dos traían la hoja de
ruta y escribían su resultado tal cual. En el Creador la consulta que falla ya
estaba cubierta; la que responde bien con cero filas no lo estaba, y esa
escribe `[]` encima de todo.

UNIR A CIEGAS TAMPOCO ERA LA RESPUESTA

Desmarcar una jornada es un acto del cliente, y la base lo guarda como una fila
con `completada: false`. Una unión que ignora esas filas nunca lleva el
desmarcado al otro dispositivo: el tilde vuelve solo.

Así que la base manda donde HABLA y calla donde no tiene fila. Fila cerrada,
jornada cerrada. Fila desmarcada, jornada abierta. Sin fila, lo que diga el
espejo local. Es un solo criterio —`unirProgreso`— y lo comparten las tres
pantallas; ninguna escribe la clave a mano. La prueba no mira el código: corre
la función con los ocho casos que de verdad pasan, el de la base que responde
bien con cero filas incluido.

Verificado también de comportamiento en las tres: las setenta y una sobreviven.

Y DOS COSAS DE OFICIO QUE SOLO APARECEN CON DATOS

El banner que pide completar el ADN tenía su título en el serif de display a
dieciocho píxeles. Por debajo de veinte, la altura de x de ese italic es tan
chica que se lee como una mancha. A veinte.

Y El Camino con datos hablaba seis lenguajes de superficie a la vez, con techo
en cinco. Dos eran redundancia pura: las filas de ese banner al cuarenta por
ciento de la misma tinta con la que las demás filas de la pantalla están al
veinte, y la portada de sistema repintando con el mismo color un fondo que su
propia caja ya pintaba. Pintura muerta que el ojo no ve y la cuenta sí.

POR QUÉ APARECIÓ TODO AHORA

Porque es la primera vez que se mide la app con datos. Con la cuenta vacía no
hay progreso que perder, no hay filas cerradas que pintar y el banner del ADN
no se muestra. Cuarenta y ocho vistas en cero no decían nada de esto.

---
## 24/10/2026 · Cirugía 17: el teléfono angosto

TODO SE MEDÍA A UN SOLO ANCHO

390 píxeles, que es un iPhone de los últimos. El cliente de esta casa está en
Latinoamérica y una parte entra desde un Android, donde 360 es el ancho más
común. Treinta píxeles menos, y aparecieron tres cosas.

LA BARRA DE ABAJO TENÍA NÚMEROS PUESTOS A MANO

Cada una de las cinco pestañas declaraba cuánto ancho se llevaba: 0.8, 1, 1.6,
1.25, 1.1. Esos números estaban mal en todos los anchos.

Medido a 360: «Hoy» recibía cincuenta píxeles para una palabra de veintinueve y
«Campañas» recibía setenta y siete para una de setenta y nueve. Así que
«Campañas» y «Contacto» ya salían cortadas mientras sobraban veintiún píxeles
al principio de la barra. A 390 zafaba por casualidad. A 320 «Contacto» se iba
de la pantalla, y Contacto es la única forma que tiene el cliente de llegar al
equipo.

Ahora ningún número: cada botón mide lo que mide su palabra y los píxeles que
sobran se reparten entre ellas como aire. Se corrige solo si una palabra cambia
y a cualquier ancho. La letra sigue en quince, que es el piso de la casa.

EL CAMINO SE ARRASTRABA DE COSTADO

La fila de la meta lleva dos textos que no se cortan: «N de 10 pacientes» y
«Registrar venta». A 320 suman trescientos tres píxeles en doscientos setenta y
dos de ancho, así que el botón se iba diecinueve de la pantalla y toda la
pantalla se podía arrastrar. Ahora el botón baja a su renglón cuando no entra,
y a 360 y 390 la fila sigue siendo una sola.

Y UN TOKEN SIN REEMPLAZAR, A LA VISTA DEL CLIENTE

Entrenadores nunca se había medido con la cuenta llena, porque con la cuenta
vacía su contenido es el mismo. Pero no: con progreso se desbloquean los ocho
entrenadores, y uno decía «Te entreno a conversar con {{consultantes}} sin
rogar ni convencer». La frase se pintaba sin pasar por el reemplazo de
vocabulario, en dos lugares.

En la misma lista, un entrenador decía «Medimos, ajustamos, escalamos» —palabra
prohibida, en una tarjeta que el cliente lee al abrir la pantalla.

Y EL DETECTOR QUE DEBÍA HABERLO CAZADO

Conjugaba cuatro formas del verbo: escalar, escalable, escalas, escala.
«Escalamos» no estaba.

Al probar la lista contra sí misma apareció algo peor. El patrón terminaba en
`\b`, y en JavaScript `\w` es solo ASCII: la `ú` no es carácter de palabra, así
que entre «gurú» y el espacio que sigue no hay límite de palabra y la
coincidencia fallaba entera. «Gurú» —la palabra más prohibida de esta casa—
nunca coincidió, desde que la lista existe. Igual «gurúes». Cualquier prohibida
que terminara en tilde tenía el mismo agujero.

El límite ahora es «ni carácter de palabra ni letra con tilde»: el ASCII cubre
los identificadores, que no son texto que alguien lee —`coach_instruccion` daba
una falta falsa con solo las letras— y las tildes cubren el castellano. Y la
prueba mide la lista contra sí misma: diecisiete formas que tiene que cazar,
siete que son nuestras y no debe tocar. Una lista de palabras incompleta da un
verde que no significa nada.

LO QUE QUEDA, Y NO ES DE CÓDIGO

A 320 píxeles —el piso histórico de la web— cinco etiquetas a quince píxeles
piden trescientos treinta y cuatro de los trescientos dieciséis que quedan.
«Entrenadores» son doce letras y es la más larga de las cinco; también es la
que se corta en la barra de arriba. Eso se arregla con una palabra más corta
para ese destino, y es una decisión de la casa, no del medidor.

A 360 se garantiza: entra ahí o es una falta. Siete vistas nuevas, estrictas.

---
## 24/10/2026 · Revisión sin hallazgo: el teclado abierto

El teclado de un teléfono se lleva cerca de 440 de los 844 píxeles de alto, y
esta app se escribe: el ADN son veintiocho campos y el reporte al equipo son
tres. Si al tocar un campo el cliente no ve lo que escribe, no cierra la
jornada.

Medido a 390 por 400, que es lo que queda con el teclado arriba, en las
pantallas que tienen campos: Acompañamiento, El Número, el Creador, el Diario y
Campañas. El contenedor que desplaza llega a 2207 píxeles de recorrido, así que
los tres campos del reporte y el botón de mandar se alcanzan. Nada que arreglar.

Y dos cosas que la propia revisión dejó claras, por si alguien la repite:

Mi Diario, Mi ADN, Métricas y Campañas no tienen campos de texto propios: lo
que el cliente escribe de su ADN se escribe en la jornada que lo pide, no en la
pantalla que lo muestra. Cero campos ahí es correcto, no una sonda ciega.

Y la sonda dio tres falsos positivos antes de dar la respuesta: enfocar un
campo no desplaza si ya se ve en parte, el documento no desplaza porque el que
desplaza es `main`, y el menú lateral desplaza por derecho propio aunque esté
cerrado, así que una sonda que busca «el primer contenedor que desplaza»
encuentra el menú. Los tres se leían como fallas de la app. Una medición que no
se entiende no es un hallazgo.

---
## 25/10/2026 · Cirugía 18: el cliente que escribe mucho

EL CAMPO PEDÍA TRESCIENTAS PALABRAS Y LA PRUEBA LE PONÍA CINCUENTA

La cuenta con datos tenía textos realistas pero cortos. El campo se llama
`historia_300` —trescientas palabras, se lo pide la app al cliente— y el estado
de prueba le ponía cincuenta y cinco. El que llena ese campo como se lo piden
no es un caso raro: es el que usa bien la app.

Entonces: el mismo día 72, con cada campo en la extensión que su propio nombre
pide, un nombre con dos apellidos y numerales de siete cifras. Cuatro vistas
nuevas, estrictas, en las cuatro pantallas que muestran lo que el cliente
escribió.

Y la app aguantó. Las cuatro en cero: ni un párrafo cortado, ni un panel
estirado sobre nada, ni un numeral partido. Es la primera vez en este arco que
un estado nuevo no destapa nada, y vale decirlo: lo que estaba bien, estaba
bien.

CON UNA SALVEDAD, QUE APARECIÓ EN LA FOTO

La barra de abajo repartía el aire con `justify-between`, que pega la primera
etiqueta contra el filo izquierdo y la última contra el derecho. Medido a 390:
«Contacto» terminaba a dos píxeles del borde. Ahora el sobrante se reparte en
los seis lugares —las cuatro juntas y las dos puntas— así que a 390 cada punta
respira ocho píxeles y a 320, donde no sobra nada, se comporta igual que antes.

LO QUE PROTEGE QUE ESTO SIGA MIDIENDO ALGO

El riesgo de un estado de prueba es silencioso: si alguien acorta uno de esos
textos, las cuatro vistas siguen corriendo y siguen dando verde, midiendo los
textos cortos otra vez. Ya pasó dos veces en esta casa —el parámetro `hechas`
que nadie leía y las diez claves de ADN inventadas— así que la prueba nueva no
mira el código: corre el generador y cuenta las palabras que salieron. Y mide
los dos lados, porque si el modo corto devolviera el largo, las seis vistas de
la cuenta llena medirían otra cosa que la que dicen medir.

También quedó una caché por modo en vez de una sola. Con una sola, la segunda
tanda recibe el estado de la primera y las cuatro pantallas de texto largo
miden los textos cortos.

---
## 25/10/2026 · Cirugía 19: el medidor mira, y ahora algo toca

EL PUNTO CIEGO MÁS GRANDE

El medidor abre una pantalla, la fotografía y cuenta lo que ve. Nunca toca
nada. Así que un botón que no guarda es invisible para él: la pantalla se ve
perfecta, las veintiuna lentes dan cero, y el cliente pierde su trabajo.

No es una hipótesis. El Camino borraba setenta y una jornadas al abrirse y las
sesenta y un vistas daban cero mientras lo hacía.

`medir-guardado.py` toca. Tres bucles, los que un cliente que paga hace todas
las semanas: llegar a la jornada del día, escribir su día en el Diario y cargar
su precio en Mi Número. Los tres se miden igual: se abre la pantalla, se toca,
se RECARGA y se pregunta si sigue ahí. Recargar es la parte que importa — sin
eso se mide el estado de React, que siempre dice que sí.

Los tres responden. Y se los vio romper: saboteados a propósito, los tres
fallan; restaurados, los tres pasan.

LO QUE LA SONDA SE EQUIVOCÓ SEIS VECES ANTES DE ACERTAR

Vale escribirlo, porque cada error se leía como una falla de la app:

Tenía su propia copia de la semilla y difería en cosas que deciden qué se
renderiza —el `id` del perfil, el `plan_comercial` que lee el candado
comercial— así que las tres pantallas abrían sin contenido. Ahora `preparar()`
se importa del medidor: dos semillas que dicen montar la misma cuenta son dos
cuentas distintas.

Abría con la cuenta del día 72. Y las tres pantallas aparecían sin un campo ni
un botón, no por una falla sino porque es lo correcto: con el día de hoy ya
escrito y la semana ya cargada, la app muestra lo guardado en vez del
formulario. La cuenta llena es para MIRAR; para TOCAR hace falta la de quien se
sienta a trabajar hoy.

Buscaba los números en Métricas, que los MUESTRA —dos pestañas, ningún campo—.
Se escriben en Mi Número. Y llenaba uno de los tres campos: el botón «Este es
mi precio nuevo» aparece recién con los tres.

Buscaba las jornadas entre los `button`, y una jornada es un `div` con
`onClick` y su `id` `meta-<codigo>`. (De paso: un div que se toca sin
`role="button"` ni foco de teclado no lo alcanza nadie que no use el dedo.
Queda anotado — es un patrón de toda la app, no una línea.)

Tocaba la tarjeta del tramo «para abrirlo» y lo CERRABA: al cargar, el Camino
abre solo el tramo en curso, y su tarjeta alterna.

Y tocaba «Día 27 · Fin de semana · 0 min» esperando un taller, porque buscaba
la clase `lucide-check-circle-2`, que no existe — la cerrada lleva
`lucide-circle-check` y la abierta `lucide-circle`. Con la clase equivocada,
las tres jornadas cerradas del tramo pasaban por abiertas.

Seis veces la app estuvo bien y la medición mal. Una medición que no se
entiende no es un hallazgo.

Y DOS COSAS QUE SÍ APARECIERON

`toggleMeta`: treinta y seis líneas en el Camino con su escritura a la base y
su celebración, definidas y nunca llamadas. Es la quinta vez que esta casa
encuentra el mismo patrón. Y esta vez costó algo más que espacio: su escritura
de `completada: false` se usó como prueba de que la base guarda el desmarcado.
La conclusión resultó correcta, pero por otra función —`desmarcarHechoAfuera`,
que sí se llama, desde el panel del Admin cuando el equipo deshace una jornada
dada por hecha afuera—. Razonar sobre código muerto da respuestas que a veces
aciertan, que es lo peor que puede pasar. Los comentarios ahora citan el camino
vivo.

Y el parámetro `hechas` del medidor seguía medio muerto: la cirugía 15 le tapó
el caso de la cuenta completa con `lleno`, y su propia rama seguía escribiendo
un array vacío con el comentario «solo las primeras `hechas` claves». Ahora
recibe las claves y las escribe — y es lo que permite abrir la cuenta a medio
camino, que es la única donde se puede tocar una jornada.

LO QUE QUEDA POR CUBRIR

Cerrar una jornada. Pasa por el reproductor de la sesión guiada y exige la
evidencia subida —`TaskCoach` llama a `onComplete` solo si `evidenciaLista`—
así que es un flujo de varios pasos con una subida de archivo en el medio. El
bucle llega hasta la jornada y comprueba que la app conteste el toque; cerrarla
es lo próximo. Lo que sí está protegido es que lo cerrado no se pierda.

---
## 25/10/2026 · Cirugía 20: lo que las lentes no ven

«CUMPLE LA ESPECIFICACIÓN» NO ES «HERMOSA»

Veintiún lentes en cero en sesenta y cinco vistas, y la app todavía no estaba a
la altura de las portadas. Eso ningún lente lo dice: hay que mirar las
capturas. Había sesenta y cinco y en todo el arco se habían mirado cuatro.

Mirando aparecieron cuatro cosas, y de cada una salió un lente nuevo o una
regla, para que no vuelvan.

EL NÚMERO QUE NO SE LEÍA COMO NÚMERO

«Tu semana 11» se leía «Tu semana ɪɪ», como romanos. Cormorant Garamond —el
serif de la casa— trae cifras de estilo antiguo por defecto: el 1 y el 2 se
dibujan a la altura de la x. Y el lente nuevo encontró más de lo que se veía:
los rangos del Camino —«Días 15 a 33», «Días 48 a 90»— perdían sus números
igual. En una app que se lee por días, y pensada para TDAH, un número que hay
que descifrar no es un número.

Se arregla en la raíz y se hereda: en el sans no cambia nada y en el serif las
sube. Una línea en vez de perseguir las decenas de lugares donde se aplica el
display, varios con estilo en línea, donde ninguna clase llega.

Y una trampa: pedir `tabular-nums` a secas REEMPLAZA el valor heredado. Así
salía el precio de la renovación —«97 dólares al mes»— con el 9 y el 7 a la
altura de la x, en la pantalla comercialmente más importante del programa.
Pasaba en cinco estilos en línea y en la utilidad de Tailwind. En esta casa
tabular siempre quiere decir tabular Y alta.

LA PANTALLA QUE DICE SU NOMBRE DOS VECES

Seis de catorce lo hacían, y es un defecto que creó esta misma casa: al poner
el nombre de la pantalla en la barra de arriba, las páginas ya tenían el suyo y
nadie sacó el de abajo. Lo primero que leía el cliente era la misma palabra dos
veces, justo donde hace más falta el aire.

Ninguna quedó muda: Entrenadores abre con lo que hacen, el Mentor con lo que
sabe, Mi Clínica con las dos llaves que tienes, el Creador con lo que escribe,
Mi Número con lo que vale una hora tuya y el Diario con su fecha, que es lo que
un diario abre.

El sexto apareció en la corrida completa y no en la primera sonda: con la
cuenta llena el Diario abre con «Entrada del día completada», así que la
repetición solo se ve con el día sin escribir. Una sonda que mira un solo
estado mide un solo estado.

EL ROBOT Y EL CANDADO

Arriba de los ocho entrenadores había un robot en oro. Es el signo más gastado
que existe para decir «IA», y esa pantalla presenta a ocho entrenadores con
nombre, voz y oficio: Caro entrena cámara, Mateo guiones. Un robot arriba de
todo los convierte en software. Se fue con el encabezado repetido.

Y cada nombre llevaba un candado al lado: «Caro 🔒». Un «no» a dos centímetros
de la línea que ya explica, en positivo, qué lo abre. Esta casa ya había
decidido lo mismo para la barra de abajo —sin huecos, sin candados—. Lo que
distingue al que todavía no se abrió es su anillo y su frase.

EL TEMA OSCURO QUE SE FILTRA POR EL ESTILO EN LÍNEA

Las clases de tema oscuro —`bg-black/20`, `text-white/55`, y son cientos— están
remapeadas en `index.css` para el papel. Un color escrito en un `style` en
línea NO se puede remapear, y ahí sobrevivieron dos.

Los ocho entrenadores se veían como el círculo gris con inicial de cualquier
app, cada uno con su anillo de color declarado y sin mostrarse: el anillo del
bloqueado era `rgba(255,255,255,0.10)`, blanco al diez por ciento sobre crema, o
sea nada. Y el disco era `bg-black/30`, que sobre papel da gris sucio.

Y en el Diario, el día con energía cero se pintaba con blanco al seis por
ciento: invisible. El cliente no podía distinguir «ese día estuve en cero» de
«ese día no existe», que en un diario es justo la diferencia que importa. De
paso, el día bueno usaba el verde brillante de la librería y no el verde del
tilde, que es el de la casa.

---
## 25/10/2026 · Cirugía 21: la app acusaba a la casa de lo que no pudo consultar

LA PANTALLA DONDE SE COBRA, MEDIDA CON LA CUENTA VACÍA

El cierre del Camino es el momento comercial más importante del programa: todo
lo que el cliente construyó y, debajo, los tres pases de renovación. Se medía
con la cuenta vacía, así que el titular decía «Julia, esto es lo que hiciste» y
abajo «0 de 63 jornadas hechas».

Ese estado es real —alguien paga, se traba y llega igual al día noventa, y la
app lo dice de frente— pero no es a quien se le ofrece la renovación. A esa
pantalla llega sobre todo quien hizo el trabajo. Dos vistas nuevas y estrictas:
el cierre y la graduación de quien terminó.

Y mirando esa vista nueva apareció lo serio.

«NO PUDE CONSULTAR» SE LEÍA COMO «NO TE DIMOS NADA»

El bloque más prominente de la pantalla, en una cita con línea de oro, decía:
«Te dimos 0 de las 3 sesiones que te prometimos. La garantía corre: seguimos
sin costo hasta que los cinco sistemas estén andando.»

`cierreDeCuentas` tiene la distinción escrita en su propia firma: «`null`
significa "no las traje", no "no tuvo ninguna"». Y `sesionesDe` devolvía un
arreglo vacío en los TRES casos en los que no puede saber: sin base, sin id, o
con la consulta fallando. El cierre leía ese vacío como un hecho.

O sea: en el modo sin base —que es el modo en el que la app funciona cuando la
red no está— la app le decía a TODOS los clientes que la casa no había
cumplido. Y al revés, un incumplimiento real quedaba indistinguible de una
consulta caída.

Lo mismo en dos extremos más: el cierre ponía `[]` cuando no había usuario
—justo para quien entra sin sesión iniciada, que es quien menos puede
desmentirlo— y la vista del equipo convertía un error de consulta en «no tuvo
sesiones», que es donde Lupe decide si la garantía corre.

Ahora el vacío sale solamente de una consulta que respondió bien y no trajo
filas. En la pantalla, la acusación desapareció: queda lo que el cliente
entregó y lo que le falta para que la garantía corra, que es su parte y es
verdad.

POR QUÉ CUENTA COMO ESTÉTICA

Porque apareció mirando. Las veintidós lentes daban cero en esa pantalla, y lo
siguen dando: ninguna puede leer si lo que la pantalla AFIRMA es cierto. Esto
salió de abrir la captura y leerla como la leería el cliente.

---
## 25/10/2026 · Cirugía 22: la pantalla cumple lo que promete

«TODO TU TRABAJO QUEDA ACÁ» Y UN NÚMERO

El cierre del Camino lo promete en su subtítulo y mostraba una cifra: las
jornadas hechas. Lo que el cliente construyó en noventa días —su método, su
oferta, su precio, su promesa— vive en su ADN y no aparecía ahí, que es donde
decide si sigue.

De los dos lados que esa pantalla pone sobre la mesa, el de lo que falta tenía
una cita con línea de oro y una lista de ocho días; el de lo que hizo, una cifra
sola. No era el orden —ese ya estaba bien— era la proporción.

Ahora, debajo de la cifra: cuántas piezas de su ADN quedaron selladas y qué
dicen, con SUS palabras. Cuatro y no catorce: las comerciales, que son las que
sostienen la conversación de la renovación. En el estado de prueba se lee «Tu
Método · El Permiso» y «Tu Oferta · Volver a Elegir · doce semanas · 1.200 USD».
Si no selló ninguna, el bloque no aparece: no se promete lo que no hay.

La máquina ya estaba: `contenidoDePieza` existe desde antes, con su comentario
—«para poder leerlo en su tarjeta»— y se usaba solo en Mi ADN.

EL SÉPTIMO NOMBRE REPETIDO, Y POR QUÉ ESTABA ESCONDIDO

Mi ADN decía su nombre dos veces, y el lente no lo veía: iba como `<p>` con el
serif a veinticuatro píxeles. Se veía título y no lo era, así que la pantalla
además no tenía ningún encabezado. El lente ahora cuenta como título lo que el
ojo lee como título —serif de display, veintidós píxeles o más, con texto
propio— y con eso barrió las sesenta y siete vistas sin encontrar ninguno más.

Otro turno ya había visto esta repetición y la resolvió igualando el posesivo:
decía «Tu ADN» y pasó a «Mi ADN». Es la segunda vez que pasa lo mismo —en Mi
Número también— y vale la regla: cuando el nombre está arriba, el contenido
abre con lo que la pantalla ES, no con cómo se llama.

Y UNA VARA QUE PUSE MAL

El lente del oro solo marcaba rellenos con más de 50% de opacidad. Lo bajé al
6%, con el argumento de que «nunca relleno» no tiene excepción por
transparencia. Encendió CUARENTA Y CINCO controles: las pestañas activas de
Campañas, Métricas, el Diario, la Biblioteca y Acompañamiento, y los chips del
Mentor, todos con oro al diez o quince por ciento.

Mirados, están bien: son una marca de estado —«acá estás»— en un lavado cálido
que sobre papel crema se lee como papel. Lo que la regla ataca es el oro usado
como superficie para parecer caro, que fue el botón principal y ya se arregló.

Cuarenta y cinco hallazgos que al mirarlos están bien son una vara mal puesta,
no cuarenta y cinco defectos. La devolví, ajustada al 35%: sigue cazando
cualquier cosa que se acerque al oro macizo y deja pasar el lavado de estado.
Entre 15% y 50% hoy no hay nada, así que no afloja nada de lo que ya estaba.

Queda una decisión de la casa, escrita en el medidor: la barra de abajo tiene
escrito «el activo cambia el trazo del ícono a oro y el peso de la etiqueta a
700. Nada más: sin fondo, sin píldora», y todas las pestañas de adentro hacen
lo contrario. Una de las dos está de más.

---
## 25/10/2026 · Cirugía 23: el mismo dato con tres totales

LO QUE EL CLIENTE LEÍA EN UNA MISMA SESIÓN

Métricas: «Jornadas hechas · 71 · de 91 en total».
El Camino: «21 de 64 jornadas».
El cierre: «50 · de 63 jornadas hechas».

El mismo dato, tres totales, en tres pantallas que se leen seguidas. Para un
programa que se vende con las palabras simple, claro y medible, eso es lo más
caro que puede pasar en una pantalla de números.

Y el 91 además NO SE ALCANZA: cuenta las noventa y una metas del seed, las del
equipo y los días de campo incluidos. Las jornadas que el cliente hace son
sesenta y cuatro, así que terminar el programa entero le daba un setenta y ocho
por ciento.

ESTO YA ESTABA RESUELTO, Y EL ARREGLO SE QUEDÓ A MITAD DE CAMINO

`esPasoDelCliente` lo dice en su propio comentario: «los días de campo y los
fines de semana no se completan: son para atender y descansar. Contarlos hacía
que el Camino dijera "1 de 90 pasos" cuando las jornadas con trabajo son
cincuenta, y esos noventa no se alcanzaban nunca».

El arreglo llegó al Camino. No llegó a Métricas. Ahora hay UNA constante —
`TOTAL_JORNADAS_DEL_CLIENTE`, derivada del seed con esa misma función— y la
usan las tres pantallas. Métricas dice «50 de 64», igual que el Camino.

Y DOS LUGARES QUE EL CLIENTE NO VE PERO LO AFECTAN

`progreso_porcentaje` se escribe en su perfil y es lo que el equipo mira para
decidir a quién llamar y a quién dejar tranquilo. Dividía por las noventa y una,
así que un cliente que cerró TODO lo suyo le aparecía a Lupe al setenta por
ciento. Ahora el número que ve el equipo es el mismo que ve el cliente.

Y la fase de autonomía por avance exigía las noventa y una cerradas: quien
cerraba sus sesenta y cuatro no llegaba nunca, solo por calendario. «Terminó el
Camino» es cerrar LAS SUYAS.

Los dos salen ahora de un solo cálculo, `suyasHechas`.

Y de paso, el séptimo código muerto: `progresoPct`, declarado en el Camino con
el mismo denominador inalcanzable y sin un solo uso.

DOS FALSOS POSITIVOS MÍOS, EN EL MISMO TURNO

Vale anotarlos. Leí la captura de la antesala y creí que el medidor estaba
midiendo el panel en vez de la antesala: me había confundido de archivo, y la
sonda mostró que la antesala renderiza perfecto. Y dije que
`estaEnFaseAutonomia` ignoraba su parámetro `caminoTerminado`: sí lo lee, en la
primera línea, y mi grep la había recortado.

Dos veces en un turno mirando con filtro en vez de mirar entero. Un grep
recortado se lee igual que un hallazgo.

---
## 25/10/2026 · Cirugía 24: las dos decisiones que quedaban

«ENTRENADORES» EN UN TELÉFONO DE 320

Son doce letras y mide noventa y ocho píxeles a quince, que es el piso de la
casa. Medido: las cinco etiquetas de la barra de abajo pedían trescientos
treinta y cuatro de los trescientos dieciséis que quedan a 320, así que la
última se iba de la pantalla — y la última es Contacto, la única forma que
tiene el cliente de llegar al equipo. Y el título de la barra de arriba pedía
ciento tres en noventa, y salía con puntos suspensivos.

Lo que cede es la PALABRA, no el cuerpo. Las dos salidas por tamaño estaban
cerradas: bajar la etiqueta rompe el piso de quince, y bajar el título a
diecisiete rompe el otro —el serif de display no baja de veinte, su altura de x
lo hace leer como una mancha— y el medidor lo marcó al intentarlo. Quitarle la
etiqueta al botón del Mentor habría dado los píxeles y repetiría un error que
esta casa ya corrigió: Soporte vivía en un salvavidas sin etiqueta y nadie lo
encontraba.

Así que «Entrenar» en las dos barras, con «Entrenadores» declarado como nombre
completo y escrito entero en el menú lateral, que tiene doscientos cincuenta y
seis píxeles. Es el mismo mecanismo de «Contacto» y «Acompañamiento», y la
forma corta de arriba va en `TITULOS_CORTOS`, que existe justo para eso.

Con eso la garantía del medidor baja de 360 a 320: las siete vistas angostas en
cero.

Y UN AIRE QUE NO ENTRA, MEDIDO

Se probó garantizar cuatro píxeles entre etiquetas con un `gap`. A 320 no
entra: el contenido pide doscientos noventa y ocho, pero «Hoy» está forzada a
cuarenta y cuatro por el piso táctil aunque su palabra mida veintinueve, así
que lo efectivo es trescientos trece de trescientos dieciséis. Los dieciséis
píxeles del gap recortaron CUATRO etiquetas tres o cuatro píxeles cada una.

Cuatro palabras cortadas es peor que cuatro palabras cerca. Revertido, con la
cuenta escrita en el código para que nadie lo vuelva a intentar a ciegas.

LA REGLA QUE SE CONTRADECÍA

La barra de abajo tiene escrito «el activo cambia el trazo del ícono a oro y el
peso de la etiqueta a 700. Nada más: sin fondo, sin píldora», y las pestañas de
adentro marcan su activo con un lavado de oro al diez o quince por ciento — son
cuarenta y cinco controles.

No era un olvido: son dos problemas distintos, y la regla ahora dice cuál
gobierna. Esta barra está siempre en pantalla, con cinco destinos peleando
trescientos veinte píxeles, y cada fondo compite con la etiqueta por el mismo
lugar. Las pestañas de adentro son un grupo chico dentro de una pantalla, donde
el lavado contesta «acá estás» sin quitarle lugar a nada. La regla del oro
apunta al oro usado como SUPERFICIE para parecer caro, que fue el botón
principal y ya se arregló.

---
## 25/10/2026 · Cirugía 25: cuando la IA no contesta

LA PROMESA CENTRAL DEPENDE DE UNA LLAVE

La app promete que hay alguien del otro lado: el Mentor y los ocho
entrenadores. Esa promesa cuelga de una llave de API que puede vencer, quedarse
sin cupo o caerse un martes a la mañana. Lo que el cliente lee en ese momento
decide si la app parece rota o parece cuidada — y es lo único que ninguna de las
veintidós lentes puede ver, porque un chat que se queda girando para siempre les
da cero a todas.

QUÉ PASA, MEDIDO

Este entorno no tiene ninguna llave, así que es exactamente el estado a medir:
la cadena entera falla. Se abrió el Mentor, se escribió «Hola, ¿por dónde
sigo?», se tocó Enviar.

A los mil quinientos milisegundos el cliente lee, dentro de la conversación y en
el turno del Mentor:

  «No pudimos responderte. Prueba de nuevo; si sigue pasando, escríbenos.»

Sin spinner eterno, sin código de estado, sin rastro técnico, sin silencio. Y
del lado del servidor, si se había cobrado un crédito se devuelve: «cobrar por
aire es la peor forma de perder la confianza de un cliente», dice el comentario
que ya estaba ahí.

Esto estaba bien hecho y no hacía falta tocar nada. Lo que faltaba era que
quedara comprobado y que siga así.

EL CUARTO BUCLE

`medir-guardado.py` pasa de tres a cuatro. Los tres primeros preguntan si lo
que el cliente escribe sobrevive a recargar; el cuarto pregunta qué LEE cuando
la IA no está. Comprueba tres cosas: que lea algo en pocos segundos, que el
mensaje diga QUÉ HACER y no solo que falló, y que no se le muestre nada técnico
—un 502, un TypeError, la palabra ANTHROPIC—.

Se lo vio romper: con el mensaje esperado cambiado por uno que no existe,
reporta «el cliente no lee nada: se queda esperando».

---
## 25/10/2026 · Cirugía 26: los primeros diez minutos

LA PRIMERA PANTALLA QUE VE QUIEN ACABA DE PAGAR, SIN MEDIR

El wizard de bienvenida abre con `onboarding_completed === false`, y la semilla
del medidor nunca escribía ese campo: quedaba `undefined`, la condición daba
falso y el wizard no aparecía. Sesenta y siete vistas y ninguna era la primera.

Las veintidós lentes le dieron cero. Mirándola, tres cosas.

EL ORO MACIZO, QUE SÍ SE VEÍA

El candado iba en un cuadrado de `bg-gold` —oro macizo, `#B0822E` lleno— el
elemento más saturado de la pantalla, en lo primero que ve quien pagó. La regla
no tiene excepción: oro mate solo en líneas de 1px, versalitas y numerales,
nunca relleno.

El lente del oro solo miraba CONTROLES, y eso es un div. Ahora mira cualquier
caja con el oro casi lleno, y se lo vio cazar: con el `bg-gold` devuelto a
propósito reporta «DIV (no es botón · rgb(142, 104, 36))».

Y la prueba, leyendo el archivo, cazó un SEGUNDO cuadrado igual en otro paso —
porque el medidor abre solo el primero de los diez pasos del wizard. Los otros
nueve siguen sin medirse, y es lo próximo.

Con eso aparecieron seis botones principales con oro macizo y su sombra de oro:
el botón que esta casa ya había arreglado en todas las pantallas —«era el
rectángulo más grande y más saturado de la app; ahora es un bloque de tinta y
el oro quedó en la línea»— y que en el wizard seguía como antes. Los seis pasan
a `btn-primary`, que en el tema claro ES ese bloque de tinta.

EL GLOW QUE NUNCA SE PINTÓ

El cuadrado tenía `shadow-[0_0_20px_var(--line2, rgba(142,104,36,0.30))]`. Un
ESPACIO adentro de los corchetes, que en Tailwind termina la clase: llegaba al
DOM cortado en `shadow-[0_0_20px_var(-` y la sombra calculada era la de la casa.
Quinta vez que aparece ese patrón acá — el mismo de los 224 bordes.

Así que el glow estaba escrito y no existía. Se fue igual, junto con dos globos
de oro de quinientos píxeles difuminados a 150, que sí se pintaban y son
exactamente lo que la regla llama glow.

Y UN LENTE QUE NO EMBARQUÉ

Se intentaron dos ramas para cazar el glow y ninguna se pudo hacer sonar: el oro
mate en una sombra sin desplazamiento no llega nunca —el tema claro impone la
sombra de la casa con `!important` sobre las clases de tarjeta— y la del
desenfoque sobre oro no sonó ni con un globo devuelto a propósito, sin que se
encontrara por qué.

Un lente que no se puede hacer fallar da confianza falsa. No van. Queda escrito
en el medidor qué se probó y por qué no entró, que es más útil que una rama
muerta.

EL COPY QUE ABRÍA UNA DUDA

«La contraseña temporal que te enviamos ya no va a funcionar después de esto.»
La regla: en el copy no hablar de más, nunca agregar aclaraciones que abran una
duda que no existía. Ahora: «Desde ahora entras con la tuya.»

LO QUE SE DEJÓ A PROPÓSITO

Dos cuadrados de oro macizo más, fuera de alcance de las sesenta y ocho vistas.
El de la Biblioteca aparece solo al pasar el mouse sobre una miniatura de video
—en un teléfono no existe— y va sobre imagen, no sobre papel. El del Admin es el
escudo de su barra lateral, que vive en su propio mundo oscuro y tiene su plan
aparte.

---
