/**
 * ADN.tsx — ADN del Negocio · v8 (mejoras.html · mayo 2026)
 *
 * Renderiza los 65 campos del ADN agrupados en las 7 secciones del documento
 * maestro v8: ID (Identidad) · META (Meta/Onboarding) · IRR (Irresistible) ·
 * NEG (Negocio · 5 ofertas) · INF (Infraestructura) · CAP (Captación) · MET (Métricas).
 *
 * Fuente de datos: se mergea el Profile con los outputs completados en hoja_de_ruta
 * (mapeados vía `adn_field` en roadmapSeed.ts).
 */

import { SEED_ROADMAP_V3 } from '../lib/roadmapSeed';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Fingerprint,
  User as UserIcon,
  Sparkles,
  DollarSign,
  Building2,
  Megaphone,
  BarChart3,
  Check,
  Circle,
  AlertCircle,
  Dna,
  Pencil,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import AdnPrint from '../components/AdnPrint';
import { supabase, isSupabaseReady } from '../lib/supabase';
import type { ProfileV2 } from '../lib/supabase';
import { SEED_ROADMAP_V8 } from '../lib/roadmapSeed';
import { type ADNCampo,
  ADN_SCHEMA_V8,
  calcularCompletitudSeccion,
  calcularCompletitudTotal,
  campoEstaCompleto,
  getADNValor,
  type ADNSeccion,
  type ADNSeccionCodigo,
} from '../lib/adnSchema';
import { usePersistedState, setSerializers } from '../lib/usePersistedState';

// L3 · ADN SIMPLE: solo lo que las herramientas y agentes usan de verdad — el resto llega caminando
const CAMPOS_VIVOS = new Set([
  'adn_autoevaluacion_dia1', 'adn_avatar', 'adn_avatar_journey', 'adn_emails_nurture',
  'adn_escenarios_roas', 'adn_landing_copy', 'adn_micronicho', 'adn_nicho',
  'adn_oferta_mid', 'adn_oferta_ultralow', 'adn_pacientes_reales', 'adn_proceso_actual',
  'adn_protocolo_entrega', 'adn_script_ventas', 'adn_transformaciones', 'adn_triage_audios',
  'adn_usp', 'adn_validacion_organica',
]);
const SECCIONES_VIVAS = ADN_SCHEMA_V8
  .map((s) => ({
    ...s,
    campos: s.campos.filter((c) => {
      const raiz = (c.profilePath ?? String(c.profileKey ?? '')).split('.')[0];
      return CAMPOS_VIVOS.has(raiz);
    }),
  }))
  .filter((s) => s.campos.length > 0);

// ═══ Lote 3 · EL CONSOLIDADO POR ESENCIA ═══
// El ADN se muestra por la esencia del negocio (lo que NO cambia con una
// tendencia), no por fases internas. 9 bloques, mapeados a los campos vivos.
const ESENCIA_DEF: { codigo: string; titulo: string; sub: string; codigos: string[] }[] = [
  { codigo: 'E1', titulo: 'Tu Historia', sub: 'Quién eres — en 30 segundos', codigos: ['ID.historia_corta_50'] },
  { codigo: 'E2', titulo: 'Tu Propósito', sub: 'Para qué haces lo que haces', codigos: ['ID.proposito_frase'] },
  { codigo: 'E3', titulo: 'Tu Legado', sub: 'Lo que queda cuando no estés', codigos: ['ID.legado_declaracion'] },
  { codigo: 'E4', titulo: 'Tu Nicho', sub: 'A quién servís mejor', codigos: ['IRR.nicho', 'IRR.micronicho'] },
  { codigo: 'E5', titulo: 'Tus Avatares', sub: 'Las personas reales de tu nicho', codigos: ['IRR.avatar_demografia', 'IRR.avatar_psicografia', 'IRR.avatar_conexion_historia'] },
  { codigo: 'E6', titulo: 'La Matriz compartida', sub: 'El infierno, los obstáculos y el cielo que tus avatares comparten', codigos: ['IRR.matriz_a_infierno', 'IRR.matriz_b_obstaculos', 'IRR.matriz_c_cielo'] },
  { codigo: 'E7', titulo: 'Tu Método único', sub: 'Las siglas — cada letra, un paso', codigos: ['IRR.metodo_nombre', 'IRR.metodo_pasos'] },
  { codigo: 'E8', titulo: 'Tu Escalera de Ofertas', sub: 'Del imán a lo premium', codigos: ['NEG.lead_magnet', 'NEG.oferta_ultralow', 'NEG.oferta_low', 'NEG.oferta_mid', 'NEG.oferta_high'] },
  { codigo: 'E9', titulo: 'Tu Sistema de Captación', sub: 'Los 8 activos que venden por ti — se afinan, no se reinventan', codigos: ['IRR.puv', 'INF.perfil_ig_optimizado', 'NEG.lead_magnet', 'INF.anuncios_meta_6_creativos', 'INF.anuncio_followme', 'INF.landing_copy_completo', 'INF.vsl_script', 'CAP.protocolo_entrega'] },
];
const _todosCampos = ADN_SCHEMA_V8.flatMap((sec) => sec.campos);
const SECCIONES_ESENCIA = ESENCIA_DEF.map((e) => ({
  codigo: e.codigo as unknown as ADNSeccionCodigo,
  titulo: e.titulo,
  subtitulo: e.sub,
  pilarRange: e.sub,
  campos: e.codigos.map((c) => _todosCampos.find((f) => f.codigo === c)).filter(Boolean) as typeof _todosCampos,
})).filter((sec) => sec.campos.length > 0);

import { PAISES } from '../lib/vozLocalizada';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'sonner';

interface ADNProps {
  perfil: Partial<ProfileV2>;
  userId?: string;
  setCurrentPage: (page: string) => void;
  /**
   * Notifica al contenedor (App.tsx) que cambiaron campos del perfil para que
   * sincronice su estado local. Sin esto, el guardado va a DB pero el cache
   * en memoria sigue viejo · al navegar afuera y volver, el campo recien
   * guardado se ve vacio.
   */
  onProfileFieldUpdate?: (fields: Record<string, unknown>) => void;
}

const ICONOS_SECCION: Record<ADNSeccionCodigo, LucideIcon> = {
  ID: Fingerprint,
  META: UserIcon,
  IRR: Sparkles,
  NEG: DollarSign,
  INF: Building2,
  CAP: Megaphone,
  MET: BarChart3,
};

// ── Helpers de visualización ──────────────────────────────────────────────────

function formatearValor(valor: unknown): string {
  if (valor === undefined || valor === null) return '—';
  if (typeof valor === 'string') return valor;
  if (Array.isArray(valor)) return valor.filter((v) => v).join(' · ');
  if (typeof valor === 'object') {
    try {
      return JSON.stringify(valor, null, 2);
    } catch {
      return String(valor);
    }
  }
  return String(valor);
}

// ── Componente: Tarjeta de sección ────────────────────────────────────────────

interface TarjetaSeccionProps {
  seccion: ADNSeccion;
  perfil: Partial<ProfileV2>;
  expandida: boolean;
  onToggle: () => void;
}

function TarjetaSeccion({ seccion, perfil, expandida, onToggle, onFieldSaved }: TarjetaSeccionProps & { onFieldSaved?: (fields: Record<string, unknown>) => void }) {
  const Icon = ICONOS_SECCION[seccion.codigo] ?? Dna;
  const permisosADN = (perfil.adn_edit_secciones as string[] | undefined) ?? [];
  const puedeEditar = permisosADN.includes('todas') || permisosADN.includes(seccion.codigo);
  const [editCodigo, setEditCodigo] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [guardandoCampo, setGuardandoCampo] = useState(false);

  async function guardarCampo(campo: ADNCampo) {
    if (!supabase || !campo.profileKey) return;
    setGuardandoCampo(true);
    try {
      const { error } = await supabase.rpc('user_update_adn', {
        seccion: seccion.codigo,
        updates: { [campo.profileKey]: editVal },
      });
      if (error) throw error;
      toast.success('Campo actualizado ✓');
      onFieldSaved?.({ [campo.profileKey]: editVal });
      setEditCodigo(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardandoCampo(false);
    }
  }
  const { completos, total, porcentaje } = calcularCompletitudSeccion(perfil, seccion);

  return (
    <div className="card-panel overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 hover:bg-gold/5 transition-colors text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-medium text-cream tracking-tight">{seccion.titulo}</h3>
            <span className="text-[10px] text-gold uppercase tracking-widest font-semibold">
              {seccion.codigo} · {seccion.pilarRange}
            </span>
          </div>
          <p className="text-sm text-cream/50 mt-0.5">{seccion.subtitulo}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-cream/40 uppercase tracking-wider">
              {completos} / {total}
            </p>
            <p className="text-base font-medium text-gold">{porcentaje}%</p>
          </div>
          {expandida ? (
            <ChevronUp className="w-5 h-5 text-cream/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-cream/40" />
          )}
        </div>
      </button>

      {/* Barra de progreso */}
      <div className="h-1 bg-gold/5">
        <div
          className="h-full bg-gold transition-all duration-500"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {expandida && (
        <div className="px-5 pb-5 pt-3 space-y-3">
          {seccion.campos.map((campo) => {
            const completo = campoEstaCompleto(perfil, campo);
            const valor = getADNValor(perfil, campo);
            const valorTexto = formatearValor(valor);
            return (
              <div
                key={campo.codigo}
                className="border-l-2 pl-4 py-2"
                style={{ borderColor: completo ? '#E8962E' : 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {completo && estadoDeCampo(true, campo.pilarOrigen, getCompletadasADN(), getHayVentasADN()) === 'preliminar' && (
                  <p className="text-[10px] text-gold/60 pl-5 italic mt-0.5">Preliminar — se ajusta con «{nombreDePaso(campo.pilarOrigen)}» en El Camino.</p>
                )}
                {completo ? (
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    ) : campo.pending ? (
                      <AlertCircle className="w-3.5 h-3.5 text-cream/30 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-cream/20 flex-shrink-0" />
                    )}
                    <p className="text-sm text-cream/90 font-medium truncate">{campo.label}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {puedeEditar && campo.profileKey && !campo.pending && (valor == null || typeof valor === 'string') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditCodigo(campo.codigo); setEditVal(typeof valor === 'string' ? valor : ''); }}
                        className="p-1 rounded-md text-gold/50 hover:text-gold hover:bg-gold/10 transition-all"
                        title="Editar este campo"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    {campo.criticoDia45 && (
                      <span className="text-[9px] uppercase tracking-widest text-gold font-semibold">
                        D45
                      </span>
                    )}
                    {(() => {
                      const est = estadoDeCampo(completo, campo.pilarOrigen, getCompletadasADN(), getHayVentasADN());
                      if (est === 'vacio') return <span className="text-[10px] text-cream/35 italic">{nombreDePaso(campo.pilarOrigen)}</span>;
                      const b = BADGE_ESTADO[est];
                      return (
                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${b.cls}`} title={est === 'preliminar' ? `Se ajusta con «${nombreDePaso(campo.pilarOrigen)}»` : est === 'confirmado' ? 'Confirmado en El Camino' : 'Validado por ventas reales'}>
                          {b.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                {editCodigo === campo.codigo ? (
                  <div className="mt-2 pl-5 space-y-2">
                    <textarea
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      rows={5}
                      className="w-full bg-ink border border-gold/30 rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold/60 resize-y"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => guardarCampo(campo)} disabled={guardandoCampo}
                        className="px-4 py-1.5 rounded-lg bg-gold hover:bg-goldhi disabled:opacity-50 text-black text-xs font-bold transition-all">
                        {guardandoCampo ? 'Guardando…' : 'Guardar'}
                      </button>
                      <button onClick={() => setEditCodigo(null)}
                        className="px-4 py-1.5 rounded-lg text-xs text-cream/50 hover:text-cream transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : completo ? (
                  <div className="prose prose-invert prose-sm max-w-none text-cream/60 text-sm mt-1 pl-5">
                    {typeof valor === 'string' && valor.length > 400 ? (
                      <Markdown>{valor}</Markdown>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{valorTexto}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-cream/30 pl-5 italic">
                    {campo.pending
                      ? 'Campo nuevo · se llenará cuando completes el pilar correspondiente.'
                      : `Se completa con «${nombreDePaso(campo.pilarOrigen)}» en El Camino.`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────



// El nombre humano de cada paso (el cliente jamás ve "P2.3")
const NOMBRE_PASO: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const p of SEED_ROADMAP_V3) for (const m of p.metas) map[m.codigo] = m.titulo;
  return map;
})();
const nombreDePaso = (codigo: string) => NOMBRE_PASO[codigo] ?? 'El Camino';

// ═══ El sistema de estados: PRELIMINAR → CONFIRMADO → VALIDADO ═══
type EstadoCampo = 'vacio' | 'preliminar' | 'confirmado' | 'validado';
const getCompletadasADN = (): Set<string> => {
  try { return new Set<string>(JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]')); } catch { return new Set<string>(); }
};
const getHayVentasADN = (): boolean => {
  try { const v = JSON.parse(localStorage.getItem('tcd_ventas') ?? '[]'); return Array.isArray(v) && v.length > 0; } catch { return false; }
};
function estadoDeCampo(tieneValor: boolean, pilarOrigen: string, completadas: Set<string>, hayVentas: boolean): EstadoCampo {
  if (!tieneValor) return 'vacio';
  const m = pilarOrigen.match(/^P(\d+)/);
  const pilarNum = m ? parseInt(m[1], 10) : -1;
  const pasoHecho = pilarNum >= 0 && completadas.has(`${pilarNum}-${pilarOrigen}`);
  if (pasoHecho && hayVentas) return 'validado';
  if (pasoHecho) return 'confirmado';
  return 'preliminar';
}
const BADGE_ESTADO: Record<Exclude<EstadoCampo, 'vacio'>, { label: string; cls: string }> = {
  preliminar: { label: 'Preliminar', cls: 'bg-gold/10 text-gold/80 border-gold/25' },
  confirmado: { label: 'Confirmado', cls: 'bg-goldhi/15 text-goldhi border-goldhi/40' },
  validado:   { label: '✓ Validado', cls: 'bg-success/15 text-success border-success/40' },
};


export default function ADN({ perfil, userId, setCurrentPage, onProfileFieldUpdate }: ADNProps) {
  const [hojaOutputs, setHojaOutputs] = useState<Record<string, string>>({});
  const [propSec, setPropSec] = useState<string>('');
  const [propTxt, setPropTxt] = useState('');
  const [propSending, setPropSending] = useState(false);
  const [seccionesExpandidas, setSeccionesExpandidas] = usePersistedState<Set<ADNSeccionCodigo>>(
    'tcd_adn_secciones',
    () => new Set(['IRR']),
    setSerializers<ADNSeccionCodigo>(),
  );
  const [paisLocal, setPaisLocal] = useState<string>(perfil.pais ?? '');
  const [savingPais, setSavingPais] = useState(false);

  // Mantener el selector sincronizado si el perfil llega despues del primer render.
  useEffect(() => {
    if (perfil.pais && perfil.pais !== paisLocal) setPaisLocal(perfil.pais);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil.pais]);

  async function guardarPais(nuevo: string) {
    setPaisLocal(nuevo);
    // Optimista: actualizamos el estado del contenedor para que al volver a
    // la pagina el selector siga mostrando el valor elegido (sin esto, la
    // navegacion descarta el cambio porque App.tsx tiene un cache viejo).
    onProfileFieldUpdate?.({ pais: nuevo });
    if (!isSupabaseReady() || !supabase || !userId) return;
    setSavingPais(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pais: nuevo })
        .eq('id', userId);
      if (error) throw error;
      toast.success('Pais guardado · la IA va a adaptar el contenido al tono local');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(
        msg.includes('column') && msg.includes('pais')
          ? 'Falta correr la migracion: ALTER TABLE profiles ADD COLUMN pais text'
          : 'No se pudo guardar el pais · probalo de nuevo',
      );
    } finally {
      setSavingPais(false);
    }
  }

  // Cargar outputs de hoja_de_ruta y mapear por adn_field
  useEffect(() => {
    if (!isSupabaseReady() || !supabase || !userId) return;
    supabase
      .from('hoja_de_ruta')
      .select('pilar_numero, meta_codigo, completada, output_generado')
      .eq('usuario_id', userId)
      .eq('completada', true)
      .then(({ data }) => {
        if (!data) return;
        const outputs: Record<string, string> = {};
        for (const row of data) {
          const pilar = SEED_ROADMAP_V8.find((p) => p.numero === row.pilar_numero);
          if (!pilar) continue;
          const meta = pilar.metas.find((m) => m.codigo === row.meta_codigo);
          if (!meta?.adn_field) continue;
          const texto = (row.output_generado as { texto?: unknown })?.texto;
          if (typeof texto === 'string' && texto.trim()) {
            // Historia 300 puede traer las 3 versiones concatenadas
            if (meta.adn_field === 'historia_300') {
              const m300 = texto.match(/---\s*HISTORIA\s+300\s+PALABRAS\s*---\s*([\s\S]*?)(?=---\s*HISTORIA\s+150|$)/i);
              const m150 = texto.match(/---\s*HISTORIA\s+150\s+PALABRAS\s*---\s*([\s\S]*?)(?=---\s*HISTORIA\s+50|$)/i);
              const m50 = texto.match(/---\s*HISTORIA\s+50\s+PALABRAS\s*---\s*([\s\S]*?)$/i);
              if (m300 && m150 && m50) {
                outputs.historia_300 = m300[1].trim();
                outputs.historia_150 = m150[1].trim();
                outputs.historia_50 = m50[1].trim();
              } else {
                outputs.historia_300 = texto;
              }
            } else {
              outputs[meta.adn_field] = texto;
            }
          }
        }
        setHojaOutputs(outputs);
      });
  }, [userId]);

  // Merge profile + outputs para vista completa
  const mergedPerfil = useMemo(() => {
    const merged = { ...perfil } as Record<string, unknown>;
    for (const [key, val] of Object.entries(hojaOutputs)) {
      if (!merged[key] || (typeof merged[key] === 'string' && !(merged[key] as string).trim())) {
        merged[key] = val;
      }
    }
    return merged as Partial<ProfileV2>;
  }, [perfil, hojaOutputs]);

  const totalStats = calcularCompletitudTotal(mergedPerfil);

  const toggleSeccion = (codigo: ADNSeccionCodigo) => {
    setSeccionesExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-[10px] text-gold uppercase tracking-widest font-semibold">
          Las 7 letras del Método CLINICA · tu negocio, documentado
        </p>
        <h1 className="text-3xl md:text-4xl font-light text-cream tracking-tight">
          ADN del Negocio
        </h1>
          <p className="text-sm text-cream/55 mt-1">El producto de tus 90 días: <span className="text-goldhi">tu ADN validado</span> — la data que te permite generar 10 pacientes de $1.000 todos los meses. Se construye solo, desde El Camino: cada respuesta que das lo pule. Aquí no se edita — aquí se contempla lo que ya es tuyo.</p>
        <p className="text-sm text-cream/50 mt-2 max-w-xl leading-relaxed">Tu ADN no se edita acá — <strong className="text-cream/75">se construye desde El Camino</strong>, ejercicio a ejercicio. Este es el genoma de tu negocio — se llena solo a medida que avanzás en El Camino. Tu <strong className="text-gold">PUV</strong> (la frase que responde "¿por qué a mí?") es su corazón: de ahí nace tu oferta, tu página y tus anuncios.</p>
        <p className="text-cream/60 max-w-2xl">
          <strong className="text-cream/85">¿Qué es tu ADN?</strong> Es la identidad completa de tu negocio: tu método, tu avatar,
          tu oferta, tu script — todo lo que construyes en los 90 días queda guardado aquí, organizado por las 7 letras de CLINICA.
          Tu Mentor y tus entrenadores lo leen para personalizar TODO lo que te dicen y generan.
          <span className="block mt-2 text-gold/90">No se llena a mano: se completa solo, a medida que haces las tareas de El Camino. Si ves campos vacíos, el camino los va a llenar.</span>
        </p>
      </div>

      {/* Resumen global */}
      <div className="card-panel p-6 flex items-center gap-6">
        <div className="flex-1">
          <p className="text-xs text-cream/40 uppercase tracking-widest mb-1 font-semibold">
            Progreso del ADN
          </p>
          <p className="text-3xl font-light text-cream tracking-tight">
            {totalStats.porcentaje}%
            <span className="text-sm text-cream/40 ml-2">
              ({totalStats.completos} de {totalStats.total} campos)
            </span>
          </p>
          {(() => {
            const comps = getCompletadasADN();
            const ventas = getHayVentasADN();
            let val = 0, conf = 0, prel = 0, vac = 0;
            for (const sec of ADN_SCHEMA_V8) for (const c of sec.campos) {
              const tiene = Boolean((mergedPerfil as Record<string, unknown>)[c.profileKey]);
              const est = estadoDeCampo(tiene, c.pilarOrigen, comps, ventas);
              if (est === 'validado') val++; else if (est === 'confirmado') conf++; else if (est === 'preliminar') prel++; else vac++;
            }
            const total = val + conf + prel + vac || 1;
            return (
              <div className="mt-3">
                <div className="h-2.5 rounded-full overflow-hidden flex bg-black/30">
                  <div style={{ width: `${(val / total) * 100}%`, background: '#22C55E' }} />
                  <div style={{ width: `${(conf / total) * 100}%`, background: '#F4B65C' }} />
                  <div style={{ width: `${(prel / total) * 100}%`, background: 'rgba(232,150,46,0.45)' }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px]">
                  <span className="text-success">⬤ {val} validados</span>
                  <span className="text-goldhi">⬤ {conf} confirmados</span>
                  <span className="text-gold/70">⬤ {prel} preliminares</span>
                  <span className="text-cream/35">○ {vac} por construir</span>
                </div>
              </div>
            );
          })()}
        </div>
        <button
          type="button"
          onClick={() => setCurrentPage('roadmap')}
          className="btn-primary text-sm whitespace-nowrap"
        >
          Ir a El Camino
        </button>
      </div>

      {/* Pais del profesional — afecta el tono del contenido publicable */}
      <div className="card-panel p-6 space-y-3">
        <div className="min-w-0">
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">
            Localizacion
          </p>
          <p className="text-sm font-semibold text-cream">Pais del profesional</p>
          <p className="text-xs text-cream/50 mt-1 leading-relaxed max-w-xl">
            La IA adapta el tono de las respuestas y de tu contenido (landing, anuncios, copies,
            guiones) a la forma de hablar de tu pais. La voz del Mentor hacia ti no cambia.
          </p>
        </div>
        <CustomSelect
          value={paisLocal}
          onChange={guardarPais}
          placeholder={savingPais ? 'Guardando…' : 'Elegi tu pais'}
          options={PAISES.map((p) => ({ value: p.codigo, label: p.nombre }))}
          className="w-full"
        />
      </div>

      {/* Secciones */}
      <div className="space-y-4">
        {SECCIONES_ESENCIA.map((seccion) => (
          <TarjetaSeccion
            key={seccion.codigo}
            seccion={seccion}
            perfil={mergedPerfil}
            onFieldSaved={(fields) => onProfileFieldUpdate?.(fields)}
            expandida={seccionesExpandidas.has(seccion.codigo)}
            onToggle={() => toggleSeccion(seccion.codigo)}
          />
        ))}
      </div>

      {/* ── Descargar como PDF ── */}
      <div className="flex justify-center pt-2">
        <AdnPrint
          nombreCliente={(mergedPerfil.nombre as string) ?? 'Tu clínica'}
          especialidad={(mergedPerfil.especialidad as string) ?? undefined}
          version="v8"
          secciones={SECCIONES_VIVAS.map((s) => ({
            titulo: s.titulo,
            subtitulo: s.codigo,
            campos: s.campos
              .map((c) => ({ label: c.label, valor: formatearValor(getADNValor(mergedPerfil, c)) }))
              .filter((c) => c.valor && c.valor.trim() && c.valor.trim() !== '—'),
          })).filter((s) => s.campos.length > 0)}
        />
      </div>

      {/* ── Proponer un ajuste (el ADN se trabaja junto al mentor) ── */}
      <div className="bg-panel border border-[rgba(232,150,46,0.12)] rounded-2xl p-5 mt-4">
        <h3 className="text-sm font-semibold text-cream mb-1">¿Ves algo para ajustar?</h3>
        <p className="text-xs text-cream/40 mb-4">
          Tu ADN se trabaja junto a tu mentor. Contanos qué cambiarías y lo revisan juntos en tu próxima sesión.
        </p>
        <div className="space-y-3">
          <CustomSelect
            value={propSec}
            onChange={setPropSec}
            placeholder="¿Sobre qué sección?"
            options={SECCIONES_VIVAS.map((s) => ({ value: s.codigo, label: s.titulo }))}
            className="w-full"
          />
          <textarea
            value={propTxt}
            onChange={(e) => setPropTxt(e.target.value)}
            placeholder="¿Qué cambiarías y por qué?"
            rows={3}
            className="w-full bg-ink border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-2.5 text-sm text-cream placeholder-cream/20 focus:outline-none focus:border-gold/50 resize-none"
          />
          <button
            onClick={async () => {
              if (!propTxt.trim() || !propSec) { toast.error('Elegí la sección y contanos el ajuste'); return; }
              if (!supabase || !userId) { toast.error('Sesión no disponible'); return; }
              setPropSending(true);
              try {
                const secTitulo = SECCIONES_VIVAS.find((s) => s.codigo === propSec)?.titulo ?? propSec;
                const { error } = await supabase.from('mensajes').insert({
                  canal: 'privado',
                  emisor_id: userId,
                  receptor_id: null,
                  contenido: `📝 PROPUESTA DE AJUSTE AL ADN · [${secTitulo}]\n${propTxt.trim()}`,
                });
                if (error) throw error;
                toast.success('Propuesta enviada a tu mentor 🙌');
                setPropTxt(''); setPropSec('');
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : 'No se pudo enviar');
              } finally {
                setPropSending(false);
              }
            }}
            disabled={propSending}
            className="w-full py-2.5 rounded-xl bg-gold/15 border border-gold/30 hover:bg-gold/25 disabled:opacity-50 text-gold text-sm font-bold transition-all"
          >
            {propSending ? 'Enviando...' : 'Enviar propuesta a mi mentor'}
          </button>
        </div>
      </div>

      <p className="text-xs text-cream/30 text-center pt-4">
        Versión alineada con el documento maestro v8 · método CLÍNICA
      </p>
    </div>
  );
}
