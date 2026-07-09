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

    console.log(`[cron/alarmas-inactividad] v2 Camino · alarmas=${alarmas}`);
    return res.status(200).json({ ok: true, alarmas });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    Sentry.captureException(err);
    return res.status(500).json({ error: msg });
  }
}

export default withSentry(handler);
