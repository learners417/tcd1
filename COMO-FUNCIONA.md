# CÓMO FUNCIONA ESTA APP

Para quien la mantiene y la hace crecer. No es un manual de usuario: es el mapa
de los motores, dónde se tocan, qué **no** se toca, y cómo agregar cosas nuevas
sin romper lo que anda.

Lo primero: **antes de tocar nada, corre la batería.** Está al final de este
documento. Si algo estaba en rojo antes de tu cambio, no lo causaste tú; si se
pone rojo después, sí.

---

## 0. La idea, en una página

La app existe para que **el cliente arme, publique, mida y corrija sus campañas
solo**. Cada vez que un humano tiene que explicarle algo, es una pantalla mal
diseñada — no un problema de soporte.

De ahí sale el criterio que decide casi todas las discusiones técnicas:

> **Cuando haya que elegir entre un minuto de una persona y una llamada de
> modelo, siempre la llamada.**

Un mes de alguien del equipo cuesta más que toda la inteligencia artificial de
todos los clientes juntos. La IA no es el costo del negocio; el tiempo humano
sí. Por eso acá no se optimiza para gastar poco: se optimiza para que cada
tarea salga bien, y se **mide** lo que cuesta para poder decidir con el número
a la vista.

**El indicador de que este trabajo va bien:** que los minutos de humano por
cliente bajen mes a mes con la misma cantidad de clientes.

---

## 1. Los motores

Siete piezas. Cada una hace una cosa y se puede entender sola.

### El enrutador de IA — `api/_lib/router.ts`

Decide **qué modelo hace cada trabajo**. Cinco tareas, cada una con su cadena
de proveedores, su temperatura y un campo `porQue` que explica la elección.

| Tarea | Modelo | Por qué |
|---|---|---|
| `guion` | Claude Sonnet, temp 0.8 | Es lo que el cliente publica con su nombre |
| `chat` | DeepSeek → Claude, temp 0.7 | Donde se van más tokens |
| `estructura` | Claude Haiku, temp 0 | No necesita voz: necesita obedecer un esquema |
| `auditoria` | Claude Sonnet, temp 0.2 | El que juzga no puede ser el que escribió |
| `general` | La cadena histórica | Para que ninguna llamada vieja cambie |

**Dónde se toca:** para agregar una tarea, se suma a `RUTAS` con su `porQue`.
Para cambiar de modelo, se cambia la cadena.
**Qué NO se toca:** el precio no se hardcodea en otro lado. Si cambia, va en la
variable de entorno `PRECIOS_IA`.

### El guardián — `api/_lib/guardian.ts`

**Un solo lugar** decide si una llamada de IA puede salir. Los dos endpoints lo
llaman. Aplica tres frenos, en este orden:

1. **Techo de gasto** (`gasto-server.ts`) — vale para todo. Si la cuenta está
   quemando dinero, da igual qué herramienta sea.
2. **Crédito** — solo las herramientas de producción: constructor, copy,
   creativo, stories, imagen.
3. **Tope de uso** (`uso-server.ts`) — el acompañamiento: mentor, entrenadores,
   sesiones. **Nunca cuesta crédito**: racionar el acompañamiento sería cobrarle
   por hacer el programa que ya pagó.

**Reglas que no se rompen:**
- Sin `userId` o sin `feature` no se cobra ni se cuenta. Es opt-in: un olvido
  del front nunca cobra de más; a lo sumo cobra de menos.
- **Un fallo de infraestructura nunca frena.** Se loguea y se deja pasar. Un
  freno a medio instalar no puede dejar sin Mentor a un cliente que pagó.
- Si la cadena falla después de cobrar, **se devuelve el crédito**. Cobrar por
  aire es la forma más rápida de perder la confianza.

### El diagnóstico — `src/lib/valueChain.ts` y `decidirCampana.ts`

**No usa IA, y no debe usarla.** Un modelo que opina sobre números da respuestas
distintas el martes y el jueves; el criterio se vuelve inconfiable justo donde
más importa. La regla decide; la IA solo redacta el «dónde mirar».

`valueChain` calcula 17 indicadores repartidos en tres tramos —atracción,
conversión, retención— y encuentra **el dominó**: el número más alejado de su
referencia. `decidirCampana` decide qué hacer con cada anuncio.

**Dónde se toca:** para agregar un indicador, se suma en `calcularCadena()` con
su referencia, su dirección y su «dónde mirar».
**Qué NO se toca:** la dirección. Un costo que baja es bueno; una tasa que baja
es mala. Confundirlas hace que el tablero marque como problema algo que va bien.

### La fábrica de anuncios — `src/lib/formulasAnuncios.ts`

Las 18 fórmulas, el recomendador, la auditoría de los 8 ingredientes, el
chequeo de políticas de publicación y el armado del carrusel.

**Dos auditorías distintas, a propósito:**
- `auditarPieza()` es determinista: expresiones regulares, gratis, instantánea,
  **siempre el mismo veredicto para el mismo texto**. Eso es lo que hace
  confiable el criterio.
- `criticoPieza.ts` es juicio de verdad y **además escribe** lo que falta. Usa
  la tarea `auditoria`, que va a un modelo distinto del que escribió la pieza.

**Qué NO se toca:** `revisarPoliticas()`. Lo que está en juego es la cuenta
publicitaria del cliente: recuperarla tarda semanas y a veces no se recupera.
Si vas a aflojar una regla, mira primero `scripts/prueba-politicas.ts`, que
tiene tantos casos limpios como sucios — un falso positivo constante hace que
el cliente deje de creerle al aviso y publique igual.

### La bitácora — `src/lib/bitacoraCampana.ts`

Qué se probó, qué pasó con el número, si ganó o perdió. Antes los números se
pisaban cada viernes y **la semana pasada no existía**.

**Qué NO se toca:** la tendencia compara cada anuncio **contra sí mismo**, no
contra los otros. Y una diferencia menor al 10% cuenta como igual: sin eso, el
ruido normal se lee como señal.

### La cola — `src/lib/colaExcepciones.ts`

El trabajo del día, ya decidido. **Quien la trabaja ejecuta, no diagnostica.**

Cada situación trae dos cosas: `accion` (qué hacer) y `como` (el mensaje listo
para mandar). Si agregas una situación nueva, tiene que traer las dos. Una
acción que describe el problema en vez de mandar a hacer algo obliga a
preguntar, y esa pregunta es el cuello de botella que la app existe para sacar.

**El plan decide quién atiende.** El de plan chico con un problema nuevo lo
resuelve la app sola; solo si sigue dos semanas sube a una persona.

### Los avisos — `src/lib/avisosCliente.ts`

Escritos **para el cliente**, no para el equipo. La misma situación que en la
cola dice «revisar el DM con él», acá dice «conversas mucho y agendas poco».

Tres reglas: no sale dos veces en la misma semana · tras dos avisos sin
resultado escala en vez de repetir · lo que ya atiende una persona no se avisa.

---

## 2. Cómo agregar cosas

### Una herramienta de IA nueva

1. Declara la **tarea** al llamar: `generateText({ tarea: 'guion', feature: 'x' })`.
   Sin `tarea` cae en `general`; sin `feature` no se cobra ni se cuenta.
2. Si es de **producción** (fabrica algo que el cliente publica), agrega su
   nombre a `FEATURES_CON_CREDITO`. Si **acompaña**, a `FEATURES_CON_TOPE`.
3. Envuelve la llamada en `try/catch` y **muestra el error**. Un botón que falla
   en silencio es peor que uno que falla.
4. Corre `npx tsx scripts/prueba-guardian.ts`.

### Un indicador nuevo en la cadena

1. Agrégalo en `calcularCadena()` con referencia, dirección y «dónde mirar».
2. Escríbele su acción en `ACCIONES` de `colaExcepciones.ts` y su aviso en
   `AVISOS` de `avisosCliente.ts`. Si no, el dominó lo señala y nadie sabe qué
   hacer.
3. Corre `prueba-cadena.ts` y `prueba-cola.ts`.

### Una tab nueva en el Admin

Cinco lugares, y la batería los verifica: el tipo `MainTab`, el array
`VALID_MAIN_TABS`, `sidebarItems`, `headerTitles` y el render.
Si es solo para el dueño, súmala a `TABS_SOLO_DUENO` — si no, un manager que
llegue por URL ve el título y el cuerpo vacío.

### Una tabla nueva en Supabase

Va en `sala-de-mando.sql`, que es idempotente y se puede correr de nuevo.
**Dos trampas que ya nos mordieron dos veces:**
- Un `unique` con una columna que puede ser `NULL` **no restringe nada**: en
  Postgres los nulos son distintos entre sí. Usa un índice parcial.
- Todo campo de `profiles` que la app lea desde el navegador tiene que sumarse
  al espejo de `syncProfileToLocalStorage`, o la lente 8.1 revienta la batería.
  Eso ya pasó con `plan_comercial` y dejó la escalera de planes abierta.

---

## 3. Lo que NO se toca sin pensarlo dos veces

| Qué | Por qué |
|---|---|
| El diagnóstico con IA | Un modelo daría otra respuesta el jueves |
| `revisarPoliticas()` | Se juega la cuenta publicitaria del cliente |
| El tope de 30 del plan blanco | Es una promesa de la landing, no una decisión de costo |
| Que el freno degrade dejando pasar | Un freno roto no puede dejar sin app a quien pagó |
| El registro en castellano neutro | Los clientes son de toda Latinoamérica y España |
| Los 14 días sin tocar la campaña | Apagar el día malo es el error más común |

---

## 4. La batería

Antes de subir cualquier cosa:

```bash
npm run lint                        # tsc en modo estricto + imports de la API
npm run build                       # que compile de verdad
python3 auditoria.py                # las lentes de producto
python3 verificar-sala.py           # coherencia entre documentos, SQL y código
npx tsx scripts/prueba-cadena.ts    # el diagnóstico
npx tsx scripts/prueba-decision.ts  # las reglas de campaña
npx tsx scripts/prueba-formulas.ts  # el recomendador y el candado
npx tsx scripts/prueba-politicas.ts # las reglas de publicación
npx tsx scripts/prueba-cola.ts      # la cola y las rachas
npx tsx scripts/prueba-avisos.ts    # los avisos automáticos
npx tsx scripts/prueba-conexion.ts  # la lectura de fallas
npx tsx scripts/prueba-bordes.ts    # los bordes numéricos
bash scripts/prueba-sql.sh          # el SQL contra un PostgreSQL real
```

**Sobre el SQL: parsearlo no alcanza.** `pglast` valida la sintaxis pero no
los tipos, y dio verde a un `round(percentile_cont(...), 0)` que revienta en
Supabase — `round` con dos argumentos solo existe para `numeric` y
`percentile_cont` devuelve `double precision`. Un error así se descubre
pegando el SQL en producción, que es el peor momento. `prueba-sql.sh` levanta
una base descartable, corre el archivo **dos veces** y ejecuta cada función,
que es lo único que valida los tipos. Si no hay PostgreSQL instalado se
saltea sola: `apt-get install -y postgresql`.

Y el que más vale, antes de una subida grande: **clonar el repo limpio,
aplicarle el paquete y correr todo ahí.** Es lo único que prueba que funciona
fuera del entorno donde se construyó. Ya encontró dos fallas que no aparecían
en la copia de trabajo.

```bash
git clone --branch mejoras --depth 1 <repo> limpio && cd limpio
# aplicar el paquete, npm install, y correr la batería entera
```

**Sobre las lentes:** si agregas una, ánclala a **hechos** —pertenencia a un
array, existencia de un identificador, una expresión del código— y nunca a
prosa ni a posiciones. Anclar a una cadena literal con un corchete pegado hizo
que agregar una tab rompiera el chequeo de otra. Pasó tres veces.

Y si una lente da decenas de hallazgos, **está mal calibrada**. Una lente que
grita lobo enseña a ignorarla, que es peor que no tenerla.

---

## 5. Lo que falta

Dicho de frente, para que no lo descubras solo:

- **La Sala de Mando** está construida: el marcador, el recorrido de nueve
  etapas, el registro de decisiones y el motor propio. Las tres vistas que se
  usan todos los días viven fuera, con su propia tab, porque merecen estar a
  un toque: **Hoy** (la cola), **Supervisión** y **Tareas**. Lo que queda de
  la especificación son las vistas de reuniones y de equipo, que hoy se
  resuelven con el calendario y con la matriz de preactivación.
- **La conexión con Meta** no existe: los números se cargan a mano. El atajo
  antes de la API es el reporte programado de Ads Manager.
- **Mi Clínica Digital** es un enlace en el menú, no comparte datos.
- **El SQL hay que correrlo.** Mientras no esté, los frenos degradan dejando
  pasar y los paneles avisan que falta — a propósito.

---

## 6. La lente que más cuesta agregar y más vale

Todo lo de arriba verifica el código **sin ejecutarlo**: el compilador mira
los tipos, la batería mira el texto de los archivos, las pruebas de modelo
corren funciones sueltas. Ninguna monta un componente.

Y **una pantalla puede compilar perfecto y reventar al abrirse**: un hook
dentro de un condicional, una propiedad de algo que llega nulo, un `.map`
sobre `undefined`. Eso lo descubre el cliente, no el compilador.

```bash
npx tsx --import ./scripts/entorno-navegador.mjs scripts/prueba-pantallas.tsx
```

Monta cada pantalla con datos realistas **y con datos vacíos, que es como
llegan la primera vez**, y verifica dos cosas: que no explote, y que dibuje
algo. Una pantalla que dibuja treinta caracteres está muda aunque no falle.

Si agregas una pantalla, agrégala ahí. Es una línea.
