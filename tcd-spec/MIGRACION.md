# Migración del repo

Qué tocar en la app que ya existe para llevarla a esta versión. En orden, y con
el criterio de que **después de cada etapa la app sigue funcionando**.

**Regla de oro de la migración:** ningún cliente en curso se migra a mitad de
camino. El seed lleva `version`; quien está adentro termina con la suya.

---

## Etapa 0 · sembrar sin romper nada

**Archivos que se agregan:**

```
src/lib/roadmap.seed.json     ← datos/roadmap.seed.json
src/lib/roadmapSeed.ts        ← datos/roadmapSeed.ts (reemplaza el actual)
src/styles/tokens.css         ← diseno/tokens.css
src/lib/tokens.ts             ← diseno/tokens.ts
prompts/                      ← agentes/prompts/*.md
```

**Qué hacer con el `roadmapSeed.ts` viejo.** Se reemplaza entero. El nuevo no
duplica datos: tipa el JSON y expone índices y helpers. Cualquier código que hoy
recorra el array con `.find()` pasa a usar `jornadaPorDia.get(dia)`.

**Verificación antes de seguir:**

```bash
python3 datos/validar.py     # tiene que decir "el paquete cierra"
```

---

## Etapa 1 · los cinco tabs

| Tab actual | Qué pasa |
|---|---|
| Hoy | Se queda. Cambia el contenido en la etapa 2 |
| Camino | Se queda. Pasa a mostrar 5 sistemas con las jornadas adentro |
| **ADN** | **Deja de ser tab.** Pasa al encabezado del Dojo |
| **Mentor** | **Se convierte en Dojo**, con ocho agentes en vez de uno |
| **—** | **Se agrega Mando**, con tres solapas |
| Clínica | Se queda. Cambia de ícono |

**Íconos.** Dojo toma el que hoy usa Mentor. Mando toma el hexágono que hoy usa
Clínica. Clínica pasa al ícono de agenda. Es el cambio mínimo que conserva el
reconocimiento de quien ya venía usando la app.

**Ruta del ADN.** La que hoy es `/adn` pasa a `/dojo#adn` y se deja una
redirección, porque hay clientes con el enlace guardado.

---

## Etapa 2 · la pantalla Hoy

Es la que más cambia y la que más rinde.

**Lo que se agrega, en este orden de arriba abajo:**

1. **Tira de cinturón** en el encabezado, a la derecha del día
2. **Barra de la jornada** de cuatro horas, debajo de la tarjeta
3. **Estado `campo` y `ciclo`**, que hoy no existen y cubren 39 de los 91 días
4. **Panel de freno**, con sus tres líneas
5. **Marcador de cuatro números**, visible solo desde el día 31

**Lo que se saca:** cualquier día que hoy quede vacío. Del seed, todos los días
del 0 al 90 tienen contenido.

**Lo que cambia de comportamiento:** la tarjeta se reemplaza por la lista de
pasos al tocar Empezar, no se agrega debajo.

---

## Etapa 3 · evidencias y grados

**Tablas nuevas:** `evidencia`, `cinturon_otorgado`, `cuaderno`.

**La tabla `progreso` cambia:** el campo de estado pasa de booleano a la máquina
de ocho estados de `datos/09-ESQUEMA.md`. Migración: todo lo que estaba en
`true` pasa a `completa`, todo lo demás a `pendiente`.

**Los cinturones viejos se descartan.** Pasan de nueve inventados a los once del
taekwondo. Para clientes en curso, se recalcula el grado según las evidencias que
ya tengan; quien no tenga evidencias arranca en blanco.

**Webhooks de GHL que hay que dar de alta:** los nueve de
`salas/08-SISTEMA-Y-MCD.md` §"Lo que TCD lee del Sistema".

---

## Etapa 4 · los agentes

**Primero el Crítico y el Sparring.** Son los dos que más cambian el resultado del
cliente y los dos que más reemplazan tu tiempo.

**Después el Espejo**, que es el más delicado: tiene el límite de derivación y las
cuatro devoluciones programadas de los días 18, 27, 43 y 45.

**El resto en orden de día.**

**Cada prompt vive en su archivo** dentro de `prompts/`. Se cargan como texto, no
se pegan en el código: así se corrigen sin desplegar.

**Lo que hay que construir además del prompt:**

| Agente | Lo que no es prompt |
|---|---|
| El Espejo | Guardado en Cuaderno · las cuatro devoluciones por fecha |
| El Crítico | Estado `aprobado` que escribe al ADN y otorga 7.º gup |
| El Escriba | Tres versiones, selección, guardado de frases propias |
| La Cámara | Visión sobre la foto del set · generador del checklist de rodaje |
| El Sparring | Medición de los cuatro números · el Ring |
| El Tablero | Lectura de Meta · la regla de los catorce días |
| El Arquitecto | Escritura de `entrega.*` |
| El Estratega | Bloqueo de grabación dentro de los 90 días |

---

## Etapa 5 · el Mando

**Creativos primero**, porque se necesita el día 26 y Campañas recién el 31.

**Conexión con Meta: lectura antes que escritura.** Con lectura sola ya funciona
el tablero completo. Las tres acciones de escritura —subir un escalón, pausar un
anuncio, activar un conjunto— se agregan después.

**Si la conexión no está lista para la fecha**, la app pide los cuatro números a
mano y el camino no se frena. Está previsto y no es un parche.

---

## Etapa 6 · las salas de apoyo

En orden de urgencia real:

1. **La Biblioteca.** Sin esto, cada video que nombra un panel genera un mensaje
2. **El Cuaderno.** Lo necesita el Espejo desde el día 3
3. **SOS.** Corta el resto de los mensajes
4. **El Ring.** Se necesita desde el día 28
5. **El Reloj.** Es el más simple y el menos urgente

---

## Los 43 archivos de video

**No bloquean la construcción.** La app se arma con los códigos del seed; los
archivos se van reemplazando a medida que se graban.

**Orden de grabación sugerido**, que es también el orden en que hacen falta:

1. **Jornada pizarra.** Ahí está `P4.1`, el circuito, que es el único error activo
   en producción. Mientras no se regrabe, el video en vivo enseña un embudo que
   ya no se vende
2. **Jornada oficina.** Cubre el mes 1 completo
3. **Jornada pantalla.** Necesita preparado: página real, comentario real, cuenta
   con datos, app con marca
4. **Jornada montaña y lago.** Seis piezas, veinte minutos

**Mientras una pieza no exista**, la jornada muestra el texto de los pasos y la
evidencia igual. El video es la mitad de la sesión, no toda.

---

## Qué se elimina

| Qué | Por qué |
|---|---|
| Pieza "Cómo usar tu app" | Manda a cargar consultantes el día 1 y promete siete etapas que no existen |
| Pieza del circuito viejo | Enseña anuncio → WhatsApp → bot → página |
| La garantía dentro del video de la oferta | Se dice dos veces |
| El perfil de seis minutos | Queda en tres y cuatro cosas |
| Los nueve cinturones viejos | Pasan a los once del taekwondo |
| Tab ADN | Sube al Dojo |
| Cualquier día sin contenido | Ya no existe: los 91 tienen algo |

---

## Lista de control del despliegue

```
[ ] python3 datos/validar.py dice "el paquete cierra"
[ ] roadmapSeed.ts reemplazado y el proyecto compila
[ ] tokens.css cargado y el tamaño del tab subido a 14px
[ ] cinco tabs con Dojo y Mando
[ ] redirección de /adn a /dojo#adn
[ ] pantalla Hoy con tira de cinturón, jornada y estados campo/ciclo
[ ] tabla evidencia con los seis tipos
[ ] once cinturones sembrados, nueve viejos descartados
[ ] nueve webhooks de GHL dados de alta
[ ] permisos de subcuenta por etapas: solo pagos y calendario al inicio
[ ] Crítico y Sparring andando
[ ] prompts cargados desde archivo, no desde el código
[ ] P4.1 regrabado antes de que entre un cliente nuevo
```

**El último punto es el único que no puede esperar.** Todo lo demás mejora la app;
ese arregla algo que hoy está enseñando mal.
