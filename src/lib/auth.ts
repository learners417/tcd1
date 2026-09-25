import { supabase, isSupabaseReady, type Profile } from './supabase';
import { setFamiliaActual } from './vocabulario';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady() || !supabase) return { error: 'Supabase no configurado' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseReady() || !supabase) return;
  await supabase.auth.signOut();
}

/**
 * Envía un mail de reset de contraseña. Supabase manda un link al mail con
 * token de recovery; al hacer click, el usuario vuelve a la app con una
 * sesión temporal + evento PASSWORD_RECOVERY, y el app muestra el modal
 * para fijar la nueva contraseña.
 */
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady() || !supabase) return { error: 'Supabase no configurado' };
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Actualiza la contraseña del usuario logueado. Solo funciona con sesión
 * activa — usado dentro del flujo PASSWORD_RECOVERY tras click en el mail.
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady() || !supabase) return { error: 'Supabase no configurado' };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}

export async function getSession() {
  if (!isSupabaseReady() || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseReady() || !supabase) return null;
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return data ?? null;
}

// Crear perfil de usuario nuevo (llamado tras crear auth.user en el admin)
export async function createProfile(profile: Omit<Profile, 'created_at'>): Promise<{ error: string | null }> {
  if (!isSupabaseReady() || !supabase) return { error: 'Supabase no configurado' };
  const { error } = await supabase.from('profiles').insert(profile);
  if (error) return { error: error.message };
  return { error: null };
}

// Crear usuario via Admin API (solo desde un entorno seguro o Edge Function)
// En producción esto se llama desde una Supabase Edge Function con service_role key
export async function inviteUser(email: string, nombre: string, plan: 'DWY' | 'DFY', especialidad: string, fecha_inicio: string): Promise<{ error: string | null }> {
  if (!isSupabaseReady() || !supabase) return { error: 'Supabase no configurado' };

  // Llamar a la Edge Function que usa service_role para crear el usuario
  const { error } = await supabase.functions.invoke('invite-user', {
    body: { email, nombre, plan, especialidad, fecha_inicio }
  });

  if (error) return { error: error.message };
  return { error: null };
}

// Sincronizar perfil de Supabase → localStorage (fallback para páginas que aún leen localStorage)
export function syncProfileToLocalStorage(profile: Profile): void {
  // Espejo dedicado del plan: el gating del Camino y el tope del Mentor lo leen
  // de acá (inmune a que el borrador del perfil pise tcd_profile sin el plan).
  try { localStorage.setItem('tcd_plan', String(profile.plan ?? '')); } catch { /* noop */ }
  // Los campos del ADN viajan en ProfileV2. Sin espejarlos, toda herramienta
  // que autocompleta desde el ADN (el Constructor de anuncios, entre otras)
  // lee undefined y muestra un formulario vacio aunque el cliente lo haya
  // sellado. El id va tambien: lo necesita el cobro de creditos.
  // El Camino se escribe con tokens: aqui se fija con que palabra se leen.
  // Un coach no tiene pacientes; un entrenador tampoco.
  setFamiliaActual(profile.especialidad);

  const v2 = profile as unknown as Record<string, unknown>;
  localStorage.setItem('tcd_profile', JSON.stringify({
    id: profile.id,
    nombre: profile.nombre,
    email: profile.email,
    especialidad: profile.especialidad ?? '',
    fecha_inicio: profile.fecha_inicio,
    plan: profile.plan,
    modulos_activos: profile.modulos_activos ?? [],
    agentes_activos: profile.agentes_activos ?? [],
    // plan_comercial y acceso_hasta gobiernan la ESCALERA de venta: sin
    // espejarlos, planActual() caia siempre en 'completo' (pilar 99) y un
    // comprador de plan blanco (pilar 1) se llevaba la app entera.
    plan_comercial: v2.plan_comercial ?? null,
    acceso_hasta: v2.acceso_hasta ?? null,
    adn_avatar: v2.adn_avatar ?? null,
    metodo_nombre: v2.metodo_nombre ?? '',
    oferta_mid: v2.oferta_mid ?? '',
  }));
}
