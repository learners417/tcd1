# Registro de cambios

## 2026.09 · versión definitiva

Reemplaza toda versión anterior del camino, los cinturones y el roadmap.

### Cambios de fondo

- **Mi Clínica entra el día 2, no el 45.** El cliente carga sus consultantes
  actuales antes de construir nada.
- **La primera plata sale de su cartera.** La transición y la subida de precio se
  mueven del día 18 a la semana 2. Cobra al precio nuevo el día 12.
- **El embudo se bifurca por audiencia**, con una pregunta con número el día 23.
  Página, video y formulario son los mismos en las dos ramas.
- **El Dojo deja de ser la app entera** y pasa a ser la sala de los ocho agentes.
- **El protocolo interior se reparte en tres aperturas** en vez de una semana
  bloque, siempre a menos de dos días de su examen real.
- **Los cinturones pasan de nueve inventados a los once del taekwondo.**
- **El perfil baja de seis minutos a tres**, cuatro cosas y se cierra.

### Piezas

- 43 piezas · 279 minutos · 4 jornadas de rodaje
- 21 tutoriales · 106 minutos
- Se eliminan: "Cómo usar tu app", el circuito viejo, la garantía dentro del
  video de la oferta, el perfil de seis minutos
- `P4.1` (el circuito) se regraba de cero: **es el único error activo en
  producción**

### Producto

- Cinco tabs: Hoy · Camino · Dojo · Mando · Clínica
- Se agregan cinco salas de apoyo: Biblioteca, Cuaderno, Ring, Reloj, SOS
- Motor de frenos con nueve reglas duras
- 69 evidencias, ninguna validada con una tarea tildada
- Entrega del Sistema por etapas: día 9, día 22, día 29

### Diseño

- Se documentan los tokens de la app existente y se agrega lo semántico que
  faltaba: verde de tildado, rojo de tachado, violeta de grado en ventana
- Doce reglas de diseño para una cabeza que se distrae
- Piso de 15 px. Etiqueta de tab sube de 12,5 a 14
- Una sola animación real en noventa días

### Correcciones de la auditoría

| Decía | Dice |
|---|---|
| Nueve grados | Once |
| Cuarenta y tres evidencias | Sesenta y nueve |
| 90 jornadas | 91, del día 0 al 90 |
| Ochenta horas de carga | **4.265 minutos ≈ 71 horas**, verificado |
| Días 6 y 7 como sesión y como campo | Sesiones de protocolo |

---

## Cómo se versiona de acá en adelante

- Cambiar un archivo de video **no cambia versión** si el día y la evidencia son
  los mismos.
- Cambiar el orden, una evidencia o un cinturón **sí cambia versión**.
- **Ningún cliente en curso se migra.** Termina con la suya.
