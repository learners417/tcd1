# CÓMO FUNCIONA LA APP — plan operativo

Documento hermano de `PLAN-CIRUGIAS.md`. Ese dice **qué se construye**; este dice **para quién y con qué reglas**.

---

## 0. La regla que decide todo

> **El cliente es el operador. El humano atiende lo que se rompe.**
>
> Y cuando haya que elegir entre un minuto de persona y una llamada de API, **siempre la API**.

La segunda parte no es una preferencia: es aritmética. Un mes de una persona del equipo cuesta más que toda la inteligencia artificial de todos los clientes juntos. Aun gastando de más, la IA no es el costo del negocio. **El costo del negocio es el tiempo humano.**

De ahí sale el criterio para cada decisión de diseño: si una pantalla puede resolver algo sola aunque cueste tres llamadas de modelo, se resuelve sola.

---

## 1. Las dos poblaciones

No son lo mismo y no se sirven igual.

### Los once actuales — instalación acompañada
Compraron un servicio con gente adentro. Están a mitad de camino: activan el 4 y el 18 de agosto y el 1 de septiembre, y **el servicio termina el 11 de diciembre**. Lo que necesitan es llegar a su primera venta, tomar ritmo propio y salir ordenados.

### Los nuevos — producto
Entran por **$1.000** (la app sola, guiada) o por **$5.000** (la app más instalación acompañada). No compran una agencia: compran un sistema que se instala solo.

**El puente entre las dos:** los once actuales, al terminar el 11 de diciembre, **no se van — bajan al escalón de $1.000**. Su servicio termina; su acceso no tiene por qué terminar. Eso convierte un cierre en una migración, y los vuelve la primera camada del producto que viene.

Y hay un segundo motivo, más importante: **los casos de éxito de los once son la prueba que vende el ticket de $1.000.** La etapa 8 del recorrido —testimonio grabado y caso documentado— deja de ser un trámite de salida y pasa a ser el activo comercial del año que viene.

---

## 2. Qué compra cada ticket

| | **$1.000** | **$5.000** | **$10.000** |
|---|---|---|---|
| **La app** | Completa y guiada | Completa y guiada | Completa y guiada |
| **Quién arma los anuncios** | Él, con la app | Él, con la app | Él, con la app |
| **Quién conecta lo técnico** | Él, con tutoriales dentro de la app | El instalador | El instalador |
| **Acompañamiento humano** | **Ninguno.** Solo si el semáforo se pone rojo | Cola de excepciones + grupal semanal | Lo anterior, con prioridad |
| **Javo** | No | No | Sí, directo |
| **Minutos de humano al mes** | **0 en el caso sano** | ~60 | ~120 |

**La línea que no se cruza:** el cliente de $1.000 tiene que costar **cero minutos** cuando todo va bien. Si cuesta uno solo por mes, a cien clientes son cien horas y el modelo se cae. Todo lo que hoy hace una persona para ese cliente tiene que estar adentro de la app antes de venderlo en volumen.

**Lo que sí cuesta plata en ese tier: la IA.** Y está bien. Un cliente que gasta $30 de modelos sobre una venta de $1.000 sigue dejando un margen que ninguna agencia consigue.

---

## 3. El calendario de las dos poblaciones

| Cuándo | Los once | Los nuevos |
|---|---|---|
| **Ago** | Activan las olas 1 y 2. Primeras ventas | Cirugías 1 a 3: la app se vuelve autosuficiente |
| **11 sep** | Siguen | **Última venta de instalación.** Desde acá se vende producto |
| **Sep – nov** | Ritmo propio. Se graban los casos de éxito | Entra la primera camada de $1.000 sostenida solo por la app |
| **11 dic** | Termina el servicio → **bajan al escalón de $1.000** | Siguen |
| **2027** | Son usuarios de producto | El negocio entero |

La consecuencia operativa: **entre septiembre y diciembre conviven las dos poblaciones**, y el equipo tiene que sostener a las dos con la misma app. Por eso la cola de excepciones (cirugía 4) tiene que distinguir por ticket: un rojo de un cliente de $5.000 se atiende; un rojo de uno de $1.000 primero recibe el empujón automático, y solo escala si no se resolvió solo.

---

## 4. Lo que la app tiene que hacer sola para el cliente de $1.000

Esta es la lista que define si el producto está listo para venderse en volumen. Cada línea que quede sin resolver es una persona contratada de más.

**Antes de encender**
- Cerrar su método y su oferta, guiándolo pregunta por pregunta
- Escribir su página de venta y su DM automático desde su ADN
- Armarle las 3 piezas, auditarlas y corregirlas antes de que salgan
- Explicarle la conexión técnica con tutoriales adentro, paso por paso
- No dejarlo encender hasta que la cadena esté probada de punta a punta

**Ya encendido**
- Pedirle un número por día en 30 segundos
- Decirle si su campaña está sana con la regla de SU objetivo
- Frenarlo cuando quiera tocar antes de tiempo
- Declarar el ganador y ofrecer dos piezas parecidas
- Avisarle cuando no publica, no contesta o se le cae el ritmo

**Cuando algo no cierra**
- Decirle dónde está el cuello de botella, no darle un tablero
- Mandarlo al entrenador que corresponde: Sofi si es el DM, Lucas si es la llamada, Ramiro si son los números
- Escalar a un humano **solo** si el semáforo estuvo rojo dos semanas

---

## 5. La capacidad, con números

Con la app haciendo lo de arriba:

| Población | Cuántos | Minutos de humano por semana | Total |
|---|---|---|---|
| Clientes de $1.000 sanos | 100 | 0 | 0 h |
| Clientes de $1.000 en rojo (≈10%) | 10 | 20 | 3,3 h |
| Clientes de $5.000 | 15 | 30 | 7,5 h |
| Grupal semanal | todos | 60 min una vez | 1 h |
| **Total de soporte** | | | **≈12 h** |

Doce horas es **media semana de una persona**. Ahí entra Lupe con aire, y Marcos queda libre para lo suyo: mejorar la máquina en lugar de operarla.

El número que hay que vigilar no es la cantidad de clientes: es **el porcentaje en rojo**. Si sube del 10% al 30%, no hace falta más gente — hace falta arreglar lo que los pone en rojo.

---

## 6. Los cuatro roles, con esta lógica

| Rol | Quién hoy | Qué sostiene |
|---|---|---|
| **Dueño del criterio** | Javo | Mentor y director. Su criterio vive en el código; entra solo por la cola y solo por los $10.000 |
| **Desarrollo** | Marcos | Hace crecer TCD y MCD. Su trabajo es que la app haga cada vez más de lo que hoy hace una persona |
| **Soporte humano** | Lupe | Trabaja la cola. No diagnostica: ejecuta la acción que la app ya escribió |
| **Administración** | Ailu, por ahora | Finanzas, cobros, equipo. Hasta que haya alguien dedicado |

**El indicador de que Marcos está haciendo bien su trabajo:** que los minutos de humano por cliente bajen mes a mes con la misma cantidad de clientes. Es el único número que mide si la app está reemplazando trabajo o solo sumando pantallas.

---

## 7. Qué cambia en el plan de las 5 cirugías

El plan no cambia de orden, pero sí de acento:

- **Cirugía 1** — el techo de gasto deja de ser un freno y pasa a ser un **medidor**: no está para limitar, está para saber cuánto cuesta cada cliente. Con eso se decide el precio, no al revés.
- **Cirugía 2** — se construye para el cliente de $1.000, que no tiene a nadie al lado. Si algo necesita que un humano lo explique, no está terminado.
- **Cirugía 3** — los tutoriales técnicos adentro de la app pasan a ser parte de la cirugía, no un extra. Es lo que hoy hace el instalador y lo que el de $1.000 tiene que resolver solo.
- **Cirugía 4** — la cola distingue por ticket: quién recibe empujón automático y quién recibe persona.
- **Cirugía 5** — la documentación de Marcos incluye **cómo agregar una herramienta nueva**, porque su trabajo del año que viene es exactamente ese.

---

## 8. Los riesgos de esta transición

**Vender el ticket de $1.000 antes de que la app esté sola.** Es el riesgo más caro. Cada cliente que entra a un producto incompleto vuelve como soporte, y el soporte de un producto barato se come el margen de tres. La regla: **no se vende en volumen hasta que la lista de la sección 4 esté completa.**

**Que los once se lleven la costumbre de tener gente.** Vienen de un servicio con personas atendiéndolos. Si en diciembre bajan al escalón de $1.000 esperando lo mismo, la transición se rompe. Hay que decírselo desde ahora, no en diciembre.

**Que se confunda soporte con enseñanza.** Lupe atiende lo que se rompe. Si empieza a explicar cómo se usa la app, es que la app no se explica sola — y eso es un problema de producto, no de soporte. Cada consulta de "cómo se hace" es una pantalla mal diseñada.
