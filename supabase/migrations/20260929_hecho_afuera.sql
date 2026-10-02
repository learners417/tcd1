-- ══════════════════════════════════════════════════════════════════
-- "LO HIZO AFUERA" — para que el semáforo no marque en rojo a quien
-- está trabajando bien.
--
-- Varios clientes vienen construyendo por fuera de la app: su método
-- en Word, su oferta en una presentación, su onboarding en otra
-- herramienta. Para la app eso no existe, así que aparecen con todo
-- vencido y en rojo.
--
-- Con esto, quien acompaña marca esa jornada como hecha afuera. Cuenta
-- como cerrada para el color, y queda distinguida para el cierre de
-- cuentas: la garantía sigue midiendo lo que el cliente entregó.
-- ══════════════════════════════════════════════════════════════════

alter table public.hoja_de_ruta
  add column if not exists hecho_afuera boolean default false,
  add column if not exists marcado_por text,
  add column if not exists marcado_el timestamptz;

comment on column public.hoja_de_ruta.hecho_afuera is
  'La jornada se cerró porque el cliente ya la tenía hecha fuera de la app.';
comment on column public.hoja_de_ruta.marcado_por is
  'Quién la marcó. Queda el nombre para poder preguntarle después.';
