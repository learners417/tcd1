# Actualizar la app · TCD 2026.09

Esta carpeta tiene **la estructura del repo adentro**. Se descomprime encima de la
raíz del proyecto y cada archivo cae donde va.

```
src/lib/roadmap.seed.json     el camino · 91 jornadas
src/lib/roadmapSeed.ts        tipos, índices y helpers · PISA el actual
src/lib/tokens.ts             tokens para JS
src/styles/tokens.css         tokens visuales
prompts/*.md                  los 8 agentes
docs/tcd-spec/                toda la especificación de la app
docs/produccion/              los guiones de rodaje y los 4 HTML
```

**Los archivos de `src/` y `prompts/` son la app.** Los de `docs/` son la
documentación: no afectan el build y se pueden mover donde quieras.

---

## Los tres pasos

**1 · Descomprimir encima de la raíz del repo.** Aceptar reemplazar
`src/lib/roadmapSeed.ts`: ese es el punto.

**2 · Compilar.** Va a fallar, y está bien. El código viejo recorre el array con
`.find()` y esos tipos ya no existen.

**3 · Arreglar los errores.** Cada `.find(j => j.dia === d)` pasa a
`jornadaPorDia.get(d)`. Y `tokens.css` se importa donde estén los estilos
globales.

Si tenés Claude Code en el repo, la instrucción es una sola:

> Leé `docs/tcd-spec/12-PARTE-DE-OBRA.md` y ejecutá los puntos en orden,
> empezando por B2.

---

## Lo que cambia al sembrar el seed nuevo

| Antes | Después |
|---|---|
| Día 67 · "Tu Matriz ABC" · P2.3b | Día 67 · "Las doce semanas escritas" · P9.4 |
| Cinturón Amarillo en el día 67 | Rojo punta negra, otorgado el día 55 |
| 9 cinturones inventados | Los 11 del taekwondo |
| Días sin contenido | Los 91 tienen algo |

---

## Lo que NO se arregla solo

Sembrar el seed arregla los días, los códigos y los cinturones. **No arregla la
interfaz.** Eso está en `docs/tcd-spec/12-PARTE-DE-OBRA.md`, en orden:

```
B1  texto blanco sobre crema · ilegible, 1,09:1
B3  el ADN no se puede editar · "Ir" lleva al Camino
G1  barra abajo en móvil · y los cinco destinos nuevos
G3  placeholders de los videos que faltan
G2  el Dojo con los ocho agentes
E1-E5  experiencia
```

---

## Verificar que quedó bien

```bash
python3 docs/tcd-spec/datos/validar.py
```

Tiene que decir **"el paquete cierra"**. Y en la app, el día 67 tiene que mostrar
"Las doce semanas escritas".


---

## Qué hay en `docs/produccion/`

Lo que hace falta para grabar. Los guiones de las cuatro jornadas, con las diez
piezas de oficina escritas palabra por palabra, y el veredicto sobre cada video
que ya existe: qué se rescata, qué es relleno y qué se tira.

Los cuatro HTML se abren en el navegador y están pensados para el teléfono.
**`oficina-hoja-de-rodaje.html` se usa mientras se graba.**
