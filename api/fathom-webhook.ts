/**
 * /api/fathom-webhook — LA TRANSCRIPCIÓN ENTRA SOLA, Y ESPERA — turno 14
 *
 * ═══ LA FUGA QUE CIERRA ═══
 *
 * De las cuatro fugas de la cirugía 6, ésta era la última de este lado.
 * Fathom está vendido y contado —el video L-17 del día 23, el paso
 * «Fathom configurado» de `preactivacionSteps`, `cuadroTickets`— y no había
 * ninguna ruta en `api/` que recibiera una transcripción: terminaba la
 * sesión y no entraba nada.
 *
 * ═══ QUÉ HACE, Y QUÉ NO ═══
 *
 * Recibe, reconoce al cliente por el email de la invitación, y **deja la
 * transcripción en la cola de lo que nadie revisó todavía**. Nada más.
 *
 * NO extrae decisiones. NO escribe en la ficha. NO le manda un aviso al
 * cliente. NO registra que la sesión ocurrió. Eso último importa: Fathom
 * graba reuniones internas, pruebas de audio y llamadas que se cortaron al
 * minuto, así que una grabación no prueba una sesión — y de `sesiones` sale
 * el «te dimos 3 de las 3 que te prometimos» del cierre del Camino. Una
 * grabación que se contara sola como sesión cumplida le daría de baja la
 * garantía a alguien sin que nadie lo decidiera.
 *
 * Y no extrae porque `src/lib/transcripcion.ts` tiene la regla de la casa
 * escrita en su encabezado: nada se guarda sin que un humano lo confirme,
 * porque una transcripción mal leída que se guarda sola es un dato falso con
 * apariencia de registro. La pantalla «Cargar sesión» del Admin sigue siendo
 * la que decide; esto sólo le ahorra el copiar y pegar.
 *
 * ═══ CONFIGURAR EN FATHOM (lo hace Javo) ═══
 *
 *   Fathom → Settings → Webhooks → Create a webhook
 *     URL      https://<tu-app>/api/fathom-webhook
 *     Header   x-fathom-secret: <FATHOM_WEBHOOK_SECRET>
 *     Incluir  include_transcript  ← sin esto no viene el texto y la ruta
 *                                     contesta 400 diciendo exactamente eso
 *
 * Si su plan no permite el header, la clave también se acepta como
 * `?clave=` en la URL: es el mismo secreto, y una URL con el secreto adentro
 * es lo único que algunos paneles de webhook saben mandar.
 *
 * Env en Vercel:
 *   SUPABASE_URL (o VITE_SUPABASE_URL) · SUPABASE_SERVICE_ROLE_KEY
 *   FATHOM_WEBHOOK_SECRET
 */
import { getAdminClient } from './_lib/credits-server.js';
import { leerCargaDeFathom, aQuienBuscar } from '../src/lib/transcripcionDeFathom.js';

/**
 * ¿Esta ficha es de alguien del equipo?
 *
 * En una sesión de acompañamiento los dos lados tienen cuenta en la app.
 * Si no se distinguiera, la transcripción quedaría colgada de la ficha de
 * quien dio la sesión —el equipo tiene perfil igual que el cliente— y en el
 * Admin aparecería como «sesión de Javo».
 */
function esDelEquipo(ficha: { rol?: string | null; admin_rol?: string | null }): boolean {
  return ficha.rol === 'admin'
    || ['owner', 'manager', 'staff'].includes(String(ficha.admin_rol ?? ''));
}

// Sin tipos de @vercel/node: no está en las dependencias y el resto de los
// endpoints tampoco los importa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const secreto = req.headers?.['x-fathom-secret'] || req.query?.clave || req.body?.secret;
  if (!process.env.FATHOM_WEBHOOK_SECRET || secreto !== process.env.FATHOM_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  const { carga, porque } = leerCargaDeFathom(req.body);
  if (!carga) {
    // 400 y no 200: el motivo queda escrito en el panel de webhooks de
    // Fathom, que es el único lugar donde Javo puede verlo.
    return res.status(400).json({ error: 'TRANSCRIPCION_ILEGIBLE', porque });
  }

  const TABLA = 'transcripciones_recibidas';

  try {
    const admin = getAdminClient();

    /* ═══ 1) ¿YA ENTRÓ? ═══
     *
     * Fathom reintenta. Sin esto, la misma sesión aparecería tres veces en
     * la cola de revisión y alguien cargaría dos veces las mismas
     * decisiones. Se pregunta antes de insertar en lugar de confiar sólo en
     * el único de la base, para poder contestar `repetida: true` —que es
     * información, no un error— y para no gastar un id por reintento.
     */
    const { data: yaEsta } = await admin
      .from(TABLA).select('id, estado')
      .eq('origen', 'fathom').eq('externo_id', carga.externoId)
      .maybeSingle();
    if (yaEsta) {
      return res.status(200).json({
        ok: true, repetida: true,
        id: (yaEsta as { id: string }).id,
        estado: (yaEsta as { estado: string }).estado,
      });
    }

    /* ═══ 2) DE QUIÉN ERA LA SESIÓN ═══
     *
     * Por el email de la invitación, los de afuera primero. El email se
     * busca en minúsculas porque `email=eq.x` de PostgREST es el `=` de
     * SQL, sensible a mayúsculas, y Fathom manda el email como lo escribió
     * quien armó la reunión.
     *
     * No encontrar a nadie NO frena nada: la transcripción entra con
     * `cliente_id` en NULL y el equipo elige el cliente a mano. Descartarla
     * sería perder la sesión por un email que no coincide, que es
     * exactamente la fuga que esta ruta vino a tapar.
     */
    let clienteId: string | null = null;
    let emailDetectado: string | null = null;
    for (const email of aQuienBuscar(carga.participantes)) {
      const { data } = await admin
        .from('profiles').select('id, rol, admin_rol').eq('email', email).maybeSingle();
      const ficha = data as { id: string; rol?: string | null; admin_rol?: string | null } | null;
      if (ficha && !esDelEquipo(ficha)) {
        clienteId = ficha.id;
        emailDetectado = email;
        break;
      }
    }

    /* ═══ 3) A LA COLA ═══ */
    const { error: errInsert } = await admin.from(TABLA).insert({
      origen: 'fathom',
      externo_id: carga.externoId,
      titulo: carga.titulo,
      fecha: carga.fecha,
      minutos: carga.minutos,
      enlace: carga.enlace,
      quien_la_dio: carga.quienLaDio,
      transcripcion: carga.transcripcion,
      participantes: carga.participantes,
      cliente_id: clienteId,
      email_detectado: emailDetectado,
      estado: 'pendiente',
    });

    if (errInsert) {
      /*
       * ═══ ACÁ SE CONTESTA 503, Y NO 200 COMO EN `ghl-webhook` ═══
       *
       * Esa ruta contesta 200 con el motivo adentro porque el hecho que
       * recibe —un cobro— queda registrado en GHL de todos modos: se puede
       * reconstruir. Acá el hecho es el único texto de una conversación que
       * ya terminó. Un 2xx le dice a Fathom «recibido» y no vuelve a
       * intentarlo nunca; con el 5xx el reintento tiene a dónde caer.
       *
       * Si la tabla todavía no existe —la migración la corre Javo— el
       * motivo lo dice con esas palabras, en lugar de un error de Postgres.
       */
      const falta = /relation .* does not exist|schema cache/i.test(errInsert.message);
      return res.status(503).json({
        ok: false,
        motivo: falta
          ? 'falta correr la migración de las transcripciones recibidas'
          : errInsert.message,
      });
    }

    /* ═══ 4) Y SE VERIFICA QUE HAYA CAÍDO EN ALGÚN LADO ═══
     *
     * La misma lección que dejó `ghl-webhook`: una escritura que no afecta
     * ninguna fila no es un error, contesta bien, y queda registrado en el
     * panel de la otra punta como entregado. Acá eso sería una sesión que
     * Fathom cree que mandó y que nadie va a revisar nunca.
     */
    const { data: despues } = await admin
      .from(TABLA).select('id')
      .eq('origen', 'fathom').eq('externo_id', carga.externoId)
      .maybeSingle();
    if (!despues) {
      return res.status(503).json({ ok: false, motivo: 'la transcripción no quedó guardada' });
    }

    return res.status(200).json({
      ok: true,
      id: (despues as { id: string }).id,
      // Lo que Javo lee en el panel de Fathom cuando algo no cuadra.
      cliente: clienteId ? 'reconocido' : 'sin reconocer',
      caracteres: carga.transcripcion.length,
      pendiente_de_revision: true,
    });
  } catch (err) {
    const motivo = err instanceof Error ? err.message : 'error inesperado';
    return res.status(503).json({ ok: false, motivo });
  }
}
