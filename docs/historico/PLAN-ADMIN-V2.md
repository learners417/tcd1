# EL ADMIN, DE RAÍZ

Recorrí el repo, la escalera y lo que pediste. Este plan sale de tres cosas
que medí, no de lo que me parece.

---

# PARTE 1 · LO QUE MEDÍ

## 1.1 «Letra muy chica» — es literal

| Tamaño | Usos | |
|---|---|---|
| **12px o menos** | **473** | **61%** |
| 14px o más | 298 | 38% |

El estándar para tableros es 14-16px de cuerpo y 18-24 de título. El mínimo
accesible son 15-16px.

**Seis de cada diez líneas están por debajo del mínimo**, y las escribí yo.

## 1.2 «Poco visual» — construí un informe, no un tablero

**207 párrafos contra 12 números grandes.**

> *Un tablero no es un informe. Es una cabina.*

**Mis pantallas explican. Un tablero no explica: muestra.**

## 1.3 «Muy repetitivo» — seis pantallas listan lo mismo

Seis pantallas del Admin dibujan la lista de clientes, cada una con su formato
y sus botones.

---

# PARTE 2 · LO QUE ENCONTRÉ EN EL REPO

## 2.1 La escalera dice quién hace falta

| Ticket | Quién instala | Ítems del equipo | ¿Pide dirección? |
|---|---|---|---|
| **$1.000** — la app sola | el cliente, con tutoriales | **0** | no |
| **$2.000** — con revisión | el cliente, revisado | 4 | no |
| **$5.000** — instalación acompañada | la agencia | **51** | no |
| **$10.000** — con dirección | la agencia | 51 | **sí** |

**Y ahí está la respuesta a tu pregunta de fondo.** Lo único que exige a una
persona en particular es la dirección del $10.000. **Todo lo demás son
funciones, y una función la puede ocupar cualquiera.**

Por eso el diseño tiene que ser **por rol y nunca por persona.**

## 2.2 Dos huecos estructurales que impiden lo que pedís

**Una persona = un rol.** El campo es uno solo. Si mañana son dos personas en
vez de cuatro, **la app no lo permite**: alguien tendría que elegir si es
supervisora o dev, y hacer el otro trabajo a ciegas.

**No existe «ver como».** No hay forma de que mires lo que ve otro sin
convertirte en otro.

---

# PARTE 3 · EL DISEÑO

## 3.1 Cuatro asientos, no cuatro personas

| Asiento | Qué se rompe si nadie lo ocupa |
|---|---|
| **Dirección** | El criterio se vuelve a discutir cada vez, y los $10.000 no reciben lo que pagaron |
| **Acompañamiento** | Las cuentas se frenan sin que nadie lo note |
| **Instalación** | Los de $5.000 y $10.000 nunca encienden |
| **Desarrollo** | Los minutos por cliente no bajan y el modelo deja de escalar |

**Hoy son cuatro personas. Podrían ser dos.** El asiento no cambia — cambia
cuántos ocupa cada uno.

### Una persona, varios sombreros

El cambio estructural: **`admin_rol` pasa de ser un texto a ser una lista.**

Y arriba de la pantalla, un selector:

> **Estás trabajando como: Acompañamiento** ▾
> *(también tenés Instalación)*

**Por qué un selector y no todo junto:** si alguien ve las dos cosas a la vez,
vuelve el caos que estamos sacando. **Un sombrero por vez, y se cambia en un
toque.**

Con dos personas, quedaría así:

> **Persona A** — dirección + acompañamiento
> **Persona B** — instalación + desarrollo

Y la app sigue funcionando igual.

## 3.2 «Ver como» — mirar sin ser

Vos podés abrir la pantalla de cualquier asiento **en modo lectura**:

> 👁 **Estás viendo como Acompañamiento.** No podés tocar nada.
> `Volver a lo mío`

**Ellos no pueden hacerlo, y no es desconfianza:** es que ver el trabajo de
otro sin poder actuar sobre él no aporta nada y sí invita a compararse.

Lo que sí ve cada uno del otro: **las decisiones, las trabas y el criterio.**
Eso es común y tiene que serlo.

## 3.3 La pantalla de cada asiento

### **ACOMPAÑAMIENTO** — sus clientes, en dos bloques

```
  CORRIENDO · 7                    INSTALANDO · 4
  (se miran resultados)            (se mira qué falta)
```

Cada cliente, **una tarjeta**:

```
┌────────────────────────────────────┐
│  ROSANA               🔴 12 días   │
│                                    │
│      18  →  2                      │
│   charlas   agendas                │
│                                    │
│  Se pierde en la conversación      │
│                                    │
│  [ Mandarle el mensaje ]     ···   │
└────────────────────────────────────┘
```

**Un número grande. Una frase. Un botón.** Detrás de los `···`: crearle la
campaña, crearle contenido, mandarlo a un entrenador, cargar una sesión, ver
su historial.

**El que atiende no debería salir del cliente para trabajar en él.**

### **INSTALACIÓN** — los 51 ítems, por cliente

Hoy este asiento no tiene pantalla y **es el que más carga tiene**: 51 de 62
ítems por cada cliente de $5.000.

> **ANA · $5.000 · semana 2**
> **34 de 51** — le faltan 17
> Lo que sigue: **verificar el píxel**
> `Abrir el tutorial` `Marcar hecho` `···`

### **DESARROLLO** — poco tiempo adentro, todo el registro

Dijiste que el dev trabaja poco dentro de la app pero reporta ahí. Entonces su
pantalla es **corta y de registro**:

> **HOY** — entrada 9:15, sin cerrar
> **EN QUÉ ESTOY** — una línea que escribe él
>
> **ESTA SEMANA — lo que hay que construir**
> · Las trabas que se repitieron 3 veces
> · Los errores que reportaron los clientes
> · Lo que más minutos de humano consume
>
> **LOS 30 DÍAS** — semana 1, 2, 3, 4 con lo que se espera
>
> **LO QUE ABSORBÍ** — cada cosa que dejó de necesitar una persona,
> con los minutos que ahorra **y si el número bajó de verdad**

**Ese último bloque es el que hace que sus cuatro horas rindan**, porque
convierte «lo automaticé» en un dato verificable.

### **DIRECCIÓN** — vos

El trabajo del equipo, los minutos por función, tu motor, y **«ver como»**.

## 3.4 Lo que es común a todos

Tres cosas que **todos ven igual**, porque son del negocio y no del asiento:

**El cierre del día** — entrada, salida, y qué trabó. Igual para los cuatro.
**Las decisiones** — el criterio escrito, para que nadie lo vuelva a discutir.
**Las trabas** — la lista del viernes.

---

# PARTE 4 · LAS REGLAS VISUALES, MEDIBLES

No opiniones: cosas que una lente puede verificar.

| Regla | Cómo se mide |
|---|---|
| **Nada por debajo de 14px** | cero `text-[10px]` y `text-[11px]` |
| **Un número grande por tarjeta** | al menos un `text-3xl` |
| **Máximo dos botones visibles** | el resto detrás de `···` |
| **El estado es un color** | chips, no frases |
| **Una sola lista de clientes** | una pantalla, no seis |

---

# PARTE 5 · LOS TURNOS

### **1 · Los asientos y «ver como»**
`admin_rol` pasa a lista, el selector de sombrero, y el modo lectura para
dirección. **Es el turno que hace posible que sean dos personas en vez de
cuatro.**

### **2 · La tarjeta y la tipografía**
La tarjeta de cliente y la letra sana en todo el Admin, con las lentes que
impiden volver atrás. **El que resuelve el caos de botones.**

### **3 · Acompañamiento e Instalación**
Las dos pantallas de los asientos que más se usan, con las herramientas
adentro de la tarjeta.

### **4 · Desarrollo**
Su pantalla de registro y el plan de 30 días. **La que necesitás antes de que
Marcos empiece.**

### **5 · Limpieza**
Borrar las pantallas que quedan repitiendo lo mismo. **Sin esto, todo lo
anterior se suma al caos en vez de reemplazarlo.**

---

## Lo único que necesito de vos

**Las prioridades de los 30 días de Marcos.** Puedo proponerlas con lo que sé
—los cinco motores construidos sin pantalla, las trabas repetidas, los minutos
por función— pero el orden es tuyo.

Y cuando esté el turno 2, **miralo antes de que siga.**
