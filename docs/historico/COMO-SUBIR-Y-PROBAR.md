# CÓMO SUBIRLO Y PROBARLO

Paso a paso, sin dar nada por sabido. Son tres partes:

1. **Subir el código** (15 minutos)
2. **Las dos variables de Vercel** (5 minutos)
3. **Probarlo** (40 minutos, y es la parte que más vale)

Si algo no se ve como dice acá, **pará y avisame**. No sigas.

---

# PARTE 1 · SUBIR EL CÓDIGO

## 1.1 Abrir el Codespace

1. Entrá a **github.com/learners417/tcd1**
2. Arriba a la izquierda hay un botón que dice **`main`** con una flechita.
   Tocalo y elegí **`mejoras`**. Es importante: si te quedás en `main`,
   subís al lugar equivocado.
3. Botón verde **`Code`** → pestaña **`Codespaces`** → tocá el que ya existe,
   o **`Create codespace on mejoras`** si no hay ninguno.
4. Se abre un editor en el navegador. Tarda uno o dos minutos la primera vez.

**Lo que tenés que ver:** una pantalla oscura, con una lista de archivos a la
izquierda y una zona grande al medio.

## 1.2 Meter el ZIP adentro

1. Bajá **TCD-completo.zip** a tu computadora.
2. En el Codespace, mirá la **lista de archivos de la izquierda**. Arriba de
   todo dice **TCD1** en mayúsculas.
3. **Arrastrá el ZIP desde tu carpeta de descargas hasta esa lista.** Soltalo
   sobre el nombre `TCD1`.
4. Esperá a que aparezca `TCD-completo.zip` en la lista.

> Si arrastrar no funciona: hacé clic derecho sobre `TCD1` → **Upload...** →
> elegí el ZIP.

## 1.3 Abrir la terminal

Menú de arriba → **Terminal** → **New Terminal**.

Se abre una franja abajo con una línea que termina en `$`. Ahí se escriben
los comandos.

**Cómo funciona:** copiás un bloque, lo pegás con `Ctrl+V` (o `Cmd+V`),
apretás **Enter**, y esperás a que vuelva a aparecer el `$`. Recién ahí
pasás al siguiente.

## 1.4 Aplicar el paquete

**Comando 1 — descomprimir:**

```bash
unzip -o -q TCD-completo.zip && rm TCD-completo.zip && echo "LISTO"
```

*Tiene que aparecer:* `LISTO`

**Comando 2 — instalar lo que falta:**

```bash
npm install
```

*Tarda 1 o 2 minutos.* Van a pasar muchas líneas. Al final puede decir
algo de "vulnerabilities" — **es normal, no lo toques.**

⚠️ **Nunca corras `npm audit fix --force`.** Rompe cosas.

**Comando 3 — que compile:**

```bash
npm run lint && npm run build
```

*Tarda 40 segundos.* Al final tiene que decir algo como
`✓ built in 40.56s`.

> Si aparece la palabra **error** en rojo: copiá las últimas 20 líneas y
> pasámelas. No sigas.

**Comando 4 — las verificaciones:**

```bash
python3 auditoria.py | tail -3
python3 verificar-sala.py | tail -3
```

*Tienen que decir:*
```
════ BATERÍA EN VERDE — el ZIP puede salir ════
  49 verdes · 0 rojos
```

> Si dice **ROJOS** o **FALLOS**: copiame la salida completa. No sigas.

## 1.5 Subirlo a GitHub

**Comando 5:**

```bash
git add -A && git commit -m "app completa: motor, fabrica, tablero, puente, sala y cirugia final" && git push
```

*Tiene que terminar con algo como* `main -> mejoras` *o* `branch 'mejoras' set up`.

> Si te pide usuario y contraseña, avisame — hay que configurar el acceso.

## 1.6 Esperar a Vercel

Vercel despliega solo cuando detecta el push.

1. Entrá a **vercel.com** → tu proyecto **sanar-os**
2. Vas a ver un despliegue nuevo con un puntito **amarillo** (construyendo)
3. En 1 o 2 minutos pasa a **verde** (listo)

> **Si sale rojo:** tocá el despliegue → pestaña **Building** → copiá las
> últimas líneas y pasámelas.

---

# PARTE 2 · LAS DOS VARIABLES DE VERCEL

Esto es lo único que puede costarte dinero si no se hace.

**Por qué:** todo lo que empieza con `VITE_` se empaqueta **dentro** de la
app que se descarga al navegador. Cualquiera que abra tu app puede leer esa
clave y gastarla con tu cuenta.

## 2.1 Agregar la nueva

1. Vercel → proyecto **sanar-os** → **Settings** → **Environment Variables**
2. Botón **Add New**
3. En **Key** escribí exactamente: `GEMINI_API_KEY`
   *(sin `VITE_` adelante — esa es toda la diferencia)*
4. En **Value** pegá tu clave de Google
5. Dejá marcados los tres entornos (Production, Preview, Development)
6. **Save**

## 2.2 Borrar la vieja

1. En la misma lista buscá **`VITE_GEMINI_API_KEY`**
2. A la derecha hay tres puntitos **`⋯`** → **Remove**
3. Confirmá

## 2.3 Volver a desplegar

Las variables solo entran en el próximo despliegue.

Vercel → pestaña **Deployments** → el último → tres puntitos **`⋯`** →
**Redeploy** → confirmá.

## 2.4 Cambiar la clave en Google

Esa clave estuvo publicada. Aunque la saques ahora, alguien pudo haberla
copiado.

1. Entrá a **aistudio.google.com/apikey**
2. **Create API key** — copiá la nueva
3. Volvé a Vercel y reemplazá el valor de `GEMINI_API_KEY` por la nueva
4. En Google, borrá la vieja (el tachito al lado)
5. Redeploy otra vez

---

# PARTE 3 · PROBARLO

Esta es la parte que más vale. **Probá en el teléfono**, que es donde viven
tus clientes.

## 3.1 Como cliente — el recorrido de 20 minutos

Entrá con un usuario de cliente (no el tuyo de admin).

### El Dashboard

- [ ] ¿Aparece arriba **«Lo que te prometiste»** con tu pacto y tu firma?
      *(Solo si alguna vez lo escribiste en la bienvenida.)*
- [ ] ¿Se ve la campanita de avisos arriba a la derecha?

### El Camino

- [ ] Entrá a **El Camino** y bajá hasta el pilar 4.
- [ ] ¿Aparece **«La Prueba de Fuego»** al final, después del Tablero de
      Números? Es nueva: antes estaba escrita pero nadie llegaba.

### Campañas — lo más importante

- [ ] Entrá a **Campañas & Creativos**
- [ ] En el brief, ¿trae tus datos del ADN o está vacío?
- [ ] **¿La app te propone tres fórmulas con el motivo escrito?**
      Tiene que decir algo como *«Tienes marca personal y un resultado real:
      tu historia es tu activo más fuerte»*
- [ ] Generá los tres anuncios. ¿Salen **partidos en láminas**, cada una con
      su botón de copiar?
- [ ] Abajo de todo, **¿aparece tu paquete** con las ocho piezas y lo que
      falta?

### El Tablero — acá está el número clave

- [ ] Entrá al Tablero.
- [ ] **¿Dice cuántas conversaciones necesitás por semana?**
      Algo como *«Para 10 ventas necesitas 14 conversaciones por semana»*
- [ ] Tocá **cargar la semana**. ¿Te pregunta **de a un dato por pantalla**,
      con los tres anuncios juntos?
- [ ] Cargá el número del día. ¿El botón dice **«Guardado ✓»**?

> ⚠️ **Si el presupuesto que sugiere es ridículamente bajo** (tipo $7 por
> semana), **frená y avisame.** Ese fue el error más caro de todos.

## 3.2 Como admin — el recorrido de 15 minutos

Entrá con tu usuario de admin.

- [ ] **Hoy** — ¿es la primera pestaña? ¿Dice *«Mirando las cuentas…»* y
      después algo con sentido? *(Va a estar vacía hasta que haya números
      cargados: eso es correcto.)*
- [ ] **Supervisión** — ¿ves las once cuentas en filas con tres puntitos?
- [ ] **Sala de Mando** → **Recorrido** — ¿aparecen tus clientes agrupados
      por etapa, con lo que les falta para avanzar?
- [ ] **Sala de Mando** → **Mi Motor** — cargá tus números y mirá qué te dice.
- [ ] **Motor IA** — tiene que decir *«todavía no hay datos del motor»*.
      ⚠️ Si dice **«falta correr sala-de-mando.sql»**, avisame: algo del SQL
      no entró.
- [ ] **Mi rol** — ¿dice quién sos, qué te toca y qué NO te toca?
- [ ] **Cargar sesión** — pegá una transcripción vieja de Fathom y mirá qué
      saca. Todavía no confirmes: solo mirá si entendió.

## 3.3 Probá romperla a propósito

Esto es lo que más me sirve:

- [ ] Tocá botones sin haber cargado nada
- [ ] Entrá a Campañas antes de sellar el ADN
- [ ] Poné números absurdos en el tablero (negativos, gigantes)
- [ ] Ponete en modo avión y tocá algo que guarde
      *(tiene que aparecer una franja roja arriba)*

---

# CÓMO PASARME EL FEEDBACK

Lo que más me sirve, en este orden:

## 1. Lo que te dejó trabado

**Lo más valioso.** Una pantalla donde tocaste algo y no pasó nada, o donde
no supiste qué hacer.

> *«Toqué X y no pasó nada»* · *«No entendí qué me estaba pidiendo acá»*

Decime **en qué pantalla** y **qué tocaste**. Con eso alcanza.

## 2. Lo que te dijo algo raro

Un número que no te cierra, un texto que promete algo que no pasa, un
consejo que no tiene sentido para vos.

> *«Me dice que invierta $7 por semana»* · *«Me dice que pida referidos y
> recién arranqué»*

**Pasame el número o la frase exacta.** Con la frase puedo encontrarlo.

## 3. Lo que se ve mal en el teléfono

Texto cortado, botones que no entran, algo que se sale de la pantalla.

**Una captura vale más que la descripción.**

## 4. Lo que te falta

Cosas que buscaste y no estaban.

---

## Lo que NO necesito

- Que armes una lista ordenada. Mandámelo suelto como te salga.
- Que investigues por qué pasa. Con el síntoma alcanza.
- Que lo pruebes todo de una. Si probás media hora y me mandás tres cosas,
  ya sirve.

---

## Si algo se rompe feo

```bash
npx tsc --noEmit
npm run build
python3 auditoria.py | tail -5
```

Copiame las últimas líneas de lo que salga.

Y si querés volver atrás:

```bash
git log --oneline -3
git revert HEAD
git push
```

Vercel vuelve a la versión anterior sola.
