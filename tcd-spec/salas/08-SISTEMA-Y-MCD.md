# El circuito de los tres sistemas

TCD enseña y entrena. El Sistema ejecuta. MCD dirige.

**La regla que ordena todo.** Cada cosa vive en un solo lugar. Si un dato existe
en dos sistemas, uno de los dos está mal.

| | TCD | Sistema | MCD |
|---|---|---|---|
| Qué es | La app del camino | GoHighLevel marca blanca | La máscara de GHL |
| Dónde | app.tuclinica.digital | sistema.tuclinica.digital | Dentro de TCD, tab Clínica |
| Cuánto dura | 90 días | Para siempre | Para siempre |
| Quién lo toca | El cliente, entrenando | El cliente, ejecutando | El cliente, dirigiendo |
| Qué guarda | Progreso, ADN, cuaderno | Contactos, páginas, pagos | Consultantes, agenda, números |

---

# 1 · El Sistema · GHL marca blanca

## Las tres entregas

El sistema completo el día 1 es la forma más rápida de que se pierda adentro. La
subcuenta existe desde el día 0; lo que se abre por etapas son los permisos.

### Entrega 1 · día 9 · pagos y calendario

**Se abre para que cobre a su cartera al precio nuevo.**

| Módulo | Estado |
|---|---|
| Payments | ✅ |
| Calendars | ✅ |
| Todo lo demás | ❌ |

`Settings → My Staff → permisos por usuario.` Se apagan: Conversations,
Opportunities, Marketing, Automation, Sites, Reporting, Contacts.

### Entrega 2 · día 22 · sitios, formularios y contactos

**Se abre el día que entiende el circuito.**

| Módulo | Se agrega |
|---|---|
| Sites | funnels, websites, forms, surveys |
| Contacts | ✅ |

### Entrega 3 · día 29 · lo último

| Módulo | Se agrega |
|---|---|
| Conversations | + el número nuevo de WhatsApp conectado |
| Automation | workflows |
| Reporting | ✅ |
| Integrations | Meta |

---

## Lo que TCD escribe en el Sistema

**Nada.** TCD no crea páginas, no crea formularios, no crea automatizaciones.

**Por qué.** Si la app construye por él, el día 91 no sabe tocar nada y depende
para siempre. Los tutoriales de Lupe existen justamente para que lo haga con las
manos una vez.

**La única excepción** son las plantillas de mensaje: TCD las genera y el cliente
las pega. Pegar es aprender; recibirlo hecho, no.

---

## Lo que TCD lee del Sistema

Nueve webhooks. Todos de lectura.

| Webhook | Dispara | Alimenta |
|---|---|---|
| `payment.received` | Cobro | Evidencias 9, 12, 45, 53 · cinturón negro |
| `appointment.booked` | Reserva | Evidencia 28 · tablero |
| `form.submitted` | Formulario | Agenda calificada |
| `call.recording.started` | Grabación activada | Evidencia 39 |
| `call.recording.ready` | Llamada grabada | Ring y autopsia |
| `contact.created` | Contacto nuevo | Bandeja |
| `opportunity.stage` | Cambio de estado | Recuperador |
| `invoice.paid` | Factura | Números de MCD |
| `subaccount.ready` | Alta | Día 0 |

**Si el webhook no llega**, la app pide el dato a mano con un campo y una línea:
*"No pudimos leerlo solos. Cargalo y seguimos."* Sin explicación técnica.

---

## Plantillas de la subcuenta

Se clonan desde un snapshot maestro al crear cada subcuenta. **El cliente las
edita; nunca las arma de cero.**

| Plantilla | Día que la usa |
|---|---|
| Página de venta base | 25 |
| Formulario de filtro, cinco preguntas | 28 |
| Calendario en dos pasos | 28 |
| Página de preparación | 28 |
| Link de pago | 9 |
| Workflow de confirmación y recordatorio | 28 |
| Workflow de recuperación | 44 |
| Respuestas automáticas de Instagram | 44 |
| Plantilla de factura | 9 |

**Regla del snapshot:** cuando se mejora una plantilla, los clientes en curso no
se migran. Se les avisa que hay una versión nueva y deciden ellos.

---

## La regla del número

El WhatsApp del Sistema es **un número nuevo**, comprado el día 0. Nunca el
personal, nunca el del consultorio.

**Por qué es una regla y no una sugerencia.** El número del consultorio tiene
años de conversaciones con consultantes actuales. Mezclarlo con el sistema
rompe la bandeja, rompe el recuperador y hace que cada mensaje de un consultante
viejo parezca un lead.

---

# 2 · MCD · la máscara de GHL

**Se especifica en el paquete siguiente.** Acá va solo el contrato: qué tiene que
existir para que TCD funcione.

## Lo que TCD necesita de MCD, desde el día 2

| Qué | Para qué |
|---|---|
| Alta de consultantes con nombre, fecha de inicio, monto y frecuencia | Evidencia día 2 · base del día 3 |
| Ingresos de los últimos tres meses | Cálculo de la hora real neta |
| Gastos fijos | Cálculo de la hora real neta |
| Agenda de la semana | Cálculo de horas reales |
| Etiqueta de transición: sube, termina, deriva | Día 8 |
| Fecha de cierre por consultante | Día 11 |
| Conteo de consultantes al precio digno | Cinturón negro |

## Lo que MCD no hace

**No es un CRM de ventas.** Los leads, la bandeja y el embudo viven en el
Sistema. MCD es lo de adentro: quién está en tratamiento, cuándo viene, cuánto
paga, cómo va.

**No duplica el calendario.** Muestra el del Sistema.

**No guarda historia clínica.** Ni notas de sesión, ni diagnósticos, ni nada que
un profesional de salud tenga obligación de custodiar bajo otra normativa. **Esa
línea no se cruza**, y conviene decirlo en la bienvenida de MCD: es un sistema de
negocio, no un sistema clínico.

## Las tres pantallas de MCD

| Pantalla | Qué muestra |
|---|---|
| **Consultantes** | Quién está adentro, en qué etapa, cuánto paga, cuándo vence |
| **Semana** | La agenda, con lo cobrado y lo pendiente |
| **Números** | Ingreso del mes, consultantes activos, precio promedio, hora real neta |

**La pantalla Números es la que se conecta con el día 87.** El recálculo de la
hora real neta sale de ahí, no de un formulario.

---

# 3 · El recorrido de un dato

Ejemplo completo, para que quede claro dónde vive cada cosa.

**El precio digno.**

1. Se decide el **día 9**, en TCD, sobre el número del día 3.
2. Se escribe en `adn.numeros.precio_digno`. **TCD es el dueño.**
3. TCD lo empuja al Sistema como monto del link de pago.
4. Cada `payment.received` se compara contra él para otorgar cinturones.
5. MCD lo lee para marcar qué consultantes están al precio nuevo.
6. El día 87 se usa para recalcular la hora real neta.

**Un dato, un dueño, cuatro lectores.** Ese es el patrón para todo lo demás.

---

# 4 · Qué pasa el día 91

El camino termina. El cliente se queda con:

| Qué | Dónde |
|---|---|
| Su clínica funcionando | MCD, para siempre |
| Su página, formulario, calendario, pagos, bandeja | El Sistema, para siempre |
| Su app con su marca y sus consultantes adentro | Para siempre |
| Sus cuatro manuales en PDF | Descargados |
| Su cuaderno completo | Descargado |
| Su plan de 180 días | Descargado |
| El Camino, el Dojo y sus cinturones | **Acceso de lectura** |

**Los agentes siguen disponibles**, porque son lo que hace que renueve. El
Tablero cada lunes, el Sparring antes de cada llamada, el Escriba para cada
anuncio nuevo. **Esa es la razón por la que este producto se puede cobrar todos
los meses y no una sola vez.**

Lo que se cierra el día 91: las sesiones nuevas. No hay más camino porque el
camino terminó.
