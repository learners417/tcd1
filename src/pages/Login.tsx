import React, { useState } from 'react';
import { Stethoscope, Eye, EyeOff, Lock, Mail, Loader2, X } from 'lucide-react';
import { signIn, sendPasswordReset } from '../lib/auth';
import { toast } from 'sonner';
import { mensajeDeFalla } from '../lib/conexion';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      /*
       * «Credenciales incorrectas» NO vale para todas las fallas.
       *
       * Si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` al publicar,
       * `signIn` devuelve «Supabase no configurado» y acá se leía «verifica tu
       * email y contraseña». El cliente que acaba de pagar la prueba diez
       * veces, pide recuperar la contraseña —que tampoco funciona— y escribe
       * convencido de que se equivocó él. Y del otro lado nadie puede
       * adivinarlo, porque el síntoma que cuenta es el equivocado.
       *
       * La app no le dice al cliente qué variable falta: eso no le sirve de
       * nada. Le dice que el problema no es suyo y qué hacer.
       */
      if (/no configurado|invalid api key/i.test(error)) {
        toast.error('La app todavía no está disponible. No es tu contraseña: escríbenos por WhatsApp y lo resolvemos.');
        return;
      }
      /*
       * El email sin confirmar es el otro caso que se leía como contraseña
       * equivocada, y es el que más le puede pasar a un cliente nuevo: las
       * altas por GHL y por migración ponen `email_confirm: true` con la clave
       * de servicio, pero el alta desde el panel usa `signUp()` desde el
       * navegador, que no puede confirmar nada. Ese cliente entra con sus
       * datos bien y lee que se equivocó.
       */
      if (/email not confirmed|not confirmed/i.test(error)) {
        toast.error('Tu cuenta todavía no está habilitada. No es tu contraseña: escríbenos por WhatsApp y la habilitamos.');
        return;
      }
      /*
       * Y lo que no es ni la contraseña ni la cuenta —quedarse sin señal, un
       * 500 de la base— lo traduce el mismo ayudante que usa el resto de la
       * app, para que el cliente lea siempre la misma voz.
       */
      if (/failed to fetch|network|fetch|timeout|50\d/i.test(error)) {
        toast.error(mensajeDeFalla(new Error(error), 'entrar'));
        return;
      }
      toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
      return;
    }

    onLogin();
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    const { error } = await sendPasswordReset(resetEmail);
    setResetLoading(false);
    if (error) {
      toast.error(mensajeDeFalla(error, 'enviar el correo'));
      return;
    }
    toast.success('Te enviamos un mail con el link para recuperar tu contraseña.');
    setShowResetModal(false);
    setResetEmail('');
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-light text-cream tracking-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Tu Clínica Digital</h1>
          <p className="text-sm text-cream/55 mt-1">El camino de tu práctica · 90 días</p>
        </div>

        {/* Card */}
        <div className="card-ios p-8 backdrop-blur-sm">
          <h2 className="text-lg font-sans not-italic font-semibold text-cream mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-cream/75 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/55" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  className="w-full bg-black/20 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl py-3 pl-10 pr-4 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-cream/75 font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/55" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-black/20 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl py-3 pl-10 pr-10 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar la contraseña' : 'Ver la contraseña'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-cream/55 hover:text-cream/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3 rounded-xl bg-gold hover:bg-goldhi disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar al programa'
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setResetEmail(email); setShowResetModal(true); }}
            className="w-full min-h-[44px] text-center text-xs text-gold/70 hover:text-gold mt-4 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>

          <p className="text-center text-xs text-cream/45 mt-6">
            ¿Otros problemas? Escríbenos por WhatsApp y te respondemos.
          </p>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line, rgba(142,104,36,0.18))]">
              <h3 className="text-sm font-sans not-italic font-semibold text-cream">Recuperar contraseña</h3>
              <button
                onClick={() => setShowResetModal(false)}
                aria-label="Cerrar"
                className="-mr-2 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-cream/55 hover:text-cream hover:bg-cream/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleResetRequest} className="p-5 space-y-4">
              <p className="text-xs text-cream/75">
                Te enviaremos un mail con un link para que puedas fijar una nueva contraseña.
              </p>
              <div>
                <label className="block text-sm font-bold text-cream/55 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoFocus
                  disabled={resetLoading}
                  className="w-full bg-black/20 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-4 py-2.5 text-sm text-cream placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading || !resetEmail.trim()}
                className="w-full py-2.5 rounded-xl bg-gold hover:bg-goldhi disabled:opacity-50 text-ink text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                {resetLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Enviar mail de recuperación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
