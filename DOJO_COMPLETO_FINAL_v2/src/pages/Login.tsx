import React, { useState } from 'react';
import { Stethoscope, Eye, EyeOff, Lock, Mail, Loader2, X } from 'lucide-react';
import { signIn, sendPasswordReset } from '../lib/auth';
import { toast } from 'sonner';

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
      toast.error(`No se pudo enviar el mail: ${error}`);
      return;
    }
    toast.success('Te enviamos un mail con el link para recuperar tu contraseña.');
    setShowResetModal(false);
    setResetEmail('');
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E8962E]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#E8962E]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8962E] to-[#F4B65C] items-center justify-center shadow-lg shadow-[#E8962E]/20 mb-4">
            <Stethoscope className="w-8 h-8 text-[#080808]" />
          </div>
          <h1 className="text-2xl font-light text-[#F2EFE9] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Tu Clínica Digital</h1>
          <p className="text-sm text-[#F2EFE9]/40 mt-1">Programa de 90 días</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1917] border border-[rgba(232,150,46,0.12)] rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-[#F2EFE9] mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#F2EFE9]/60 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2EFE9]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl py-3 pl-10 pr-4 text-sm text-[#F2EFE9] placeholder-[#F2EFE9]/30 focus:outline-none focus:border-[#E8962E]/50 focus:ring-1 focus:ring-[#E8962E]/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#F2EFE9]/60 font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2EFE9]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl py-3 pl-10 pr-10 text-sm text-[#F2EFE9] placeholder-[#F2EFE9]/30 focus:outline-none focus:border-[#E8962E]/50 focus:ring-1 focus:ring-[#E8962E]/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2EFE9]/40 hover:text-[#F2EFE9]/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3 rounded-xl bg-[#E8962E] hover:bg-[#F4B65C] disabled:opacity-50 disabled:cursor-not-allowed text-[#080808] font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#E8962E]/20"
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
            className="w-full text-center text-xs text-[#E8962E]/70 hover:text-[#E8962E] mt-4 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>

          <p className="text-center text-xs text-[#F2EFE9]/30 mt-6">
            ¿Otros problemas? Contactá a tu coach por WhatsApp.
          </p>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(232,150,46,0.1)]">
              <h3 className="text-sm font-semibold text-[#F2EFE9]">Recuperar contraseña</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F2EFE9]/40 hover:text-[#F2EFE9] hover:bg-[#F2EFE9]/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleResetRequest} className="p-5 space-y-4">
              <p className="text-xs text-[#F2EFE9]/60">
                Te enviaremos un mail con un link para que puedas fijar una nueva contraseña.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoFocus
                  disabled={resetLoading}
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-2.5 text-sm text-[#F2EFE9] placeholder-[#F2EFE9]/30 focus:outline-none focus:border-[#E8962E]/50 transition-colors disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading || !resetEmail.trim()}
                className="w-full py-2.5 rounded-xl bg-[#E8962E] hover:bg-[#F4B65C] disabled:opacity-50 text-black text-sm font-bold transition-all flex items-center justify-center gap-2"
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
