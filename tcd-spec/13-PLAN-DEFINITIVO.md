# Plan definitivo · 16 sep 2026

Reemplaza cualquier orden de trabajo anterior. El producto está diseñado
(`00-MAESTRO.md` y `camino/`); lo que falta es terminar la migración y que la
app diga lo mismo que los videos.

**Regla nueva: los nombres se congelan antes de grabar.** Un video que nombra
algo que la app llama distinto confunde más que un video que falta.

---

## 1 · Nombres congelados

### Las cinco pestañas

`Hoy · Camino · Entrenadores · Campañas · Clínica`

| Pestaña | Para qué | Qué tiene adentro |
|---|---|---|
| Hoy | Qué hago hoy | Tu paso de hoy, la jornada de 4 horas, mañana, el cierre del día |
| Camino | Dónde estoy | Los 5 sistemas, los 90 días, cinturones, Biblioteca, Cuaderno |
| Entrenadores | Practico | Tu ADN arriba, los nueve entrenadores abajo |
| Campañas | Consigo consultantes | Creativos · Tu campaña · Números |
| Clínica | Dirijo | Abre Mi Clínica |

**El Mentor** es un botón fijo en todas las pantallas, no una pestaña.
En la computadora, la barra lateral tiene las mismas cinco, en el mismo orden.

### Los tres sistemas que se nombran

- **La app** (Tu Clínica Digital): donde recorres el camino.
- **El Sistema** (`sistema.tuclinica.digital`): tu página, formularios, agenda, cobros.
- **Mi Clínica**: tus consultantes, agenda, cobros y números.

### Los cinco sistemas del camino

1. **Tú** · días 1 a 12
2. **Tu programa** · días 15 a 19
3. **Tu sistema de venta** · días 22 a 46
4. **Tu clínica adentro** · día 2 y días 47 a 53
5. **Tu plan de marca** · días 61 a 67

### Los nueve entrenadores

El Espejo (el trabajo interno) · Vera (tu precio) · Sofi (tus mensajes) ·
Diego (tu producto, aprueba tu método) · Mateo (tu contenido) · Caro (tu cámara) ·
Ramiro (tu embudo) · Lucas (tus llamadas) · Bruno (tu entrega).

Ya no existen: el Crítico, el Escriba, la Cámara, el Sparring, el Tablero, el
Arquitecto, el Estratega, el Dojo, el Mando.

### Los once cinturones

Blanco · Blanco punta amarilla · Amarillo · Amarillo punta verde · Verde ·
Verde punta azul · Azul · Azul punta roja · Rojo · Rojo punta negra · Negro.

### El ADN

Un solo ADN, en Entrenadores. Sus bloques: **Quién eres** (Tu historia · Lo que
atravesaste · Tus dones · Tu precio digno) y los de tu oferta. El "Manual del
Negocio" se funde en el ADN.

### Palabras que se quedan, explicadas la primera vez

- **Búnker:** tu lugar y tu hora fija de trabajo.
- **Pacto:** tu compromiso escrito y publicado.
- **Cuaderno:** tu cuaderno de papel, y su copia en la app.
- **Consultante:** la persona que atiendes. Nunca "paciente" ni "gente".

### Cómo se habla

En tú, en todos los videos y en toda la app.

---

## 2 · Estado verificado

| Hecho | Falta |
|---|---|
| Seed nuevo, día único, cinturón por evidencia | Las cinco pestañas y el botón del Mentor |
| Diseño en 38 vistas (auditoría con medidor) | Sesión en cinco pantallas con el texto completo |
| Hoy y Camino rediseñados, pilares abiertos | La sesión sin video y el tablero de grabación |
| Tuteo, tildes, nombres de entrenadores | ADN editable en su tarjeta |
| | Hoy completo: jornada, mañana, marcador, freno |
| | Sacar el reloj que corre y la emoción diaria |

---

## 3 · Las cirugías hasta el lanzamiento

**Criterio de lanzamiento (16 sep):** se lanza con los videos grabados y los que
ya existían. Toda sesión sin video muestra su texto completo. Los videos que
faltan se graban cuando un cliente los pida. Los que enseñan algo viejo
(estado `CERO`: el circuito, la bienvenida vieja y la entrega vieja) **no se
muestran**.

| # | Fecha | Cirugía | Listo cuando |
|---|---|---|---|
| C1 | jue 17 | **La estructura.** Cinco pestañas en teléfono y computadora. Botón del Mentor fijo. ADN único en Entrenadores (el Manual del Negocio se funde). Biblioteca y Cuaderno dentro de Camino. Métricas y Creador dentro de Campañas. Diario como cierre del día en Hoy. Las rutas viejas redirigen | A cualquier lado en dos toques · 38 vistas en cero faltas · ninguna ruta vieja da pantalla vacía |
| C2 | vie 18 | **La sesión.** Cinco pantallas: Te llevas · Mira · Haz · Sube · Listo. Texto completo de `camino/` en el seed; la evidencia con un campo `pide` para el cliente (la regla `valida` queda interna). Sin códigos, sin reloj, emoción solo en los días de protocolo, modo 15 minutos con su paso esencial. Video en tres estados: disponible · sin video (texto completo) · oculto | Las 91 jornadas se abren y se completan sin un solo video · lente de contenido en verde |
| C3 | lun 21 | **Hoy, el ADN y el tablero.** Hoy completo: jornada de 4 horas, mañana, marcador desde el día 31, freno con sus tres líneas, días de campo y ciclo. ADN editable en su tarjeta; el precio sellado se cambia con El Espejo. Tablero de grabación en el Admin: piezas y tutoriales con su estado y la subida a su sesión | **App congelada.** Lupe graba L-01, L-02 y L-22 a L-26 |
| C4 | mar 22 | **Redacción del mes 1** (días 0 a 33) con la vara | **Javo la aprueba** |
| C5 | mié 23 | **Redacción de los meses 2 y 3**, las sesiones guiadas y las herramientas | Las 91 jornadas pasan la vara |
| C6 | jue 24 | **El recorrido completo.** Un cliente simulado del día 1 al 90: cada día abre, cada evidencia se sube, cada cinturón se otorga, ningún callejón. Lo mismo del lado del equipo. Verificar que Vercel publique `mejoras` | Cero callejones · auditoría en verde en un clon limpio |
| — | vie 25 | **Lanzamiento.** Javo crea un cliente de prueba y hace el día 1 desde el teléfono | Si el día 1 se entiende sin preguntar, se abre |

**Quién hace qué.** Claude construye y verifica cada cirugía en un clon limpio.
Javo aprueba el mes 1 (mar 22) y prueba el día 1 (vie 25). Lupe graba desde el
lun 21 y sube cada video en el tablero. Marcos hereda `COMO-FUNCIONA.md` y este
plan.

## 4 · La vara del contenido

Cada jornada, sin excepción:

1. **Título:** la pregunta o el resultado, nunca el nombre interno.
2. **Te llevas:** una línea.
3. **Haz:** cinco pasos como máximo, verbo + cosa concreta + ejemplo.
4. **Sube / terminaste cuando:** una frase, sin reglas técnicas.
5. **Sin** metáforas sin explicar, códigos (P1.0) ni símbolos (< > ±).

Una lente de la auditoría lo exige en las 91 jornadas.

---

## 5 · Grabación

**Criterio (16 sep):** un video de Javo existe solo si cambia una creencia, está
antes de una decisión que cuesta o dibuja el método. Todo lo demás es texto en la
app, un entrenador o un tutorial de Lupe. De 43 piezas quedan **13 nuevas** (unos
87 minutos) y **4 que se mantienen** si pasan la escucha.

**Actualización (16 sep).** El precio digno sale: repite lo que ya dice la
sesión. **Grabados:** P1.0 Tu hora real neta · P1.1 Por qué el dinero se sana
primero · P3.7 La transición de tu cartera. **Por grabar cuando se pida, en este
orden:** P4.1 El circuito completo (el viejo se oculta) · P0.0 Bienvenida ·
P3.1 La oferta y su garantía · P4.4 Encender · P5.1 La W · P6.3 Tu primer
consultante nuevo · P6.1 Entregar sin quemarte · P7.1 La máquina de 10 ·
P9.1 Por qué la marca va última · P10.3 Qué sigue.

**Se mantienen si pasan la escucha.** P1.1 · P2.1 · P1.4 · P5.2. Que no nombren
el Mentor como pestaña, los nueve cinturones viejos, las fases C·L·I·N·I·C·A, el
Dojo ni el Mando.

**Salen del catálogo.**
- A texto en la app: P0.3, P3.9, P3.3b, P4.1c, P6.2, P10.2, P4.1a, P7.1a,
  P4.2e-i, P5.4-i.
- Los hace un entrenador: P2.4b (Diego), P5.6 (Lucas), P9.4 (Mateo),
  P4.3e (Mateo), P4.7 y P4.4c (Ramiro).
- A tutorial de Lupe: P4.2d → L-22 Crear tu página con Claude · P4.4b → L-23
  Crear tu campaña en Meta · P4.5 → L-24 Tu recuperador · P8.1 + P8.2 → L-25 Tu
  app: marca y etapas · P8.4 + P8.5 → L-26 Tu app: videos e invitación.
- Ya cubiertos por tutoriales existentes: P0.4 (L-02), P4.2b (L-11).

**Lupe.** 19 de sus 21 tutoriales no dependen de la app y siguen. L-01, L-02 y
los cinco nuevos (L-22 a L-26) se graban con la app congelada, desde el lunes 21.

**En el seed (turno 1):** `piezas` queda con las 17 (13 + 4), `tutoriales` suma
L-22 a L-26, y cada jornada que perdió su video muestra su texto completo. La
sesión funciona igual sin video.

**Hoja de grabación:** https://claude.ai/artifact/W4pycUhSxUQjekmTw5bBso
