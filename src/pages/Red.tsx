/**
 * Red — T12 · LA RED (Plan Maestro).
 * Dos secciones: la Semana Blanca regalable (tus llaves del mes, con atribución
 * y premio) y La Herencia de la cohorte (objeciones y hooks reales, anónimos).
 * Degrada con elegancia: sin las tablas/RPCs, muestra estados vacíos cálidos.
 */
import React, { useEffect, useState } from 'react';
import { Users, Gift, Copy, Check, KeyRound, Sparkles, Send, Shield, Flame } from 'lucide-react';
import {
  generarInvitacion,
  misInvitaciones,
  llavesEsteMes,
  linkInvitacion,
  getHerencia,
  postHerencia,
  LLAVES_POR_MES,
  PREMIO_TEXTO,
  type Invitacion,
  type HerenciaEntry,
  type TipoHerencia,
} from '../lib/red';

function tiempoRel(iso?: string): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 60) return `hace ${Math.max(1, min)} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export default function Red({ userId }: { userId?: string }) {
  const [invs, setInvs] = useState<Invitacion[]>([]);
  const [herencia, setHerencia] = useState<HerenciaEntry[] | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [avisoInv, setAvisoInv] = useState<string | null>(null);

  // Form Herencia
  const [tipo, setTipo] = useState<TipoHerencia>('objecion');
  const [texto, setTexto] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [posteando, setPosteando] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (userId) {
        const i = await misInvitaciones(userId);
        if (vivo) setInvs(i);
      }
      const h = await getHerencia();
      if (vivo) setHerencia(h);
    })();
    return () => {
      vivo = false;
    };
  }, [userId]);

  const usadas = llavesEsteMes(invs);
  const restantes = Math.max(0, LLAVES_POR_MES - usadas);
  const redimidas = invs.filter((i) => i.estado === 'redimida').length;

  const generar = async () => {
    setGenerando(true);
    setAvisoInv(null);
    const r = await generarInvitacion();
    if (r.error) {
      setAvisoInv(r.error);
    } else if (userId) {
      setInvs(await misInvitaciones(userId));
    }
    setGenerando(false);
  };

  const copiar = (codigo: string) => {
    try {
      void navigator.clipboard.writeText(linkInvitacion(codigo));
      setCopiado(codigo);
      setTimeout(() => setCopiado(null), 1800);
    } catch {
      /* noop */
    }
  };

  const publicar = async () => {
    if (!texto.trim()) return;
    setPosteando(true);
    const ok = await postHerencia({ tipo, texto: texto.trim(), respuesta: respuesta.trim() || undefined });
    if (ok) {
      setTexto('');
      setRespuesta('');
      setHerencia(await getHerencia());
    }
    setPosteando(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-[#F2EFE9] tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-[#E8962E]" /> La Red
        </h1>
        <p className="text-sm text-[#F2EFE9]/50 mt-1">
          Nadie sana solo. Regalá la Semana Blanca a quien lo necesita, y dejale a la cohorte lo que
          aprendiste en el campo.
        </p>
      </div>

      {/* ── Semana Blanca regalable ── */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-4 h-4 text-[#E8962E]" />
          <h2 className="text-[11px] font-bold text-[#F2EFE9] tracking-widest uppercase">
            Regalá la Semana Blanca
          </h2>
        </div>
        <p className="text-sm text-[#F2EFE9]/55 mb-4">
          Tenés <span className="text-[#E8962E] font-bold">{restantes}</span> de {LLAVES_POR_MES} llaves
          este mes. Cada llave le abre a un colega la primera semana del Camino.
        </p>

        {/* Premio */}
        <div className="rounded-xl bg-[#E8962E]/[0.06] border border-[#E8962E]/20 p-3 mb-4 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#E8962E] mt-0.5 shrink-0" />
          <p className="text-xs text-[#F2EFE9]/75 leading-relaxed">
            Por cada fundador que entra con tu llave, ganás <span className="text-[#E8962E] font-medium">{PREMIO_TEXTO}</span>.
            {redimidas > 0 ? (
              <span className="block mt-1 text-[#22C55E]">
                Ya {redimidas === 1 ? 'entró' : 'entraron'} {redimidas} con tu llave. 🥋
              </span>
            ) : null}
          </p>
        </div>

        {/* Llaves */}
        {invs.length > 0 ? (
          <div className="space-y-2 mb-4">
            {invs.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5"
              >
                <KeyRound className="w-4 h-4 text-[#E8962E] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-[#F2EFE9] truncate">{inv.codigo}</p>
                  <p
                    className={`text-[10px] uppercase tracking-wider font-bold ${
                      inv.estado === 'redimida' ? 'text-[#22C55E]' : 'text-[#F2EFE9]/35'
                    }`}
                  >
                    {inv.estado === 'redimida' ? 'Redimida · un colega entró' : 'Sin usar'}
                  </p>
                </div>
                {inv.estado !== 'redimida' ? (
                  <button
                    onClick={() => copiar(inv.codigo)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E8962E]/12 border border-[#E8962E]/30 text-[#E8962E] text-[10px] font-bold uppercase tracking-wider hover:bg-[#E8962E]/20 transition-colors"
                  >
                    {copiado === inv.codigo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiado === inv.codigo ? 'Copiado' : 'Copiar link'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {avisoInv ? <p className="text-[11px] text-[#E8962E] mb-3">{avisoInv}</p> : null}

        <button
          onClick={generar}
          disabled={generando || restantes <= 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E8962E] text-[#080808] text-sm font-bold uppercase tracking-wider hover:bg-[#F4B65C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <KeyRound className="w-4 h-4" />
          {restantes <= 0 ? 'Sin llaves este mes' : generando ? 'Generando…' : 'Generar una llave'}
        </button>
      </div>

      {/* ── La Herencia de la cohorte ── */}
      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#E8962E]" />
          <h2 className="text-[11px] font-bold text-[#F2EFE9] tracking-widest uppercase">
            La Herencia de la cohorte
          </h2>
        </div>
        <p className="text-sm text-[#F2EFE9]/55 mb-4">
          Lo que aprendés en una llamada real vale oro para el que viene atrás. Dejá una objeción que
          te tiraron —y cómo la trabajaste— o un hook que funcionó.
        </p>

        {/* Form */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 mb-5">
          <div className="flex gap-2 mb-3">
            {(['objecion', 'hook'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                  tipo === t
                    ? 'bg-[#E8962E]/15 border-[#E8962E]/40 text-[#E8962E]'
                    : 'bg-transparent border-white/10 text-[#F2EFE9]/50 hover:border-white/25'
                }`}
              >
                {t === 'objecion' ? 'Una objeción' : 'Un hook'}
              </button>
            ))}
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            placeholder={tipo === 'objecion' ? 'La objeción, tal cual te la dijeron…' : 'El hook que enganchó…'}
            className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F2EFE9] placeholder-white/25 focus:border-[#E8962E]/50 focus:outline-none resize-none mb-2"
          />
          {tipo === 'objecion' ? (
            <textarea
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={2}
              placeholder="Cómo la trabajaste (lo que te funcionó)…"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F2EFE9] placeholder-white/25 focus:border-[#E8962E]/50 focus:outline-none resize-none mb-2"
            />
          ) : null}
          <button
            onClick={publicar}
            disabled={posteando || !texto.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8962E]/15 border border-[#E8962E]/30 text-[#E8962E] text-xs font-bold uppercase tracking-wider hover:bg-[#E8962E]/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" /> {posteando ? 'Dejando…' : 'Dejar en la Herencia'}
          </button>
        </div>

        {/* Feed */}
        {herencia && herencia.length > 0 ? (
          <div className="space-y-3">
            {herencia.map((h, i) => (
              <div key={h.id ?? i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      h.tipo === 'hook'
                        ? 'bg-[#22C55E]/15 text-[#22C55E]'
                        : 'bg-[#E8962E]/15 text-[#E8962E]'
                    }`}
                  >
                    {h.tipo === 'hook' ? 'Hook' : 'Objeción'}
                  </span>
                  <span className="text-[10px] text-[#F2EFE9]/35">
                    {h.es_tu ? 'Vos' : h.alias} · {tiempoRel(h.created_at)}
                  </span>
                </div>
                <p className="text-sm text-[#F2EFE9]/90 leading-relaxed">{h.texto}</p>
                {h.respuesta ? (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#22C55E]/[0.06] border border-[#22C55E]/15 px-3 py-2">
                    <Flame className="w-3.5 h-3.5 text-[#22C55E] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#F2EFE9]/75 leading-relaxed">{h.respuesta}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#F2EFE9]/50">
            Todavía no hay aportes. Sé el primero en dejarle algo a la cohorte — lo que a vos te costó,
            a otro le ahorra semanas.
          </p>
        )}
        <p className="text-[10px] text-[#F2EFE9]/30 mt-3">
          Los aportes son anónimos. Se comparte la experiencia, no el nombre.
        </p>
      </div>
    </div>
  );
}
