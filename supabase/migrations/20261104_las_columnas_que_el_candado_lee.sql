-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  EL CANDADO LEÍA COLUMNAS QUE LA TABLA NO TENÍA                          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- 4 de noviembre, a la noche, probando el alta de un cliente real.
--
-- Al terminar la bienvenida, el cliente tocaba el último botón y la pantalla
-- decía «Tu conexión cortó justo al guardar este paso». No era la conexión:
--
--     ERROR 42703: record "new" has no field "acceso_tipo"
--     CONTEXT: new.acceso_tipo is distinct from old.acceso_tipo
--     PL/pgSQL function profiles_solo_el_equipo_cambia_lo_que_compro() line 34
--
-- El trigger `profiles_lo_que_compro` (20261018) mira diez columnas de
-- `profiles` para impedir que un cliente se cambie solo lo que compró. Dos de
-- esas diez las agregan migraciones VIEJAS —`acceso_tipo` la de
-- 20260926_hoja_de_ruta y `acceso_hasta` la de 20260718_ac1_gating_columns— y
-- en esta base esas migraciones nunca corrieron. En PL/pgSQL, leer un campo
-- que el registro no tiene no falla al crear la función: falla al EJECUTARLA.
--
-- O sea que el candado se instaló bien y recién se rompió cuando lo usó el
-- primer cliente. Y como el trigger es `before update` sobre toda la tabla,
-- rompía CUALQUIER escritura de un cliente sobre su propia ficha, no solo la
-- bienvenida: la contraseña, la especialidad, el diagnóstico, todo.
--
-- Acá se agregan las diez columnas que el trigger lee, con el tipo y el
-- default de la migración que las trajo. Las que ya están no se tocan.
--
-- Por qué no lo vio la prueba: `prueba-sql.sh` arma la base vieja leyendo los
-- `add column` de TODO el SQL del repositorio, o sea que da por corridas las
-- migraciones viejas. En la base de prueba `acceso_tipo` existía. La lección
-- es que el andamiaje no puede dar por hecho lo que la base real no tiene; la
-- prueba de este archivo lo hace al revés: borra la columna y comprueba que
-- el fallo aparece.

alter table public.profiles add column if not exists acceso_tipo          text default 'noventa';
alter table public.profiles add column if not exists acceso_hasta         timestamptz;
alter table public.profiles add column if not exists servicio_contratado  text not null default 'base';
alter table public.profiles add column if not exists cima_incluida        boolean not null default false;
alter table public.profiles add column if not exists migracion_habilitada boolean not null default false;
alter table public.profiles add column if not exists migrado_en           timestamptz;
alter table public.profiles add column if not exists biblioteca_abierta   boolean not null default false;
alter table public.profiles add column if not exists plan_comercial       text;
alter table public.profiles add column if not exists admin_rol            text;
alter table public.profiles add column if not exists rol                  text default 'cliente';

comment on column public.profiles.acceso_tipo is
  'Qué ventana de acceso tiene. La lee el trigger profiles_lo_que_compro: sin la columna, ese trigger rompe toda escritura de un cliente sobre su propia ficha.';
