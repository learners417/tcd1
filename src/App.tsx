/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import CustomSelect from './components/CustomSelect';
import Sidebar from './components/Sidebar';
import CeremoniaCinturon from './components/CeremoniaCinturon';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Coach from './pages/Coach';
import Metrics from './pages/Metrics';
import Mensajes from './pages/Mensajes'; // G4: el chat habilitado
import Liga from './pages/Liga'; // T10: EL JUEGO
import Red from './pages/Red'; // T12: LA RED
import { capturarInviteDeURL, redimirInvitacionPendiente } from './lib/red';
import { sincronizarArtefactos } from './lib/puenteMCD'; // T13: EL PUENTE MCD
import DiarioDirector from './pages/DiarioDirector';
import Biblioteca from './pages/Biblioteca';
import Agentes from './pages/Agentes';
import ManualNegocio from './pages/ManualNegocio';
import ADN from './pages/ADN';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Campanas from './pages/Campanas';
import { cinturonDesdeProgreso } from './lib/cinturones';
import { accesoVencido, NOMBRE_PLAN, PRECIO_FUNDADOR, waLink } from './lib/planes';
import CreadorContenido from './pages/CreadorContenido';
import WelcomeWizard from './components/WelcomeWizard';
import LoadingScreen from './components/LoadingScreen';
import { X, User, Bell, Shield, CreditCard, LogOut, Camera, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseReady, type Profile as SupabaseProfile } from './lib/supabase';
import { signOut, syncProfileToLocalStorage, updatePassword } from './lib/auth';
import { recordTodayActivity } from './lib/activity';
import { setSentryUser } from './lib/sentry';
import { toast } from 'sonner';

type SettingsTab = 'perfil' | 'notificaciones' | 'seguridad' | 'facturacion';

interface Profile {
  nombre: string;
  email: string;
  especialidad: string;
  fecha_inicio: string;
  plan: 'DWY' | 'DFY';
}

function loadProfile(): Profile {
  try {
    const saved = localStorage.getItem('tcd_profile');
    if (saved) return JSON.parse(saved);
  } catch { /* noop */ }
  const today = new Date().toISOString().split('T')[0];
  return { nombre: 'Profesional', email: '', especialidad: '', fecha_inicio: today, plan: 'DWY' };
}

// Páginas válidas — fuente de verdad para validar lo guardado en localStorage
const VALID_PAGES = [
  'dashboard', 'roadmap', 'coach', 'metrics', 'liga', 'red',
  'diario', 'adn', 'manualNegocio', 'biblioteca', 'agentes',
  'campanas',
] as const;
const PAGE_STORAGE_KEY = 'tcd_current_page';

function loadCurrentPage(): string {
  try {
    const saved = localStorage.getItem(PAGE_STORAGE_KEY);
    if (saved && (VALID_PAGES as readonly string[]).includes(saved)) return saved;
  } catch { /* noop */ }
  return 'dashboard';
}

type AuthState = 'loading' | 'logged_out' | 'logged_in';



/** La Semana Blanca terminó: modo lectura digno — su trabajo preservado, la puerta abierta. */
function SemanaCompleta({ nombre, planReservado }: { nombre?: string; planReservado?: string | null }) {
  let quemas = 0; let racha = 0;
  try {
    const set = new Set<string>(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]'));
    quemas = set.has('1-P1.3') ? 1 : 0;
    racha = parseInt(localStorage.getItem('tcd_racha') ?? '0', 10) || 0;
  } catch { /* noop */ }
  const nombreRes = planReservado && NOMBRE_PLAN[planReservado as keyof typeof NOMBRE_PLAN] ? NOMBRE_PLAN[planReservado as keyof typeof NOMBRE_PLAN] : null;
  const precioRes = planReservado && PRECIO_FUNDADOR[planReservado] ? PRECIO_FUNDADOR[planReservado] : null;
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      <div className="max-w-md w-full card-panel rounded-3xl p-8 text-center border border-[rgba(232,150,46,0.25)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E8962E] mb-3">Tu Semana Blanca está completa</p>
        <h1 className="text-2xl text-[#F2EFE9] mb-3" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          {nombre ? `${nombre}, lo` : 'Lo'} que construiste es tuyo.
        </h1>
        <p className="text-sm text-[#F2EFE9]/60 mb-5 leading-relaxed">
          {quemas ? 'Tu QUEMA está hecha — eso no se deshace. ' : ''}Tu ADN, tu diario y tu avance quedan guardados 30 días, esperándote.
        </p>
        {nombreRes && (
          <p className="text-sm text-[#F2EFE9]/80 mb-5">Tu lugar de fundador sigue reservado: <span className="text-[#F4B65C] font-semibold">{nombreRes}</span>{precioRes && <> · {precioRes} (50% off, congelado de por vida)</>}</p>
        )}
        <div className="text-left mb-5 space-y-2">
          {([
            ['🟡', 'Tu Base', '$147', 'La Fase 1 completa: tu relación con el dinero sanada + tu Mentor sin límite.'],
            ['🟢', 'Tu Sistema', '$497', 'Hasta la Fase 3: tu oferta construida, tu método con nombre y tus primeros entrenadores.'],
            ['⬛', 'Programa Completo', '$997', 'Los 90 días enteros, los 9 entrenadores, y la garantía por contrato: 10 pacientes de $1.000 o seguimos gratis.'],
          ] as const).map(([e, n, p, d]) => (
            <div key={n} className="rounded-xl border border-[rgba(232,150,46,0.15)] bg-black/20 px-3.5 py-2.5">
              <p className="text-xs font-bold text-[#F2EFE9]">{e} {n} · <span className="text-[#F4B65C]">{p}</span> <span className="text-[#F2EFE9]/35 font-normal">(precio fundador, de por vida)</span></p>
              <p className="text-[11px] text-[#F2EFE9]/55 mt-0.5">{d}</p>
            </div>
          ))}
        </div>
        <a href={waLink(('Hola · Quiero continuar mi camino' + (nombreRes ? ' con el plan ' + nombreRes : '')))} target="_blank" rel="noreferrer"
           className="block btn-primary text-[#1a1206] font-bold px-6 py-3.5 rounded-2xl mb-3">
          Retomar mi camino →
        </a>
        <p className="text-[11px] text-[#F2EFE9]/35">Un mensaje y seguís exactamente donde quedaste — mismo login, todo intacto.{racha > 1 ? ` Tu racha de ${racha} te espera.` : ''}</p>
      </div>
    </div>
  );
}

function PaginaBloqueada({ nombre }: { nombre: string }) {
  return (
    <div className="max-w-lg mx-auto mt-24 text-center card-panel p-10 rounded-3xl border border-[rgba(232,150,46,0.15)]">
      <p className="text-4xl mb-4">🔒</p>
      <h2 className="text-lg text-[#F2EFE9] mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{nombre} está guardado para ti</h2>
      <p className="text-sm text-[#F2EFE9]/55">Se desbloquea con el <span className="text-[#F4B65C]">Cinturón Verde</span> — tu oferta aprobada. Sigue en El Camino: cada micro-sesión te acerca.</p>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(loadCurrentPage);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('perfil');
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [profileDraft, setProfileDraft] = useState<Profile>(loadProfile);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [profileLoading, setProfileLoading] = useState(false);
  const [supabaseProfile, setSupabaseProfile] = useState<SupabaseProfile | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => localStorage.getItem('tcd_avatar') || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // T12 · LA RED — captura ?invite= al entrar y lo redime cuando hay sesión.
  // T13 · EL PUENTE MCD — los artefactos del Camino se instalan solos en Mi Clínica.
  useEffect(() => {
    capturarInviteDeURL();
    if (supabaseProfile?.id) {
      void redimirInvitacionPendiente();
      void sincronizarArtefactos(supabaseProfile.id, supabaseProfile);
    }
  }, [supabaseProfile?.id]);
  const mainRef = useRef<HTMLElement>(null);

  // Password recovery (post-click en mail de reset)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPassword2, setRecoveryPassword2] = useState('');
  const [recoveryShowPwd, setRecoveryShowPwd] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // ─── Auth init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseReady() || !supabase) {
      // No Supabase configured — skip auth, go straight to app (dev mode)
      const existing = localStorage.getItem('tcd_profile');
      if (!existing) localStorage.setItem('tcd_profile', JSON.stringify(profile));
      setAuthState('logged_in');
      return;
    }

    // Safety valve: never leave user stuck on spinner
    const safetyTimer = setTimeout(() => {
      setAuthState(prev => prev === 'loading' ? 'logged_out' : prev);
    }, 5000);

    // Single source of truth — handles page load (INITIAL_SESSION) + login + logout
    // TOKEN_REFRESHED is intentionally ignored to avoid UI flicker when switching tabs
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clearTimeout(safetyTimer);
        setSentryUser(null);
        setSupabaseProfile(null);
        setAuthState('logged_out');
        return;
      }
      if (event === 'TOKEN_REFRESHED') {
        // Token silently refreshed — user is still logged in, no UI update needed
        clearTimeout(safetyTimer);
        return;
      }
      if (event === 'PASSWORD_RECOVERY') {
        // El usuario llegó desde el mail de reset — pedir nueva contraseña antes
        // de cargar el resto de la app.
        clearTimeout(safetyTimer);
        setShowRecoveryModal(true);
        return;
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // Asociar usuario a Sentry para que los errores muestren quién los disparó.
        setSentryUser({ id: session.user.id, email: session.user.email });
        // Only do a full profile load on real login / first load, not on tab refocus
        setProfileLoading(true);
        await loadSupabaseProfile(session.user.id);
        clearTimeout(safetyTimer);
        setProfileLoading(false);
        setAuthState('logged_in');
        // Registrar el día como "conectado" (no bloqueante, idempotente, máx 1/día).
        void recordTodayActivity(session.user.id);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function loadSupabaseProfile(userId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Profile fetch timeout') }), 4000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (!error && data) {
        setSupabaseProfile(data as SupabaseProfile);
        try { const at = (data as { avatar_tipo?: string })?.avatar_tipo; if (at === 'A' || at === 'B') localStorage.setItem('tcd_avatar', at); } catch { /* noop */ }
        syncProfileToLocalStorage(data as SupabaseProfile);
        const p: Profile = {
          nombre: data.nombre,
          email: data.email,
          especialidad: data.especialidad ?? '',
          fecha_inicio: data.fecha_inicio,
          plan: data.plan,
        };
        setProfile(p);
        setProfileDraft(p);
        return true;
      }
      console.warn('loadSupabaseProfile: no data or timeout.', error?.message);
      return false;
    } catch (err) {
      console.error('loadSupabaseProfile exception:', err);
      return false;
    }
  }

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [currentPage]);

  // Persistir la página actual para que sobreviva al refresh
  useEffect(() => {
    try {
      localStorage.setItem(PAGE_STORAGE_KEY, currentPage);
    } catch { /* noop */ }
  }, [currentPage]);

  const openSettings = () => {
    setProfileDraft(loadProfile());
    setShowSettings(true);
  };

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem('tcd_avatar', dataUrl);
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const saveProfile = async () => {
    localStorage.setItem('tcd_profile', JSON.stringify(profileDraft));
    setProfile(profileDraft);

    // Also update in Supabase if available
    if (supabase && supabaseProfile) {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: profileDraft.nombre,
          especialidad: profileDraft.especialidad,
          fecha_inicio: profileDraft.fecha_inicio,
          plan: profileDraft.plan,
        })
        .eq('id', supabaseProfile.id);

      if (error) {
        toast.error('Error al guardar en la nube. Los cambios se guardaron localmente.');
      }
    }

    setShowSettings(false);
  };

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('tcd_profile');
    setShowSettings(false);
    setAuthState('logged_out');
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (recoveryPassword !== recoveryPassword2) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    setRecoveryLoading(true);
    const { error } = await updatePassword(recoveryPassword);
    setRecoveryLoading(false);
    if (error) {
      toast.error(`Error: ${error}`);
      return;
    }
    toast.success('Contraseña actualizada. Ya podés usar la app.');
    setShowRecoveryModal(false);
    setRecoveryPassword('');
    setRecoveryPassword2('');
  };

  const RecoveryModal = showRecoveryModal ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111110] border border-[rgba(232,150,46,0.18)] rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-5 py-4 border-b border-[rgba(232,150,46,0.1)]">
          <h3 className="text-sm font-semibold text-[#F2EFE9]">Fijar nueva contraseña</h3>
          <p className="text-[11px] text-[#F2EFE9]/50 mt-0.5">Elegí una contraseña nueva para tu cuenta.</p>
        </div>
        <form onSubmit={handleRecoverySubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2EFE9]/40" />
              <input
                type={recoveryShowPwd ? 'text' : 'password'}
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                disabled={recoveryLoading}
                autoFocus
                className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#F2EFE9] placeholder-[#F2EFE9]/30 focus:outline-none focus:border-[#E8962E]/50 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setRecoveryShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2EFE9]/40 hover:text-[#F2EFE9]/70 transition-colors"
              >
                {recoveryShowPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2EFE9]/40" />
              <input
                type={recoveryShowPwd ? 'text' : 'password'}
                value={recoveryPassword2}
                onChange={(e) => setRecoveryPassword2(e.target.value)}
                placeholder="Repetí la contraseña"
                required
                disabled={recoveryLoading}
                className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F2EFE9] placeholder-[#F2EFE9]/30 focus:outline-none focus:border-[#E8962E]/50 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={recoveryLoading || !recoveryPassword || !recoveryPassword2}
            className="w-full py-2.5 rounded-xl bg-[#E8962E] hover:bg-[#F4B65C] disabled:opacity-50 text-black text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            {recoveryLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  ) : null;

  // ─── Loading state ──────────────────────────────────────────────────────────
  // Solo mostramos el loader cuando no tenemos profile todavia. Si Supabase
  // refresca el token al volver el foco al browser, profileLoading pega un
  // flash pero ya tenemos el profile cargado — no hay que re-renderizar el
  // loader en ese caso (sino la app parece que recarga cada vez que cambias
  // de pestaña).
  if (authState === 'loading' || (profileLoading && !supabaseProfile)) {
    return (
      <>
        <LoadingScreen />
        {RecoveryModal}
      </>
    );
  }

  // ─── Not logged in ──────────────────────────────────────────────────────────
  if (authState === 'logged_out') {
    return (
      <>
        <Login onLogin={() => { /* noop: onAuthStateChange handles state */ }} />
        {RecoveryModal}
      </>
    );
  }

  // ─── Admin view ─────────────────────────────────────────────────────────────
  if (supabaseProfile?.rol === 'admin') {
    return (
      <>
        <Admin adminProfile={supabaseProfile} onSignOut={handleSignOut} />
        {RecoveryModal}
      </>
    );
  }

  // ─── Onboarding wizard (primer login) ──────────────────────────────────────
  if (supabaseProfile && supabaseProfile.onboarding_completed === false) {
    return (
      <>
        <WelcomeWizard
          profile={supabaseProfile}
          onComplete={(firstPage) => {
            if (firstPage) setCurrentPage(firstPage);
            loadSupabaseProfile(supabaseProfile.id);
          }}
        />
        {RecoveryModal}
      </>
    );
  }

  // ─── Main app ────────────────────────────────────────────────────────────────
  // ═══ La Semana Blanca vencida: modo lectura digno (nada se borra) ═══
  if (supabaseProfile && accesoVencido(supabaseProfile)) {
    return <SemanaCompleta nombre={supabaseProfile.nombre ?? undefined} planReservado={supabaseProfile.plan_reservado} />;
  }

  return (
    <div className="flex h-screen bg-[#080808] text-[#F2EFE9] overflow-hidden font-sans selection:bg-[#E8962E]/30">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E8962E]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E8962E]/5 blur-[120px] pointer-events-none" />

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <CeremoniaCinturon />
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenSettings={openSettings}
        onSignOut={handleSignOut}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Topbar setCurrentPage={setCurrentPage} userId={supabaseProfile?.id} onMobileMenuToggle={() => setMobileMenuOpen(v => !v)} />
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide">
          <div className="p-6">
            {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} userId={supabaseProfile?.id}
                perfil={supabaseProfile ?? undefined} />}
            {currentPage === 'roadmap' && <Roadmap userId={supabaseProfile?.id} perfil={supabaseProfile ?? undefined} geminiKey={import.meta.env.VITE_GEMINI_API_KEY} onNavigate={setCurrentPage} onProfileFieldUpdate={(fields) => setSupabaseProfile(prev => prev ? { ...prev, ...fields } as typeof prev : prev)} />}
            {currentPage === 'coach' && <Coach userId={supabaseProfile?.id} perfil={supabaseProfile ?? undefined} />}
            {currentPage === 'liga' && <Liga userId={supabaseProfile?.id} perfil={supabaseProfile ?? undefined} />}
            {currentPage === 'red' && <Red userId={supabaseProfile?.id} />}
            {currentPage === 'metrics' && <Metrics userId={supabaseProfile?.id} />}
            {currentPage === 'mensajes' && <Mensajes userId={supabaseProfile?.id} />}
            {currentPage === 'diario' && (
              <DiarioDirector
                userId={supabaseProfile?.id}
                geminiKey={import.meta.env.VITE_GEMINI_API_KEY}
              />
            )}
            {currentPage === 'adn' && <ADN perfil={supabaseProfile ?? {}} userId={supabaseProfile?.id} setCurrentPage={setCurrentPage} onProfileFieldUpdate={(fields) => setSupabaseProfile(prev => prev ? { ...prev, ...fields } as typeof prev : prev)} />}
            {currentPage === 'manualNegocio' && <ManualNegocio perfil={supabaseProfile ?? {}} userId={supabaseProfile?.id} setCurrentPage={setCurrentPage} onProfileFieldUpdate={(fields) => setSupabaseProfile(prev => prev ? { ...prev, ...fields } as typeof prev : prev)} />}
            {currentPage === 'biblioteca' && <Biblioteca userId={supabaseProfile?.id} />}
            {currentPage === 'agentes' && (
              <Agentes
                userId={supabaseProfile?.id}
                perfil={supabaseProfile ?? undefined}
                geminiKey={import.meta.env.VITE_GEMINI_API_KEY}
                setCurrentPage={setCurrentPage}
              />
            )}
            {currentPage === 'campanas' && (() => {
              try {
                const set = new Set<string>(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]'));
                if (cinturonDesdeProgreso(set).orden < 5) return <PaginaBloqueada nombre="Campañas & Creativos" />;
              } catch { /* noop */ }
              return null;
            })() || currentPage === 'campanas' && (
              <Campanas
                userId={supabaseProfile?.id}
                perfil={supabaseProfile ?? undefined}
                geminiKey={import.meta.env.VITE_GEMINI_API_KEY}
              />
            )}
            {currentPage === 'creador' && (() => {
              try {
                const set = new Set<string>(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]'));
                if (cinturonDesdeProgreso(set).orden < 5) return <PaginaBloqueada nombre="El Creador de Contenido" />;
              } catch { /* noop */ }
              return null;
            })() || currentPage === 'creador' && (
              <CreadorContenido
                userId={supabaseProfile?.id}
                perfil={supabaseProfile ?? undefined}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#1A1917] border border-[rgba(232,150,46,0.12)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[rgba(232,150,46,0.12)]">
              <h2 className="text-xl font-medium text-[#F2EFE9]">Ajustes de la Cuenta</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Settings Sidebar */}
              <div className="w-1/3 border-r border-[rgba(232,150,46,0.12)] p-4 space-y-2 bg-[#1A1917]/50 flex flex-col">
                <div className="flex-1 space-y-2">
                  {([
                    { id: 'perfil' as SettingsTab, label: 'Perfil', icon: User },
                    { id: 'notificaciones' as SettingsTab, label: 'Notificaciones', icon: Bell },
                    { id: 'seguridad' as SettingsTab, label: 'Seguridad', icon: Shield },
                    { id: 'facturacion' as SettingsTab, label: 'Facturación', icon: CreditCard },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                        settingsTab === tab.id
                          ? 'bg-[#E8962E]/10 text-[#E8962E] font-medium'
                          : 'text-[#F2EFE9]/60 hover:bg-[#E8962E]/5 hover:text-[#F2EFE9]'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>
                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors mt-auto"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </div>

              {/* Settings Content */}
              <div className="w-2/3 p-6 overflow-y-auto">
                {settingsTab === 'perfil' && (
                  <div className="space-y-6">
                    {/* Avatar upload */}
                    <div className="flex flex-col items-center gap-3">
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="relative group w-20 h-20 rounded-full border-2 border-dashed border-[rgba(232,150,46,0.18)] hover:border-[#E8962E]/50 transition-colors overflow-hidden"
                      >
                        {avatarUrl ? (
                          <img loading="lazy" src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#E8962E]/10 flex items-center justify-center text-2xl font-bold text-[#E8962E]">
                            {(profileDraft.nombre || 'P').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </button>
                      <p className="text-xs text-[#F2EFE9]/40">Clic para cambiar foto de perfil</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[#F2EFE9] mb-4">Información Personal</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-[#F2EFE9]/60 mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            value={profileDraft.nombre}
                            onChange={e => setProfileDraft({ ...profileDraft, nombre: e.target.value })}
                            className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-2.5 text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#F2EFE9]/60 mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            value={profileDraft.email}
                            disabled
                            className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-2.5 text-[#F2EFE9]/40 cursor-not-allowed"
                          />
                          <p className="text-xs text-[#F2EFE9]/30 mt-1">El email no se puede cambiar desde aquí</p>
                        </div>
                        <div>
                          <label className="block text-xs text-[#F2EFE9]/60 mb-1">Especialidad</label>
                          <input
                            type="text"
                            value={profileDraft.especialidad}
                            onChange={e => setProfileDraft({ ...profileDraft, especialidad: e.target.value })}
                            className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-2.5 text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-[rgba(232,150,46,0.12)] flex justify-end gap-3">
                      <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors">
                        Cancelar
                      </button>
                      <button onClick={saveProfile} className="btn-primary">
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'notificaciones' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-[#F2EFE9] mb-4">Preferencias de Notificaciones</h3>
                    {['Recordatorios del diario', 'Mensajes del equipo', 'Recordatorios de tareas', 'Resumen semanal'].map((item, i) => (
                      <label key={i} className="flex items-center justify-between py-3 border-b border-[rgba(232,150,46,0.1)]">
                        <span className="text-sm text-[#F2EFE9]/80">{item}</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#E8962E]" />
                      </label>
                    ))}
                  </div>
                )}

                {settingsTab === 'seguridad' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-[#F2EFE9] mb-4">Seguridad</h3>
                    <div>
                      <p className="text-sm text-[#F2EFE9]/60 mb-2">Cambia tu contraseña cuando quieras: te enviamos un email con el enlace seguro.</p>
                      <button
                        onClick={async () => {
                          const email = supabaseProfile?.email;
                          if (!email || !supabase) return;
                          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                          if (error) toast.error('No pudimos enviar el email. Intenta de nuevo.');
                          else toast.success('Listo: revisa tu correo (' + email + ') y sigue el enlace.');
                        }}
                        className="px-4 py-2 rounded-xl border border-[rgba(232,150,46,0.25)] text-[#E8962E] text-sm hover:bg-[#E8962E]/10 transition-colors"
                      >
                        Enviarme el email de restablecimiento
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'facturacion' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-[#F2EFE9] mb-4">Facturación</h3>
                    <div className="bg-[#1A1917]/50 border border-[rgba(232,150,46,0.12)] p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#F2EFE9]/80">Plan Actual</span>
                        <span className="px-3 py-1 rounded-full bg-[#E8962E]/20 text-[#E8962E] text-xs font-medium">
                          Tu Clínica Digital — {profile.plan}
                        </span>
                      </div>
                      <p className="text-xs text-[#F2EFE9]/40">Programa de 90 días</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {RecoveryModal}
    </div>
  );
}
