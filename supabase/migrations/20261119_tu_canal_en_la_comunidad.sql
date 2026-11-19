-- TU CANAL EN LA COMUNIDAD — el link directo, guardado en su perfil.
--
-- Cada cliente tiene un canal privado en la comunidad, y para llegar hasta él
-- tiene que entrar al grupo y buscarlo entre quince. El link es un dato por
-- cliente y no se puede derivar: lo da la comunidad cuando se crea el canal.
--
-- Columna y no tabla: es un dato por persona, no una lista. Nace en null y la
-- pantalla de Hoy no dibuja la fila hasta que está cargado, así que cargar los
-- once de a uno no deja a nadie viendo un botón roto.
--
-- Lo escribe el equipo (los perfiles ya se actualizan desde el Admin con la
-- clave de servicio) y lo lee el dueño del perfil, que es lo que ya permite la
-- política de `profiles`: no hace falta ninguna política nueva.

alter table public.profiles
  add column if not exists canal_comunidad text;

comment on column public.profiles.canal_comunidad is
  'Link directo al canal privado del cliente en la comunidad. Null hasta que se carga.';
