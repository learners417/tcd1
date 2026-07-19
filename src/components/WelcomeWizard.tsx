import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, CheckCircle2, Sparkles, Map, Bot, MessageSquare, BookOpen, LockKeyhole, UserCircle, Rocket } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import { toast } from 'sonner';
import { PAISES } from '../lib/vozLocalizada';
import CustomSelect from './CustomSelect';

interface WelcomeWizardProps {
  profile: Profile;
  onComplete: (firstPage?: string) => void;
}

type Step = 'password' | 'profile' | 'diagnostico' | 'welcome' | 'pacto' | 'guide';

const ESPECIALIDADES = [
  'Psicólogo/a',
  'Nutricionista',
  'Odontólogo/a',
  'Kinesiólogo/a',
  'Coach',
  'Terapeuta',
  'Médico/a',
  'Otro',
];

const STEPS: Step[] = ['password', 'profile', 'diagnostico', 'welcome', 'pacto', 'guide'];

export default function WelcomeWizard({ profile, onComplete }: WelcomeWizardProps) {
  const [step, setStep] = useState<Step>('password');
  // ── El Diagnóstico (Lote 1 · la semilla del ADN) ──
  const [dxAvatar, setDxAvatar] = useState<'A' | 'B' | null>(null);
  const [dxFreno, setDxFreno] = useState('');
  const [dxNicho, setDxNicho] = useState('');
  const [dxDinero, setDxDinero] = useState('');
  const [dxTiempo, setDxTiempo] = useState('');
  const [dxEstilo, setDxEstilo] = useState<'hueso' | 'guantes' | ''>('');
  const [dxFe, setDxFe] = useState<'si' | 'no' | ''>('');
  const [dxSaving, setDxSaving] = useState(false);

  const guardarDiagnostico = async () => {
    if (!dxAvatar) return;
    setDxSaving(true);
    try {
      localStorage.setItem('tcd_avatar', dxAvatar);
      try { localStorage.setItem('tcd_diagnostico', JSON.stringify({ freno: dxFreno, nicho: dxNicho, dinero: dxDinero, tiempo: dxTiempo }));
      localStorage.setItem('tcd_estilo_mentor', dxEstilo || 'hueso');
      localStorage.setItem('tcd_fe', dxFe || 'no'); } catch { /* noop */ }
      if (supabase) {
        await supabase.from('profiles').update({
          avatar_tipo: dxAvatar,
          diagnostico: { freno: dxFreno, nicho_hipotesis: dxNicho, dinero: dxDinero, tiempo: dxTiempo, estilo_mentor: dxEstilo, trabajo_espiritual: dxFe },
          ...(dxNicho.trim() ? { adn_nicho: dxNicho.trim() } : {}),
          ...(dxFreno ? { adn_diagnostico_capa: `Tu freno principal al arrancar: ${dxFreno}. El Camino lo trabaja desde la primera semana.` } : {}),
        }).eq('id', profile.id);
      }
    } catch { /* no bloqueamos el flujo */ }
    setDxSaving(false);
    setStep('welcome');
  };
  // ── El Pacto (F3) ──
  const [pactoTexto, setPactoTexto] = useState('');
  const [pactoFirma, setPactoFirma] = useState('');

  // Step 1 — password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Step 2 — profile
  const [especialidad, setEspecialidad] = useState(profile.especialidad ?? '');
  const [especialidadOtro, setEspecialidadOtro] = useState('');
  const [pais, setPais] = useState(profile.pais ?? '');
  const [ingresosMensuales, setIngresosMensuales] = useState('');
  const [horasSemana, setHorasSemana] = useState('');
  const [frustracion, setFrustracion] = useState('');
  const [energia, setEnergia] = useState(5);
  const [savingProfile, setSavingProfile] = useState(false);

  async function handlePasswordSubmit() {
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (!supabase) { setStep('profile'); return; }

    setSavingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStep('profile');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error cambiando contraseña');
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleProfileSubmit() {
    setSavingProfile(true);
    try {
      const espFinal = especialidad === 'Otro' && especialidadOtro.trim()
        ? especialidadOtro.trim()
        : especialidad;

      if (supabase) {
        // Guardar especialidad y pais en perfil
        const update: Record<string, string> = {};
        if (espFinal) update.especialidad = espFinal;
        if (pais) update.pais = pais;
        if (Object.keys(update).length > 0) {
          await supabase.from('profiles').update(update).eq('id', profile.id);
        }

        // Guardar energía y frustración como primera entrada del diario
        const hoy = new Date().toISOString().split('T')[0];
        await supabase.from('diario_entradas').insert({
          user_id: profile.id,
          fecha: hoy,
          respuestas: {
            q1: frustracion.trim() ? `[Onboarding] ${frustracion.trim()}` : '',
            q2: '',
            q3: energia,
            q4: '',
            q5: '',
          },
        });
      }
      setStep('diagnostico');
    } catch {
      // No bloqueamos el flujo si algo falla
      setStep('diagnostico');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleComplete(firstPage?: string) {
    if (supabase) {
      await supabase.from('profiles')
        .update({ onboarding_completed: true, status: 'ACTIVE' })
        .eq('id', profile.id);
    }
    onComplete(firstPage);
  }

  const nombreCorto = profile.nombre.split(' ')[0];
  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 selection:bg-gold/30">
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-goldhi/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8 sticky top-0 pt-2 pb-2 z-10">
          {STEPS.map((s, idx) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-gold' :
                idx < currentStepIndex ? 'w-4 bg-gold/40' : 'w-4 bg-gold/10'
              }`}
            />
          ))}
        </div>

        {/* ── STEP 1: PASSWORD ── */}
        {step === 'password' && (
          <div className="bg-panel border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(232,150,46,0.18)]">
                <LockKeyhole className="w-5 h-5 text-ink" />
              </div>
              <h1 className="text-2xl font-semibold text-cream mb-2">Hola, {nombreCorto}</h1>
              <p className="text-sm text-cream/75 leading-relaxed">
                Para empezar, elige una contraseña personal. La contraseña temporal que te enviamos ya no va a funcionar después de esto.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-black/40 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-3 pr-12 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/55 hover:text-cream/80 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Confirmar contraseña</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Repite la contraseña"
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-sm text-cream focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-500/50'
                      : 'border-[rgba(232,150,46,0.12)] focus:border-gold/50'
                  }`}
                />
              </div>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 w-8 rounded-full transition-colors ${newPassword.length >= i * 4 ? 'bg-success' : 'bg-gold/10'}`} />
                  ))}
                </div>
                <span className="text-[11px] text-cream/55">
                  {newPassword.length < 4 ? 'Muy corta' : newPassword.length < 8 ? 'Casi...' : <span className="flex items-center gap-0.5">Lista <CheckCircle2 className="w-3 h-3 text-success inline" /></span>}
                </span>
              </div>
            )}

            <button
              onClick={handlePasswordSubmit}
              disabled={savingPwd || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full mt-6 py-3.5 rounded-xl bg-gold hover:bg-goldhi disabled:opacity-50 text-ink text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
            >
              {savingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Continuar</>}
            </button>
          </div>
        )}

        {/* ── STEP 2: PROFILE ── */}
        {step === 'profile' && (
          <div className="bg-panel border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(232,150,46,0.18)]">
                <UserCircle className="w-5 h-5 text-ink" />
              </div>
              <h1 className="text-2xl font-semibold text-cream mb-2">Cuéntanos sobre ti</h1>
              <p className="text-sm text-cream/75 leading-relaxed">
                Esta info le sirve a tu acompañante para conocerte mejor desde el día 1 y que el Mentor IA te dé respuestas más precisas.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">¿Cuál es tu profesión?</label>
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES.map(esp => (
                    <button
                      key={esp}
                      type="button"
                      onClick={() => setEspecialidad(esp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        especialidad === esp
                          ? 'bg-gold/20 text-gold border border-gold/40'
                          : 'bg-panel text-cream/75 border border-[rgba(232,150,46,0.12)] hover:border-[rgba(232,150,46,0.18)] hover:text-cream/90'
                      }`}
                    >
                      {esp}
                    </button>
                  ))}
                </div>
                {especialidad === 'Otro' && (
                  <input
                    type="text"
                    autoFocus
                    value={especialidadOtro}
                    onChange={e => setEspecialidadOtro(e.target.value)}
                    placeholder="¿Cuál es tu profesión?"
                    className="mt-3 w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/60 transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
                  ¿Desde qué país trabajas? <span className="text-cream/45 normal-case font-normal">(la IA adapta el tono de las respuestas y de tu contenido)</span>
                </label>
                <CustomSelect
                  value={pais}
                  onChange={setPais}
                  placeholder="Elige tu país"
                  options={PAISES.map(p => ({ value: p.codigo, label: p.nombre }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
                  ¿Cómo está tu energía hoy? <span className="text-cream/45 normal-case font-normal">(1 = agotado/a · 10 = con todo)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEnergia(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        n <= energia
                          ? 'bg-amber-500 text-ink shadow-sm shadow-amber-500/30'
                          : 'bg-panel text-cream/45 border border-[rgba(232,150,46,0.12)] hover:border-[rgba(232,150,46,0.18)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
                  ¿Cuál es tu mayor frustración hoy en tu práctica? <span className="text-cream/45 normal-case font-normal">(opcional)</span>
                </label>
                <textarea
                  value={frustracion}
                  onChange={e => setFrustracion(e.target.value)}
                  placeholder="Ej: No sé cómo conseguir pacientes nuevos sin depender de referidos, siento que trabajo mucho y gano poco..."
                  rows={3}
                  className="w-full bg-black/40 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors resize-none"
                />
                <p className="text-[11px] text-cream/45 mt-1.5">Tu Mentor va a leer esto para entenderte desde el inicio.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Ingresos mensuales (USD)</label>
                  <input
                    type="number"
                    value={ingresosMensuales}
                    onChange={e => setIngresosMensuales(e.target.value)}
                    placeholder="Ej: 2000"
                    className="w-full bg-black/40 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Horas/semana</label>
                  <input
                    type="number"
                    value={horasSemana}
                    onChange={e => setHorasSemana(e.target.value)}
                    placeholder="Ej: 40"
                    className="w-full bg-black/40 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('welcome')}
                className="px-5 py-3 rounded-xl text-sm text-cream/55 hover:text-cream/80 transition-colors"
              >
                Saltar
              </button>
              <button
                onClick={handleProfileSubmit}
                disabled={savingProfile}
                className="flex-1 py-3 rounded-xl bg-gold hover:bg-goldhi disabled:opacity-50 text-ink text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Continuar</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: WELCOME ── */}
        {step === 'diagnostico' && (
          <div className="space-y-6 fade-rise">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Tu punto de partida</p>
              <h2 className="text-2xl font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Siete preguntas — la semilla de tu ADN</h2>
              <p className="text-sm text-cream/55 mt-1">Con esto tu plan arranca personalizado. Un minuto, sin vueltas.</p>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">1 · ¿Ya tienes una forma propia de trabajar con tus pacientes — un método, aunque no tenga nombre?</p>
              <div className="space-y-2">
                {([['B','Sí. Tengo mi manera de hacer las cosas — la uso hace años.'],['A','No, o no lo tengo claro. Trabajo caso por caso.']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDxAvatar(v)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxAvatar === v ? 'border-gold bg-gold/10 text-cream' : 'border-[rgba(232,150,46,0.14)] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">2 · ¿Qué te frena más hoy?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['No sé conseguir pacientes online','Me cuesta cobrar lo que valgo','No tengo tiempo — todo depende de mí','Un poco de todo'].map((o) => (
                  <button key={o} onClick={() => setDxFreno(o)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxFreno === o ? 'border-gold bg-gold/10 text-cream' : 'border-[rgba(232,150,46,0.14)] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{o}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">3 · ¿A quién ayudas mejor? (tu paciente típico, en una frase)</p>
              <input value={dxNicho} onChange={(e) => setDxNicho(e.target.value)} placeholder="Ej: mujeres de 40-55 con problemas digestivos crónicos" className="w-full bg-black/20 border border-[rgba(232,150,46,0.14)] rounded-xl px-4 py-3 text-sm text-cream placeholder-cream/25 focus:outline-none focus:border-gold/50" />
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">4 · Cuando tienes que decir tu precio, ¿qué pasa?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['Lo digo tranquilo','Lo bajo antes de que me lo pidan','Lo justifico con títulos y años','Evito el tema'].map((o) => (
                  <button key={o} onClick={() => setDxDinero(o)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxDinero === o ? 'border-gold bg-gold/10 text-cream' : 'border-[rgba(232,150,46,0.14)] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{o}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">5 · ¿Cuánto tiempo real por día tienes para esto?</p>
              <div className="grid grid-cols-3 gap-2">
                {['30 min','1 hora','2+ horas'].map((o) => (
                  <button key={o} onClick={() => setDxTiempo(o)} className={`px-4 py-3 rounded-xl border text-sm transition-all ${dxTiempo === o ? 'border-gold bg-gold/10 text-cream' : 'border-[rgba(232,150,46,0.14)] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{o}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">6 · ¿Cómo quieres que te hable tu Mentor?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([['hueso', 'Directo al hueso. Sin vueltas, aunque incomode.'], ['guantes', 'Con guantes. Firme, pero más suave.']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDxEstilo(v)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxEstilo === v ? 'border-gold bg-gold/10 text-cream' : 'border-[rgba(232,150,46,0.14)] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">7 · ¿El trabajo espiritual es parte de tu vida?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([['si', 'Sí — la fe, la oración o la gratitud son parte de mi camino.'], ['no', 'No — prefiero un lenguaje neutro.']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDxFe(v)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxFe === v ? 'border-gold bg-gold/10 text-cream' : 'border-[rgba(232,150,46,0.14)] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{l}</button>
                ))}
              </div>
            </div>

            {dxAvatar && (
              <p className="text-xs text-cream/45 italic">Listo. Con esto tu ADN ya tiene su semilla. Tu plan: <strong className="text-gold not-italic">10 pacientes a tu precio digno y 10 horas menos por semana — en 90 días</strong>. Método CLINICA, una sesión por día.</p>
            )}

            <button
              onClick={guardarDiagnostico}
              disabled={!dxAvatar || dxSaving}
              className="w-full py-3.5 rounded-xl bg-gold text-ink font-bold text-sm hover:bg-goldhi transition-colors disabled:opacity-40"
            >
              {dxSaving ? 'Guardando…' : 'Continuar →'}
            </button>
          </div>
        )}

        {step === 'welcome' && (
          <div className="bg-panel border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-cream" />
            </div>

            <h1 className="text-2xl font-semibold text-cream mb-3">Bienvenido/a al dojo, {nombreCorto}</h1>
            <p className="text-sm text-gold/90 leading-relaxed mb-3 font-medium">
              Ya diste el primer paso más difícil: decidir que tu trabajo vale lo suficiente como para invertir en él. Eso mismo — cobrar con dignidad — es lo que vas a aprender a hacer con cada paciente.
            </p>
            <p className="text-sm text-cream/70 leading-relaxed mb-2">
              Estás por empezar un camino de 90 días: <strong className="text-cream/90">una sesión de trabajo por día</strong> (de 45 minutos a 2 horas; la primera semana, la del dinero, pide un poco más), de lunes a viernes. Cada sesión te deja algo construido. Cada hito se prueba con evidencia. Cada logro real gana un cinturón — 9 cinturones, del Blanco al Negro: <strong className="text-gold">10 pacientes de $1.000</strong>.
            </p>
            <p className="text-sm text-cream/80 leading-relaxed mb-6">
              <span className="text-gold font-semibold">Nuestro equipo</span> te acompaña en todo el proceso — seguimos tu progreso, respondemos tus dudas y te guiamos paso a paso. Puedes escribirnos en cualquier momento desde el Chat.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Map, label: 'El Camino', desc: 'Tu sesión de cada día. Todo pasa acá.' },
                { icon: Bot, label: 'Mentor IA', desc: 'Te acompaña y destraba. No hace tu trabajo.' },
                { icon: MessageSquare, label: 'Entrenadores', desc: 'Especialistas que aparecen cuando toca' },
              ].map(item => (
                <div key={item.label} className="bg-panel border border-[rgba(232,150,46,0.1)] rounded-2xl p-4">
                  <div className="mb-2"><item.icon className="w-6 h-6 text-gold" /></div>
                  <p className="text-xs font-semibold text-cream mb-1">{item.label}</p>
                  <p className="text-[11px] text-cream/55">{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('pacto')}
              className="w-full py-4 rounded-xl bg-gold hover:bg-goldhi text-ink text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
            >
              <ArrowRight className="w-4 h-4" /> Continuar
            </button>
          </div>
        )}


        {/* ── STEP: EL PACTO ── */}
        {step === 'pacto' && (
          <div className="bg-panel border border-[rgba(232,150,46,0.18)] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">🥋</p>
              <h1 className="text-2xl font-semibold text-cream mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>El Pacto</h1>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold">En el dojo, la palabra empeñada es el primer cinturón</p>
            </div>

            <div className="rounded-2xl border border-cream/10 bg-[#0F0F0F] p-5 mb-5">
              <p className="text-sm text-cream/80 leading-relaxed">
                Esto no es un formulario. Es una promesa — y las promesas se hacen con nombre y apellido.
              </p>
              <p className="text-sm text-cream/80 leading-relaxed mt-3">
                <strong className="text-cream">A los tuyos:</strong> a quienes te formaron y a quienes dependen de ti.{' '}
                <strong className="text-cream">A tus pacientes:</strong> a los que ya ayudaste y a los diez que todavía no te encontraron.{' '}
                <strong className="text-cream">Y a ti:</strong> al profesional que hoy decide dejar de sobrevivir.
              </p>
              <p className="text-sm text-gold/90 leading-relaxed mt-3 font-medium">
                Mi primer compromiso: llegar al Cinturón Amarillo — sanar mi relación con el dinero — antes del día 10.
              </p>
            </div>

            <label className="text-[11px] uppercase tracking-widest text-gold font-bold">Escribe tu pacto con tus palabras (por qué haces esto, por quién)</label>
            <textarea
              value={pactoTexto}
              onChange={(e) => setPactoTexto(e.target.value)}
              rows={4}
              placeholder="Hago este camino porque…"
              className="w-full mt-1.5 mb-4 px-4 py-3 rounded-xl bg-ink border border-cream/15 text-cream text-sm focus:border-gold/50 focus:outline-none resize-none"
            />
            <label className="text-[11px] uppercase tracking-widest text-gold font-bold">Tu firma (nombre completo)</label>
            <input
              value={pactoFirma}
              onChange={(e) => setPactoFirma(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full mt-1.5 mb-6 px-4 py-3 rounded-xl bg-ink border border-cream/15 text-cream text-sm italic focus:border-gold/50 focus:outline-none"
              style={{ fontFamily: 'var(--font-display)' }}
            />
            <button
              onClick={() => {
                if (pactoTexto.trim().length < 20 || pactoFirma.trim().length < 5) return;
                try {
                  localStorage.setItem('tcd_pacto', JSON.stringify({ texto: pactoTexto.trim(), firma: pactoFirma.trim(), fecha: new Date().toISOString() }));
                } catch { /* noop */ }
                setStep('guide');
              }}
              disabled={pactoTexto.trim().length < 20 || pactoFirma.trim().length < 5}
              className="w-full py-4 rounded-xl bg-gold hover:bg-goldhi text-ink text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
            >
              FIRMO MI PACTO
            </button>
            <p className="text-[11px] text-cream/45 text-center mt-3">Tu pacto queda guardado. Lo vas a volver a leer el día de tu graduación.</p>
          </div>
        )}

        {/* ── STEP 4: GUIDE ── */}
        {step === 'guide' && (
          <div className="bg-panel border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Rocket className="w-5 h-5 text-cream" />
              </div>
              <h1 className="text-xl font-semibold text-cream mb-2">¿Por dónde empezar?</h1>
              <p className="text-sm text-cream/75">Estos son tus primeros 3 pasos concretos:</p>
            </div>

            <div className="space-y-3 mb-8">
              {([
                {
                  num: '1',
                  icon: Map,
                  title: 'Abre El Camino',
                  desc: 'Tu sesión de hoy te espera: el Día 1 completo — tu Foto de Partida. Una sesión por día, todo se hace ahí.',
                  styles: {
                    card: 'bg-gold/5 border-gold/20 hover:bg-gold/10',
                    icon: 'bg-gold/20',
                    iconColor: 'text-gold',
                    step: 'text-gold/60',
                    title: 'text-gold',
                    arrow: 'text-gold/40 group-hover:text-gold',
                  },
                  page: 'roadmap',
                },
                {
                  num: '2',
                  icon: MessageSquare,
                  title: 'Conoce tu ritmo',
                  desc: 'Lunes a viernes: tu sesión (45 min a 2 h). Sábado y domingo: descanso — tu racha queda protegida.',
                  styles: {
                    card: 'bg-gold/5 border-gold/20 hover:bg-gold/10',
                    icon: 'bg-gold/20',
                    iconColor: 'text-gold',
                    step: 'text-gold/60',
                    title: 'text-gold',
                    arrow: 'text-gold/40 group-hover:text-gold',
                  },
                  page: 'mensajes',
                },
                {
                  num: '3',
                  icon: Bot,
                  title: 'Prueba el Mentor IA',
                  desc: 'Tu guía del camino. Pregúntale cuando te trabes — te destraba y te devuelve a tu sesión. Él no hace tu trabajo: te acompaña.',
                  styles: {
                    card: 'bg-gold/5 border-gold/20 hover:bg-gold/10',
                    icon: 'bg-gold/20',
                    iconColor: 'text-gold',
                    step: 'text-gold/60',
                    title: 'text-gold',
                    arrow: 'text-gold/40 group-hover:text-gold',
                  },
                  page: 'coach',
                },
              ] as const).map(item => (
                <button
                  key={item.num}
                  onClick={() => handleComplete(item.page)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group ${item.styles.card}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.styles.icon}`}>
                      <item.icon className={`w-4 h-4 ${item.styles.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${item.styles.step}`}>Paso {item.num}</span>
                      <p className={`text-sm font-semibold mb-0.5 mt-0.5 ${item.styles.title}`}>{item.title}</p>
                      <p className="text-xs text-cream/55 leading-relaxed">{item.desc}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-colors shrink-0 mt-2 ${item.styles.arrow}`} />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleComplete('dashboard')}
              className="w-full py-3 rounded-xl bg-gold/5 border border-[rgba(232,150,46,0.12)] hover:bg-gold/10 text-cream/75 hover:text-cream text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Ir al dashboard primero
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
