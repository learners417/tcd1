/**
 * GET /api/cron/alarmas-inactividad — v2 · EL CAMINO (Cirugía Total G1, jul 2026)
 *
 * Cron diario (12:00 UTC) que mira el Camino real de cada cliente activo:
 * si su próxima sesión pendiente está 3+ días HÁBILES atrasada respecto de
 * su día de programa, avisa a todos los admins por la campanita.
 * Idempotente por día (no repite la alarma del mismo cliente el mismo día).
 *
 * Auth: Vercel manda `Authorization: Bearer <CRON_SECRET>` si está configurado.
 */

import { getAdminClient } from '../_lib/credits-server.js';
import { withSentry, Sentry } from '../_lib/sentry.js';
import {
  AVISOS, planificarAvisos, type HistorialAvisos,
} from '../../src/lib/avisosCliente.js';
import {
  calcularCadena, encontrarDomino, numerosDeFila, COLUMNAS_DE_SEMANA,
  type FilaDeSemana,
} from '../../src/lib/valueChain.js';
import type { ItemCola } from '../../src/lib/colaExcepciones.js';
import {
  ENTREGAS, entregaPendiente, avisoAlCliente, tareaDelEquipo,
} from '../../src/lib/entregasDelEquipo.js';

/** La semana ISO, igual que en el resto de la app: '2026-W31'. */
function semanaISOde(d: Date): string {
  const f = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = f.getUTCDay() || 7;
  f.setUTCDate(f.getUTCDate() + 4 - dia);
  const eneUno = new Date(Date.UTC(f.getUTCFullYear(), 0, 1));
  const n = Math.ceil(((f.getTime() - eneUno.getTime()) / 86400000 + 1) / 7);
  return `${f.getUTCFullYear()}-W${String(n).padStart(2, '0')}`;
}

// El calendario del Camino v4 (generado del seed — pilar, código, día asignado)
const CAMINO: { p: number; c: string; d: number }[] = [
  { p: 0, c: 'P0.0', d: 1 },
  { p: 0, c: 'P0.2', d: 1 },
  { p: 0, c: 'P0.4', d: 1 },
  { p: 1, c: 'P1.1', d: 2 },
  { p: 1, c: 'P1.2', d: 2 },
  { p: 1, c: 'P1.2b', d: 3 },
  { p: 1, c: 'P1.3', d: 4 },
  { p: 1, c: 'P1.4', d: 5 },
  { p: 1, c: 'P1.5', d: 8 },
  { p: 1, c: 'P1.6', d: 9 },
  { p: 2, c: 'P2.1', d: 10 },
  { p: 2, c: 'P2.2', d: 10 },
  { p: 2, c: 'P2.3', d: 11 },
  { p: 2, c: 'P2.4', d: 12 },
  { p: 2, c: 'P2.5', d: 12 },
  { p: 3, c: 'P3.1', d: 15 },
  { p: 3, c: 'P3.2', d: 16 },
  { p: 3, c: 'P3.3', d: 15 },
  { p: 3, c: 'P3.4', d: 17 },
  { p: 3, c: 'P3.5', d: 18 },
  { p: 4, c: 'P4.1', d: 19 },
  { p: 4, c: 'P4.5', d: 22 },
  { p: 4, c: 'P4.2', d: 19 },
  { p: 4, c: 'P4.3', d: 23 },
  { p: 4, c: 'P4.3b', d: 24 },
  { p: 4, c: 'P4.3c', d: 25 },
  { p: 4, c: 'P4.4', d: 29 },
  { p: 4, c: 'P4.3d', d: 26 },
  { p: 5, c: 'P5.1', d: 30 },
  { p: 5, c: 'P5.2', d: 30 },
  { p: 5, c: 'P5.3', d: 31 },
  { p: 5, c: 'P5.5', d: 32 },
  { p: 5, c: 'P5.4', d: 37 },
  { p: 6, c: 'P6.1', d: 38 },
  { p: 6, c: 'P6.4', d: 39 },
  { p: 6, c: 'P6.2', d: 43 },
  { p: 6, c: 'P6.3', d: 44 },
  { p: 7, c: 'P7.1', d: 50 },
  { p: 7, c: 'P7.2', d: 51 },
  { p: 7, c: 'P7.3', d: 85 }
];

// El descanso por CALENDARIO REAL: qué día de la semana ES el día N del
// programa de ESTE cliente (no todos arrancan lunes). Espejo de la racha.
const esDescansoReal = (fechaInicio: string, diaPrograma: number) => {
  const f = new Date(fechaInicio);
  f.setDate(f.getDate() + (diaPrograma - 1));
  const wd = f.getDay();
  return wd === 0 || wd === 6;
};

async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  try {
    const admin = getAdminClient();

    // 1) clientes activos con fecha de inicio
    const { data: clientes, error: e1 } = await admin
      .from('profiles')
      .select('id, nombre, fecha_inicio, rol, status')
      .neq('rol', 'admin');
    if (e1) throw e1;

    // 2) los admins (destinatarios)
    const { data: admins, error: e2 } = await admin.from('profiles').select('id').eq('rol', 'admin');
    if (e2) throw e2;
    const adminIds: string[] = (admins ?? []).map((a: { id: string }) => a.id);

    // 3) las tareas completadas de todos (una query)
    const { data: tareas } = await admin
      .from('hoja_de_ruta')
      .select('usuario_id, pilar_numero, meta_codigo, completada');
    const completadasPor = new Map<string, Set<string>>();
    for (const t of tareas ?? []) {
      if (!t.completada) continue;
      if (!completadasPor.has(t.usuario_id)) completadasPor.set(t.usuario_id, new Set());
      completadasPor.get(t.usuario_id)!.add(t.meta_codigo);
    }

    // 4) idempotencia: alarmas ya enviadas hoy
    const hoy = new Date().toISOString().slice(0, 10);
    const { data: yaHoy } = await admin
      .from('notificaciones')
      .select('descripcion')
      .eq('tipo', 'admin')
      .gte('created_at', `${hoy}T00:00:00Z`)
      .ilike('titulo', '%atrasado%');
    const avisadosHoy = new Set((yaHoy ?? []).map((n: { descripcion: string }) => n.descripcion?.split(' lleva ')[0] ?? ''));

    let alarmas = 0;
    for (const cli of clientes ?? []) {
      if (!cli.fecha_inicio) continue;
      if (cli.status && !['ACTIVE', 'activo', null].includes(cli.status)) continue;
      const dia = Math.max(1, Math.min(95, Math.floor((Date.now() - new Date(cli.fecha_inicio).getTime()) / 86400000) + 1));
      const done = completadasPor.get(cli.id) ?? new Set();
      const proxima = CAMINO.find((m) => !done.has(m.c));
      if (!proxima || proxima.d >= dia) continue;
      // atraso en días hábiles
      let atraso = 0;
      for (let d = proxima.d + 1; d <= dia; d++) if (!esDescansoReal(cli.fecha_inicio, d)) atraso++;
      if (atraso < 3) continue;
      const nombre = cli.nombre ?? 'Cliente';
      if (avisadosHoy.has(nombre)) continue;
      await Promise.all(
        adminIds.map((aid) =>
          admin.from('notificaciones').insert({
            usuario_id: aid,
            tipo: 'admin',
            titulo: `🔴 ${nombre}: ${atraso} días atrasado`,
            descripcion: `${nombre} lleva ${atraso} días hábiles sin avanzar (sesión pendiente: ${proxima.c}, día ${proxima.d}). Contacto humano hoy.`,
            accion_url: '/admin/clientes',
            leida: false,
          }),
        ),
      );
      alarmas++;
    }

    // ── LOS AVISOS QUE LA APP MANDA SOLA ──
    //
    // `avisosCliente` estaba construido y probado, y NADIE LO DISPARABA. Es
    // el módulo que hace que la app empuje sola: sin esto, toda cuenta que se
    // traba espera a que una persona la mire, y el modelo deja de escalar.
    //
    // Va acá y no en un cron propio porque este ya corre todos los días y ya
    // recorre a los clientes activos: sumar otro cron sería otro lugar más
    // donde algo puede fallar en silencio.
    let avisados = 0;
    let escalados = 0;
    let repetidosHoy = 0;
    const pendientes: ItemCola[] = [];
    const nombrePorId = new Map<string, string>(
      (clientes ?? []).map((c: { id: string; nombre?: string | null }) =>
        [c.id, c.nombre ?? 'Cliente']));

    // El historial de avisos, derivado de lo que ya se mandó.
    //
    // Se lee por la COLUMNA `clave`, no comparando títulos. Antes el aviso se
    // reconocía por su texto: cambiarle una palabra a un título dejaba el
    // historial de ese aviso en cero para todos, y a la mañana siguiente
    // volvía a salir desde el principio a quien ya lo había recibido dos
    // veces. Con la clave guardada en la base, el texto se puede reescribir
    // cuando haga falta.
    const historial: HistorialAvisos = await (async () => {
      const desde = new Date(Date.now() - 70 * 86400000).toISOString();
      const { data: previas } = await admin
        .from('notificaciones')
        .select('usuario_id, clave, created_at')
        .eq('tipo', 'sistema')
        .not('clave', 'is', null)
        .gte('created_at', desde);
      const h: HistorialAvisos = { enviados: {}, ultimaSemana: {} };
      for (const n of (previas ?? []) as Array<{ usuario_id: string; clave: string; created_at: string }>) {
        if (!AVISOS[n.clave]) continue;
        const id = `${n.usuario_id}|${n.clave}`;
        h.enviados[id] = (h.enviados[id] ?? 0) + 1;
        const sem = semanaISOde(new Date(n.created_at));
        // Se queda la más reciente: la lista no viene ordenada.
        if (!h.ultimaSemana[id] || sem > h.ultimaSemana[id]) h.ultimaSemana[id] = sem;
      }
      return h;
    })();
    try {
      const semana = semanaISOde(new Date());

      // ── EL DIAGNÓSTICO, EL MISMO QUE VE EL EQUIPO ──
      //
      // Acá había cuatro condiciones escritas a mano —sin cargar, sin
      // conversaciones, pocas agendas, sin ventas— y con eso solo podían
      // salir CUATRO de los veinte avisos. Los otros dieciséis estaban
      // escritos y no tenían forma de dispararse: el costo de la agenda, la
      // frecuencia agotada, las cuotas sin cobrar, el cliente que termina y
      // no renueva. Justo los tramos donde el cliente se cae DESPUÉS de
      // empezar a vender, que es donde más cuesta recuperarlo.
      //
      // Ahora corre `calcularCadena` y `encontrarDomino`, las mismas que usa
      // la cola del Admin sobre la misma tabla. Un solo diagnóstico: lo que
      // la app le dice al cliente y lo que le muestra al equipo no pueden ser
      // dos lecturas distintas de los mismos números.
      const { data: activos } = await admin
        .from('profiles')
        .select('id')
        .eq('rol', 'cliente')
        .not('campana_desde', 'is', null)
        .or('campana_pausada.is.null,campana_pausada.eq.false');
      const idsActivos: string[] = (activos ?? []).map((a: { id: string }) => a.id);

      const { data: filas } = await admin
        .from('sala_metricas_semana')
        .select(COLUMNAS_DE_SEMANA)
        .in('cliente_id', idsActivos)
        .eq('semana_iso', semana)
        .is('anuncio', null);
      const semanaDe = new Map<string, FilaDeSemana>(
        ((filas ?? []) as unknown as FilaDeSemana[]).map((f) => [f.cliente_id, f]));

      // Los países, que deciden contra qué banda se juzga el costo. Sin
      // esto, `calcularCadena` cae en la referencia de México y juzga a toda
      // la cartera contra ella — el techo argentino está por debajo del piso
      // español, así que se equivoca en las dos direcciones y en silencio.
      const { data: montajes } = await admin
        .from('montaje_campana')
        .select('user_id, paises')
        .in('user_id', idsActivos);
      const paisesDe = new Map<string, string[]>(
        ((montajes ?? []) as Array<{ user_id: string; paises: string[] | null }>)
          .filter((m) => m.paises?.length)
          .map((m) => [m.user_id, m.paises as string[]]));

      for (const id of idsActivos) {
        const fila = semanaDe.get(id);
        // Sin números no se opina: se le pide que cargue, que es lo primero.
        const cuello = fila
          ? encontrarDomino(calcularCadena(numerosDeFila(fila), paisesDe.get(id) ?? []))
              .indicador?.id ?? null
          : 'no_cargo';
        if (!cuello) continue;

        pendientes.push({
          clienteId: id,
          nombre: nombrePorId.get(id) ?? 'Cliente',
          cuello,
          situacion: '', accion: '', como: '',
          // El cron solo manda lo automático: lo que necesita persona ya está
          // en la cola del Admin y lo ve el equipo al abrir su día.
          quien: 'la app',
          enRiesgo: 0, semanasIgual: 0, yaSeIntento: false,
        });
      }

      // ── LAS TRES REGLAS QUE FALTABAN ──
      //
      // El bloque anterior insertaba el aviso DIRECTO, sin mirar nada. Dos
      // consecuencias, las dos en contra de lo que el aviso busca:
      //
      //   · El cliente recibía el mismo aviso TODOS LOS DÍAS mientras el
      //     cuello siguiera. Las alarmas del equipo sí chequean si ya salieron
      //     hoy; estas no. Un aviso diario por el mismo motivo deja de leerse
      //     al segundo día, y de paso enseña a ignorar la campana entera.
      //   · Nunca escalaba. `AVISOS_ANTES_DE_ESCALAR` estaba escrito y no se
      //     aplicaba en ninguna parte: después de dos avisos sin que el
      //     cliente lo resolviera, no se enteraba nadie.
      //
      // `planificarAvisos` ya resolvía las tres reglas y nadie la llamaba. El
      // historial que necesita se deriva de las notificaciones ya enviadas:
      // el dato estaba, no hacía falta una tabla nueva.
      const plan = planificarAvisos(pendientes, historial, semanaISOde(new Date()));

      for (const aviso of plan.aMandar) {
        await admin.from('notificaciones').insert({
          usuario_id: aviso.clienteId,
          tipo: 'sistema',
          titulo: aviso.titulo,
          descripcion: aviso.descripcion,
          accion_url: aviso.destino,
          // La clave queda guardada: es con lo que la corrida de mañana sabe
          // que este aviso ya salió. Sin ella el historial se reconstruía
          // comparando títulos, y cambiarle una palabra a un texto reseteaba
          // la cuenta de todos.
          clave: aviso.clave,
          leida: false,
        });
        avisados++;
      }

      // Lo que el aviso automático no pudo resolver pasa a una persona. Dos
      // veces avisado y sin cambio no es un cliente que no leyó: es un aviso
      // que no alcanza para eso.
      for (const aviso of plan.aEscalar) {
        const nombre = nombrePorId.get(aviso.clienteId) ?? 'Cliente';
        await Promise.all(adminIds.map((aid) =>
          admin.from('notificaciones').insert({
            usuario_id: aid,
            tipo: 'admin',
            titulo: `${nombre}: el aviso automático no alcanzó`,
            descripcion: `Se le avisó ${aviso.vecesEnviado} ${aviso.vecesEnviado === 1 ? 'vez' : 'veces'} por «${aviso.titulo}» y sigue igual. Necesita una persona.`,
            accion_url: '/admin/clientes',
            leida: false,
          })));
        escalados++;
      }
      repetidosHoy = plan.repetidos;
    } catch (err) {
      // No tumba el cron: las alarmas del equipo ya se mandaron, y perderlas
      // por un fallo de los avisos sería cambiar un problema por dos.
      console.error('[cron/alarmas-inactividad] fallaron los avisos', err);
    }

    // ── LAS ENTREGAS DEL EQUIPO ──
    //
    // El plan tiene tres momentos en que el equipo instala algo técnico: el
    // alta, los sitios y formularios del día 11, y las automatizaciones del 29.
    // Estaban escritas en el seed y NADIE LAS LEÍA: el cliente llegaba al día
    // 11 sin saber que le tocaba una entrega, y Lupe sin saber que debía
    // hacerla. Aparecían cuando alguien se acordaba, o cuando el cliente
    // preguntaba por WhatsApp.
    //
    // Se disparan por el día del TRABAJO y no por el del calendario: la
    // entrega existe para desbloquear la sesión que viene, así que llega
    // cuando el cliente llega. Montarle los formularios a alguien que todavía
    // no escribió su oferta es trabajo que se hace dos veces.
    let entregasAvisadas = 0;
    try {
      const claves = ENTREGAS.map((e) => `entrega-${e.dia}`);
      const { data: yaSalieron } = await admin
        .from('notificaciones')
        .select('usuario_id, clave')
        .in('clave', claves);
      const hechasDe = new Map<string, number[]>();
      for (const n of (yaSalieron ?? []) as Array<{ usuario_id: string; clave: string }>) {
        const dia = Number(n.clave.replace('entrega-', ''));
        if (!Number.isFinite(dia)) continue;
        hechasDe.set(n.usuario_id, [...(hechasDe.get(n.usuario_id) ?? []), dia]);
      }

      for (const cli of clientes ?? []) {
        if (!cli.fecha_inicio) continue;
        if (cli.status && !['ACTIVE', 'activo', null].includes(cli.status)) continue;
        const done = completadasPor.get(cli.id) ?? new Set();
        const proxima = CAMINO.find((m) => !done.has(m.c));
        // Sin próxima, terminó el Camino: todas las entregas ya corresponden.
        const diaDeTrabajo = proxima ? proxima.d : 90;
        const e = entregaPendiente(diaDeTrabajo, hechasDe.get(cli.id) ?? []);
        if (!e) continue;

        const nombre = cli.nombre ?? 'Cliente';
        const aviso = avisoAlCliente(e);
        await admin.from('notificaciones').insert({
          usuario_id: cli.id, tipo: 'sistema',
          titulo: aviso.titulo, descripcion: aviso.descripcion,
          accion_url: '/mensajes', clave: `entrega-${e.dia}`, leida: false,
        });

        // Y la tarea en la lista de quien la tiene que hacer. La huella la
        // forman el cliente y la referencia, así que no se duplica.
        const tarea = tareaDelEquipo(e, nombre);
        await Promise.all(adminIds.map((aid) =>
          admin.rpc('crear_tarea_del_sistema', {
            p_titulo: tarea.titulo,
            p_descripcion: tarea.descripcion,
            p_asignado: aid,
            p_cliente: cli.id,
            p_origen: 'recorrido',
            p_ref: `entrega-${e.dia}`,
            p_destino: 'escalar',
            p_texto_listo: null,
            p_peso: 60_000,
            p_prioridad: 'alta',
            p_vence: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
          }).then(() => undefined, () => undefined)));
        entregasAvisadas++;
      }
    } catch (err) {
      console.error('[cron/alarmas-inactividad] fallaron las entregas', err);
    }

    console.log(`[cron/alarmas-inactividad] v2 Camino · alarmas=${alarmas} avisos=${avisados} escalados=${escalados} repetidos_evitados=${repetidosHoy} entregas=${entregasAvisadas}`);
    return res.status(200).json({ ok: true, alarmas });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    Sentry.captureException(err);
    return res.status(500).json({ error: msg });
  }
}

export default withSentry(handler);
