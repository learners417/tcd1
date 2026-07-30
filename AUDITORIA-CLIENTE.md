# LA AUDITORÍA DEL QUE PAGÓ $1.000

Dejé de verificar contra tu pedido y verifiqué contra **el recorrido de alguien
que hizo la inversión más cara de su vida esperando diez pacientes**.

Encontré cinco cosas. **Dos son graves y una es urgente.**

---

# LOS CINCO HALLAZGOS

## 🔴 1 · La sesión en curso vive solo en su navegador

`SesionViva.tsx` guarda el progreso en `localStorage` y **hace cero llamadas a
la base**.

Eso significa que si empieza una sesión en el teléfono y la sigue en la
computadora, **empieza de cero**. Si limpia el navegador, **pierde el trabajo**.
Si cambia de celular, **pierde todo lo que no terminó**.

**Y las sesiones guiadas SON el producto.** Es donde escribe su método, su
oferta y su avatar. Perder eso no es un inconveniente: es perder lo único que
justifica los $1.000.

**Lo peor: no se entera hasta que ya pasó.**

## 🔴 2 · Hay dos vocabularios de ticket que no se hablan

| Dónde | Cómo llama a los planes |
|---|---|
| `planes.ts` — lo que gobierna el acceso | blanco · amarillo · verde · negro |
| `cuadroTickets.ts` — lo que decide qué instala cada uno | mil · dos_mil · cinco_mil · diez_mil |

**Nada traduce entre los dos.** Cero funciones, cero mapas.

Consecuencia directa: **el cuadro por ticket que construimos no se puede usar**,
porque la app no sabe que un cliente «verde» es uno de $5.000. Y de hecho el
cuadro **no está montado en ninguna pantalla** — está construido, probado, y
suelto.

**Y eso responde tu pregunta sobre los $5.000:** hoy no recibe nada distinto
dentro de la app. Solo cambia quién hace la instalación, por fuera.

## 🟡 3 · Un mensaje sin responder no aparece en ninguna parte

El circuito de soporte funciona: el cliente escribe, el equipo ve, responde, y
el cliente recibe el aviso en tiempo real. **Eso está bien construido.**

Lo que falta es lo que lo vuelve confiable: **si nadie responde, nada lo
señala.** Un mensaje puede quedar tres días sin respuesta y no aparece en la
cola, ni en la supervisión, ni en el marcador.

En un producto de $1.000, **tres días de silencio es la diferencia entre un
cliente y un reembolso.**

## 🟡 4 · No hay ningún compromiso de tiempo de respuesta

Ni declarado al cliente, ni medido internamente. **Cero menciones en todo el
repositorio.**

El que paga no sabe si le contestan en una hora o en una semana, y el equipo no
tiene contra qué medirse. Es el hueco que ya había detectado en el playbook —
la ruta de escalado con momento— pero ahora se ve el costo real.

## 🟡 5 · No hay forma de decir «esto se rompió»

Si un cliente encuentra un error —el DM no le llega, un botón no anda, la app
le dio un número raro— **su único camino es escribir en Soporte y esperar.**

No hay diferencia entre «tengo una duda» y «esto no funciona», y son dos cosas
completamente distintas: **una espera, la otra no.**

---

# LO QUE SÍ ESTÁ BIEN

Para no perder la proporción:

- **El circuito de soporte funciona de punta a punta**, con aviso en tiempo real
- **El diagnóstico no miente**: se ajusta al mercado y espera datos suficientes
- **Los avisos automáticos llegan y llevan a algún lado** (18 destinos rotos, arreglados)
- **La cola escribe la acción y el mensaje**, ordenada por dinero en riesgo
- **Nadie del equipo ve el dinero del dueño**, verificado en el HTML
- **El criterio de las tres situaciones difíciles está escrito**

---

# LO QUE PROPONGO, EN ORDEN DE URGENCIA

### **1 · Que la sesión no se pierda nunca** 🔴
Guardar el progreso en la base en cada paso, con el navegador como respaldo y
no al revés. **Es lo primero porque es lo único irrecuperable.**

### **2 · Un solo vocabulario de ticket** 🔴
Traducir plan ↔ ticket en un lugar, y **montar el cuadro** para que el de
$5.000 vea lo que compró.

### **3 · El mensaje sin responder, en la cola** 🟡
Con su reloj: a las 24 horas aparece, a las 48 sube al primer lugar.

### **4 · El compromiso, dicho** 🟡
«Te respondemos en menos de 24 horas hábiles», declarado al cliente y medido en
el marcador. Un número que se puede fallar es mejor que ninguno.

### **5 · «Algo no funciona»** 🟡
Un camino aparte del de las dudas, que entra directo a la cola del dev y no a
la de acompañamiento.

---

# LAS OTRAS PREGUNTAS QUE HICISTE

## ¿A quién contratar, y con qué accesos?

**El próximo asiento es INSTALACIÓN**, y ya está fundamentado: para un cliente
de $5.000 el equipo hace 51 de los 62 ítems, eso hoy vive dentro del techo de
12 horas de acompañamiento, y **no cabe**. Además instalar y acompañar son dos
oficios distintos: mezclarlos rompe la inducción de 72 horas.

**Sus accesos**, con el modelo que ya está construido: ve todos los clientes,
sus números y las decisiones. **No** ve el dinero de TCD, ni las ventas de
Javo, ni el rendimiento de sus compañeros, ni las conversaciones.

Eso funciona hoy sin tocar nada: alcanza con darle el rol.

**Producción puede esperar** hasta que entren los tickets altos.

## ¿Cómo gestionás sus check-in y check-out y sus tareas?

Ya está construido y funcionando: entrada y salida a la hora que sea, minutos
calculados solos, la traba anotada al cerrar, y la lista del viernes con lo
repetido primero. Las jornadas viven en la base, así que **las trabas de uno le
llegan al resto.**

Lo que falta ahí es chico: **la tarea que sale de la cola todavía no se marca
como cerrada desde el cierre del día.** Se anota qué cuentas atendió, no qué
tareas cerró.

## ¿Estamos gestionando la app como las premium de clase mundial?

**En diagnóstico y automatización, sí.** Un tablero que ajusta por mercado, que
espera datos suficientes antes de opinar y que dice hasta dónde puede opinar es
mejor que la mayoría de lo que se vende como premium.

**En operación de soporte, todavía no.** Y son exactamente los tres huecos de
arriba: sin compromiso de respuesta, sin alerta de mensaje sin responder, y sin
un camino separado para lo que está roto. Eso es lo que separa una herramienta
buena de un servicio premium.

**Ninguno de los tres es difícil.** Son un turno.
