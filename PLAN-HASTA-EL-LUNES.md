# De acá al lunes — diez turnos para que salga a la venta

Escrito el jueves 5 de noviembre de 2026, 22:30.

---

## El diagnóstico, en tres líneas

**1 · Las 22 lentes pasan y la pantalla igual está mal.** (Corregido el
turno 1: primero leí esos ceros como «no se midió». Son cero FALTAS. La
auditoría sí mide el Admin —104 vistas, no 87— y pasa las 22 lentes.)

Lo que no pasa es otra cosa. Esas lentes miran contraste, tamaños y
desbordes, no CUÁNTO hay en la pantalla. Del lado del cliente también daban
cero mientras El Camino abría con 545 palabras; por eso se construyó
`medir-densidad.py`. Ese nunca había apuntado al Admin. Apuntado:

| pantalla | palabras | toques |
|---|---|---|
| **admin:videos** | **1.341** | **107** |
| admin:casa | 849 | 25 |
| admin:semana | 290 | 9 |
| admin:mirol | 214 | 13 |
| *la peor del cliente (adn)* | *250* | *22* |

Y una que sí era un agujero: el control estricto decía
`if p in resultados` — la pantalla estricta que no se medía se salteaba en
SILENCIO y después imprimía «✓ las pantallas estrictas cumplen la
especificación». Arreglado: lo que no se midió se nombra y falla.

**2 · Diecisiete pestañas.** `clientes · pipeline · mensajes · metricas ·
videos · equipo · campanas · creativos · tareas · motor · hoy · supervision ·
sala · mirol · sesiones · semana · casa`. Del lado del cliente ya se tomó la
decisión contraria: cuatro destinos fijos, iguales en teléfono y en
computadora. Acá falta tomarla.

**3 · La misma enfermedad, sin tratar.** La pestaña de Clientes —la que se
abre todos los días— abre con «Días sin soporte»: un formulario de dos fechas
que se usa dos veces al año, con 32 palabras de explicación y las fechas en
`mm/dd/yyyy`, arriba de la lista de clientes. Es exactamente lo que El Camino
tenía con las once casillas.

Tamaño: 13.912 líneas en el Admin, 5.100 solo en `Admin.tsx`.

---

## Los diez turnos

Cada turno cierra con la batería corriendo y el trabajo subido. Nada queda a
medias entre turnos.

| # | Qué se hace | Cómo se sabe que quedó |
|---|---|---|
| **1** | **La vara apunta al Admin.** Arreglar el modo `--admin` (devuelve ceros), meter las 17 pestañas en el conjunto estricto, y extender `caminar-el-dia-1.py` a recorrer el Admin tocando cada botón. | La lista real de defectos del Admin, medida. Deja de ser «está floja» y pasa a ser una lista. |
| **2** | **De 17 pestañas a las que se usan.** La misma decisión que del lado del cliente, tomada con el recorrido del turno 1 a la vista: qué hace quien opera en un día, y qué entra en cada destino. | Una estructura propuesta, decidida en un mensaje. Lo demás vive adentro. |
| **3** | **Clientes.** La pantalla que se abre todos los días: la lista arriba, el caso raro adentro, fechas en `dd/mm`. | Medida: palabras, toques y alto, antes y después. |
| **4** | **El día del que opera.** `hoy · supervision · semana` son tres pantallas para una pregunta: qué hay que hacer hoy y con quién. Se unifican. | Una sola pantalla, medida, y el recorrido la cruza sin trabarse. |
| **5** | **Los videos y los tutoriales.** Que funcionen de verdad: qué video tiene cada jornada, cuál falta, y que la pantalla lo diga sin prometer lo que no está. Incluye la lente que recorre las 91 jornadas. | Una pantalla en el Admin que dice qué falta grabar, y ninguna jornada que mienta. |
| **6** | **Botones vacíos y callejones.** Todo botón que no hace nada, todo estado vacío sin salida, todo lugar donde se puede quedar trabado. | Una lente nueva que los encuentra sola, para que no vuelvan. |
| **7** | **Estética, teléfono.** Tipografías, tamaños, color, aire. Que se vea más caro: menos relleno, más jerarquía, la línea de oro donde corresponde. | Capturas de las dos mitades, miradas. |
| **8** | **Estética, computadora.** Lo mismo a 1440: hoy el Admin es una columna de teléfono estirada, como era El Camino antes del arreglo. | Capturas a 1440, miradas. |
| **9** | **Caminar todo, de punta a punta.** Cliente y Admin, clic por clic, con datos de verdad. Lo que mide una pantalla no ve un recorrido. | El recorrido completo sin un freno. |
| **10** | **El cierre.** Batería entera con el Admin adentro, verificación en la URL desplegada, y el punto bueno marcado. | Verde, con el Admin contando. |

---

## Lo que no puedo hacer yo

Esto es tuyo y bloquea «listo para vender»:

- **Los pasos del día 45** — «Tu primer consultante nuevo» es una sesión de 30
  minutos vacía, y su evidencia es el cobro del sistema.
- **Los 31 videos del Camino.**
- **Los 3 links de pago.**
- **Los 5 mensajes de los libros en GHL.**
- **El SQL de `fallas_vistas`** — hasta que corra, si a un cliente se le traba
  una pantalla, la app le dice «ya nos llegó el aviso» y no llega nada.

---

## La regla de los diez turnos

Medir, después mirar la captura, después tocar. En este arco, cada defecto
que valió la pena salió de MIRAR —el cero que parecía un paréntesis, las caras
sin frente, el botón que no llevaba a la sesión—, nunca de leer el código. Y
cada vez que la vara dijo verde con la app todavía fea, era porque la vara no
estaba apuntando ahí.
