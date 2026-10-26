# Cómo cargar esto a GitHub

Este ZIP es el repositorio completo de la app, al día. No es un parche ni una
selección de archivos: es todo, en el estado en que quedó.

## Lo primero

El push automático está cerrado. GitHub devuelve:

    403 — Claude doesn't have GitHub access to learners417/tcd1
    for your organization

Se abre de una de estas dos formas, y con cualquiera de las dos el ZIP deja
de hacer falta:

1. Instalar la app de Claude en el repositorio:
   `github.com/apps/claude/installations/select_target` → cuenta **learners417**
   → marcar **tcd1**.
2. Reconectar GitHub en `claude.ai/customize/connectors`.

## Mientras tanto, con el ZIP

En la rama `mejoras`:

    # desde la carpeta donde descomprimiste
    git checkout mejoras        # o: git checkout -b mejoras
    # reemplazar el contenido por el de este ZIP
    git add -A
    git commit -m "Cirugías 1-14"
    git push

El historial de cada cambio —qué se tocó, cuándo y por qué— está en
`HISTORIAL-DEL-TRABAJO.md`, porque un ZIP no lleva el historial de Git.
Cincuenta registros, del primero al último.

## Antes de publicar: la batería

Cada cirugía se cerró con esto, y conviene correrlo después de cargar:

    npm install
    npx tsc --noEmit                        # TypeScript
    npm run build                           # el paquete
    python3 scripts/medir-app.py --estricto  # 68 vistas, 22 lentes
    python3 scripts/medir-guardado.py        # 4 bucles: tocar, recargar, y la IA caída
    for t in scripts/prueba-*.ts; do npx tsx "$t"; done   # 107 pruebas

El medidor levanta su propio servidor y abre la app en un teléfono de 390
píxeles. Guarda una captura por vista en `/tmp/app-<pantalla>.png` y el detalle
en `/tmp/medir-app.json`. Sale con error si alguna vista estricta tiene faltas.
Las 68 vistas incluyen la bienvenida —los primeros diez minutos de quien acaba
de pagar—, el día 1, el escalón de entrada, el día 90, la ventana vencida, el
fondo del scroll, la cuenta con datos, el teléfono de 320 píxeles, el cliente
que escribe mucho, y el cierre y la graduación de quien terminó.

El medidor MIRA; `medir-guardado.py` TOCA. Abre la cuenta de quien se sienta a
trabajar hoy, escribe en el Diario y carga su precio en Mi Número, RECARGA, y
pregunta si sigue ahí. Un botón que no guarda es invisible para el medidor: la
pantalla se ve perfecta y el cliente pierde su trabajo.

Su cuarto bucle le escribe al Mentor SIN llave de IA, que es como corre este
entorno: comprueba que el cliente lea qué pasó y qué hacer —en castellano, sin
un código de estado ni un rastro técnico— en vez de quedarse mirando un chat
que gira. La promesa de que hay alguien del otro lado depende de una llave que
puede vencer o quedarse sin cupo.

## Lo que queda de tu lado

- El permiso de GitHub, arriba.
- Los tres enlaces de cobro de los pases de renovación.
- Los cinco mensajes del libro en GHL.
- Los 31 videos por grabar.
- **Una decisión:** el catálogo de 22 herramientas de IA está apagado con
  `{false && …}` en `src/pages/Biblioteca.tsx`. Ninguna de las 91 jornadas del
  Camino apunta a una herramienta, así que o se enciende y se conectan, o se
  saca. Lo segundo no se deshace desde un ZIP, por eso está esperando.
