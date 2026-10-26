# PARA SUBIR

Todo lo del paquete está verificado sobre un clon recién bajado de GitHub.
Lo que sigue es lo único que la app no puede hacer sola.

---

## 1. Aplicar el paquete

En el Codespace, sobre la rama **mejoras**:

```bash
cd /workspaces/tcd1
unzip -o -q TCD-completo.zip && rm TCD-completo.zip
npm install
npm run lint && npm run build
python3 auditoria.py | tail -3
python3 verificar-sala.py | tail -3
```

Si las cuatro salen bien:

```bash
git add -A
git commit -m "app completa: motor, fábrica, tablero, puente, sala y cirugía final"
git push
```

---

## 2. Las dos variables de Vercel

Esto sí o sí, y es lo único que puede costar dinero si no se hace.

**Agregar:** `GEMINI_API_KEY` — **sin** el prefijo `VITE_`.
**Borrar:** `VITE_GEMINI_API_KEY`.

Todo lo que lleva `VITE_` se empaqueta dentro del navegador: mientras esa
variable siga cargada, la clave se publica en cada build y **cualquiera que
abra la app puede leerla y gastarla**.

Y como estuvo expuesta en producción, **conviene generar una clave nueva en
Google y revocar la vieja.**

Mientras no lo hagas: la transcripción de audio y la verificación de
evidencia no van a funcionar (ahora buscan la clave del lado del servidor).
Nada más se rompe.

---

## 3. El SQL — ya está hecho

`sala-de-mando.sql` corrió el 26 de julio, sin errores. Es idempotente: si
alguna vez dudás, se puede volver a pegar entero.

---

## 4. Qué mirar el primer día

**En Admin → Motor IA.** Si dice *"todavía no hay datos del motor"*, está
bien: las tablas existen y nadie generó nada aún. Si te muestra el aviso de
correr el SQL, algo no entró.

**En Admin → Hoy.** La cola arranca vacía hasta que haya números cargados.
Eso es correcto: una cuenta sana no aparece.

**Como cliente, en Campañas.** El tablero tiene que decirte cuántas
conversaciones necesitas por semana para tu objetivo. Si dice un número
absurdamente bajo, avisame — ese fue el bug más caro de toda la serie.

---

## 5. Lo que sigue faltando, dicho de frente

**La conexión con Meta.** Los números se cargan a mano, dos minutos por
cliente. El atajo antes de la API es el reporte programado del administrador
de anuncios, que se configura una vez por cuenta.

**MiClínica.** Sigue siendo un enlace. El puente mínimo —la lista de sus
pacientes, en qué semana va cada uno, quién está por terminar— está
construido, pero MCD todavía no tiene datos propios que traer.

**Las vistas de reuniones y equipo de la Sala.** Se resuelven hoy con tu
calendario y con la matriz de preactivación.

---

## 6. Si algo sale mal

Corré la batería completa y pasame la salida. Las nueve lentes están en
`COMO-FUNCIONA.md`, sección 4 y 6.

La que más rápido encuentra un problema nuevo es la que monta las pantallas:

```bash
npx tsx --import ./scripts/entorno-navegador.mjs scripts/prueba-pantallas.tsx
```
