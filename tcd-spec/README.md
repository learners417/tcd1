# TCD · paquete de especificación

Todo lo necesario para construir la app Tu Clínica Digital en su versión
definitiva. Escrito para que se construya sin volver a preguntar.

**Leer en este orden.** `00-MAESTRO.md` primero: define la arquitectura, los
cinco tabs, el motor de frenos, el ADN y las reglas que no se negocian.
`10-DISENO.md` segundo: el sistema visual y las doce reglas de diseño para una
cabeza que se distrae, que cambian cómo se arma cada pantalla y no solo cómo se
pinta. `11-REVISION-FINAL.md` tiene la auditoría cruzada y el orden de
construcción sugerido.

---

## Estado del paquete

| Archivo | Qué contiene | Estado |
|---|---|---|
| `00-MAESTRO.md` | Arquitectura, tabs, frenos, ADN, reglas | ✅ |
| `camino/MES-1.md` | Días 0 a 33, micro paso a paso | ✅ |
| `camino/MES-2.md` | Días 34 a 60 | ✅ |
| `camino/MES-3.md` | Días 61 a 90 | ✅ |
| `01-PIEZAS.md` | Las 43 piezas de video y los 21 tutoriales | ✅ |
| `agentes/02-AGENTES.md` | Los 8 agentes con sus prompts completos | ✅ |
| `03-CINTURONES.md` | Los 11 grados, evidencias y validación | ✅ |
| `04-PROTOCOLO.md` | Mindset y bodyset, las tres aperturas | ✅ |
| `salas/05-MANDO-CREATIVOS.md` | Tab de creativos | ✅ |
| `salas/06-MANDO-CAMPANAS.md` | Tab de campañas | ✅ |
| `salas/07-BIBLIOTECA-CUADERNO.md` | Biblioteca, Cuaderno, Ring, Reloj y SOS | ✅ |
| `salas/08-SISTEMA-Y-MCD.md` | Contrato con GHL y con MCD | ✅ |
| `datos/09-ESQUEMA.md` | Modelo de datos completo | ✅ |
| `datos/roadmap.seed.json` | Las 91 jornadas en JSON, listas para sembrar | ✅ |
| `datos/generar_seed.py` | Genera el seed. Fuente de verdad de los números | ✅ |
| `10-DISENO.md` | Sistema visual, tokens y las 12 reglas para TDAH | ✅ |
| `11-REVISION-FINAL.md` | Auditoría cruzada, decisiones y orden de construcción | ✅ |
| `MIGRACION.md` | Qué tocar en el repo existente, en orden | ✅ |
| `CHANGELOG.md` | Qué cambia respecto de lo que está en producción | ✅ |
| `datos/roadmapSeed.ts` | Tipos, índices y helpers. Reemplaza el actual | ✅ |
| `datos/validar.py` | Valida el paquete contra sí mismo. Sirve de CI | ✅ |
| `diseno/tokens.css` · `tokens.ts` | Los tokens, listos para importar | ✅ |
| `agentes/prompts/*.md` | Los 8 prompts sueltos, listos para cargar | ✅ |

---

## Convenciones que usa todo el paquete

**Códigos de pieza.** `P{sistema}.{orden}` para los videos de Javo, `L-NN` para
los tutoriales de Lupe. Los códigos que ya existen en `roadmapSeed.ts` se
respetan; los nuevos siguen el mismo formato.

**Estados de pieza.** `SE MANTIENE` (el guion sirve, se regraba por escenario) ·
`REGRABAR` (cambia el contenido) · `REGRABAR DE CERO` (el actual enseña algo que
ya no se vende) · `NUEVO` (no existe).

**Sets de grabación.** `montaña` · `lago` · `pizarra` · `oficina` · `pantalla` ·
`voz`.

**Tipos de evidencia.** `numero` · `texto` · `imagen` · `url` · `archivo` ·
`evento`. El tipo `evento` no se sube: se detecta desde el Sistema o desde Meta.

**Idioma.** Todo lo que ve el cliente va en castellano neutro, de tú. Las notas
internas de este paquete van como estén.

---

## Lo que este paquete reemplaza

Deja sin efecto toda versión anterior de: el orden del camino, la cantidad y los
nombres de los cinturones, el momento en que llega Mi Clínica, el circuito de
captación y el alcance del trabajo de perfil.

Cuatro cambios de fondo respecto de lo que está hoy en vivo:

1. **Mi Clínica entra el día 2, no el día 45.** Carga sus consultantes actuales
   antes de construir nada.
2. **La primera plata sale de su cartera, no de la pauta.** Cobra al precio
   nuevo el día 12.
3. **El embudo se bifurca por audiencia**, con una pregunta con número. Página,
   video y formulario son los mismos en las dos ramas.
4. **El Dojo deja de ser la app entera** y pasa a ser la sala de los agentes.


---

## Los números del camino, verificados sobre el seed

| | |
|---|---|
| Jornadas | 91 · del día 0 al 90 |
| Sesiones con video | 42 |
| Sesiones de protocolo | 6 |
| Jornadas de rodaje | 2 |
| Días de campo | 10 |
| Días de ciclo | 29 |
| Piezas de video de Javo | 43 · 279 minutos · 4 jornadas de rodaje |
| Tutoriales de Lupe | 21 · 106 minutos |
| Evidencias | 69 |
| Cinturones | 11 |
| Agentes | 8 |
| Frenos | 9 |
| **Trabajo del cliente** | **4.265 minutos ≈ 71 horas** |

## Los dos comandos

```bash
python3 datos/generar_seed.py    # regenera el seed y muestra los totales
python3 datos/validar.py         # valida todo el paquete contra sí mismo
```

`validar.py` chequea que el seed no tenga huecos, que cada pieza del catálogo se
use en la jornada que declara, que cada agente y cada cinturón existan donde se
los nombra, que los ocho prompts sueltos estén, que los totales de la prosa
coincidan con los del seed, y que no reaparezca ninguna de las cuatro cifras
viejas que ya se corrigieron. **Sale con código 1 si algo no cierra**, así que
sirve tal cual como paso de CI.

**Si un número de la documentación no coincide con lo que imprimen los scripts,
los scripts tienen razón.**

---

## Qué hacer con esto

1. Subir la carpeta al repo
2. Leer `MIGRACION.md`: dice qué tocar, en qué orden, y qué se elimina
3. Empezar por la etapa 0, que no rompe nada
4. **Y regrabar `P4.1` antes de que entre un cliente nuevo:** es el único video
   en producción que enseña algo que ya no se vende
