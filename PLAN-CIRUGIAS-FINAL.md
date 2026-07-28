# EL PLAN DE CIRUGÍAS FINAL

Dos correcciones mías antes de nada. Las dos importan.

---

# PARTE 1 · DONDE ME EQUIVOQUÉ

## 1.1 El país que dije no era el país que hace falta

Te dije que `profiles.pais` estaba guardado y sin usar, como si fuera el dato
del mercado. **No lo es.** Ese campo dice **dónde vive el sanador**, y se usa
para elegir el dialecto de su contenido — que hable como se habla en su país.

Vos lo marcaste bien: **alguien puede vivir en Chile y correr anuncios en Perú,
Colombia y México.**

Entonces el dato que falta es otro y no existe en ninguna parte:

> **`mercados`** — en qué países corre la pauta, que pueden ser varios y
> ninguno ser el suyo.

Y no es lo mismo por dos motivos: **el costo** (un CPM mexicano no se parece a
uno español) y **el poder de compra** (en algunos mercados $1.000 es
inalcanzable, y ahí la campaña «funciona» y no vende nunca).

## 1.2 Lo de la API de Meta cambió, y mucho

Te venía diciendo que traer datos de Meta era trabajo de instalación: acceso de
socio en cada portafolio, tokens de sistema, todo eso.

**Eso dejó de ser cierto el 29 de abril de este año.** Meta publicó su propio
servidor MCP oficial en `mcp.facebook.com/ads`, gratis en beta, con 29
herramientas y **conexión por OAuth: sin app de desarrollador, sin tokens.**

Verifiqué que sigue vigente. Cambia el plan, y te lo cuento entero.

---

# PARTE 2 · LAS CONEXIONES, EN TRES NIVELES

La distinción que ordena todo: **un MCP conecta a una persona que habla con una
IA. No es una API para que tu app traiga datos sola.** Son cosas distintas, y
por eso hay tres niveles y no uno.

## Nivel 0 — Hoy: la carga a mano

Dos minutos por cliente por semana, desde el administrador. Once clientes son
**22 minutos semanales.** Funciona, y no bloquea nada.

## Nivel 1 — Esta semana, gratis: Lupe con el MCP de Meta

Lupe conecta el MCP oficial a su Claude —OAuth, dos minutos, una vez— y
pregunta:

> *«Traeme gasto, impresiones, alcance y resultados de los últimos 7 días de
> las once cuentas, por anuncio.»*

Y pega el resultado en la app.

**No toca la app. No necesita que yo construya nada.** Baja los 22 minutos a
unos cinco, y lo puede hacer el lunes.

**Es lo primero que haría.** Es gratis, es hoy, y no depende de ninguna cirugía.

## Nivel 2 — Después: la app trae los números sola

La API de Anthropic acepta un parámetro `mcp_servers`. O sea que
`api/ai/generate.ts` puede llamar a Claude **con el MCP de Meta enganchado** y
pedirle los números de una cuenta.

Lo que hace falta: el token de OAuth de cada cliente, guardado. Es mucho más
liviano que un token de sistema, pero sigue siendo un paso por cliente.

**Mi recomendación: nivel 1 ya, nivel 2 cuando las campañas lleven un mes
corriendo.** Porque el nivel 1 te da el 80% del alivio con cero riesgo, y
recién con datos reales vas a saber qué números de verdad hacen falta a diario.

## Otros conectores que sí valen

**GHL para las agendas.** Ya funciona el mecanismo del cobro. Una URL más y la
agenda —el número más difícil de contar a mano— entra sola.

**Y con eso alcanza.** WhatsApp Business API es Meta otra vez, Stripe no aplica
porque cobran por GHL, y una hoja de cálculo intermedia sería agregar un lugar
más donde los datos se pueden desincronizar.

---

# PARTE 3 · LOS MERCADOS, Y CÓMO RECOMENDARLOS DE VERDAD

Tu idea de recomendar países según el avatar es buena. La cuestión es de dónde
sale la data, porque **una recomendación con datos inventados es peor que no
recomendar nada.**

## Las tres fuentes, de peor a mejor

**Benchmarks publicados.** Genéricos, de comercio electrónico, de otro año.
Son los que ya nos hicieron equivocar una vez con el costo por conversación.

**El benchmark de Meta.** El MCP oficial trae `ads_insights_industry_benchmark`.
Es real y está actualizado, pero sigue siendo del rubro entero, no de un
programa de sanación de $1.000.

**Tus once clientes.** Esta es la buena.

## Lo que nadie más puede tener

En cuatro semanas, once clientes corriendo en cinco o seis mercados van a
producir algo que ningún benchmark del mundo tiene: **cuánto cuesta una
conversación, y cuántas de esas compran, para programas de sanación de $1.000,
por país.**

**La app tiene que acumular eso desde el primer día.** Cada semana, cada
cliente, cada mercado → una tabla que crece sola.

Y a partir del segundo mes, la recomendación deja de ser una opinión:

> **Para tu avatar —mujeres de 40 a 55, dolor emocional, ticket $1.000—
> México y Colombia están dando conversaciones a $6 y venden el 8%.
> España da conversaciones a $14 pero vende el 14%.**
> *Con 4 clientes midiendo, 6 semanas de datos.*

**Y mientras tanto dice la verdad:** «todavía no tengo datos propios de este
mercado». Que es infinitamente mejor que inventar un número.

---

# PARTE 4 · LAS CIRUGÍAS

Seis. **Las cuatro primeras antes de encender.**

---

## **G.1 — Los mercados y la verdad de los costos**

El campo `mercados` (varios países, ninguno tiene que ser el suyo), y que las
bandas de costo se ajusten al mercado donde corre la pauta.

Más **la tabla propia que empieza a acumular desde el día uno**: qué costó una
conversación y qué porcentaje compró, por país y por rango de precio.

*Sin esto, once clientes en seis mercados se miden con la misma vara y el
diagnóstico miente en los dos sentidos.*

## **G.2 — Impresiones, CPM y frecuencia**

Un campo más en la carga. Con él, los dos diagnósticos de Meta que hoy no se
pueden hacer, y el aviso de **frecuencia mayor a 3**, que es el que evita que
se tire un creativo que está bien cuando el problema es que el público es
angosto.

## **G.3 — Un tablero, dos puertas, con firma**

Que el cliente y Lupe escriban en el mismo lugar, que cada campo diga quién lo
cargó, y que **la app diagnostique con lo que hay** diciendo qué le falta para
llegar más lejos.

*Es lo que evita que la cola de Lupe quede ciega el primer viernes.*

## **G.4 — Los micro-pasos con su entrenador**

El mapa único: cada cuello → su micro-paso → su entrenador. Inyectado también
en los ocho prompts, **para que deriven lo que no es suyo** — incluido Diego,
que hoy contesta cualquier cosa.

Y el entrenador **abre con el diagnóstico adentro**, no en blanco.

## **G.5 — Lanzado o instalando**

El dato, el filtro, y las dos clases de ítem en la cola: el lanzado se corrige
con un ajuste, el que instala se destraba con una decisión.

## **G.6 — Las agendas por webhook**

Una URL más en GHL.

---

# PARTE 5 · QUÉ VE LUPE CUANDO ESTÉ TODO

Un viernes cualquiera, con las once corriendo:

> ### 4 cuentas necesitan que entres. 7 están bien.
> 2 de conversación · 1 técnico · 1 para Javo

> **ANUNCIO — Marina** · México · lanzada hace 9 días
> Frecuencia 4,2 esta semana. **El público la vio cuatro veces: se agotó.**
> No es el creativo — es que el público es muy chico.
> **→ Ampliar el público o sumar Colombia**
> `Copiar el mensaje`

> **CONVERSACIÓN — Rosana** · España · lanzada hace 12 días
> 18 conversaciones, 2 agendas. A $14 la conversación, que para España está
> bien. Se pierde en el mensaje.
> **→ Hablar con Sofi sobre esto**
> `Copiar el mensaje`

> **TÉCNICO — Ana** · México · lanzada hace 5 días
> 14 comentarios, cero conversaciones. La automatización está cortada.
> **→ Pasar al dev**

> **PARA JAVO — Diego** · Chile · lanzado hace 30 días
> Toma llamadas y no cierra. La ejecución está bien.
> **→ Agendar sesión**

Y abajo, lo que la app resolvió sola: los avisos que salieron sin que nadie
los mandara.

---

## Lo que NO entra, y por qué

**Escribir en Meta desde la app.** El MCP oficial permite crear y modificar
campañas. **No lo quiero cerca de esto todavía.** Un error de una IA con
permiso de escritura sobre once cuentas publicitarias no se deshace con un
botón. Leer sí; escribir, cuando haya meses de confianza.

**La segmentación detallada.** A este presupuesto, el público amplio gana.
Va en el tutorial, no como dato a cargar.
