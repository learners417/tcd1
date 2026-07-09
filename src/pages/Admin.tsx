import React, { useState, useEffect, useRef, useCallback } from 'react';
import CustomSelect from '../components/CustomSelect';
import TasksPipeline from '../components/admin/TasksPipeline';
import MigrationWizard from '../components/admin/MigrationWizard';
import { calcularCinturon, cinturonDesdeProgreso } from '../lib/cinturones';
import { notificarMensajeAdmin } from '../lib/notifications';
import CintaCinturon from '../components/CintaCinturon';
import { esDiaDescanso, calcularRachaDesdeFechas } from '../lib/racha';
import NotificationBell from '../components/NotificationBell';
import AdminClienteADN from '../components/admin/AdminClienteADN';
import PreactivacionMatriz from '../components/admin/PreactivacionMatriz';
import {
  Users, Send, ChevronRight, X, Plus, Loader2,
  Stethoscope, CheckCircle2, Circle, LogOut,
  MessageSquare, BookOpen, BarChart2, Calendar,
  TrendingUp, TrendingDown, Sparkles, Bot,
  Hash, Trophy, Lock, Shield,
  CheckCheck, AlertTriangle, Image, Mic, Settings, Camera,
  Video, Trash2, Youtube, Play, ChevronDown, FileText,
  Globe, Flame, Star, DollarSign, Pencil,
  Sprout, Target, Sunrise, UserCircle, Lightbulb, Triangle,
  Cog, Building2, Megaphone, Phone, Handshake, Palette, BarChart3,
  Search, UsersRound, Check, ClipboardList, Menu, ClipboardCheck,
  Mail, KeyRound, Fingerprint, ChevronLeft, Sun, Moon, Rocket } from 'lucide-react';

const ADMIN_PILAR_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout, BookOpen, Target, Sunrise, UserCircle, Lightbulb, Triangle, Cog,
  Building2, Megaphone, Phone, Handshake, Palette, BarChart3,
};
import { supabase, type Profile, type ProfileV2, type Mensaje, type AdminNote, type UserStatus, type PilarId, isSupabaseReady, PILAR_ORDER, fetchProfileV2 } from '../lib/supabase';
import { STAGE_COLORS, SEMAFORO_BG } from '../lib/teamColors';
import { SEED_ROADMAP_V3, SEED_ROADMAP_V2 } from '../lib/roadmapSeed';
import { generateText } from '../lib/aiProvider';
import { usePersistedState } from '../lib/usePersistedState';
import { useAdminTheme } from '../lib/theme';
import { TAREAS_TAGS } from '../lib/diarioCalcs';
import { calcularEmbudoV3KPIs, postsTotales } from '../lib/funnelCalcs';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import Campanas from './Campanas';
import CreativosView from '../components/campanas/CreativosView';
import Markdown from 'react-markdown';

// ─── TIPOS Y CONSTANTES ─────────────────────────────────────────────────────────

type AdminRol = 'owner' | 'manager' | 'staff';
type MainTab = 'clientes' | 'pipeline' | 'mensajes' | 'metricas' | 'videos' | 'equipo' | 'campanas' | 'creativos' | 'tareas';
type DetalleTab = 'resumen' | 'diario' | 'evidencias' | 'mentor' | 'metricas' | 'mensajes' | 'notas' | 'adn';
type MensajesChannel = 'comunidad' | 'victorias' | 'consultas' | 'privados';

interface AdminProps {
  adminProfile: Profile;
  onSignOut: () => void;
}

interface ClienteConEstado extends Profile {
  dia_programa: number;
  semana_programa: number;
  semaforo: 'verde' | 'amarillo' | 'rojo' | 'gris';
  tareas_completadas: number;
  tareas_total: number;
  tareas_por_pilar: Record<number, number>;
  ultima_entrada_diario?: string;
  racha_diario: number;
  ventas_count: number;
  estado_garantia: 'en_camino' | 'en_riesgo' | 'activada';
  cinturon: { emoji: string; nombre: string; orden: number; metafora: string };
  dias_atraso: number;
  progreso_porcentaje: number;
}

interface AdminVideo {
  id: string;
  grupo?: string;
  pilar_id?: PilarId;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  duracion?: string;
}

interface AdminChecklistItem {
  id: string;
  admin_id: string;
  titulo: string;
  categoria: 'diaria' | 'semanal' | 'mensual';
  completada: boolean;
  fecha_completada?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ONBOARDING: { label: 'Onboarding', color: 'text-[#F2EFE9]/50',  bg: 'bg-[#F2EFE9]/5',  border: 'border-[#F2EFE9]/10' },
  ACTIVE:     { label: 'Activo',     color: 'text-[#22C55E]',      bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20' },
  PAUSED:     { label: 'Pausado',    color: 'text-[#E8962E]',      bg: 'bg-[#E8962E]/10', border: 'border-[#E8962E]/20' },
  COMPLETED:  { label: 'Completado', color: 'text-[#22C55E]',      bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20' },
  CHURNED:    { label: 'Inactivo',   color: 'text-[#EF4444]',      bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20' },
};

const STATUS_BADGE_COLOR: Record<string, string> = {
  ACTIVE:     '#22C55E',
  PAUSED:     '#E8962E',
  ONBOARDING: 'rgba(255,255,255,0.5)',
  CHURNED:    '#EF4444',
  COMPLETED:  '#22C55E',
};

const SEMAFORO_CONFIG = {
  verde:    { class: 'bg-[#22C55E] shadow-[0_0_8px_rgba(16,185,129,0.4)]', label: 'En ritmo',        text: 'text-[#22C55E]' },
  amarillo: { class: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]', label: 'Atención',   text: 'text-[#E8962E]' },
  rojo:     { class: 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]',  label: 'Necesita ayuda',  text: 'text-[#EF4444]' },
  gris:     { class: 'bg-gray-600',                                         label: 'Sin datos',       text: 'text-[#F2EFE9]/60' },
};

// Build pilar options from SEED_ROADMAP_V3
const PILAR_OPTIONS: { id: PilarId; label: string }[] = SEED_ROADMAP_V3.map(p => ({
  id: p.id,
  label: `${p.id} — ${p.titulo}`,
}));

const PIPELINE_STAGES: { label: string; sub: string; maxDay: number; fase: number; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { label: 'Onboarding',                sub: 'Día 1',      maxDay: 1,  fase: 0, icon: UserCircle },
  { label: 'F1 · Sanar el Dinero',      sub: 'Días 2–9',   maxDay: 9,  fase: 1, icon: Fingerprint },
  { label: 'F2 · Método y Oferta',      sub: 'Días 10–18', maxDay: 18, fase: 2, icon: Search },
  { label: 'F3 · Sistema Encendido',    sub: 'Días 19–33', maxDay: 33, fase: 3, icon: Sparkles },
  { label: 'F4 · Vender y Escalar',     sub: 'Días 34–90', maxDay: 90, fase: 4, icon: Rocket },
];

function getFaseFromProgress(tareas_completadas: number): number {
  const pilarId = derivePilarFromProgress(tareas_completadas);
  const pilar = SEED_ROADMAP_V3.find(p => p.id === pilarId);
  return pilar?.fase ?? 0;
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const PILAR_TO_GRUPO: Record<string, string> = {
  P0: 'A', P1: 'A', P2: 'A', P3: 'B', P4: 'B',
  P5: 'C', P6: 'C', P7: 'D', P8: 'D',
  P9A: 'E', P9B: 'E', P9C: 'E', P10: 'E', P11: 'E',
};

function calcDias(fecha_inicio: string): { dia: number; semana: number } {
  const diff = Math.floor((new Date().getTime() - new Date(fecha_inicio).getTime()) / (1000 * 60 * 60 * 24));
  const dia = Math.max(1, Math.min(90, diff + 1));
  return { dia, semana: Math.max(1, Math.min(12, Math.floor(diff / 7) + 1)) };
}

function derivePilarFromProgress(tareas_completadas: number): PilarId {
  let acum = 0;
  for (const pilar of SEED_ROADMAP_V3) {
    acum += pilar.metas.length;
    if (acum > tareas_completadas) return pilar.id;
  }
  return 'P11';
}

// ─── COMPONENTE CHAT GLOBAL ADMIN ────────────────────────────────────────────────

function GlobalChat({ canal, adminProfile }: { canal: string; adminProfile: Profile }) {
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const adminAvatarUrl = localStorage.getItem(`tcd_admin_avatar_${adminProfile.id}`) || '';

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    supabase
      .from('mensajes')
      .select('*, emisor:profiles!emisor_id(nombre, rol)')
      .eq('canal', canal)
      .order('created_at')
      .then(({ data }) => {
        if (data) setMessages(data as Mensaje[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`admin-global-${canal}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `canal=eq.${canal}` },
        async (payload) => {
          const { data } = await supabase!.from('mensajes').select('*, emisor:profiles!emisor_id(nombre, rol)').eq('id', payload.new.id).single();
          if (data) setMessages(prev => [...prev, data as Mensaje]);
        }
      ).subscribe();
    return () => { supabase!.removeChannel(channel); };
  }, [canal]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!supabase || !input.trim()) return;
    setEnviando(true);
    try {
      const { error } = await supabase.from('mensajes').insert({
        canal, emisor_id: adminProfile.id, contenido: input.trim()
      });
      if (error) throw error;
      setInput('');
    } catch {
      toast.error('Error enviando mensaje al canal');
    } finally {
      setEnviando(false);
    }
  }

  async function handleUploadFile(file: File, tipo: 'imagen' | 'audio') {
    if (!supabase) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? (tipo === 'imagen' ? 'jpg' : 'mp3');
      const path = `admin/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('mensajes-archivos').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('mensajes-archivos').getPublicUrl(data.path);
      const { error: msgErr } = await supabase.from('mensajes').insert({
        canal, emisor_id: adminProfile.id, contenido: '', tipo_archivo: tipo, archivo_url: publicUrl
      });
      if (msgErr) throw msgErr;
    } catch {
      toast.error('Error subiendo archivo. Verificá que el bucket exista en Supabase.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#1A1917]/30 border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f, 'imagen'); e.target.value = ''; }} />
      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadFile(f, 'audio'); e.target.value = ''; }} />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#E8962E] animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-gray-800 mb-4" />
            <p className="text-[#F2EFE9]/40">Este canal está en silencio. Rompelo vos.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.emisor_id === adminProfile.id;
            const isAdmin = m.emisor?.rol === 'admin';
            const senderName = m.emisor?.nombre ?? (isMe ? adminProfile.nombre : '?');
            const initial = senderName.charAt(0).toUpperCase();
            return (
              <div key={m.id} className={`flex gap-2.5 items-end max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                {isMe && adminAvatarUrl ? (
                  <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden border border-[#E8962E]/30">
                    <img loading="lazy" src={adminAvatarUrl} alt={senderName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                    isAdmin ? 'bg-[#E8962E]/20 border-[#E8962E]/30 text-[#E8962E]'
                             : 'bg-[#E8962E]/10 border-[rgba(232,150,46,0.12)] text-[#F2EFE9]'
                  }`}>
                    {isAdmin ? <Shield className="w-3.5 h-3.5" /> : initial}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] font-semibold px-1 ${isAdmin ? 'text-[#E8962E]' : 'text-[#F2EFE9]/40'} ${isMe ? 'text-right' : ''}`}>
                    {senderName}{isAdmin ? ' · Coach' : ''}
                  </span>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isMe ? 'bg-[#E8962E]/25 text-[#F2EFE9] border border-[#E8962E]/20 rounded-tr-sm'
                         : isAdmin ? 'bg-[#E8962E]/20 text-[#E8962E] border border-[#E8962E]/20 rounded-tl-sm'
                         : 'bg-[#1A1917]/60 text-[#F2EFE9]/90 border border-[rgba(232,150,46,0.12)] rounded-tl-sm'
                  }`}>
                    {m.tipo_archivo === 'imagen' && m.archivo_url && (
                      <img loading="lazy" src={m.archivo_url} alt="imagen" className="max-w-xs rounded-xl mb-2 cursor-pointer hover:opacity-90"
                           onClick={() => window.open(m.archivo_url)} />
                    )}
                    {m.tipo_archivo === 'audio' && m.archivo_url && (
                      <audio controls src={m.archivo_url} className="w-full mb-2 rounded-lg" />
                    )}
                    {m.contenido && <p>{m.contenido}</p>}
                    <p className={`text-[10px] mt-1.5 opacity-40 ${isMe ? 'text-right' : ''}`}>
                      {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[rgba(232,150,46,0.12)] shrink-0 bg-[#1A1917]/20">
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1 shrink-0">
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading}
              title="Subir imagen"
              className="w-10 h-10 rounded-xl bg-[#E8962E]/5 border border-[rgba(232,150,46,0.12)] hover:bg-[#E8962E]/10 flex items-center justify-center text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors disabled:opacity-50">
              <Image className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => audioInputRef.current?.click()} disabled={uploading}
              title="Subir audio"
              className="w-10 h-10 rounded-xl bg-[#E8962E]/5 border border-[rgba(232,150,46,0.12)] hover:bg-[#E8962E]/10 flex items-center justify-center text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors disabled:opacity-50">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={uploading ? 'Subiendo archivo...' : 'Enviar mensaje al canal...'}
            disabled={enviando || uploading}
            className="flex-1 bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg py-3 px-5 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || enviando || uploading}
            className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
          >
            {enviando || uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────

export default function Admin({ adminProfile, onSignOut }: AdminProps) {
  const adminRol: AdminRol = (adminProfile as any).admin_rol ?? 'owner';
  const VALID_MAIN_TABS: MainTab[] = ['clientes', 'pipeline', 'mensajes', 'metricas', 'videos', 'equipo', 'campanas', 'creativos', 'tareas'];
  const [mainTab, setMainTab] = usePersistedState<MainTab>(
    'tcd_admin_main_tab',
    'clientes',
    { validate: (v) => VALID_MAIN_TABS.includes(v) },
  );
  // ID de tarea pendiente de abrir vía notificación. Se setea desde el
  // handler de NotificationBell y se limpia cuando TasksPipeline abre el modal.
  const [pendingTareaId, setPendingTareaId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin_sidebar_collapsed') === '1';
  });
  useEffect(() => {
    try { localStorage.setItem('admin_sidebar_collapsed', sidebarCollapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [sidebarCollapsed]);
  const [channelUnread, setChannelUnread] = useState<Record<string, number>>({});

  // Clientes
  const [clientes, setClientes] = useState<ClienteConEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<ClienteConEstado | null>(null);
  const VALID_DETALLE_TABS: DetalleTab[] = ['resumen', 'diario', 'evidencias', 'mentor', 'metricas', 'mensajes', 'notas', 'adn'];
  const [detalleTab, setDetalleTab] = usePersistedState<DetalleTab>(
    'tcd_admin_detalle_tab',
    'resumen',
    { validate: (v) => VALID_DETALLE_TABS.includes(v) },
  );
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  // ── Evidencias del cliente (F-Admin: el visor) ──
  const [convsCliente, setConvsCliente] = useState<{ agente: string; mensajes: { role: string; content: string; timestamp?: string }[] }[]>([]);
  const [convsLoading, setConvsLoading] = useState(false);
  const cargarConversaciones = useCallback(async (clienteId: string) => {
    if (!supabase) return;
    setConvsLoading(true);
    try {
      const [agRes, coRes] = await Promise.all([
        supabase.from('agent_conversations').select('agent_id, messages, last_message_at').eq('user_id', clienteId)
        .order('last_message_at', { ascending: false }),
        supabase.from('coach_conversations').select('*').eq('user_id', clienteId).limit(1),
      ]);
      // El Mentor (coach_conversations) + los 8 entrenadores (agent_conversations), juntos.
      const coachRow = (coRes.data ?? [])[0] as { messages?: unknown; updated_at?: string } | undefined;
      const data = [
        ...(coachRow ? [{ agent_id: 'mentor', messages: coachRow.messages ?? [], last_message_at: coachRow.updated_at ?? null }] : []),
        ...(agRes.data ?? []),
      ];
      const NOMBRES: Record<string, string> = { coach: 'Mentor IA', diego: 'Diego (método)', sofi: 'Sofi (sistemas)', vera: 'Vera (oferta)', mateo: 'Mateo (contenido)', caro: 'Caro (grabación)', bruno: 'Bruno (WhatsApp)', lucas: 'Lucas (ventas)', ramiro: 'Ramiro (métricas)' };
      setConvsCliente((data ?? []).map((r: { agent_id: string; messages: unknown }) => ({
        agente: NOMBRES[r.agent_id] ?? r.agent_id,
        mensajes: ((r.messages ?? []) as { role: string; content: string; timestamp?: string }[]).filter((m) => m.role !== 'system'),
      })));
    } finally {
      setConvsLoading(false);
    }
  }, []);
  const [evidenciasCliente, setEvidenciasCliente] = useState<{ meta: string; archivos: { name: string; path: string }[] }[]>([]);
  const [evidenciasLoading, setEvidenciasLoading] = useState(false);
  const cargarEvidenciasCliente = useCallback(async (clienteId: string) => {
    if (!supabase) return;
    setEvidenciasLoading(true);
    try {
      const base = `evidencias/${clienteId}`;
      const { data: carpetas } = await supabase.storage.from('task-attachments').list(base, { limit: 60 });
      const resultado: { meta: string; archivos: { name: string; path: string }[] }[] = [];
      for (const c of carpetas ?? []) {
        if (!c.name || c.name.startsWith('.')) continue;
        const { data: archivos } = await supabase.storage.from('task-attachments').list(`${base}/${c.name}`, { limit: 20 });
        const files = (archivos ?? []).filter((f) => f.name && !f.name.startsWith('.')).map((f) => ({ name: f.name, path: `${base}/${c.name}/${f.name}` }));
        if (files.length > 0) resultado.push({ meta: c.name.replace(/_/g, '.'), archivos: files });
      }
      setEvidenciasCliente(resultado);
    } finally {
      setEvidenciasLoading(false);
    }
  }, []);
  const abrirEvidencia = async (path: string) => {
    if (!supabase) return;
    const { data } = await supabase.storage.from('task-attachments').createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };
  const [clientSearch, setClientSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<UserStatus | 'ALL'>('ALL');

  // Campanas — cliente seleccionado
  const [campanasClienteId, setCampanasClienteId] = usePersistedState<string | null>(
    'tcd_admin_campanas_cliente',
    null,
    { validate: (v) => v === null || typeof v === 'string' },
  );
  const [campanasClientePerfil, setCampanasClientePerfil] = useState<ProfileV2 | null>(null);
  const [campanasPerfilLoading, setCampanasPerfilLoading] = useState(false);

  // Detalle state
  const [detalleTareas, setDetalleTareas] = useState<any[]>([]);
  const [detalleDiario, setDetalleDiario] = useState<any[]>([]);
  const [detalleMetricas, setDetalleMetricas] = useState<any[]>([]);
  const [detalleMensajes, setDetalleMensajes] = useState<Mensaje[]>([]);
  const [mensajeInput, setMensajeInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [iaRecomendacion, setIaRecomendacion] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Metricas globales
  const [metricasGlobales, setMetricasGlobales] = useState<any>(null);
  const [metricasLoading, setMetricasLoading] = useState(false);
  const [filtroMetricasId, setFiltroMetricasId] = useState<string | null>(null);
  const [metricasTareas, setMetricasTareas] = useState<any[]>([]);
  const [metricasOutputs, setMetricasOutputs] = useState<any[]>([]);
  const [metricasTareasLoading, setMetricasTareasLoading] = useState(false);
  const [pilarExpandido, setPilarExpandido] = useState<Record<number, boolean>>({});
  const [satisfaccionGlobal, setSatisfaccionGlobal] = useState<number | null>(null);
  const [clienteRatings, setClienteRatings] = useState<{ pilar_numero: number; pilar_titulo?: string; rating: number; comentario?: string }[]>([]);
  const [ratingsResumen, setRatingsResumen] = useState<Record<string, number>>({});
  const [ratingsPorPilar, setRatingsPorPilar] = useState<{
    pilar_numero: number;
    pilar_titulo?: string;
    avg: number;
    count: number;
    distribucion: Record<1 | 2 | 3 | 4 | 5, number>;
    ratings: { usuario_id: string; rating: number; comentario?: string; created_at?: string }[];
  }[]>([]);
  const [pilarRatingExpandido, setPilarRatingExpandido] = useState<Record<number, boolean>>({});
  const [tareaModal, setTareaModal] = useState<{ meta: any; tareaData: any; output: string; clienteNombre: string } | null>(null);
  const [tareaResumen, setTareaResumen] = useState('');
  const [tareaResumenLoading, setTareaResumenLoading] = useState(false);

  // Formulario nuevo cliente
  const [nuevoForm, setNuevoForm] = useState({
    nombre: '', email: '', password: '', especialidad: '', plan: 'DWY' as 'DWY' | 'DFY' | 'IMPLEMENTACION',
    fecha_inicio: new Date().toISOString().split('T')[0],
    status: 'ONBOARDING' as UserStatus,
  });
  const [creando, setCreando] = useState(false);

  // Notas internas
  const [detalleNotas, setDetalleNotas] = useState<AdminNote[]>([]);
  const [notaInput, setNotaInput] = useState('');
  const [notaLoading, setNotaLoading] = useState(false);

  // Status change
  const [statusCambiando, setStatusCambiando] = useState(false);

  // Mensajes unified
  const [mensajesChannel, setMensajesChannel] = useState<MensajesChannel>('privados');
  const [chatCliente, setChatCliente] = useState<ClienteConEstado | null>(null);
  const [chatMessages, setChatMessages] = useState<Mensaje[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatEnviando, setChatEnviando] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Videos admin
  const [adminVideos, setAdminVideos] = useState<AdminVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoForm, setVideoForm] = useState<{ id?: string; pilar_id: PilarId | ''; titulo: string; descripcion: string; youtubeUrl: string; duracion: string }>({
    pilar_id: '', titulo: '', descripcion: '', youtubeUrl: '', duracion: ''
  });

  // Admin settings
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminDraft, setAdminDraft] = useState({ nombre: adminProfile.nombre, cargo: adminProfile.especialidad || 'Director' });
  const [adminAvatar, setAdminAvatar] = useState<string>(() => localStorage.getItem(`tcd_admin_avatar_${adminProfile.id}`) || '');
  const [guardandoAdmin, setGuardandoAdmin] = useState(false);
  const adminAvatarInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useAdminTheme();

  // Equipo
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [teamForm, setTeamForm] = useState({ nombre: '', email: '', password: '', admin_rol: 'manager' as AdminRol });
  const [creandoTeam, setCreandoTeam] = useState(false);

  // Eliminar cliente / miembro (owner only) — confirmacion + ejecucion
  const [clienteAEliminar, setClienteAEliminar] = useState<ClienteConEstado | null>(null);
  const [miembroAEliminar, setMiembroAEliminar] = useState<{ id: string; nombre: string; email: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Manager checklist
  const [checklistItems, setChecklistItems] = useState<AdminChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  // ─── EFFECTS ──────────────────────────────────────────────────────────────────

  useEffect(() => { cargarClientes(); cargarRatingsResumen(); }, []);

  useEffect(() => {
    if (!campanasClienteId) { setCampanasClientePerfil(null); return; }
    let cancelled = false;
    setCampanasPerfilLoading(true);
    fetchProfileV2(campanasClienteId).then((p) => {
      if (!cancelled) { setCampanasClientePerfil(p); setCampanasPerfilLoading(false); }
    });
    return () => { cancelled = true; };
  }, [campanasClienteId]);

  useEffect(() => {
    if (mainTab === 'metricas' && !metricasGlobales) cargarMetricasGlobales();
    if (mainTab === 'metricas') { cargarSatisfaccionGlobal(); cargarRatingsResumen(); cargarRatingsPorPilar(); }
    if (mainTab === 'videos') cargarAdminVideos();
    if (mainTab === 'equipo' || mainTab === 'tareas') cargarEquipo();
    if (mainTab !== 'metricas') setFiltroMetricasId(null);
  }, [mainTab]);

  useEffect(() => {
    if (filtroMetricasId) {
      setPilarExpandido({});
      cargarTareasClienteMetricas(filtroMetricasId);
      cargarRatingsCliente(filtroMetricasId);
    } else {
      setMetricasTareas([]);
      setMetricasOutputs([]);
      setClienteRatings([]);
    }
  }, [filtroMetricasId]);

  // Manager checklist load
  useEffect(() => {
    if (adminRol === 'manager') cargarChecklist();
  }, [adminRol]);

  // Channel notifications
  useEffect(() => {
    if (!supabase) return;
    const chatChannels = [] as const; // L2: comunidad v1 sin muro — solo Privados
    const ICONS = { comunidad: Users, victorias: Trophy, consultas: Hash } as const;

    const subs = chatChannels.map(ch =>
      supabase!.channel(`admin-notif-${ch}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `canal=eq.${ch}` },
          async (payload) => {
            if (mainTab === 'mensajes' && mensajesChannel === ch) return;
            if (payload.new.emisor_id === adminProfile.id) return;

            const { data: m } = await supabase!.from('mensajes')
              .select('*, emisor:profiles!emisor_id(nombre, rol)')
              .eq('id', payload.new.id).single();

            const nombre = (m?.emisor as { nombre?: string } | undefined)?.nombre ?? 'Alguien';
            const preview = (payload.new.contenido ?? '').slice(0, 60);
            const ChIcon = ICONS[ch];

            toast(nombre, {
              description: preview || 'Archivo adjunto',
              action: { label: 'Ver', onClick: () => { setMainTab('mensajes'); setMensajesChannel(ch); } },
              icon: React.createElement(ChIcon, { className: 'w-4 h-4 text-[#E8962E]' }),
              duration: 6000,
            });

            setChannelUnread(prev => ({ ...prev, [ch]: (prev[ch] ?? 0) + 1 }));
          }
        ).subscribe()
    );
    return () => { subs.forEach(s => supabase!.removeChannel(s)); };
  }, [mainTab, mensajesChannel, adminProfile.id]);

  // Realtime for privados DM
  useEffect(() => {
    if (!supabase || !chatCliente || mainTab !== 'mensajes' || mensajesChannel !== 'privados') return;
    const channel = supabase
      .channel(`admin-inbox-${chatCliente.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' },
        async (payload) => {
          if (!supabase) return;
          if (payload.new.emisor_id === adminProfile.id) return;
          const { data } = await supabase.from('mensajes').select('*, emisor:profiles!emisor_id(nombre, rol)').eq('id', payload.new.id).single();
          if (data && data.canal === 'privado' && (data.emisor_id === chatCliente.id || data.receptor_id === chatCliente.id)) {
            setChatMessages(prev => {
              if (prev.find(m => m.id === data.id)) return prev;
              return [...prev, data as Mensaje];
            });
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatCliente, mainTab, mensajesChannel, adminProfile.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Realtime for client detail private messages
  useEffect(() => {
    if (!supabase || !selectedCliente || mainTab !== 'clientes') return;
    const channel = supabase
      .channel(`admin-private-${selectedCliente.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' },
        async (payload) => {
          if (payload.new.emisor_id === adminProfile.id) return;
          const { data } = await supabase.from('mensajes').select('*, emisor:profiles!emisor_id(nombre, rol)').eq('id', payload.new.id).single();
          if (data && data.canal === 'privado' && (data.emisor_id === selectedCliente.id || data.receptor_id === selectedCliente.id)) {
            setDetalleMensajes(prev => {
              if (prev.find(m => m.id === data.id)) return prev;
              return [...prev, data as Mensaje];
            });
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedCliente, mainTab, adminProfile.id]);

  useEffect(() => {
    if (selectedCliente && mainTab === 'clientes') cargarDetalleCliente(selectedCliente.id);
  }, [selectedCliente, detalleTab, mainTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detalleMensajes]);

  // ─── DATA FUNCTIONS ───────────────────────────────────────────────────────────

  function extractOutputText(output: unknown): string {
    if (!output) return '';
    if (typeof output === 'string') {
      try {
        const parsed = JSON.parse(output);
        return extractOutputText(parsed);
      } catch { return output; }
    }
    if (typeof output === 'object') {
      const obj = output as Record<string, unknown>;
      for (const key of ['texto', 'resultado', 'output', 'content', 'respuesta', 'text']) {
        if (typeof obj[key] === 'string' && (obj[key] as string).length > 10) {
          return (obj[key] as string).replace(/\\n/g, '\n').replace(/\\t/g, '  ');
        }
      }
      const parts = Object.entries(obj)
        .filter(([, v]) => typeof v === 'string' && (v as string).length > 5)
        .map(([k, v]) => `**${k}:** ${(v as string).replace(/\\n/g, '\n')}`);
      return parts.join('\n\n');
    }
    return String(output);
  }

  async function abrirTareaModal(meta: any, tareaData: any, rawOutput: unknown, clienteNombre: string) {
    const outputText = extractOutputText(rawOutput);
    setTareaModal({ meta, tareaData, output: outputText, clienteNombre });
    setTareaResumen('');
    if (!outputText || outputText.length < 20) return;
    setTareaResumenLoading(true);
    try {
      const prompt = `Sos asistente del equipo de coaching que acompaña a profesionales de la salud.
El cliente "${clienteNombre}" completó la tarea "${meta.titulo}" del programa Tu Clínica Digital.

Este es el output que generó con la IA:
---
${outputText.slice(0, 2000)}
---

Escribí un resumen de 2-3 oraciones en español para el equipo que explique:
1. Qué definió o produjo el cliente en esta tarea
2. Una observación relevante para guiarlo mejor en la próxima sesión

Sé directa, empática y concisa. Sin bullet points, solo texto corrido. Sin emojis.`;
      const resumen = await generateText({ prompt });
      setTareaResumen(resumen);
    } catch {
      // resumen is optional
    } finally {
      setTareaResumenLoading(false);
    }
  }

  async function cargarTareasClienteMetricas(clientId: string) {
    if (!supabase) return;
    setMetricasTareasLoading(true);
    try {
      const [tareasRes, outputsRes] = await Promise.all([
        supabase.from('hoja_de_ruta').select('*').eq('usuario_id', clientId).eq('completada', true),
        supabase.from('herramienta_outputs').select('*').eq('usuario_id', clientId),
      ]);
      setMetricasTareas(tareasRes.data ?? []);
      setMetricasOutputs(outputsRes.data ?? []);
    } catch {
      // tables may not exist yet
    } finally {
      setMetricasTareasLoading(false);
    }
  }

  async function cargarMetricasGlobales() {
    if (!supabase) return;
    setMetricasLoading(true);
    try {
      const { data } = await supabase.rpc('get_metricas_globales');
      setMetricasGlobales(data ?? {});
    } catch {
      toast.error('Error cargando métricas globales');
    } finally {
      setMetricasLoading(false);
    }
  }

  async function cargarSatisfaccionGlobal() {
    if (!supabase) return;
    const { data } = await supabase.from('pilar_satisfaction_ratings').select('rating');
    if (data && data.length > 0) {
      const avg = data.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / data.length;
      setSatisfaccionGlobal(Math.round(avg * 10) / 10);
    } else {
      setSatisfaccionGlobal(null);
    }
  }

  async function cargarRatingsCliente(userId: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from('pilar_satisfaction_ratings')
      .select('pilar_numero, pilar_titulo, rating, comentario')
      .eq('usuario_id', userId)
      .order('pilar_numero');
    setClienteRatings(data ?? []);
  }

  async function cargarRatingsResumen() {
    if (!supabase) return;
    const { data } = await supabase
      .from('pilar_satisfaction_ratings')
      .select('usuario_id, rating');
    if (!data) return;
    const totals: Record<string, { sum: number; count: number }> = {};
    for (const r of data) {
      if (!totals[r.usuario_id]) totals[r.usuario_id] = { sum: 0, count: 0 };
      totals[r.usuario_id].sum += r.rating;
      totals[r.usuario_id].count += 1;
    }
    const resumen: Record<string, number> = {};
    for (const [uid, { sum, count }] of Object.entries(totals)) {
      resumen[uid] = Math.round((sum / count) * 10) / 10;
    }
    setRatingsResumen(resumen);
  }

  async function cargarRatingsPorPilar() {
    if (!supabase) return;
    const { data } = await supabase
      .from('pilar_satisfaction_ratings')
      .select('usuario_id, pilar_numero, pilar_titulo, rating, comentario, created_at')
      .order('created_at', { ascending: false });
    if (!data) { setRatingsPorPilar([]); return; }
    type Bucket = {
      pilar_numero: number;
      pilar_titulo?: string;
      sum: number;
      count: number;
      distribucion: Record<1 | 2 | 3 | 4 | 5, number>;
      ratings: { usuario_id: string; rating: number; comentario?: string; created_at?: string }[];
    };
    const byPilar = new Map<number, Bucket>();
    for (const r of data as Array<{ usuario_id: string; pilar_numero: number; pilar_titulo?: string; rating: number; comentario?: string; created_at?: string }>) {
      let bucket = byPilar.get(r.pilar_numero);
      if (!bucket) {
        bucket = {
          pilar_numero: r.pilar_numero,
          pilar_titulo: r.pilar_titulo,
          sum: 0,
          count: 0,
          distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          ratings: [],
        };
        byPilar.set(r.pilar_numero, bucket);
      }
      bucket.sum += r.rating;
      bucket.count += 1;
      const lvl = r.rating as 1 | 2 | 3 | 4 | 5;
      if (lvl >= 1 && lvl <= 5) bucket.distribucion[lvl] += 1;
      bucket.ratings.push({
        usuario_id: r.usuario_id,
        rating: r.rating,
        comentario: r.comentario,
        created_at: r.created_at,
      });
      if (r.pilar_titulo && !bucket.pilar_titulo) bucket.pilar_titulo = r.pilar_titulo;
    }
    const arr = Array.from(byPilar.values())
      .map((b) => ({
        pilar_numero: b.pilar_numero,
        pilar_titulo: b.pilar_titulo,
        avg: Math.round((b.sum / b.count) * 10) / 10,
        count: b.count,
        distribucion: b.distribucion,
        ratings: b.ratings,
      }))
      .sort((a, b) => a.pilar_numero - b.pilar_numero);
    setRatingsPorPilar(arr);
  }

  async function cargarClientes() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase.rpc('get_all_profiles');
      if (error || !profiles) { setLoading(false); return; }

      const clientesConEstado = await Promise.all(profiles.map(async (p: Profile) => {
        const { dia, semana } = calcDias(p.fecha_inicio);
        const [tareasRes, metricasRes, diarioRes] = await Promise.all([
          supabase.rpc('get_user_tasks', { target_user_id: p.id }),
          supabase.rpc('get_user_metrics', { target_user_id: p.id }),
          supabase.rpc('get_user_diary', { target_user_id: p.id }),
        ]);

        let tareas = tareasRes.data ?? [];
        // FIX progreso: el Camino escribe SIEMPRE en hoja_de_ruta (columna `completada`).
        const { data: hrRows } = await supabase
          .from('hoja_de_ruta')
          .select('pilar_numero, meta_codigo, completada, es_estrella, fecha_completada')
          .eq('usuario_id', p.id);
        if (tareas.length === 0) {
          if (hrRows && hrRows.length > 0) {
            tareas = hrRows.map((r: any) => ({
              ...r,
              status: r.completada ? 'completada' : 'pendiente',
            }));
          }
        }
        const totalFromSeed = SEED_ROADMAP_V2.reduce((acc, pil) => acc + pil.metas.length, 0);
        const metricas = metricasRes.data ?? [];
        const ultimaDiario = diarioRes.data?.[0]?.fecha;

        // Semáforo v2 = RITMO REAL: atraso hábil contra el dia_asignado del Camino
        const completadasSet = new Set<string>(
          (hrRows ?? []).filter((r: any) => r.completada === true).map((r: any) => `${r.pilar_numero}-${r.meta_codigo}`)
        );
        let diaEsperado: number | null = null;
        outer: for (const pil of SEED_ROADMAP_V2) {
          for (const mm of pil.metas) {
            if (!completadasSet.has(`${pil.numero}-${mm.codigo}`)) { diaEsperado = mm.dia_asignado ?? null; break outer; }
          }
        }
        let dias_atraso = 0;
        if (diaEsperado !== null && dia > diaEsperado) {
          for (let d = diaEsperado + 1; d <= dia; d++) if (!esDiaDescanso(d)) dias_atraso++;
        }
        let semaforo: ClienteConEstado['semaforo'] = 'gris';
        if (tareas.length > 0 || completadasSet.size > 0) {
          semaforo = dias_atraso <= 0 ? 'verde' : dias_atraso <= 3 ? 'amarillo' : 'rojo';
        }
        // Cinturón: pilar más alto con TODAS sus metas completas
        // Cinturón: LA MISMA función que el cliente (una sola fuente de verdad).
        const cint = cinturonDesdeProgreso(completadasSet);
        const cinturon = { emoji: cint.emoji, nombre: cint.nombre, orden: cint.orden, metafora: cint.metafora };

        const entradas = diarioRes.data ?? [];
        // Racha = LA MISMA definición que el cliente (sesiones, lu-vi, gracia),
        // calculada de fecha_completada (DB).
        const fechasSesiones = (hrRows ?? [])
          .filter((r: any) => r.completada === true && r.fecha_completada)
          .map((r: any) => String(r.fecha_completada));
        const rachaActual = calcularRachaDesdeFechas(fechasSesiones);

        const ventasRes = await supabase.rpc('get_user_ventas', { target_user_id: p.id }).then(r => r, () => ({ data: [] }));
        const ventas_count = (ventasRes.data ?? []).length;

        const tareasEstrella = tareas.filter((t: any) => t.es_estrella && t.completada).length;
        const diarioCount = entradas.length;
        const metricasCount = metricas.length;
        let estado_garantia: ClienteConEstado['estado_garantia'] = 'en_camino';
        if (ventas_count === 0 && dia >= 60) {
          if (tareasEstrella >= 10 && diarioCount >= 60 && metricasCount >= 8) estado_garantia = 'activada';
          else if (dia >= 75) estado_garantia = 'en_riesgo';
        }

        const tareasCompletadas = tareas.filter((t: any) => t.status === 'completada' || t.completada).length;
        const progPct = (p as any).progreso_porcentaje ?? 0;
        const tareasCompletadasFallback = tareasCompletadas === 0 && progPct > 0
          ? Math.round((progPct / 100) * totalFromSeed)
          : tareasCompletadas;

        const tareasPorPilar: Record<number, number> = {};
        for (const t of tareas) {
          if (t.completada || t.status === 'completada') {
            const pilarNum = t.pilar_numero ?? t.pilarNumero;
            if (pilarNum !== undefined) {
              tareasPorPilar[pilarNum] = (tareasPorPilar[pilarNum] ?? 0) + 1;
            }
          }
        }

        return {
          ...p,
          dia_programa: dia,
          semana_programa: semana,
          semaforo,
          cinturon,
          dias_atraso,
          tareas_completadas: tareasCompletadasFallback,
          tareas_total: tareas.length > 0 ? tareas.length : totalFromSeed,
          tareas_por_pilar: tareasPorPilar,
          ultima_entrada_diario: ultimaDiario,
          racha_diario: rachaActual,
          ventas_count,
          estado_garantia,
          progreso_porcentaje: (p as any).progreso_porcentaje ?? 0,
        } as ClienteConEstado;
      }));
      setClientes(clientesConEstado);
    } catch {
      toast.error('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  }

  async function cargarDetalleCliente(userId: string) {
    if (!supabase) return;
    if (detalleTab === 'adn') return; // El componente ADN gestiona su propia carga.
    setDetalleLoading(true);
    try {
      if (detalleTab === 'resumen') {
        const [t, d, m] = await Promise.all([
          supabase.rpc('get_user_tasks', { target_user_id: userId }),
          supabase.rpc('get_user_diary', { target_user_id: userId }),
          supabase.rpc('get_user_metrics', { target_user_id: userId }),
        ]);
        let tareasDetalle = t.data ?? [];
        if (tareasDetalle.length === 0) {
          const { data: hrRows } = await supabase
            .from('hoja_de_ruta')
            .select('pilar_numero, meta_codigo, completada, es_estrella')
            .eq('usuario_id', userId);
          if (hrRows && hrRows.length > 0) {
            tareasDetalle = hrRows.map((r: any) => ({
              ...r,
              status: r.completada ? 'completada' : 'pendiente',
            }));
          }
        }
        setDetalleTareas(tareasDetalle);
        setDetalleDiario((d.data ?? []).slice(0, 3));
        setDetalleMetricas(m.data ?? []);
      } else if (detalleTab === 'mentor') {
        if (selectedCliente) cargarConversaciones(selectedCliente.id);
      } else if (detalleTab === 'evidencias') {
        if (selectedCliente) cargarEvidenciasCliente(selectedCliente.id);
      } else if (detalleTab === 'diario') {
        const { data } = await supabase.rpc('get_user_diary', { target_user_id: userId });
        setDetalleDiario(data ?? []);
      } else if (detalleTab === 'metricas') {
        const [metricsRes, tareasRes, outputsRes] = await Promise.all([
          supabase.rpc('get_user_metrics', { target_user_id: userId }),
          supabase.from('hoja_de_ruta').select('*').eq('usuario_id', userId).eq('completada', true),
          supabase.from('herramienta_outputs').select('*').eq('usuario_id', userId),
        ]);
        setDetalleMetricas(metricsRes.data ?? []);
        setMetricasTareas(tareasRes.data ?? []);
        setMetricasOutputs(outputsRes.data ?? []);
        setPilarExpandido({});
      } else if (detalleTab === 'mensajes') {
        const { data } = await supabase
          .from('mensajes')
          .select('*, emisor:profiles!emisor_id(nombre, rol)')
          .or(`emisor_id.eq.${userId},receptor_id.eq.${userId}`)
          .eq('canal', 'privado')
          .order('created_at');
        setDetalleMensajes((data as Mensaje[]) ?? []);
      } else if (detalleTab === 'notas') {
        await cargarNotas(userId);
      }
    } catch {
      // ignore
    } finally {
      setDetalleLoading(false);
    }
  }

  async function generarRecomendacion() {
    if (!selectedCliente) return;
    setIaLoading(true);
    setIaRecomendacion('');
    try {
      const lastDiary = detalleDiario[0]?.respuestas;
      const pendingTasks = detalleTareas.filter((t: any) => t.status !== 'completada').slice(0, 3);
      const lastMetric = detalleMetricas[detalleMetricas.length - 1];

      const diarioResumen = lastDiary
        ? `Cómo se sintió: "${lastDiary.q1 || '—'}". Lo que lo frenó: "${lastDiary.q2 || '—'}". Energía: ${lastDiary.q3 || '—'}/10. Acción tomada: "${lastDiary.q4 || '—'}". Plan para mañana: "${lastDiary.q7 || '—'}".`
        : 'Sin entradas de diario recientes.';

      const prompt = `Sos el sistema de inteligencia de coaching del programa "Sanar OS" para profesionales de la salud. Tu rol es asistir al DIRECTOR/COACH humano dándole un briefing claro sobre el estado de un cliente específico y recomendaciones accionables para su próxima intervención.

CLIENTE: ${selectedCliente.nombre} (${selectedCliente.especialidad || 'especialidad no indicada'})
PLAN: ${selectedCliente.plan} · Día ${selectedCliente.dia_programa} de 90 · Semana ${selectedCliente.semana_programa} de 12
PROGRESO: ${selectedCliente.tareas_completadas} de ${selectedCliente.tareas_total} tareas completadas (${selectedCliente.tareas_total > 0 ? Math.round((selectedCliente.tareas_completadas / selectedCliente.tareas_total) * 100) : 0}%)
RACHA DIARIO: ${selectedCliente.racha_diario} días consecutivos
VENTAS REALES: ${selectedCliente.ventas_count}
ÚLTIMO DIARIO: ${diarioResumen}
MÉTRICAS NEGOCIO: ${lastMetric ? `${lastMetric.leads} leads, ${lastMetric.conversaciones ?? 0} llamadas, ${lastMetric.ventas} ventas en la última semana` : 'sin datos de métricas aún'}

Generá un briefing para el coach en 3 partes:
1. ESTADO ACTUAL (1-2 oraciones sobre dónde está el cliente y su ritmo real)
2. RIESGO O PUNTO CRÍTICO (qué puede frenar el avance si no se interviene)
3. ACCIÓN SUGERIDA PARA EL COACH (qué decirle o hacer en la próxima interacción — específico y directo)

Tono: profesional, directo, orientado a resultados. Sin emojis. En español.`;

      const recomendacion = await generateText({ prompt });
      setIaRecomendacion(recomendacion);
    } catch {
      toast.error('Error generando recomendación IA');
    } finally {
      setIaLoading(false);
    }
  }

  async function enviarMensajePrivado() {
    if (!supabase || !selectedCliente || !mensajeInput.trim()) return;
    setEnviando(true);
    const texto = mensajeInput.trim();
    const tempId = crypto.randomUUID();
    const optimisticMsg: Mensaje = {
      id: tempId,
      canal: 'privado',
      emisor_id: adminProfile.id,
      receptor_id: selectedCliente.id,
      contenido: texto,
      created_at: new Date().toISOString(),
    } as Mensaje;
    setDetalleMensajes(prev => [...prev, optimisticMsg]);
    setMensajeInput('');
    try {
      const { error } = await supabase.from('mensajes').insert({
        canal: 'privado', emisor_id: adminProfile.id, receptor_id: selectedCliente.id, contenido: texto
      });
      if (error) throw error;
      void notificarMensajeAdmin(selectedCliente.id, adminProfile.nombre ?? 'El equipo');
    } catch {
      setDetalleMensajes(prev => prev.filter(m => m.id !== tempId));
      setMensajeInput(texto);
      toast.error('Error enviando mensaje');
    } finally {
      setEnviando(false);
    }
  }

  async function cargarChatMessages(clienteId: string) {
    if (!supabase) return;
    setChatLoading(true);
    try {
      const { data } = await supabase
        .from('mensajes')
        .select('*, emisor:profiles!emisor_id(nombre, rol)')
        .or(`emisor_id.eq.${clienteId},receptor_id.eq.${clienteId}`)
        .eq('canal', 'privado')
        .order('created_at');
      setChatMessages((data as Mensaje[]) ?? []);
    } finally {
      setChatLoading(false);
    }
  }

  async function enviarChatMsg() {
    if (!supabase || !chatCliente || !chatInput.trim()) return;
    setChatEnviando(true);
    const texto = chatInput.trim();
    const tempId = crypto.randomUUID();
    const optimistic: Mensaje = {
      id: tempId, canal: 'privado', emisor_id: adminProfile.id,
      receptor_id: chatCliente.id, contenido: texto, created_at: new Date().toISOString(),
    } as Mensaje;
    setChatMessages(prev => [...prev, optimistic]);
    setChatInput('');
    try {
      const { error } = await supabase.from('mensajes').insert({
        canal: 'privado', emisor_id: adminProfile.id, receptor_id: chatCliente.id, contenido: texto
      });
      if (error) throw error;
      void notificarMensajeAdmin(chatCliente.id, adminProfile.nombre ?? 'El equipo');
    } catch {
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
      setChatInput(texto);
      toast.error('Error enviando mensaje');
    } finally {
      setChatEnviando(false);
    }
  }

  async function cargarAdminVideos() {
    if (!supabase) return;
    setVideosLoading(true);
    try {
      const { data, error } = await supabase
        .from('programa_videos')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setAdminVideos(data.map((v: any) => ({
        id: v.id,
        grupo: v.grupo,
        pilar_id: v.pilar_id ?? undefined,
        titulo: v.titulo,
        descripcion: v.descripcion,
        youtubeUrl: v.youtube_url,
        duracion: v.duracion,
      })));
    } catch {
      toast.error('Error cargando videos');
    } finally {
      setVideosLoading(false);
    }
  }

  async function saveAdminVideo(v: Omit<AdminVideo, 'id'> & { id?: string }) {
    if (!supabase) return;
    if (!v.pilar_id) {
      toast.error('Elegí un pilar antes de guardar el video.');
      return;
    }
    try {
      if (v.id) {
        const { error } = await supabase
          .from('programa_videos')
          .update({
            grupo: PILAR_TO_GRUPO[v.pilar_id] ?? 'A',
            pilar_id: v.pilar_id,
            titulo: v.titulo,
            descripcion: v.descripcion || '',
            youtube_url: v.youtubeUrl,
            duracion: v.duracion || null,
          })
          .eq('id', v.id);
        if (error) throw error;
        setAdminVideos(prev => prev.map(old => old.id === v.id ? { ...old, ...v, id: v.id! } : old));
        toast.success('Video actualizado');
      } else {
        const { data, error } = await supabase
          .from('programa_videos')
          .insert({
            grupo: PILAR_TO_GRUPO[v.pilar_id] ?? 'A',
            pilar_id: v.pilar_id,
            titulo: v.titulo,
            descripcion: v.descripcion || '',
            youtube_url: v.youtubeUrl,
            duracion: v.duracion || null,
          })
          .select()
          .single();
        if (error) throw error;
        setAdminVideos(prev => [...prev, {
          id: data.id,
          grupo: data.grupo,
          pilar_id: data.pilar_id ?? undefined,
          titulo: data.titulo,
          descripcion: data.descripcion,
          youtubeUrl: data.youtube_url,
          duracion: data.duracion,
        }]);
        toast.success('Video guardado en la nube');
      }
    } catch (err: unknown) {
      const msg = (err as any)?.message ?? (err instanceof Error ? err.message : JSON.stringify(err));
      console.error('saveAdminVideo error:', err);
      toast.error(`Error al guardar video: ${msg}`);
    }
  }

  async function deleteAdminVideo(id: string) {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('programa_videos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setAdminVideos(prev => prev.filter(v => v.id !== id));
      toast.success('Video eliminado');
    } catch {
      toast.error('Error al eliminar video');
    }
  }

  async function cargarNotas(clientId: string) {
    if (!supabase) return;
    setNotaLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDetalleNotas((data ?? []) as AdminNote[]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error cargando notas');
    } finally {
      setNotaLoading(false);
    }
  }

  async function agregarNota() {
    if (!supabase || !selectedCliente || !notaInput.trim()) return;
    const texto = notaInput.trim();
    setNotaInput('');
    try {
      const { error } = await supabase.from('admin_notes').insert({
        client_id: selectedCliente.id,
        author_id: adminProfile.id,
        content: texto,
      });
      if (error) throw error;
      await cargarNotas(selectedCliente.id);
    } catch (err: unknown) {
      setNotaInput(texto);
      toast.error(err instanceof Error ? err.message : 'Error guardando nota');
    }
  }

  async function cambiarStatusCliente(nuevoStatus: UserStatus) {
    if (!supabase || !selectedCliente) return;
    setStatusCambiando(true);
    try {
      await supabase.rpc('update_client_status', {
        target_user_id: selectedCliente.id,
        new_status: nuevoStatus,
      });
      setClientes(prev => prev.map(c =>
        c.id === selectedCliente.id ? { ...c, status: nuevoStatus } : c
      ));
      setSelectedCliente(prev => prev ? { ...prev, status: nuevoStatus } : prev);
      toast.success(`Estado actualizado a ${STATUS_CONFIG[nuevoStatus]?.label ?? nuevoStatus}`);
    } catch {
      toast.error('Error cambiando estado');
    } finally {
      setStatusCambiando(false);
    }
  }

  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleChangeEmail() {
    if (!supabase || !selectedCliente) return;
    const newEmail = newEmailInput.trim().toLowerCase();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Ingresá un email válido');
      return;
    }
    if (newEmail === selectedCliente.email?.toLowerCase()) {
      toast.error('El nuevo email es igual al actual');
      return;
    }
    setChangingEmail(true);
    try {
      const { error } = await supabase.rpc('admin_change_client_email', {
        target_user_id: selectedCliente.id,
        new_email: newEmail,
      });
      if (error) throw error;
      setClientes(prev => prev.map(c => c.id === selectedCliente.id ? { ...c, email: newEmail } : c));
      setSelectedCliente(prev => prev ? { ...prev, email: newEmail } : prev);
      toast.success(`Email cambiado a ${newEmail}`);
      setShowChangeEmailModal(false);
      setNewEmailInput('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      toast.error(`No se pudo cambiar el email: ${msg}`);
    } finally {
      setChangingEmail(false);
    }
  }

  async function handleSendReset() {
    if (!supabase || !selectedCliente?.email) return;
    if (!window.confirm(`¿Enviar mail de recuperación de contraseña a ${selectedCliente.email}?`)) return;
    setSendingReset(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.auth.resetPasswordForEmail(selectedCliente.email, { redirectTo });
      if (error) throw error;
      toast.success(`Mail de recuperación enviado a ${selectedCliente.email}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      toast.error(`No se pudo enviar: ${msg}`);
    } finally {
      setSendingReset(false);
    }
  }

  async function toggleFullAgentAccess() {
    if (!supabase || !selectedCliente) return;
    const newVal = !selectedCliente.full_agent_access;
    try {
      const { error } = await supabase.rpc('toggle_full_agent_access', {
        target_user_id: selectedCliente.id,
        new_value: newVal,
      });
      if (error) throw error;
      setClientes(prev => prev.map(c =>
        c.id === selectedCliente.id ? { ...c, full_agent_access: newVal } : c
      ));
      setSelectedCliente(prev => prev ? { ...prev, full_agent_access: newVal } : prev);
      toast.success(newVal ? 'Todos los entrenadores IA desbloqueados' : 'Entrenadores IA bloqueados por pilar');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      toast.error(`Error actualizando acceso a agentes: ${msg}`);
    }
  }

  async function guardarConfigAdmin() {
    setGuardandoAdmin(true);
    try {
      if (supabase) {
        await supabase.from('profiles').update({
          nombre: adminDraft.nombre,
          especialidad: adminDraft.cargo,
        }).eq('id', adminProfile.id);
      }
      adminProfile.nombre = adminDraft.nombre;
      adminProfile.especialidad = adminDraft.cargo;
      toast.success('Perfil actualizado.');
      setShowAdminSettings(false);
    } catch {
      toast.error('Error al guardar. Intentá de nuevo.');
    } finally {
      setGuardandoAdmin(false);
    }
  }

  function handleAdminAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem(`tcd_admin_avatar_${adminProfile.id}`, dataUrl);
      setAdminAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function crearClienteLocal() {
    if (!nuevoForm.email || !nuevoForm.nombre || !nuevoForm.password) return;
    setCreando(true);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const tempClient = createClient(url, key, {
        auth: {
          persistSession: false,
          storageKey: 'temp_auth',
          storage: { getItem: () => null, setItem: () => null, removeItem: () => null }
        }
      });

      const { data: signUpData, error } = await tempClient.auth.signUp({
        email: nuevoForm.email.trim(),
        password: nuevoForm.password.trim(),
        options: {
          data: { nombre: nuevoForm.nombre.trim() }
        }
      });
      if (error) throw error;

      if (signUpData.user && supabase) {
        await new Promise(r => setTimeout(r, 1500));
        await supabase.from('profiles').update({
          especialidad: nuevoForm.especialidad.trim() || null,
          plan: nuevoForm.plan,
          fecha_inicio: nuevoForm.fecha_inicio,
          status: nuevoForm.status,
          onboarding_completed: nuevoForm.status !== 'ONBOARDING',
        }).eq('id', signUpData.user.id);
      }

      toast.success(`Cuenta creada para ${nuevoForm.nombre}. Ya puede iniciar sesión.`);
      setShowNuevoCliente(false);
      setNuevoForm({ nombre: '', email: '', password: '', especialidad: '', plan: 'DWY', fecha_inicio: new Date().toISOString().split('T')[0], status: 'ONBOARDING' });
      await cargarClientes();
    } catch (e: any) {
      toast.error(`Error creando cuenta: ${e.message}`);
    } finally {
      setCreando(false);
    }
  }

  async function cargarEquipo() {
    if (!supabase) return;
    setTeamLoading(true);
    try {
      // RPC SECURITY DEFINER — la RLS de profiles solo deja ver el propio
      // profile, por eso un SELECT directo devuelve 1 solo miembro.
      const { data, error } = await supabase.rpc('get_team_members');
      if (error) throw error;
      setTeamMembers(data ?? []);
    } catch {
      toast.error('Error cargando equipo');
    } finally {
      setTeamLoading(false);
    }
  }

  async function agregarMiembroEquipo() {
    if (!teamForm.email || !teamForm.nombre || !teamForm.password) return;
    setCreandoTeam(true);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const tempClient = createClient(url, key, {
        auth: { persistSession: false, storageKey: 'temp_auth_team', storage: { getItem: () => null, setItem: () => null, removeItem: () => null } }
      });
      const { data: signUpData, error } = await tempClient.auth.signUp({
        email: teamForm.email.trim(),
        password: teamForm.password.trim(),
        options: { data: { nombre: teamForm.nombre.trim() } }
      });
      if (error) throw error;
      if (signUpData.user && supabase) {
        // El trigger on_auth_user_created crea el profile con rol='cliente'.
        // Via RPC SECURITY DEFINER lo promovemos a admin — el update directo no
        // pasa por RLS (auth.uid() != target.id). Reintentamos por la carrera
        // con el trigger (puede tardar 1-3 seg).
        let promoted = false;
        let lastErr: string | null = null;
        for (let attempt = 0; attempt < 4 && !promoted; attempt++) {
          await new Promise(r => setTimeout(r, attempt === 0 ? 1500 : 1000));
          const { error: rpcErr } = await supabase.rpc('promover_a_admin', {
            p_user_id: signUpData.user.id,
            p_admin_rol: teamForm.admin_rol,
          });
          if (!rpcErr) {
            promoted = true;
          } else {
            lastErr = rpcErr.message;
          }
        }
        if (!promoted) {
          throw new Error(`No se pudo promover el miembro a admin: ${lastErr ?? 'error desconocido'}`);
        }
      }
      toast.success(`Miembro ${teamForm.nombre} agregado al equipo.`);
      setShowAddTeamMember(false);
      setTeamForm({ nombre: '', email: '', password: '', admin_rol: 'manager' });
      await cargarEquipo();
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setCreandoTeam(false);
    }
  }

  async function cambiarRolAdmin(targetId: string, newRol: AdminRol) {
    if (!supabase) return;
    try {
      // UPDATE directo no funciona por RLS (auth.uid() != target.id). Usamos la
      // misma RPC promover_a_admin — es idempotente: si ya es admin, solo
      // actualiza admin_rol.
      const { error } = await supabase.rpc('promover_a_admin', {
        p_user_id: targetId,
        p_admin_rol: newRol,
      });
      if (error) throw error;
      setTeamMembers(prev => prev.map(m => m.id === targetId ? { ...m, admin_rol: newRol } : m));
      toast.success('Rol actualizado');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error actualizando rol: ${msg}`);
    }
  }

  async function confirmarEliminarCliente() {
    if (!supabase || !clienteAEliminar) return;
    setEliminando(true);
    try {
      const { error } = await supabase.rpc('admin_delete_cliente', { p_user_id: clienteAEliminar.id });
      if (error) throw error;
      const deletedId = clienteAEliminar.id;
      setClientes(prev => prev.filter(c => c.id !== deletedId));
      if (selectedCliente?.id === deletedId) setSelectedCliente(null);
      if (chatCliente?.id === deletedId) setChatCliente(null);
      if (campanasClienteId === deletedId) setCampanasClienteId(null);
      if (filtroMetricasId === deletedId) setFiltroMetricasId(null);
      setClienteAEliminar(null);
      toast.success(`Cliente ${clienteAEliminar.nombre} eliminado`);
    } catch (e: any) {
      toast.error(`Error eliminando cliente: ${e?.message ?? 'desconocido'}`);
    } finally {
      setEliminando(false);
    }
  }

  async function confirmarEliminarMiembro() {
    if (!supabase || !miembroAEliminar) return;
    setEliminando(true);
    try {
      const { error } = await supabase.rpc('admin_delete_team_member', { p_user_id: miembroAEliminar.id });
      if (error) throw error;
      const deletedId = miembroAEliminar.id;
      setTeamMembers(prev => prev.filter(m => m.id !== deletedId));
      const nombre = miembroAEliminar.nombre;
      setMiembroAEliminar(null);
      toast.success(`Miembro ${nombre} eliminado del equipo`);
    } catch (e: any) {
      toast.error(`Error eliminando miembro: ${e?.message ?? 'desconocido'}`);
    } finally {
      setEliminando(false);
    }
  }

  async function cargarChecklist() {
    if (!supabase) return;
    setChecklistLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_tareas_checklist')
        .select('*')
        .eq('admin_id', adminProfile.id)
        .order('created_at');
      if (error) throw error;
      setChecklistItems((data ?? []) as AdminChecklistItem[]);
    } catch {
      // table may not exist yet
    } finally {
      setChecklistLoading(false);
    }
  }

  async function toggleChecklistItem(itemId: string, completada: boolean) {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('admin_tareas_checklist')
        .update({ completada, fecha_completada: completada ? new Date().toISOString() : null })
        .eq('id', itemId);
      if (error) throw error;
      setChecklistItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, completada, fecha_completada: completada ? new Date().toISOString() : undefined } : item
      ));
    } catch {
      toast.error('Error actualizando tarea');
    }
  }

  const detailTabs: { id: DetalleTab; label: string; icon: React.ElementType }[] = [
    { id: 'resumen', label: 'Resumen', icon: TrendingUp },
    { id: 'evidencias', label: 'Evidencias', icon: ClipboardCheck },
    { id: 'mentor', label: 'Mentor', icon: MessageSquare },
    { id: 'diario', label: 'Diario', icon: Calendar },
    { id: 'metricas', label: 'Métricas', icon: BarChart2 },
    { id: 'adn', label: 'ADN', icon: Fingerprint },
    { id: 'mensajes', label: 'Chat', icon: MessageSquare },
    { id: 'notas', label: 'Notas', icon: BookOpen },
  ];

  // Filter clients
  const filteredClientes = clientes.filter(c => {
    const matchSearch = !clientSearch || c.nombre.toLowerCase().includes(clientSearch.toLowerCase());
    const matchStatus = filtroStatus === 'ALL' || c.status === filtroStatus || (!c.status && filtroStatus === 'ACTIVE');
    return matchSearch && matchStatus;
  });
  // La ronda de la mañana de Lupe: rojos primero, después amarillos — dentro de cada grupo, mayor atraso arriba
  const SEMAFORO_PESO: Record<string, number> = { rojo: 0, amarillo: 1, verde: 2, gris: 3 };
  const clientesOrdenados = [...filteredClientes].sort(
    (a, b) => (SEMAFORO_PESO[a.semaforo] - SEMAFORO_PESO[b.semaforo]) || (b.dias_atraso - a.dias_atraso)
  );

  // ─── SIDEBAR NAV CONFIG ───────────────────────────────────────────────────────

  const sidebarItems: { id: MainTab; label: string; icon: React.ElementType; ownerOnly?: boolean }[] = [
    { id: 'clientes',  label: 'Clientes',  icon: Users },
    { id: 'pipeline',  label: 'Activación', icon: ClipboardCheck },
    { id: 'mensajes',  label: 'Mensajes',  icon: MessageSquare },
    { id: 'metricas',  label: 'Métricas',  icon: BarChart2 },
    { id: 'videos',    label: 'Videos',    icon: Video },
    { id: 'equipo',    label: 'Equipo',    icon: UsersRound, ownerOnly: true },
    { id: 'campanas',  label: 'Campañas',  icon: Megaphone },
    { id: 'creativos', label: 'Creativos', icon: Image },
    { id: 'tareas',    label: 'Tareas',    icon: ClipboardCheck },
  ];

  const headerTitles: Record<MainTab, string> = {
    clientes: 'Panel de Control — Clientes',
    pipeline: 'Checklist de Pre-Activación',
    mensajes: 'Centro de Mensajes',
    metricas: 'Métricas Globales del Programa',
    videos: 'Gestión de Videos',
    equipo: 'Gestión de Equipo',
    campanas: 'Campañas & Creativos',
    creativos: 'Generador de Creativos',
    tareas: 'Pipeline de Tareas Internas',
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#080808] text-[#F2EFE9] font-sans overflow-hidden selection:bg-[#E8962E]/30">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E8962E]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[220px] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:inset-auto md:translate-x-0 md:z-20 ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-[220px]'} shrink-0 border-r border-[rgba(232,150,46,0.1)] bg-[#0E0E0E] flex flex-col transition-all duration-300`}>
        <div className={`p-5 ${sidebarCollapsed ? 'md:p-3' : ''} transition-all duration-300`}>
          <div className={`flex items-center gap-3 mb-8 ${sidebarCollapsed ? 'md:justify-center md:gap-0 md:mb-6' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-[#E8962E] flex items-center justify-center shadow-[0_0_20px_rgba(232,150,46,0.18)] shrink-0">
              <Stethoscope className="w-5 h-5 text-[#F2EFE9]" />
            </div>
            <div className={`${sidebarCollapsed ? 'md:hidden' : ''} min-w-0`}>
              <h1 className="text-sm font-semibold text-[#F2EFE9] tracking-wide truncate">Tu Clinica Digital</h1>
              <p className="text-[10px] text-[#E8962E] uppercase tracking-widest font-bold">Admin</p>
            </div>
          </div>

          {/* Toggle expand/collapse — solo desktop */}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className={`hidden md:flex items-center justify-center w-full mb-3 py-1.5 rounded-lg text-[#F2EFE9]/40 hover:text-[#E8962E] hover:bg-[#E8962E]/10 transition-colors`}
            title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>

          <nav className="space-y-0.5">
            {sidebarItems
              .filter(item => !item.ownerOnly || adminRol === 'owner' || !adminRol)
              .map(item => {
                const totalUnread = item.id === 'mensajes'
                  ? (channelUnread['comunidad'] ?? 0) + (channelUnread['victorias'] ?? 0) + (channelUnread['consultas'] ?? 0)
                  : 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMainTab(item.id);
                      setMobileMenuOpen(false);
                      if (item.id === 'mensajes') {
                        setChannelUnread(prev => ({ ...prev, comunidad: 0, victorias: 0, consultas: 0 }));
                      }
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${sidebarCollapsed ? 'md:justify-center md:px-0 md:gap-0' : ''} ${
                      mainTab === item.id
                        ? 'bg-[#E8962E]/10 text-[#E8962E]'
                        : 'text-[#F2EFE9]/60 hover:bg-[#E8962E]/10 hover:text-[#F2EFE9]'
                    }`}
                  >
                    {mainTab === item.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#E8962E] rounded-r-full" />
                    )}
                    <span className="relative shrink-0">
                      <item.icon className="w-4 h-4" />
                      {sidebarCollapsed && totalUnread > 0 && (
                        <span className="hidden md:block absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E8962E] shadow-[0_0_6px_rgba(232,150,46,0.6)]" />
                      )}
                    </span>
                    <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                    {totalUnread > 0 && (
                      <span className={`${sidebarCollapsed ? 'md:hidden' : ''} ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[#E8962E] text-[#F2EFE9] text-[10px] font-bold flex items-center justify-center`}>
                        {totalUnread}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        <div className={`mt-auto p-5 ${sidebarCollapsed ? 'md:p-3' : ''} border-t border-[rgba(232,150,46,0.1)] transition-all duration-300`}>
          <div className={`flex items-center gap-3 mb-4 ${sidebarCollapsed ? 'md:justify-center md:gap-0' : ''}`}>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#E8962E]/10 flex items-center justify-center text-sm font-bold border border-[rgba(232,150,46,0.18)] shrink-0">
              {adminAvatar
                ? <img loading="lazy" src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
                : adminProfile.nombre.charAt(0).toUpperCase()
              }
            </div>
            <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-sm font-medium text-[#F2EFE9] truncate">{adminProfile.nombre}</p>
              <p className="text-[10px] text-[#F2EFE9]/40 truncate">{adminProfile.especialidad || 'Director'}</p>
            </div>
            <button
              onClick={() => { setAdminDraft({ nombre: adminProfile.nombre, cargo: adminProfile.especialidad || 'Director' }); setShowAdminSettings(true); }}
              className={`${sidebarCollapsed ? 'md:hidden' : ''} w-7 h-7 rounded-lg bg-[#E8962E]/5 hover:bg-[#E8962E]/10 flex items-center justify-center text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors shrink-0`}
              title="Ajustes de perfil"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onSignOut}
            title={sidebarCollapsed ? 'Salir del sistema' : undefined}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-[#F2EFE9]/60 hover:bg-[#E8962E]/5 hover:text-[#F2EFE9] transition-colors ${sidebarCollapsed ? 'md:gap-0' : ''}`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Salir del sistema</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="h-16 border-b border-[rgba(232,150,46,0.1)] flex items-center gap-3 px-4 md:px-6 shrink-0 bg-black/20 backdrop-blur-md">
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/10 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-medium tracking-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#F2EFE9' }}>
            {headerTitles[mainTab]}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell
              userId={adminProfile.id}
              size="sm"
              onNavigate={(url) => {
                // Mapea accion_url → tab del panel admin (+ abre modal de tarea si viene tareaId)
                if (url.includes('/admin') && url.includes('tab=tareas')) {
                  setMainTab('tareas');
                  const match = url.match(/[?&]tareaId=([0-9a-f-]+)/i);
                  if (match) setPendingTareaId(match[1]);
                } else if (url.includes('/admin/clientes')) {
                  setMainTab('clientes');
                } else if (url.includes('/admin/mensajes')) {
                  setMainTab('mensajes');
                }
              }}
            />
          </div>
        </header>

        <div className={`flex-1 scrollbar-hide ${mainTab === 'mensajes' ? 'overflow-hidden flex flex-col' : mainTab === 'pipeline' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto p-6'}`}>

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: ACTIVACIÓN (Checklist Pre-Activación por cliente)
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'pipeline' && (
            <>
              {/* G4 · El proceso de activación — la guía operativa de Lupe */}
              <div className="rounded-2xl border border-[#E8962E]/25 bg-gradient-to-br from-[#E8962E]/[0.05] to-transparent p-5 mb-4 mx-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8962E] mb-3">📋 El proceso de activación (cliente nuevo, paso a paso)</p>
                <ol className="grid md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#F2EFE9]/70 list-decimal list-inside">
                  <li>Crear su subcuenta GHL desde el snapshot maestro</li>
                  <li>Alta en TCD (botón Nuevo cliente) — mail + contraseña temporal + plan</li>
                  <li>Alta en MiClínica Digital (misma identidad)</li>
                  <li>Bienvenida por mail: las 2 llaves + sus accesos (Discord solo DWY/DFY)</li>
                  <li>Día 1: verificar el Pacto firmado y la Foto de Partida</li>
                  <li>Semana 1: la ronda diaria del semáforo (verde = no tocar)</li>
                  <li>Día 22-26: acompañar el montaje técnico (sistema + dominio)</li>
                  <li>Día 29: verificar la campaña ENCENDIDA (evidencia en su ficha)</li>
                </ol>
              </div>
              <PreactivacionMatriz clientes={clientes} adminId={adminProfile.id} />
          </>
            )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: CLIENTES
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'clientes' && !selectedCliente && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Header row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2EFE9]/30" />
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-all"
                    />
                  </div>
                  <CustomSelect
                    value={filtroStatus}
                    onChange={(val) => setFiltroStatus(val as UserStatus | 'ALL')}
                    options={[
                      { value: 'ALL', label: 'Todos los estados' },
                      { value: 'ACTIVE', label: 'Activos' },
                      { value: 'ONBOARDING', label: 'Onboarding' },
                      { value: 'PAUSED', label: 'Pausados' },
                      { value: 'CHURNED', label: 'Inactivos' },
                      { value: 'COMPLETED', label: 'Completados' },
                    ]}
                    className="w-48"
                  />
                </div>
                <button
                  onClick={() => setShowMigrationWizard(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(232,150,46,0.18)] text-sm font-semibold text-[#E8962E] hover:bg-[#E8962E]/10 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Migrar cliente
                </button>
                <button
                  onClick={() => setShowNuevoCliente(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#E8962E]/20"
                >
                  <Plus className="w-4 h-4" /> Nuevo Cliente
                </button>
              </div>

              {/* Client table */}
              <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
                {loading ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-[#E8962E] animate-spin" /></div>
                ) : clientesOrdenados.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                    <p className="text-[#F2EFE9]/40 text-sm">Sin clientes que coincidan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-[rgba(232,150,46,0.1)]">
                        {['Nombre', 'Email', 'Plan', 'Inicio', 'Días', 'Cinturón', 'Pacientes', 'Pilar', 'Estado', 'Progreso'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40">{h}</th>
                        ))}
                        {adminRol === 'owner' && (
                          <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {clientesOrdenados.map(c => {
                        const pct = c.tareas_total > 0
                          ? Math.round((c.tareas_completadas / c.tareas_total) * 100)
                          : (c.progreso_porcentaje ?? 0);
                        const pilar = (c as any).pilar_actual
                          ? `P${(c as any).pilar_actual}`
                          : derivePilarFromProgress(c.tareas_completadas);
                        const st = c.status ?? 'ACTIVE';
                        const stCfg = STATUS_CONFIG[st];
                        return (
                          <tr
                            key={c.id}
                            onClick={() => { setSelectedCliente(c); setDetalleTab('resumen'); setIaRecomendacion(''); }}
                            className="bg-[#111110] hover:bg-[#1A1917] border-b border-[rgba(232,150,46,0.1)] cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E8962E]/10 border border-[rgba(232,150,46,0.12)] flex items-center justify-center text-xs font-bold text-[#F2EFE9] shrink-0">
                                  {c.nombre.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-[#F2EFE9] group-hover:text-[#E8962E] transition-colors truncate max-w-[140px]">{c.nombre}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-[#F2EFE9]/50 truncate max-w-[160px]">{c.email}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8962E]/10 text-[#E8962E] border border-[#E8962E]/20">{c.plan}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-[#F2EFE9]/50">{c.fecha_inicio}</td>
                            <td className="px-4 py-3 text-xs text-[#F2EFE9]/60 font-medium">Día {c.dia_programa}{c.dias_atraso > 0 && <span className={`${c.dias_atraso > 3 ? 'text-[#EF4444]' : 'text-[#E8962E]'} ml-1.5 text-[10px]`} title={`${c.dias_atraso} días hábiles de atraso`}>⚠ {c.dias_atraso}d atraso</span>}</td>
                            <td className="px-4 py-3 text-xs" title={`Cinturón ${c.cinturon.nombre}`}>{c.cinturon.emoji} <span className="text-[#F2EFE9]/50">{c.cinturon.nombre}</span></td>
                            <td className="px-4 py-3 text-xs text-[#F2EFE9]/60">{c.ventas_count}/10</td>
                            <td className="px-4 py-3 text-xs text-[#E8962E] font-medium">{pilar}</td>
                            <td className="px-4 py-3">
                              <span
                                className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                                style={{
                                  color: STATUS_BADGE_COLOR[st] ?? '#F2EFE9',
                                  backgroundColor: `${STATUS_BADGE_COLOR[st] ?? '#F2EFE9'}15`,
                                  border: `1px solid ${STATUS_BADGE_COLOR[st] ?? '#F2EFE9'}30`,
                                }}
                              >
                                {stCfg?.label ?? st}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-[#E8962E]/5 rounded-full overflow-hidden w-20">
                                  <div
                                    className="h-full rounded-full bg-[#E8962E]"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-[#F2EFE9]/50 w-8 text-right">{pct}%</span>
                              </div>
                            </td>
                            {adminRol === 'owner' && (
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setClienteAEliminar(c); }}
                                  title="Eliminar cliente"
                                  className="p-2 rounded-lg text-[#F2EFE9]/40 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Client detail view ── */}
          {mainTab === 'clientes' && selectedCliente && (
            <div className="flex gap-6" style={{ height: 'calc(100vh - 120px)' }}>
              {/* Left: client list narrow */}
              <div className="w-[240px] shrink-0 flex flex-col">
                <button
                  onClick={() => setSelectedCliente(null)}
                  className="flex items-center gap-2 text-xs text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors mb-3"
                >
                  <ChevronRight className="w-3 h-3 rotate-180" /> Volver a la tabla
                </button>
                <div className="space-y-1.5 overflow-y-auto scrollbar-hide flex-1">
                  {clientes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCliente(c); setDetalleTab('resumen'); setIaRecomendacion(''); }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedCliente?.id === c.id
                          ? 'bg-[#E8962E]/10 border-[#E8962E]/30'
                          : 'bg-[#111110] border-[rgba(232,150,46,0.1)] hover:bg-[#E8962E]/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${SEMAFORO_CONFIG[c.semaforo].class}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#F2EFE9] truncate">{c.nombre}</p>
                          <p className="text-[10px] text-[#F2EFE9]/40">{c.cinturon.emoji} {c.cinturon.nombre} · Día {c.dia_programa}/90 · {c.ventas_count}/10 🎉</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: detail panel */}
              <div className="flex-1 card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                {/* Header */}
                <div className="absolute top-0 right-0 p-4 z-10">
                  <button onClick={() => setSelectedCliente(null)} className="p-2 rounded-full bg-black/40 text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/10 transition-colors backdrop-blur-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-8 border-b border-[rgba(232,150,46,0.1)] flex items-center gap-5 shrink-0 bg-[#1A1917]/30">
                  <div className="w-16 h-16 rounded-2xl bg-[#E8962E]/20 border border-[#E8962E]/30 flex items-center justify-center text-xl font-bold text-[#E8962E] shadow-inner">
                    {selectedCliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="text-2xl font-light text-[#F2EFE9] tracking-tight">{selectedCliente.nombre}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedCliente.plan === 'DFY' ? 'bg-[#E8962E]/20 text-[#E8962E] border border-[#E8962E]/30' : selectedCliente.plan === 'IMPLEMENTACION' ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#E8962E]/20 text-[#E8962E] border border-[#E8962E]/30'}`}>
                        {selectedCliente.plan}
                      </span>
                      {/* Status badge + quick change */}
                      <div className="flex items-center gap-1.5 relative">
                        <CustomSelect
                          value={selectedCliente.status ?? 'ACTIVE'}
                          onChange={(val) => cambiarStatusCliente(val as UserStatus)}
                          options={Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }))}
                          className="min-w-[120px]"
                        />
                        {statusCambiando && <Loader2 className="w-3 h-3 text-[#E8962E] animate-spin" />}
                      </div>
                      {/* Toggle acceso completo agentes */}
                      <button
                        onClick={toggleFullAgentAccess}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          selectedCliente.full_agent_access
                            ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30 hover:bg-[#22C55E]/25'
                            : 'bg-[#E8962E]/10 text-[#E8962E] border-[#E8962E]/30 hover:bg-[#E8962E]/20'
                        }`}
                      >
                        <Bot className="w-4 h-4" />
                        {selectedCliente.full_agent_access ? 'Agentes Activados' : 'Activar Agentes'}
                      </button>
                      {/* Cambiar email */}
                      <button
                        onClick={() => { setNewEmailInput(''); setShowChangeEmailModal(true); }}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border bg-[#E8962E]/10 text-[#E8962E] border-[#E8962E]/30 hover:bg-[#E8962E]/20"
                      >
                        <Mail className="w-4 h-4" />
                        Cambiar email
                      </button>
                      {/* Reset de contraseña */}
                      <button
                        onClick={handleSendReset}
                        disabled={sendingReset}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border bg-[#F2EFE9]/5 text-[#F2EFE9]/70 border-[#F2EFE9]/10 hover:bg-[#F2EFE9]/10 disabled:opacity-50"
                      >
                        {sendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        Enviar reset
                      </button>
                    </div>
                    <p className="text-xs text-[#F2EFE9]/60 flex items-center gap-2">
                      <Lock className="w-3 h-3 text-[#F2EFE9]/30" /> {selectedCliente.email}
                      {selectedCliente.especialidad && <><span>·</span> {selectedCliente.especialidad}</>}
                    </p>
                  </div>
                </div>

                {/* Tabs nav */}
                <div className="flex border-b border-[rgba(232,150,46,0.1)] px-6 shrink-0 bg-black/20">
                  {detailTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDetalleTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-4 text-xs font-semibold uppercase tracking-wider transition-all relative ${
                        detalleTab === tab.id
                          ? 'text-[#E8962E]'
                          : 'text-[#F2EFE9]/40 hover:text-[#F2EFE9]/80'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {detalleTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8962E] rounded-t-full shadow-[0_0_10px_rgba(232,150,46,0.5)]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-black/10">
                  {detalleLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-[#E8962E] animate-spin" /></div>
                  ) : (
                    <>
                      {/* ── RESUMEN ── */}
                      {detalleTab === 'resumen' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-4 text-center">
                              <p className="text-2xl font-light text-[#F2EFE9]">{selectedCliente.dia_programa}</p>
                              <div className="mt-3"><CintaCinturon cinturon={{ ...selectedCliente.cinturon, id: 'c', hito: '' } as never} variante="linea" /></div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {[{ l: '+30d', d: 30, t: 'Extensión 30 días' }, { l: '+60d', d: 60, t: 'Extensión 60 días' }, { l: '+90d', d: 90, t: 'Extensión 90 días' }, { l: '⏸ 14d', d: 14, t: 'Pausa 14 días' }].map((b) => (
                                  <button
                                    key={b.l}
                                    title={b.t}
                                    onClick={async () => {
                                      if (!supabase || !selectedCliente) return;
                                      if (!window.confirm(`${b.t} para ${selectedCliente.nombre}: el programa se corre ${b.d} días hacia adelante. ¿Confirmar?`)) return;
                                      const nueva = new Date(selectedCliente.fecha_inicio);
                                      nueva.setDate(nueva.getDate() + b.d);
                                      const { error } = await supabase.from('profiles').update({ fecha_inicio: nueva.toISOString().split('T')[0] }).eq('id', selectedCliente.id);
                                      if (!error) { alert(`${b.t} aplicada. Recarga la lista para ver el día nuevo.`); }
                                    }}
                                    className="px-2 py-1 rounded-md bg-[#E8962E]/10 border border-[#E8962E]/25 text-[10px] font-semibold text-[#E8962E] hover:bg-[#E8962E]/20 transition-colors"
                                  >{b.l}</button>
                                ))}
                              </div>
                              <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider mt-1">Día / 90</p>
                            </div>
                            <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-4 text-center">
                              <p className="text-2xl font-light text-[#E8962E] flex items-center justify-center gap-1"><Flame className="w-5 h-5" /> {selectedCliente.racha_diario}</p>
                              <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider mt-1">Racha diario</p>
                            </div>
                            <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-4 text-center">
                              <p className="text-2xl font-light text-[#22C55E]">{selectedCliente.ventas_count}</p>
                              <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider mt-1">Ventas reales</p>
                            </div>
                            <div className={`rounded-2xl p-4 text-center border ${
                              selectedCliente.estado_garantia === 'activada' ? 'bg-[#EF4444]/10 border-[#EF4444]/30' :
                              selectedCliente.estado_garantia === 'en_riesgo' ? 'bg-[#E8962E]/10 border-[#E8962E]/30' :
                              'bg-[#111110] border-[rgba(232,150,46,0.1)]'
                            }`}>
                              <Shield className={`w-6 h-6 mx-auto mb-1 ${
                                selectedCliente.estado_garantia === 'activada' ? 'text-[#EF4444]' :
                                selectedCliente.estado_garantia === 'en_riesgo' ? 'text-[#E8962E]' : 'text-[#F2EFE9]/30'
                              }`} />
                              <p className={`text-[10px] uppercase tracking-wider font-bold ${
                                selectedCliente.estado_garantia === 'activada' ? 'text-[#EF4444]' :
                                selectedCliente.estado_garantia === 'en_riesgo' ? 'text-[#E8962E]' : 'text-[#F2EFE9]/40'
                              }`}>{selectedCliente.estado_garantia === 'activada' ? 'Garantía' : selectedCliente.estado_garantia === 'en_riesgo' ? 'En riesgo' : 'En camino'}</p>
                            </div>
                          </div>

                          {/* ── PIPELINE ── */}
                          {(() => {
                            const clienteFase = getFaseFromProgress(selectedCliente.tareas_completadas);
                            const rawIdx = PIPELINE_STAGES.findIndex(s => s.fase === clienteFase);
                            const activeIdx = rawIdx === -1 ? 0 : rawIdx;
                            return (
                              <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40 mb-5">Pipeline del Programa</p>
                                <div className="flex items-start">
                                  {PIPELINE_STAGES.map((stage, i) => {
                                    const isActive = i === activeIdx;
                                    const isDone = i < activeIdx;
                                    return (
                                      <React.Fragment key={stage.label}>
                                        <div className="flex flex-col items-center gap-2 flex-1">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                                            isActive
                                              ? 'bg-[#E8962E] border-[#E8962E] shadow-[0_0_14px_rgba(232,150,46,0.45)]'
                                              : isDone
                                              ? 'bg-[#22C55E]/15 border-[#22C55E]/60'
                                              : 'bg-[#080808] border-[rgba(232,150,46,0.10)]'
                                          }`}>
                                            {isDone
                                              ? <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                                              : isActive
                                              ? <span className="w-2.5 h-2.5 bg-[#080808] rounded-full block" />
                                              : <span className={`text-[10px] font-bold ${isActive ? 'text-[#080808]' : 'text-[#F2EFE9]/20'}`}>{i + 1}</span>
                                            }
                                          </div>
                                          <div className="text-center px-1">
                                            <p className={`text-[11px] font-semibold leading-tight ${
                                              isActive ? 'text-[#E8962E]' : isDone ? 'text-[#22C55E]/70' : 'text-[#F2EFE9]/25'
                                            }`}>{stage.label}</p>
                                            <p className={`text-[9px] mt-0.5 ${isActive ? 'text-[#E8962E]/60' : 'text-[#F2EFE9]/15'}`}>{stage.sub}</p>
                                          </div>
                                        </div>
                                        {i < PIPELINE_STAGES.length - 1 && (
                                          <div className={`h-[2px] flex-1 mt-4 rounded-full mx-0.5 ${
                                            i < activeIdx ? 'bg-[#22C55E]/30' : 'bg-[rgba(232,150,46,0.08)]'
                                          }`} />
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-5">
                              <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-widest mb-1 font-bold">Progreso de Tareas</p>
                              <div className="flex items-end gap-2 mb-3">
                                <p className="text-3xl font-light text-[#F2EFE9]">{selectedCliente.tareas_completadas}</p>
                                <p className="text-sm text-[#F2EFE9]/40 mb-1">/ {selectedCliente.tareas_total}</p>
                              </div>
                              <div className="h-2 bg-[#E8962E]/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#E8962E] rounded-full" style={{ width: `${selectedCliente.tareas_total > 0 ? Math.round((selectedCliente.tareas_completadas / selectedCliente.tareas_total) * 100) : 0}%` }} />
                              </div>
                            </div>
                            <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-5">
                              <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-widest mb-2 font-bold">Último Diario</p>
                              {detalleDiario[0] ? (() => {
                                const d0 = detalleDiario[0];
                                const energia = d0.energia_nivel ?? d0.respuestas?.q3;
                                const logro = d0.diario_logro ?? d0.respuestas?.q4;
                                const freno = d0.diario_bloqueo ?? d0.respuestas?.q2;
                                return (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs text-[#F2EFE9]/40">{new Date(d0.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                      {d0.diario_score != null && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8962E]/15 text-[#E8962E]">{d0.diario_score}/100</span>
                                      )}
                                    </div>
                                    {energia != null && (
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <span className="text-[10px] text-[#F2EFE9]/40 uppercase font-bold">Energía</span>
                                        <div className="flex gap-0.5">
                                          {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className={`w-2 h-2 rounded-sm ${i < Number(energia) ? 'bg-[#E8962E]' : 'bg-[#E8962E]/10'}`} />
                                          ))}
                                        </div>
                                        <span className="text-[10px] text-[#E8962E] font-bold">{energia}/10</span>
                                      </div>
                                    )}
                                    {(d0.diario_cuerpo != null) && (
                                      <p className="text-[11px] text-[#F2EFE9]/50 mb-1">Cuerpo {d0.diario_cuerpo} · Mente {d0.diario_mente} · Emociones {d0.diario_emociones}</p>
                                    )}
                                    {logro && (
                                      <p className="text-xs text-[#F2EFE9]/80 line-clamp-2"><span className="text-[#22C55E] font-bold">Logro: </span>{logro}</p>
                                    )}
                                    {freno && (
                                      <p className="text-xs text-[#F2EFE9]/60 mt-1 line-clamp-1"><span className="text-[#E8962E] font-bold">Freno: </span>{freno}</p>
                                    )}
                                  </>
                                );
                              })() : <p className="text-xs text-[#F2EFE9]/30">Sin entradas de diario aún</p>}
                            </div>
                          </div>

                          <div className="bg-[#E8962E]/5 border border-[#E8962E]/20 rounded-2xl p-6 relative overflow-hidden">
                            <Bot className="absolute -right-6 -bottom-6 w-32 h-32 text-[#F2EFE9]/5" />
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-[#E8962E]/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-[#E8962E]" />
                                  </div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-[#E8962E]">Coach AI Assistant</p>
                                </div>
                                <button
                                  onClick={generarRecomendacion} disabled={iaLoading}
                                  className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#E8962E]/20"
                                >
                                  {iaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                  Analizar y Sugerir
                                </button>
                              </div>
                              {iaRecomendacion ? (
                                <div className="bg-black/20 rounded-xl p-4 border border-[#E8962E]/20">
                                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-headings:text-[#F2EFE9] prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1 prose-strong:text-[#E8962E] prose-strong:font-semibold prose-li:text-[#F2EFE9]/85 prose-li:my-0.5 prose-p:text-[#F2EFE9]/90">
                                    <Markdown>{iaRecomendacion}</Markdown>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-[#F2EFE9]/40">Haz clic en Analizar para que la IA escanee el perfil, métricas diarias y tareas pendientes de este cliente para crear recomendaciones proactivas de coaching.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── DIARIO ── */}
                      {detalleTab === 'mentor' && (
                <div className="space-y-5">
                  <p className="text-xs text-[#F2EFE9]/50">Todo lo que este cliente habló con el Mentor y sus entrenadores — sus respuestas, sus trabas, sus miedos. <strong className="text-[#E8962E]">Acá ves dónde intervenir.</strong></p>
                  {convsLoading ? (
                    <p className="text-sm text-[#F2EFE9]/40">Trayendo sus conversaciones…</p>
                  ) : convsCliente.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-[rgba(232,150,46,0.12)] rounded-xl">
                      <p className="text-sm text-[#F2EFE9]/50">Todavía no habló con el Mentor.</p>
                      <p className="text-xs text-[#F2EFE9]/30 mt-1">La primera conversación llega con la Sesión 1.</p>
                    </div>
                  ) : (
                    convsCliente.map((c) => (
                      <details key={c.agente} className="rounded-xl border border-[rgba(232,150,46,0.12)] bg-[#111110] overflow-hidden">
                        <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-[#F2EFE9]/85 hover:bg-[#E8962E]/5 transition-colors">
                          💬 {c.agente} <span className="text-[10px] text-[#F2EFE9]/35 ml-2">{c.mensajes.length} mensajes</span>
                        </summary>
                        <div className="max-h-96 overflow-y-auto px-4 pb-4 space-y-2">
                          {c.mensajes.map((msg, i) => (
                            <div key={i} className={`text-xs leading-relaxed p-2.5 rounded-lg ${msg.role === 'user' ? 'bg-[#E8962E]/8 text-[#F2EFE9]/90 ml-6' : 'bg-[#F2EFE9]/4 text-[#F2EFE9]/60 mr-6'}`}>
                              <span className="text-[9px] font-bold uppercase tracking-wider opacity-50 block mb-0.5">{msg.role === 'user' ? 'Cliente' : c.agente}</span>
                              {msg.content}
                            </div>
                          ))}
                        </div>
                      </details>
                    ))
                  )}
                </div>
              )}
              {detalleTab === 'evidencias' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#F2EFE9]/50">Las pruebas que subió el cliente en cada sesión-hito: la foto de la quema, el audio de su precio, la captura de la campaña, el comprobante del pago. <strong className="text-[#E8962E]">El comprobante del primer pago es la evidencia de la garantía.</strong></p>
                  {evidenciasLoading ? (
                    <p className="text-sm text-[#F2EFE9]/40">Buscando las evidencias del camino…</p>
                  ) : evidenciasCliente.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-[rgba(232,150,46,0.10)] rounded-xl">
                      <p className="text-sm text-[#F2EFE9]/50">Todavía no subió evidencias.</p>
                      <p className="text-xs text-[#F2EFE9]/30 mt-1">La primera llega con LA QUEMA (día 4).</p>
                    </div>
                  ) : (
                    evidenciasCliente.map((g) => (
                      <div key={g.meta} className="rounded-xl border border-[rgba(232,150,46,0.10)] bg-[#111110] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8962E] mb-2">Sesión {g.meta}</p>
                        <div className="flex flex-wrap gap-2">
                          {g.archivos.map((f) => (
                            <button key={f.path} onClick={() => abrirEvidencia(f.path)} className="px-3 py-2 rounded-lg bg-[#E8962E]/10 border border-[#E8962E]/25 text-xs text-[#E8962E] hover:bg-[#E8962E]/20 transition-colors">
                              📎 {f.name.length > 28 ? f.name.slice(0, 28) + '…' : f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {detalleTab === 'diario' && (
                        <div className="space-y-4">
                          {detalleDiario.length === 0 ? (
                            <p className="text-[#F2EFE9]/40 text-sm text-center py-12">Sin entradas de diario</p>
                          ) : detalleDiario.map((entrada: any, i: number) => {
                            const r = entrada.respuestas ?? {};
                            const energia = entrada.energia_nivel ?? r.q3;
                            const esV3 = entrada.diario_cuerpo != null || entrada.diario_logro != null;
                            const tagLabels = Array.isArray(entrada.diario_tareas)
                              ? entrada.diario_tareas.map((id: string) => TAREAS_TAGS.find((t) => t.id === id)?.label ?? id)
                              : [];
                            return (
                              <div key={i} className="p-6 rounded-2xl bg-[#111110] border border-[rgba(232,150,46,0.1)]">
                                <div className="flex items-center justify-between mb-4">
                                  <p className="text-sm font-semibold text-[#F2EFE9] tracking-wide">
                                    {new Date(entrada.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {entrada.diario_score != null && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8962E]/15 text-[#E8962E]">{entrada.diario_score}/100</span>
                                    )}
                                    {energia != null && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-[#F2EFE9]/40 uppercase font-bold">Energía</span>
                                        <div className="flex gap-0.5">
                                          {Array.from({ length: 10 }).map((_, idx) => (
                                            <div key={idx} className={`w-2 h-2 rounded-sm ${idx < Number(energia) ? 'bg-[#E8962E]' : 'bg-[#E8962E]/10'}`} />
                                          ))}
                                        </div>
                                        <span className="text-[10px] text-[#E8962E] font-bold">{energia}/10</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {esV3 ? (
                                  <div className="space-y-3">
                                    {entrada.diario_cuerpo != null && (
                                      <div className="flex gap-6 text-xs">
                                        <span className="text-[#F2EFE9]/60">Cuerpo <b className="text-[#F2EFE9]">{entrada.diario_cuerpo}</b></span>
                                        <span className="text-[#F2EFE9]/60">Mente <b className="text-[#F2EFE9]">{entrada.diario_mente}</b></span>
                                        <span className="text-[#F2EFE9]/60">Emociones <b className="text-[#F2EFE9]">{entrada.diario_emociones}</b></span>
                                      </div>
                                    )}
                                    {entrada.diario_logro && <div><p className="text-[10px] uppercase font-bold text-[#22C55E]/70 mb-1">Logro</p><p className="text-xs text-[#F2EFE9]/80">{entrada.diario_logro}</p></div>}
                                    {entrada.diario_bloqueo && <div><p className="text-[10px] uppercase font-bold text-[#E8962E]/70 mb-1">Bloqueo</p><p className="text-xs text-[#F2EFE9]/80">{entrada.diario_bloqueo}</p></div>}
                                    {tagLabels.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {tagLabels.map((l: string, idx: number) => (
                                          <span key={idx} className="text-[10px] bg-[#E8962E]/5 px-2 py-1 rounded-full text-[#F2EFE9]/60">{l}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-4">
                                    {r.q1 && <div className="col-span-2"><p className="text-[10px] uppercase font-bold text-[#E8962E]/70 mb-1">Cómo se sintió</p><p className="text-xs text-[#F2EFE9]/80">{r.q1}</p></div>}
                                    {r.q4 && <div><p className="text-[10px] uppercase font-bold text-[#22C55E]/70 mb-1">Acción tomada</p><p className="text-xs text-[#F2EFE9]/80">{r.q4}</p></div>}
                                    {r.q5 && <div><p className="text-[10px] uppercase font-bold text-[#E8962E]/70 mb-1">Pensamiento dominante</p><p className="text-xs text-[#F2EFE9]/80">{r.q5}</p></div>}
                                    {r.q2 && <div className="col-span-2"><p className="text-[10px] uppercase font-bold text-[#E8962E]/70 mb-1">Lo que lo frenó</p><p className="text-xs text-[#F2EFE9]/80">{r.q2}</p></div>}
                                    {r.q6 && <div><p className="text-[10px] uppercase font-bold text-[#E8962E]/70 mb-1">Emoción predominante</p><p className="text-xs text-[#F2EFE9]/80">{r.q6}</p></div>}
                                    {r.q7 && <div><p className="text-[10px] uppercase font-bold text-[#E8962E]/70 mb-1">Plan para mañana</p><p className="text-xs text-[#F2EFE9]/80">{r.q7}</p></div>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── METRICAS ── */}
                      {detalleTab === 'metricas' && (
                        <div className="space-y-5">
                          <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
                            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-[#F2EFE9]/60 flex items-center gap-2">
                                <BarChart2 className="w-3.5 h-3.5 text-[#E8962E]" /> Progreso por Pilar
                              </h3>
                              {metricasTareasLoading && <Loader2 className="w-3.5 h-3.5 text-[#E8962E] animate-spin" />}
                            </div>
                            <div className="divide-y divide-[rgba(232,150,46,0.1)]">
                              {SEED_ROADMAP_V2.map(pilar => {
                                const metasPilar = pilar.metas.length;
                                const completadasReales = selectedCliente.tareas_por_pilar?.[pilar.numero] ?? 0;
                                const pctPilar = metasPilar > 0 ? Math.round((completadasReales / metasPilar) * 100) : 0;
                                const expandido = pilarExpandido[pilar.numero] ?? false;
                                const tareasCompletadasPilar = metricasTareas.filter((t: any) => (t.pilar_numero ?? t.pilarNumero) === pilar.numero);
                                return (
                                  <div key={pilar.numero}>
                                    <button
                                      type="button"
                                      onClick={() => completadasReales > 0 && setPilarExpandido(prev => ({ ...prev, [pilar.numero]: !expandido }))}
                                      className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left bg-[#111110] ${
                                        completadasReales > 0 ? 'hover:bg-[#1A1917] cursor-pointer' : 'cursor-default'
                                      }`}
                                    >
                                      {(() => { const IC = ADMIN_PILAR_ICON_MAP[pilar.icon]; return IC ? <IC className="w-5 h-5 text-[#E8962E] shrink-0" /> : <span className="w-5 h-5 shrink-0" />; })()}
                                      <span className="text-xs text-[#F2EFE9]/80 w-36 truncate shrink-0 font-medium">{pilar.titulo}</span>
                                      <div className="flex-1 h-1.5 bg-[#E8962E]/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-[#E8962E] transition-all duration-500" style={{ width: `${pctPilar}%` }} />
                                      </div>
                                      <span className="text-xs text-[#F2EFE9]/40 w-10 text-right shrink-0">{completadasReales}/{metasPilar}</span>
                                      {completadasReales > 0 && (
                                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform text-[#E8962E] ${expandido ? 'rotate-180' : ''}`} />
                                      )}
                                    </button>
                                    {expandido && (
                                      <div className="px-5 pb-4 space-y-2 bg-[#E8962E]/5">
                                        {pilar.metas.map(meta => {
                                          const tareaData = tareasCompletadasPilar.find((t: any) => t.meta_codigo === meta.codigo);
                                          if (!tareaData) return null;
                                          const herramientaOutput = meta.herramienta_id
                                            ? metricasOutputs.find((o: any) => o.herramienta_id === meta.herramienta_id)
                                            : null;
                                          const rawOutput = tareaData.output_generado ?? herramientaOutput?.output ?? null;
                                          const hasOutput = !!rawOutput;
                                          return (
                                            <button
                                              key={meta.codigo}
                                              type="button"
                                              onClick={() => abrirTareaModal(meta, tareaData, rawOutput, selectedCliente.nombre)}
                                              className="w-full text-left bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl overflow-hidden hover:border-[rgba(232,150,46,0.18)] hover:bg-[#1A1917]/50 transition-all group"
                                            >
                                              <div className="flex items-center gap-3 p-3.5">
                                                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#E8962E]" />
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E8962E]/10 text-[#E8962E]">{meta.codigo}</span>
                                                    {meta.es_estrella && <Star className="w-3 h-3 text-[#E8962E] fill-[#E8962E]" />}
                                                    {tareaData.fecha_completada && (
                                                      <span className="text-[10px] text-[#F2EFE9]/30">
                                                        {new Date(tareaData.fecha_completada).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-sm font-semibold text-[#F2EFE9] mt-0.5 truncate">{meta.titulo}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                  {hasOutput && (
                                                    <span className="text-[10px] text-[#E8962E] bg-[#E8962E]/10 px-2 py-0.5 rounded-full">Con output</span>
                                                  )}
                                                  <ChevronRight className="w-3.5 h-3.5 text-[#F2EFE9]/30 group-hover:text-[#F2EFE9]/60 transition-colors" />
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                        {tareasCompletadasPilar.length === 0 && (
                                          <p className="text-xs text-[#F2EFE9]/30 py-2">Los datos llegan caminando — este cliente recién arranca.</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/60 mb-3">Métricas de Negocio Semanales</h3>
                            {detalleMetricas.length === 0 ? (
                              <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl p-6 text-center">
                                <p className="text-sm text-[#F2EFE9]/40">El cliente aún no cargó métricas semanales.</p>
                              </div>
                            ) : detalleMetricas.slice().reverse().map((m: any, i: number) => {
                              const esV3 = m.met_fecha_inicio != null || m.met_roas != null || m.met_ads_plataforma != null;
                              if (esV3) {
                                const kpis = calcularEmbudoV3KPIs(m);
                                const roas = m.met_roas ?? kpis.roas;
                                const periodo = m.met_fecha_inicio
                                  ? (m.met_periodo_tipo === 'dia'
                                      ? new Date(m.met_fecha_inicio + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                                      : `${new Date(m.met_fecha_inicio + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}–${m.met_fecha_fin ? new Date(m.met_fecha_fin + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : ''}`)
                                  : m.semana;
                                return (
                                  <div key={i} className="p-5 rounded-2xl bg-[#111110] border border-[rgba(232,150,46,0.1)] flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-[#F2EFE9]/60 bg-[#E8962E]/5 px-2.5 py-1 rounded-lg">{periodo}</span>
                                    <div className="flex gap-7">
                                      <div className="text-center"><p className={`text-lg font-bold ${roas != null && roas >= 2 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{roas != null ? `${Number(roas).toFixed(1)}×` : '—'}</p><p className="text-[10px] text-[#F2EFE9]/40 font-bold uppercase">ROAS</p></div>
                                      <div className="text-center"><p className="text-[#F2EFE9] text-lg font-light">{postsTotales(m)}</p><p className="text-[10px] text-[#F2EFE9]/40 font-bold uppercase">posts</p></div>
                                      <div className="text-center"><p className="text-[#22C55E] text-lg font-bold">{m.ventas_cerradas ?? 0}</p><p className="text-[10px] text-[#22C55E]/50 font-bold uppercase">ventas</p></div>
                                      <div className="text-center"><p className="text-[#F2EFE9] text-lg font-light">${Number(m.ingresos_cobrados ?? 0).toLocaleString('es-AR')}</p><p className="text-[10px] text-[#F2EFE9]/40 font-bold uppercase">ingresos</p></div>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={i} className="p-5 rounded-2xl bg-[#111110] border border-[rgba(232,150,46,0.1)] flex items-center justify-between mb-3">
                                  <span className="text-xs font-semibold text-[#F2EFE9]/60 bg-[#E8962E]/5 px-2.5 py-1 rounded-lg">{m.semana}</span>
                                  <div className="flex gap-8">
                                    <div className="text-center"><p className="text-[#F2EFE9] text-lg font-light">{m.leads ?? m.mensajes_recibidos ?? 0}</p><p className="text-[10px] text-[#F2EFE9]/40 font-bold uppercase">leads</p></div>
                                    <div className="text-center"><p className="text-[#F2EFE9] text-lg font-light">{m.conversaciones ?? m.llamadas_tomadas ?? 0}</p><p className="text-[10px] text-[#F2EFE9]/40 font-bold uppercase">llamadas</p></div>
                                    <div className="text-center"><p className="text-[#22C55E] text-lg font-bold">{m.ventas ?? m.ventas_cerradas ?? 0}</p><p className="text-[10px] text-[#22C55E]/50 font-bold uppercase">ventas</p></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── ADN ── */}
                      {detalleTab === 'adn' && (
                        <AdminClienteADN
                          clienteId={selectedCliente.id}
                          clienteNombre={selectedCliente.nombre}
                          adminRol={adminRol}
                        />
                      )}

                      {/* ── NOTAS INTERNAS ── */}
                      {detalleTab === 'notas' && (
                        <div className="space-y-4">
                          <p className="text-[10px] text-[#F2EFE9]/30 uppercase tracking-wider font-bold">Solo visible para admins -- No la ve el cliente</p>
                          <div className="flex gap-2">
                            <textarea
                              value={notaInput}
                              onChange={e => setNotaInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) agregarNota(); }}
                              placeholder="Escribí una nota interna... (Ctrl+Enter para guardar)"
                              rows={3}
                              className="flex-1 bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg py-3 px-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-all resize-none"
                            />
                            <button
                              onClick={agregarNota}
                              disabled={!notaInput.trim()}
                              className="btn-primary w-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shadow-lg shadow-[#E8962E]/20 shrink-0"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                          {notaLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-[#E8962E] animate-spin" /></div>
                          ) : detalleNotas.length === 0 ? (
                            <div className="text-center py-12">
                              <BookOpen className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                              <p className="text-[#F2EFE9]/40 text-sm">Sin notas aún. Usá esto para documentar contexto importante del cliente.</p>
                            </div>
                          ) : detalleNotas.map(nota => (
                            <div key={nota.id} className="bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-xl p-4">
                              <p className="text-sm text-[#F2EFE9]/90 leading-relaxed whitespace-pre-wrap">{nota.content}</p>
                              <p className="text-[10px] text-[#F2EFE9]/30 mt-2">
                                {new Date(nota.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── MENSAJES ── */}
                      {detalleTab === 'mensajes' && (
                        <div className="space-y-3">
                          {detalleMensajes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                              <MessageSquare className="w-10 h-10 text-gray-800 mb-4" />
                              <p className="text-[#F2EFE9]/40 text-sm">Comenzá la conversación con {selectedCliente.nombre}</p>
                            </div>
                          ) : detalleMensajes.map(m => {
                            const isMe = m.emisor_id === adminProfile.id;
                            const senderName = isMe ? adminProfile.nombre : selectedCliente.nombre;
                            const initial = senderName.charAt(0).toUpperCase();
                            return (
                              <div key={m.id} className={`flex gap-2.5 items-end max-w-[88%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border overflow-hidden ${isMe ? 'bg-[#E8962E]/20 border-[#E8962E]/30 text-[#E8962E]' : 'bg-[#E8962E]/10 border-[rgba(232,150,46,0.12)] text-[#F2EFE9]'}`}>
                                  {isMe
                                    ? (adminAvatar ? <img loading="lazy" src={adminAvatar} alt="" className="w-full h-full object-cover" /> : <Shield className="w-3.5 h-3.5" />)
                                    : initial}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className={`text-[10px] font-semibold text-[#F2EFE9]/40 px-1 ${isMe ? 'text-right' : ''}`}>{senderName}</span>
                                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                    isMe ? 'bg-[#E8962E]/25 text-[#F2EFE9] border border-[#E8962E]/20 rounded-tr-sm'
                                         : 'bg-[#1A1917]/60 text-[#F2EFE9]/90 border border-[rgba(232,150,46,0.12)] rounded-tl-sm'
                                  }`}>
                                    {m.contenido && <p>{m.contenido}</p>}
                                    <p className={`text-[10px] mt-1.5 opacity-40 ${isMe ? 'text-right' : ''}`}>
                                      {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Chat input for private messages */}
                {detalleTab === 'mensajes' && (
                  <div className="p-4 border-t border-[rgba(232,150,46,0.1)] shrink-0 bg-[#1A1917]/20">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mensajeInput}
                        onChange={e => setMensajeInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensajePrivado()}
                        placeholder="Escribe un mensaje privado..."
                        disabled={enviando}
                        className="flex-1 bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg py-3 px-5 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-all"
                      />
                      <button
                        onClick={enviarMensajePrivado}
                        disabled={!mensajeInput.trim() || enviando}
                        className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shadow-lg shadow-[#E8962E]/20"
                      >
                        {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Manager checklist floating panel */}
              {adminRol === 'manager' && checklistItems.length > 0 && (
                <div className="w-[260px] shrink-0">
                  <ManagerChecklist
                    items={checklistItems}
                    onToggle={toggleChecklistItem}
                    loading={checklistLoading}
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: MENSAJES (unified)
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'mensajes' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Channel tabs */}
              <div className="flex border-b border-[rgba(232,150,46,0.1)] px-6 shrink-0 bg-black/20">
                {([
                  { id: 'privados' as MensajesChannel, label: 'Privados', icon: MessageSquare },
                  // L2 · recorte: comunidad/victorias/consultas van al Canal de WhatsApp (v1 sin muro)
                ]).map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => { setMensajesChannel(ch.id); setChatCliente(null); }}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all relative ${
                      mensajesChannel === ch.id
                        ? 'text-[#E8962E]'
                        : 'text-[#F2EFE9]/40 hover:text-[#F2EFE9]/80'
                    }`}
                  >
                    <ch.icon className="w-4 h-4" />
                    {ch.label}
                    {(channelUnread[ch.id] ?? 0) > 0 && (
                      <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[#E8962E] text-[#F2EFE9] text-[9px] font-bold flex items-center justify-center">
                        {channelUnread[ch.id]}
                      </span>
                    )}
                    {mensajesChannel === ch.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8962E] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Channel content */}
              {mensajesChannel !== 'privados' ? (
                <div className="flex-1 min-h-0 p-4">
                  <GlobalChat canal={mensajesChannel} adminProfile={adminProfile} />
                </div>
              ) : (
                /* Privados: WhatsApp-style */
                <div className="flex flex-1 min-h-0 overflow-hidden">
                  {/* Left: client list */}
                  <div className="w-[280px] shrink-0 border-r border-[rgba(232,150,46,0.12)] flex flex-col bg-black/20">
                    <div className="p-4 border-b border-[rgba(232,150,46,0.12)]">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#F2EFE9]/40">Conversaciones ({clientes.length})</p>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                      {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-[#E8962E] animate-spin" /></div>
                      ) : clientes.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setChatCliente(c); cargarChatMessages(c.id); }}
                          className={`w-full text-left px-4 py-3.5 border-b border-[rgba(232,150,46,0.08)] transition-all flex items-center gap-3 ${
                            chatCliente?.id === c.id ? 'bg-[#E8962E]/10' : 'hover:bg-[#1A1917]/50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold border ${
                            chatCliente?.id === c.id ? 'bg-[#E8962E]/20 border-[#E8962E]/30 text-[#E8962E]' : 'bg-[#E8962E]/5 border-[rgba(232,150,46,0.12)] text-[#F2EFE9]'
                          }`}>
                            {c.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#F2EFE9] truncate">{c.nombre}</p>
                            <p className="text-[10px] text-[#F2EFE9]/40 truncate">{c.especialidad || 'Sin especialidad'}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full shrink-0 ${SEMAFORO_CONFIG[c.semaforo].class}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: conversation */}
                  {chatCliente ? (
                    <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
                      <div className="h-16 border-b border-[rgba(232,150,46,0.12)] flex items-center gap-3 px-6 shrink-0 bg-black/20">
                        <div className="w-9 h-9 rounded-full bg-[#E8962E]/20 border border-[#E8962E]/30 flex items-center justify-center text-sm font-bold text-[#E8962E]">
                          {chatCliente.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#F2EFE9]">{chatCliente.nombre}</p>
                          <p className="text-[10px] text-[#F2EFE9]/40">{chatCliente.especialidad || 'Día ' + chatCliente.dia_programa + '/90'}</p>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide space-y-3">
                        {chatLoading ? (
                          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#E8962E] animate-spin" /></div>
                        ) : chatMessages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageSquare className="w-10 h-10 text-gray-800 mb-4" />
                            <p className="text-[#F2EFE9]/40 text-sm">Comenzá la conversación con {chatCliente.nombre}</p>
                          </div>
                        ) : chatMessages.map(m => {
                          const isMe = m.emisor_id === adminProfile.id;
                          const senderName = isMe ? adminProfile.nombre : chatCliente.nombre;
                          return (
                            <div key={m.id} className={`flex gap-2.5 items-end max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border overflow-hidden ${isMe ? 'bg-[#E8962E]/20 border-[#E8962E]/30' : 'bg-[#E8962E]/10 border-[rgba(232,150,46,0.12)]'}`}>
                                {isMe
                                  ? (adminAvatar ? <img loading="lazy" src={adminAvatar} alt="" className="w-full h-full object-cover" /> : <Shield className="w-3.5 h-3.5 text-[#E8962E]" />)
                                  : senderName.charAt(0).toUpperCase()
                                }
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-semibold text-[#F2EFE9]/40 px-1 ${isMe ? 'text-right' : ''}`}>{senderName}</span>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                  isMe ? 'bg-[#E8962E]/25 text-[#F2EFE9] border border-[#E8962E]/20 rounded-tr-sm'
                                       : 'bg-[#1A1917]/60 text-[#F2EFE9]/90 border border-[rgba(232,150,46,0.12)] rounded-tl-sm'
                                }`}>
                                  <p>{m.contenido}</p>
                                  <p className={`text-[10px] mt-1.5 opacity-40 ${isMe ? 'text-right' : ''}`}>
                                    {new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="p-4 border-t border-[rgba(232,150,46,0.12)] shrink-0 bg-[#1A1917]/20">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarChatMsg()}
                            placeholder={`Mensaje a ${chatCliente.nombre}...`}
                            disabled={chatEnviando}
                            className="flex-1 bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg py-3 px-5 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-all"
                          />
                          <button
                            onClick={enviarChatMsg}
                            disabled={!chatInput.trim() || chatEnviando}
                            className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors shadow-lg shadow-[#E8962E]/20"
                          >
                            {chatEnviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                      <div>
                        <MessageSquare className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <p className="text-[#F2EFE9]/40 text-sm">Seleccioná un cliente para chatear</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: METRICAS
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'metricas' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Client filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setFiltroMetricasId(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    filtroMetricasId === null
                      ? 'bg-[#E8962E]/20 border-[#E8962E]/50 text-[#E8962E]'
                      : 'bg-[#1A1917]/50 border-[rgba(232,150,46,0.14)] text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/6'
                  }`}
                >
                  <Globe className="w-4 h-4 inline" /> Global ({clientes.length})
                </button>
                {clientes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setFiltroMetricasId(c.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      filtroMetricasId === c.id
                        ? 'bg-[#E8962E]/20 border-[#E8962E]/50 text-[#E8962E]'
                        : 'bg-[#1A1917]/50 border-[rgba(232,150,46,0.14)] text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/6'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${SEMAFORO_CONFIG[c.semaforo].class}`} />
                    {c.nombre.split(' ')[0]}
                  </button>
                ))}
                <button
                  onClick={() => { setMetricasGlobales(null); cargarMetricasGlobales(); cargarSatisfaccionGlobal(); cargarRatingsPorPilar(); cargarClientes(); }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1917]/50 border border-[rgba(232,150,46,0.14)] text-xs text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors"
                >
                  <Loader2 className="w-3.5 h-3.5" /> Actualizar
                </button>
              </div>

              {filtroMetricasId === null ? (
                <>
                  {/* KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Profesionales activos', value: clientes.length, icon: Users, color: 'text-[#E8962E]', border: 'border-[#E8962E]/20', bg: 'bg-[#E8962E]/5' },
                      { label: 'En ritmo', value: clientes.filter(c => c.semaforo === 'verde').length, icon: CheckCheck, color: 'text-[#22C55E]', border: 'border-[#22C55E]/20', bg: 'bg-[#22C55E]/5' },
                      { label: 'Necesitan atención', value: clientes.filter(c => c.semaforo === 'rojo' || c.semaforo === 'amarillo').length, icon: AlertTriangle, color: 'text-[#E8962E]', border: 'border-[#E8962E]/20', bg: 'bg-[#E8962E]/5' },
                      { label: 'Progreso promedio', value: clientes.length ? `${Math.round(clientes.reduce((a, c) => a + (c.tareas_total > 0 ? (c.tareas_completadas / c.tareas_total) * 100 : (c.progreso_porcentaje ?? 0)), 0) / clientes.length)}%` : '—', icon: TrendingUp, color: 'text-[#E8962E]', border: 'border-[#E8962E]/20', bg: 'bg-[#E8962E]/5' },
                      { label: 'Satisfacción promedio', value: satisfaccionGlobal !== null ? `${satisfaccionGlobal.toFixed(1)} / 5` : '—', icon: Star, color: 'text-[#E8962E]', border: 'border-[#E8962E]/20', bg: 'bg-[#E8962E]/5' },
                    ].map((s, i) => (
                      <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
                        <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                        <p className={`text-3xl font-light ${s.color} mb-1`}>{s.value}</p>
                        <p className="text-xs text-[#F2EFE9]/40 font-semibold uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress table */}
                  <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[rgba(232,150,46,0.1)] flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#F2EFE9]/60 flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5 text-[#E8962E]" /> Progreso individual
                      </h3>
                    </div>
                    <div className="divide-y divide-[rgba(232,150,46,0.1)]">
                      {clientes.length === 0 ? (
                        <p className="text-[#F2EFE9]/30 text-sm text-center py-10">El tablero espera a tu primer cliente</p>
                      ) : clientes.map(c => {
                        const pct = c.tareas_total > 0
                          ? Math.round((c.tareas_completadas / c.tareas_total) * 100)
                          : (c.progreso_porcentaje ?? 0);
                        return (
                          <button
                            key={c.id}
                            onClick={() => setFiltroMetricasId(c.id)}
                            className="w-full flex items-center gap-4 px-6 py-4 bg-[#111110] hover:bg-[#1A1917] transition-colors text-left group"
                          >
                            <div className={`w-2 h-2 rounded-full shrink-0 ${SEMAFORO_CONFIG[c.semaforo].class}`} />
                            <div className="w-32 shrink-0">
                              <p className="text-sm font-semibold text-[#F2EFE9] group-hover:text-[#E8962E] transition-colors truncate">{c.nombre}</p>
                              <p className="text-[10px] text-[#F2EFE9]/40">{c.cinturon.emoji} {c.cinturon.nombre} · Día {c.dia_programa}/90 · {c.ventas_count}/10 🎉</p>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-[#F2EFE9]/40">Pilar {derivePilarFromProgress(c.tareas_completadas)}</span>
                                <span className="text-xs font-bold text-[#F2EFE9]">{pct}%</span>
                              </div>
                              <div className="h-2 bg-[#E8962E]/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#E8962E] transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-5 shrink-0">
                              {c.racha_diario > 0 && <div className="text-center"><p className="text-sm font-bold text-[#E8962E] flex items-center gap-0.5"><Flame className="w-3.5 h-3.5" /> {c.racha_diario}</p><p className="text-[9px] text-[#F2EFE9]/30 uppercase">Racha</p></div>}
                              <div className="text-center"><p className={`text-sm font-bold ${c.ventas_count > 0 ? 'text-[#22C55E]' : 'text-[#F2EFE9]/30'}`}>{c.ventas_count}</p><p className="text-[9px] text-[#F2EFE9]/30 uppercase">Ventas</p></div>
                              <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#E8962E] transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Valoraciones por pilar (agregado global) */}
                  <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-[rgba(232,150,46,0.1)] flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#F2EFE9]/60 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-[#E8962E]" /> Valoraciones por pilar
                      </h3>
                      <span className="text-[10px] text-[#F2EFE9]/40">
                        {ratingsPorPilar.reduce((a, p) => a + p.count, 0)} reseñas totales · {ratingsPorPilar.length} pilares con datos
                      </span>
                    </div>
                    {ratingsPorPilar.length === 0 ? (
                      <p className="text-[#F2EFE9]/30 text-sm text-center py-10">Aún no hay valoraciones registradas por los clientes.</p>
                    ) : (
                      <div className="divide-y divide-[rgba(232,150,46,0.1)]">
                        {ratingsPorPilar.map((p) => {
                          const pilarSeed = SEED_ROADMAP_V2.find(s => s.numero === p.pilar_numero);
                          const titulo = p.pilar_titulo || pilarSeed?.titulo || `Pilar ${p.pilar_numero}`;
                          const expandido = pilarRatingExpandido[p.pilar_numero] ?? false;
                          const conComentarios = p.ratings.filter(r => r.comentario && r.comentario.trim().length > 0);
                          const maxDist = Math.max(1, ...Object.values(p.distribucion));
                          return (
                            <div key={p.pilar_numero} className="bg-[#111110]">
                              <button
                                type="button"
                                onClick={() => setPilarRatingExpandido(prev => ({ ...prev, [p.pilar_numero]: !expandido }))}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#1A1917] transition-colors text-left"
                              >
                                <div className="w-7 h-7 rounded-lg bg-[#E8962E]/10 border border-[#E8962E]/20 flex items-center justify-center text-xs font-bold text-[#E8962E] shrink-0">
                                  {p.pilar_numero}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#F2EFE9] truncate">{titulo}</p>
                                  <p className="text-[10px] text-[#F2EFE9]/40 mt-0.5">
                                    {p.count} valoración{p.count === 1 ? '' : 'es'} · {conComentarios.length} con reseña
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                      key={s}
                                      className={`w-3.5 h-3.5 ${s <= Math.round(p.avg) ? 'text-[#E8962E] fill-[#E8962E]' : 'text-[#F2EFE9]/15'}`}
                                    />
                                  ))}
                                  <span className="text-sm font-bold text-[#E8962E] ml-2 w-10 text-right">{p.avg.toFixed(1)}</span>
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 text-[#F2EFE9]/40 shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
                                />
                              </button>
                              {expandido && (
                                <div className="px-6 pb-5 pt-1 space-y-4 bg-[#0F0F0F] border-t border-[rgba(232,150,46,0.05)]">
                                  {/* Distribución 5→1 */}
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40 mb-2">Distribución</p>
                                    {([5, 4, 3, 2, 1] as const).map(level => {
                                      const cnt = p.distribucion[level];
                                      const pct = (cnt / maxDist) * 100;
                                      return (
                                        <div key={level} className="flex items-center gap-3">
                                          <span className="text-[10px] text-[#F2EFE9]/50 w-3">{level}</span>
                                          <Star className="w-3 h-3 text-[#E8962E] fill-[#E8962E] shrink-0" />
                                          <div className="flex-1 h-1.5 bg-[#E8962E]/5 rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full bg-[#E8962E] transition-all duration-500"
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                          <span className="text-[10px] text-[#F2EFE9]/40 w-8 text-right">{cnt}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {/* Reseñas con comentario */}
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40 mb-2">
                                      Reseñas {conComentarios.length > 0 ? `(${conComentarios.length})` : ''}
                                    </p>
                                    {conComentarios.length === 0 ? (
                                      <p className="text-xs text-[#F2EFE9]/30 italic">Sin comentarios escritos en este pilar.</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {conComentarios.map((r, idx) => {
                                          const cliente = clientes.find(c => c.id === r.usuario_id);
                                          const nombre = cliente?.nombre || 'Cliente';
                                          const fecha = r.created_at
                                            ? new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '';
                                          return (
                                            <div
                                              key={`${r.usuario_id}-${idx}`}
                                              className="bg-[#111110] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3"
                                            >
                                              <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <button
                                                    type="button"
                                                    onClick={() => setFiltroMetricasId(r.usuario_id)}
                                                    className="text-xs font-semibold text-[#F2EFE9] hover:text-[#E8962E] transition-colors truncate"
                                                  >
                                                    {nombre}
                                                  </button>
                                                  {fecha && <span className="text-[10px] text-[#F2EFE9]/30">· {fecha}</span>}
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                  {[1, 2, 3, 4, 5].map(s => (
                                                    <Star
                                                      key={s}
                                                      className={`w-3 h-3 ${s <= r.rating ? 'text-[#E8962E] fill-[#E8962E]' : 'text-[#F2EFE9]/15'}`}
                                                    />
                                                  ))}
                                                </div>
                                              </div>
                                              <p className="text-xs text-[#F2EFE9]/65 italic leading-relaxed">"{r.comentario}"</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Guarantee status */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'En camino al resultado', IconComp: CheckCircle2, count: clientes.filter(c => c.estado_garantia === 'en_camino').length, color: 'text-[#22C55E]', border: 'border-[#22C55E]/20', bg: 'bg-[#22C55E]/5' },
                      { label: 'En riesgo de garantía', IconComp: AlertTriangle, count: clientes.filter(c => c.estado_garantia === 'en_riesgo').length, color: 'text-[#E8962E]', border: 'border-[#E8962E]/20', bg: 'bg-[#E8962E]/5' },
                      { label: 'Garantía activada', IconComp: Shield, count: clientes.filter(c => c.estado_garantia === 'activada').length, color: 'text-[#EF4444]', border: 'border-[#EF4444]/20', bg: 'bg-[#EF4444]/5' },
                    ].map((s, i) => (
                      <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-5 flex items-center gap-4`}>
                        <s.IconComp className={`w-8 h-8 ${s.color}`} />
                        <div>
                          <p className={`text-3xl font-light ${s.color} mb-0.5`}>{s.count}</p>
                          <p className="text-xs text-[#F2EFE9]/60 font-medium">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Individual view */
                (() => {
                  const c = clientes.find(x => x.id === filtroMetricasId);
                  if (!c) return null;
                  const pct = c.tareas_total > 0
                    ? Math.round((c.tareas_completadas / c.tareas_total) * 100)
                    : (c.progreso_porcentaje ?? 0);
                  return (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 bg-[#E8962E]/10 border border-[#E8962E]/20 rounded-2xl p-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#E8962E]/30 border border-[#E8962E]/30 flex items-center justify-center text-xl font-bold text-[#F2EFE9]">
                          {c.nombre.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#F2EFE9]">{c.nombre}</h3>
                          <p className="text-sm text-[#F2EFE9]/60">{c.especialidad || 'Profesional de la salud'} · {c.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${SEMAFORO_CONFIG[c.semaforo].class}`} />
                          <span className={`text-sm font-semibold ${SEMAFORO_CONFIG[c.semaforo].text}`}>{SEMAFORO_CONFIG[c.semaforo].label}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Día del programa', value: `${c.dia_programa}/90`, color: 'text-[#E8962E]' },
                          { label: 'Tareas completadas', value: `${c.tareas_completadas}/${c.tareas_total}`, color: 'text-[#E8962E]' },
                          { label: 'Racha diario', value: c.racha_diario > 0 ? `${c.racha_diario} días` : '—', color: 'text-[#E8962E]' },
                          { label: 'Ventas registradas', value: c.ventas_count, color: 'text-[#22C55E]' },
                        ].map((s, i) => (
                          <div key={i} className="bg-[#111110] border border-[rgba(232,150,46,0.14)] rounded-2xl p-4">
                            <p className={`text-2xl font-light ${s.color} mb-1`}>{s.value}</p>
                            <p className="text-[10px] text-[#F2EFE9]/40 uppercase tracking-wider font-semibold">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#F2EFE9]/60">Progreso en el programa</p>
                          <p className="text-2xl font-light text-[#F2EFE9]">{pct}%</p>
                        </div>
                        <div className="h-3 bg-[#E8962E]/5 rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full bg-[#E8962E] transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Satisfaction ratings per pilar */}
                      <div className="bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-2xl p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#F2EFE9]/60 mb-3 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-[#E8962E]" /> Valoraciones por pilar
                        </p>
                        {clienteRatings.length === 0 ? (
                          <p className="text-xs text-[#F2EFE9]/30">Sin valoraciones registradas aún.</p>
                        ) : (
                          <div className="space-y-3">
                            {clienteRatings.map((r) => (
                              <div key={r.pilar_numero} className="border-b border-[rgba(255,255,255,0.05)] last:border-0 pb-3 last:pb-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-[#F2EFE9]/70">
                                    Pilar {r.pilar_numero}{r.pilar_titulo ? ` — ${r.pilar_titulo}` : ''}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-[#E8962E] fill-[#E8962E]' : 'text-[#F2EFE9]/15'}`}
                                      />
                                    ))}
                                    <span className="text-xs text-[#F2EFE9]/40 ml-1">{r.rating}/5</span>
                                  </div>
                                </div>
                                {r.comentario && (
                                  <p className="text-xs text-[#F2EFE9]/45 italic bg-[#F2EFE9]/3 rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.05)]">
                                    "{r.comentario}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pilar accordion */}
                      <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
                        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[#F2EFE9]/60 flex items-center gap-2">
                            <BarChart2 className="w-3.5 h-3.5 text-[#E8962E]" /> Estimación por pilar
                          </h3>
                          {metricasTareasLoading && <Loader2 className="w-3.5 h-3.5 text-[#E8962E] animate-spin" />}
                        </div>
                        <div className="divide-y divide-[rgba(232,150,46,0.1)]">
                          {SEED_ROADMAP_V2.map(pilar => {
                            const metasPilar = pilar.metas.length;
                            const completadasReales = (c as any).tareas_por_pilar
                              ? ((c as any).tareas_por_pilar[pilar.numero] ?? 0)
                              : Math.min(metasPilar, Math.max(0, c.tareas_completadas - SEED_ROADMAP_V2.slice(0, pilar.numero).reduce((a, p) => a + p.metas.length, 0)));
                            const pctPilar = metasPilar > 0 ? Math.round((completadasReales / metasPilar) * 100) : 0;
                            const expandido = pilarExpandido[pilar.numero] ?? false;
                            const tareasCompletadasPilar = metricasTareas.filter((t: any) => (t.pilar_numero ?? t.pilarNumero) === pilar.numero);
                            return (
                              <div key={pilar.numero}>
                                <button
                                  type="button"
                                  onClick={() => completadasReales > 0 && setPilarExpandido(prev => ({ ...prev, [pilar.numero]: !expandido }))}
                                  className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left bg-[#111110] ${
                                    completadasReales > 0 ? 'hover:bg-[#1A1917] cursor-pointer' : 'cursor-default'
                                  }`}
                                >
                                  {(() => { const IC = ADMIN_PILAR_ICON_MAP[pilar.icon]; return IC ? <IC className="w-5 h-5 text-[#E8962E] shrink-0" /> : <span className="w-5 h-5 shrink-0" />; })()}
                                  <span className="text-xs text-[#F2EFE9]/80 w-36 truncate shrink-0 font-medium">{pilar.titulo}</span>
                                  <div className="flex-1 h-1.5 bg-[#E8962E]/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-[#E8962E] transition-all duration-500" style={{ width: `${pctPilar}%` }} />
                                  </div>
                                  <span className="text-xs text-[#F2EFE9]/40 w-10 text-right shrink-0">{completadasReales}/{metasPilar}</span>
                                  {completadasReales > 0 && (
                                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform text-[#E8962E] ${expandido ? 'rotate-180' : ''}`} />
                                  )}
                                </button>

                                {expandido && (
                                  <div className="px-5 pb-4 space-y-2 bg-[#E8962E]/5">
                                    {pilar.metas.map(meta => {
                                      const tareaData = tareasCompletadasPilar.find((t: any) => t.meta_codigo === meta.codigo);
                                      if (!tareaData) return null;
                                      const herramientaOutput = meta.herramienta_id
                                        ? metricasOutputs.find((o: any) => o.herramienta_id === meta.herramienta_id)
                                        : null;
                                      const rawOutput = tareaData.output_generado ?? herramientaOutput?.output ?? null;
                                      const hasOutput = !!rawOutput;
                                      return (
                                        <button
                                          key={meta.codigo}
                                          type="button"
                                          onClick={() => abrirTareaModal(meta, tareaData, rawOutput, c.nombre)}
                                          className="w-full text-left bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl overflow-hidden hover:border-[rgba(232,150,46,0.18)] hover:bg-[#1A1917]/50 transition-all group"
                                        >
                                          <div className="flex items-center gap-3 p-3.5">
                                            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#E8962E]" />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E8962E]/10 text-[#E8962E]">{meta.codigo}</span>
                                                {meta.es_estrella && <Star className="w-3 h-3 text-[#E8962E] fill-[#E8962E]" />}
                                                {tareaData.fecha_completada && (
                                                  <span className="text-[10px] text-[#F2EFE9]/30">
                                                    {new Date(tareaData.fecha_completada).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-sm font-semibold text-[#F2EFE9] mt-0.5 truncate">{meta.titulo}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {hasOutput && (
                                                <span className="text-[10px] text-[#E8962E] bg-[#E8962E]/10 px-2 py-0.5 rounded-full">Con output</span>
                                              )}
                                              <ChevronRight className="w-3.5 h-3.5 text-[#F2EFE9]/30 group-hover:text-[#F2EFE9]/60 transition-colors" />
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                    {tareasCompletadasPilar.length === 0 && (
                                      <p className="text-xs text-[#F2EFE9]/30 py-2">Los datos llegan caminando — este cliente recién arranca.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelectedCliente(c); setMainTab('clientes'); setDetalleTab('resumen'); }}
                        className="w-full py-3 rounded-xl bg-[#E8962E]/10 border border-[#E8962E]/20 text-[#E8962E] text-sm font-semibold hover:bg-[#E8962E]/20 transition-colors"
                      >
                        Ver perfil completo con diario, métricas y mensajes
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: VIDEOS (pilar-based)
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'videos' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-[#F2EFE9] tracking-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Videos del Programa</h2>
                  <p className="text-sm text-[#F2EFE9]/40 mt-1">Agregá videos de YouTube por pilar. Se muestran automáticamente en la Biblioteca de tus clientes.</p>
                </div>
                <button
                  onClick={() => { setVideoForm({ pilar_id: '', titulo: '', descripcion: '', youtubeUrl: '', duracion: '' }); setShowAddVideo(true); }}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-[#E8962E]/20"
                >
                  <Plus className="w-4 h-4" /> Agregar Video
                </button>
              </div>

              {/* Videos grouped by pilar */}
              {SEED_ROADMAP_V3.map(pilar => {
                // Find videos for this pilar: match by pilar_id or fallback grupo mapping
                const vids = adminVideos.filter(v => v.pilar_id === pilar.id);
                // Also find VIDEO tasks in the roadmap for this pilar
                const videoTask = pilar.metas.find(m => m.tipo === 'VIDEO');
                return (
                  <div key={pilar.id} className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-[rgba(232,150,46,0.12)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => { const IC = ADMIN_PILAR_ICON_MAP[pilar.icon]; return IC ? <IC className="w-4 h-4 text-[#E8962E]" /> : null; })()}
                        <p className="text-sm font-semibold text-[#F2EFE9]">{pilar.id} — {pilar.titulo}</p>
                        {videoTask && <span className="text-[10px] text-[#F2EFE9]/30 ml-2 truncate max-w-[200px]">{videoTask.titulo}</span>}
                      </div>
                      <span className="text-[10px] bg-[#E8962E]/5 px-2 py-0.5 rounded-full text-[#F2EFE9]/40">{vids.length} videos</span>
                    </div>
                    {videosLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#E8962E] animate-spin" /></div>
                    ) : vids.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-[#F2EFE9]/30">Sin videos en este pilar todavía.</div>
                    ) : (
                      <div className="divide-y divide-[rgba(232,150,46,0.1)]">
                        {vids.map(v => {
                          const vidId = getYoutubeId(v.youtubeUrl);
                          return (
                            <div key={v.id} className="flex items-center gap-4 px-5 py-3 bg-[#111110] hover:bg-[#1A1917] transition-colors">
                              <div className="w-16 h-10 rounded-lg overflow-hidden bg-black/40 shrink-0">
                                {vidId ? (
                                  <img loading="lazy" src={`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`} alt={v.titulo} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Youtube className="w-4 h-4 text-[#EF4444]/40" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#F2EFE9] truncate">{v.titulo}</p>
                                <p className="text-xs text-[#F2EFE9]/40 truncate">{v.descripcion}</p>
                              </div>
                              <span className="text-[10px] text-[#E8962E] font-medium shrink-0">{v.pilar_id ?? v.grupo}</span>
                              {v.duracion && <span className="text-[10px] text-[#F2EFE9]/40 shrink-0">{v.duracion}</span>}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setVideoForm({
                                      id: v.id,
                                      pilar_id: (v.pilar_id ?? '') as PilarId | '',
                                      titulo: v.titulo,
                                      descripcion: v.descripcion,
                                      youtubeUrl: v.youtubeUrl,
                                      duracion: v.duracion || '',
                                    });
                                    setShowAddVideo(true);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-[#E8962E]/5 hover:bg-[#E8962E]/10 flex items-center justify-center text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors shrink-0"
                                  title="Editar video"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteAdminVideo(v.id)}
                                  className="w-7 h-7 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] transition-colors shrink-0"
                                  title="Eliminar video"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: EQUIPO (owner only)
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'equipo' && (adminRol === 'owner' || !adminRol) && (
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-white tracking-tight" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Gestión de Equipo</h2>
                  <p className="text-sm text-white/40 mt-1">Administrá roles y permisos de los miembros del equipo.</p>
                </div>
                <button onClick={() => setShowAddTeamMember(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Agregar Miembro
                </button>
              </div>

              <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl overflow-visible">
                {teamLoading ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-[#E8962E] animate-spin" /></div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-16">
                    <UsersRound className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                    <p className="text-[#F2EFE9]/40 text-sm">El equipo se arma acá — agregá al primero.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(232,150,46,0.1)]">
                        {['Nombre', 'Rol', 'Estado'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40">{h}</th>
                        ))}
                        <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#F2EFE9]/40">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map(member => {
                        const memberRol: AdminRol = member.admin_rol ?? 'owner';
                        return (
                          <tr key={member.id} className="bg-[#111110] hover:bg-[#1A1917] border-b border-[rgba(232,150,46,0.1)] transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#E8962E]/10 border border-[rgba(232,150,46,0.12)] flex items-center justify-center text-sm font-bold text-[#F2EFE9]">
                                  {member.nombre?.charAt(0)?.toUpperCase() ?? '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#F2EFE9]">{member.nombre}</p>
                                  <p className="text-[10px] text-[#F2EFE9]/40">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {member.id === adminProfile.id ? (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-[#E8962E]/20 text-[#E8962E] border border-[#E8962E]/30">
                                  {memberRol}
                                </span>
                              ) : (
                                <CustomSelect
                                  value={memberRol}
                                  onChange={(val) => cambiarRolAdmin(member.id, val as AdminRol)}
                                  options={[
                                    { value: 'owner', label: 'Owner' },
                                    { value: 'manager', label: 'Manager' },
                                    { value: 'staff', label: 'Staff' },
                                  ]}
                                  className="w-32"
                                />
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                                Activo
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {member.id === adminProfile.id ? (
                                <span className="text-[10px] text-[#F2EFE9]/30 italic">Vos</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setMiembroAEliminar({ id: member.id, nombre: member.nombre ?? 'Miembro', email: member.email ?? '' })}
                                  title="Eliminar miembro"
                                  className="p-2 rounded-lg text-[#F2EFE9]/40 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {showAddTeamMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                  <div className="w-full max-w-md max-h-[90vh] bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl relative overflow-y-auto scrollbar-hide">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8962E]" />
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-semibold text-white tracking-tight">Agregar Miembro</h3>
                        <p className="text-xs text-white/40 mt-1">Creá una cuenta para un nuevo miembro del equipo</p>
                      </div>
                      <button onClick={() => setShowAddTeamMember(false)} className="w-8 h-8 rounded-full bg-[#E8962E]/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#E8962E]/10 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">Nombre completo *</label>
                        <input type="text" value={teamForm.nombre} onChange={e => setTeamForm({ ...teamForm, nombre: e.target.value })} placeholder="Ej: María García" className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8962E]/50 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">Email *</label>
                        <input type="email" value={teamForm.email} onChange={e => setTeamForm({ ...teamForm, email: e.target.value })} placeholder="nombre@ejemplo.com" className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8962E]/50 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#22C55E]/80 mb-2">Contraseña inicial *</label>
                        <input type="text" value={teamForm.password} onChange={e => setTeamForm({ ...teamForm, password: e.target.value })} placeholder="Ej: Equipo123!" className="w-full bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg px-4 py-3 text-sm text-[#22C55E] placeholder-[#22C55E]/30 focus:outline-none focus:border-[#22C55E]/50 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">Rol en el equipo *</label>
                        <CustomSelect value={teamForm.admin_rol} onChange={(val) => setTeamForm({ ...teamForm, admin_rol: val as AdminRol })} options={[{ value: 'owner', label: 'Owner — Acceso total' }, { value: 'manager', label: 'Manager — Gestión de clientes' }, { value: 'staff', label: 'Staff — Acceso limitado' }]} className="w-full" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                      <button onClick={() => setShowAddTeamMember(false)} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold transition-colors">Cancelar</button>
                      <button onClick={agregarMiembroEquipo} disabled={creandoTeam || !teamForm.nombre.trim() || !teamForm.email.trim() || !teamForm.password.trim()} className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {creandoTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Miembro'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: CAMPAÑAS & CREATIVOS
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'campanas' && (
            <div className="max-w-6xl mx-auto">
              {/* Selector de cliente */}
              <div className="mb-6 card-panel p-4">
                <label className="block text-[10px] font-bold tracking-wider uppercase text-[#F2EFE9]/40 mb-2">
                  Seleccionar cliente
                </label>
                <CustomSelect
                  value={campanasClienteId ?? ''}
                  onChange={(val) => setCampanasClienteId(val || null)}
                  options={clientes.map(c => ({
                    value: c.id,
                    label: `${c.nombre} — ${c.especialidad ?? 'Sin especialidad'}`,
                  }))}
                />
                {campanasPerfilLoading && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#F2EFE9]/40">
                    <Loader2 className="w-3 h-3 animate-spin" /> Trayendo su historia completa…
                  </div>
                )}
                {campanasClientePerfil && !campanasPerfilLoading && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#22C55E]">
                    <Check className="w-3 h-3" />
                    Trabajando con: {campanasClientePerfil.nombre}
                    {campanasClientePerfil.adn_avatar ? ' (ADN completo)' : ' (ADN parcial)'}
                  </div>
                )}
              </div>

              {/* Campanas module */}
              {campanasClienteId && campanasClientePerfil ? (
                <Campanas
                  key={campanasClienteId}
                  userId={campanasClienteId}
                  perfil={campanasClientePerfil}
                  geminiKey={import.meta.env.VITE_GEMINI_API_KEY}
                />
              ) : !campanasPerfilLoading && (
                <div className="card-panel p-10 text-center">
                  <Megaphone className="w-10 h-10 text-[#F2EFE9]/15 mx-auto mb-3" />
                  <p className="text-sm text-[#F2EFE9]/40">
                    Selecciona un cliente para comenzar a crear campanas con su ADN de negocio.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB: CREATIVOS (generador standalone, sin paso de copy)
              ═══════════════════════════════════════════════════════════════════════ */}
          {mainTab === 'creativos' && (
            <div className="max-w-6xl mx-auto">
              {/* Selector de cliente (reusa el state de campanas) */}
              <div className="mb-6 card-panel p-4">
                <label className="block text-[10px] font-bold tracking-wider uppercase text-[#F2EFE9]/40 mb-2">
                  Seleccionar cliente
                </label>
                <CustomSelect
                  value={campanasClienteId ?? ''}
                  onChange={(val) => setCampanasClienteId(val || null)}
                  options={clientes.map(c => ({
                    value: c.id,
                    label: `${c.nombre} — ${c.especialidad ?? 'Sin especialidad'}`,
                  }))}
                />
                {campanasPerfilLoading && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#F2EFE9]/40">
                    <Loader2 className="w-3 h-3 animate-spin" /> Trayendo su historia completa…
                  </div>
                )}
                {campanasClientePerfil && !campanasPerfilLoading && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#22C55E]">
                    <Check className="w-3 h-3" />
                    Trabajando con: {campanasClientePerfil.nombre}
                  </div>
                )}
              </div>

              {campanasClienteId && campanasClientePerfil ? (
                <CreativosView
                  key={campanasClienteId}
                  userId={campanasClienteId}
                  perfil={campanasClientePerfil}
                  geminiKey={import.meta.env.VITE_GEMINI_API_KEY}
                />
              ) : !campanasPerfilLoading && (
                <div className="card-panel p-10 text-center">
                  <Image className="w-10 h-10 text-[#F2EFE9]/15 mx-auto mb-3" />
                  <p className="text-sm text-[#F2EFE9]/40">
                    Selecciona un cliente para generar creativos con su ADN de negocio.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: TAREAS INTERNAS
              ═══════════════════════════════════════════════════════════════ */}
          {mainTab === 'tareas' && (
            <TasksPipeline
              currentAdminId={adminProfile?.id ?? ''}
              adminRol={adminRol}
              teamMembers={teamMembers}
              clientes={clientes}
              initialTareaId={pendingTareaId}
              onInitialTareaOpened={() => setPendingTareaId(null)}
            />
          )}

        </div>
      </main>

      {/* ─── MODAL AJUSTES ADMIN ────────────────────────────────────────────────── */}
      {showAdminSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8962E]" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#F2EFE9]">Ajustes de Perfil Admin</h3>
              <button onClick={() => setShowAdminSettings(false)} className="w-8 h-8 rounded-full bg-[#E8962E]/5 flex items-center justify-center text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 mb-6">
              <input ref={adminAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAdminAvatarUpload} />
              <button
                onClick={() => adminAvatarInputRef.current?.click()}
                className="relative group w-20 h-20 rounded-full border-2 border-dashed border-[rgba(232,150,46,0.18)] hover:border-[#E8962E]/50 transition-colors overflow-hidden"
              >
                {adminAvatar ? (
                  <img loading="lazy" src={adminAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#E8962E]/10 flex items-center justify-center text-2xl font-bold text-[#E8962E]">
                    {(adminDraft.nombre || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#F2EFE9]" />
                </div>
              </button>
              <p className="text-xs text-[#F2EFE9]/40">Clic para cambiar foto</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={adminDraft.nombre}
                  onChange={e => setAdminDraft({ ...adminDraft, nombre: e.target.value })}
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Cargo / Título</label>
                <input
                  type="text"
                  value={adminDraft.cargo}
                  onChange={e => setAdminDraft({ ...adminDraft, cargo: e.target.value })}
                  placeholder="Ej: Coach Principal, Soporte Técnico..."
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Apariencia</label>
                <div role="radiogroup" aria-label="Tema visual" className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={theme === 'dark'}
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'bg-[#E8962E]/15 border-[rgba(232,150,46,0.5)] text-[#E8962E]'
                        : 'bg-black/20 border-[rgba(232,150,46,0.10)] text-[#F2EFE9]/70 hover:text-[#F2EFE9] hover:border-[rgba(232,150,46,0.18)]'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Oscuro
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={theme === 'light'}
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      theme === 'light'
                        ? 'bg-[#E8962E]/15 border-[rgba(232,150,46,0.5)] text-[#E8962E]'
                        : 'bg-black/20 border-[rgba(232,150,46,0.10)] text-[#F2EFE9]/70 hover:text-[#F2EFE9] hover:border-[rgba(232,150,46,0.18)]'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Claro
                  </button>
                </div>
                <p className="text-[11px] text-[#F2EFE9]/40 mt-2">El cambio se aplica al toque y se recuerda la próxima vez que entres.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAdminSettings(false)} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button
                onClick={guardarConfigAdmin}
                disabled={guardandoAdmin || !adminDraft.nombre.trim()}
                className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {guardandoAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL MIGRACIÓN CLIENTE ────────────────────────────────────────────── */}
      {showMigrationWizard && (
        <MigrationWizard
          onClose={() => setShowMigrationWizard(false)}
          onSuccess={cargarClientes}
          clientes={clientes}
        />
      )}

      {/* ─── MODAL CAMBIAR EMAIL DEL CLIENTE ────────────────────────────────────── */}
      {showChangeEmailModal && selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(232,150,46,0.1)]">
              <div>
                <h3 className="text-sm font-semibold text-[#F2EFE9]">Cambiar email</h3>
                <p className="text-[11px] text-[#F2EFE9]/50 mt-0.5">{selectedCliente.nombre}</p>
              </div>
              <button
                onClick={() => setShowChangeEmailModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F2EFE9]/40 hover:text-[#F2EFE9] hover:bg-[#F2EFE9]/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider mb-1.5">Email actual</label>
                <p className="text-sm text-[#F2EFE9]/60 px-3 py-2 bg-black/20 rounded-lg border border-[rgba(232,150,46,0.1)]">{selectedCliente.email ?? '—'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider mb-1.5">Nuevo email *</label>
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  autoFocus
                  disabled={changingEmail}
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-xl px-4 py-2.5 text-sm text-[#F2EFE9] placeholder-[#F2EFE9]/30 focus:outline-none focus:border-[#E8962E]/50 transition-colors disabled:opacity-50"
                />
              </div>
              <div className="bg-[#E8962E]/5 border border-[#E8962E]/20 rounded-xl px-3 py-2">
                <p className="text-[11px] text-[#E8962E]/80">
                  El cliente usará este email para hacer login. La contraseña actual se mantiene — si querés que la cambie, mandá "Enviar reset" después.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowChangeEmailModal(false)}
                  disabled={changingEmail}
                  className="flex-1 py-2.5 rounded-xl border border-[#F2EFE9]/10 text-sm text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeEmail}
                  disabled={changingEmail || !newEmailInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#E8962E] hover:bg-[#F4B65C] disabled:opacity-50 text-black text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  {changingEmail ? <><Loader2 className="w-4 h-4 animate-spin" /> Cambiando...</> : 'Confirmar cambio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL NUEVO CLIENTE ────────────────────────────────────────────────── */}
      {showNuevoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8962E]" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-[#F2EFE9] tracking-tight">Nuevo Estudiante</h3>
                <p className="text-xs text-[#F2EFE9]/40 mt-1">Ingresa sus datos para la academia</p>
              </div>
              <button onClick={() => setShowNuevoCliente(false)} className="w-8 h-8 rounded-full bg-[#E8962E]/5 flex items-center justify-center text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Nombre completo *</label>
                <input type="text" value={nuevoForm.nombre} onChange={e => setNuevoForm({ ...nuevoForm, nombre: e.target.value })} placeholder="Ej: Dra. María González" className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Email *</label>
                <input type="email" value={nuevoForm.email} onChange={e => setNuevoForm({ ...nuevoForm, email: e.target.value })} placeholder="maria@ejemplo.com" className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#22C55E]/80 mb-2">Contraseña inicial *</label>
                <input type="text" value={nuevoForm.password} onChange={e => setNuevoForm({ ...nuevoForm, password: e.target.value })} placeholder="Ej: Maria123!" className="w-full bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-lg px-4 py-3 text-sm text-[#22C55E] placeholder-[#22C55E]/30 focus:outline-none focus:border-[#22C55E]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Especialidad</label>
                <input type="text" value={nuevoForm.especialidad} onChange={e => setNuevoForm({ ...nuevoForm, especialidad: e.target.value })} placeholder="Ej: Nutricionista" className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Plan</label>
                  <CustomSelect
                    value={nuevoForm.plan}
                    onChange={(val) => setNuevoForm({ ...nuevoForm, plan: val as 'DWY' | 'DFY' | 'IMPLEMENTACION' })}
                    options={[
                      { value: 'DWY', label: 'DWY — Solo App' },
                      { value: 'DFY', label: 'DFY — Con Acompañamiento' },
                      { value: 'IMPLEMENTACION', label: 'Implementación' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Inicio</label>
                  <input type="date" value={nuevoForm.fecha_inicio} onChange={e => setNuevoForm({ ...nuevoForm, fecha_inicio: e.target.value })} className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Estado inicial</label>
                <CustomSelect
                  value={nuevoForm.status}
                  onChange={(val) => setNuevoForm({ ...nuevoForm, status: val as UserStatus })}
                  options={[
                    { value: 'ONBOARDING', label: 'Onboarding (cliente nuevo)' },
                    { value: 'ACTIVE', label: 'Activo (ya conoce la app)' },
                  ]}
                />
              </div>

            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={crearClienteLocal} disabled={creando || !nuevoForm.email || !nuevoForm.nombre || !nuevoForm.password} className="btn-primary flex-1 py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-[#E8962E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {creando ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</> : 'Crear Cuenta Activa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ADD/EDIT VIDEO ──────────────────────────────────────────────── */}
      {showAddVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8962E]" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#F2EFE9]">{videoForm.id ? 'Editar Video' : 'Nuevo Video'}</h3>
              <button onClick={() => setShowAddVideo(false)} className="w-8 h-8 rounded-full bg-[#E8962E]/5 flex items-center justify-center text-[#F2EFE9]/60 hover:text-[#F2EFE9] hover:bg-[#E8962E]/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">URL de YouTube *</label>
                <input
                  type="text"
                  value={videoForm.youtubeUrl}
                  onChange={e => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                  placeholder="https://youtu.be/... o https://youtube.com/watch?v=..."
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors"
                />
                {videoForm.youtubeUrl && getYoutubeId(videoForm.youtubeUrl) && (
                  <img
                    src={`https://img.youtube.com/vi/${getYoutubeId(videoForm.youtubeUrl)}/mqdefault.jpg`}
                    alt="preview"
                    className="mt-2 w-full rounded-xl object-cover aspect-video"
                  />
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Pilar *</label>
                <CustomSelect
                  value={videoForm.pilar_id}
                  onChange={(val) => setVideoForm({ ...videoForm, pilar_id: val as PilarId | '' })}
                  options={[
                    { value: '', label: 'Elegí un pilar…' },
                    ...PILAR_OPTIONS.map(p => ({ value: p.id, label: p.label })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Título *</label>
                <input
                  type="text"
                  value={videoForm.titulo}
                  onChange={e => setVideoForm({ ...videoForm, titulo: e.target.value })}
                  placeholder="Ej: Módulo 1 — Identidad del Fundador"
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Descripción</label>
                <input
                  type="text"
                  value={videoForm.descripcion}
                  onChange={e => setVideoForm({ ...videoForm, descripcion: e.target.value })}
                  placeholder="Breve descripción del contenido"
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/60 mb-2">Duración (opcional)</label>
                <input
                  type="text"
                  value={videoForm.duracion}
                  onChange={e => setVideoForm({ ...videoForm, duracion: e.target.value })}
                  placeholder="Ej: 15:30"
                  className="w-full bg-black/20 border border-[rgba(232,150,46,0.12)] rounded-lg px-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8962E]/50 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddVideo(false)} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button
                disabled={!videoForm.youtubeUrl.trim() || !videoForm.titulo.trim() || !videoForm.pilar_id}
                onClick={() => {
                  const pilar = videoForm.pilar_id;
                  if (!videoForm.youtubeUrl.trim() || !videoForm.titulo.trim() || !pilar) return;
                  saveAdminVideo({
                    id: videoForm.id,
                    pilar_id: pilar,
                    titulo: videoForm.titulo.trim(),
                    descripcion: videoForm.descripcion.trim(),
                    youtubeUrl: videoForm.youtubeUrl.trim(),
                    duracion: videoForm.duracion.trim() || undefined,
                  });
                  setShowAddVideo(false);
                }}
                className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {videoForm.id ? 'Guardar Cambios' : <><Plus className="w-4 h-4" /> Agregar Video</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DETALLE TAREA ──────────────────────────────────────────────────── */}
      {tareaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setTareaModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] bg-[#111110] border border-[rgba(232,150,46,0.12)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 p-6 border-b border-[rgba(232,150,46,0.12)]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8962E]/15 text-[#E8962E] border border-[#E8962E]/20">
                    {tareaModal.meta.codigo}
                  </span>
                  {tareaModal.meta.es_estrella && <span className="text-[#E8962E] text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-[#E8962E]" /> Tarea estrella</span>}
                  {tareaModal.tareaData?.fecha_completada && (
                    <span className="text-[11px] text-[#F2EFE9]/40">
                      Completada el {new Date(tareaModal.tareaData.fecha_completada).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-[#F2EFE9]">{tareaModal.meta.titulo}</h2>
                <p className="text-xs text-[#F2EFE9]/40 mt-1 leading-relaxed">{tareaModal.meta.descripcion}</p>
              </div>
              <button
                onClick={() => setTareaModal(null)}
                className="p-2 rounded-xl hover:bg-[#E8962E]/10 text-[#F2EFE9]/40 hover:text-[#F2EFE9] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
              <div className="bg-[#E8962E]/5 border border-[#E8962E]/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-[#E8962E]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8962E]">Resumen para el equipo</span>
                </div>
                {tareaResumenLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="w-4 h-4 text-[#E8962E] animate-spin" />
                    <span className="text-sm text-[#F2EFE9]/60">Analizando el output de {tareaModal.clienteNombre}...</span>
                  </div>
                ) : tareaResumen ? (
                  <p className="text-sm text-[#F2EFE9]/90 leading-relaxed">{tareaResumen}</p>
                ) : (
                  <p className="text-sm text-[#F2EFE9]/40 italic">
                    {tareaModal.output ? 'No se pudo generar el resumen automático.' : 'Esta tarea no tiene output guardado — fue marcada como completada manualmente.'}
                  </p>
                )}
              </div>

              {tareaModal.output ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-3.5 h-3.5 text-[#F2EFE9]/40" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#F2EFE9]/40">Output generado por el cliente</span>
                  </div>
                  <div className="bg-black/30 border border-[rgba(232,150,46,0.12)] rounded-2xl p-5">
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-[#F2EFE9] prose-headings:font-semibold prose-strong:text-[#E8962E] prose-li:text-[#F2EFE9]/80">
                      <Markdown>{tareaModal.output}</Markdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Circle className="w-8 h-8 text-gray-700 mb-3" />
                  <p className="text-sm text-[#F2EFE9]/40">Sin output guardado</p>
                  <p className="text-xs text-gray-700 mt-1">El cliente completó esta tarea pero no hay contenido generado por IA asociado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: confirmar eliminacion de cliente (owner only)
          ═══════════════════════════════════════════════════════════════ */}
      {clienteAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#111110] border border-[#EF4444]/30 rounded-3xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#EF4444] rounded-t-3xl" />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Eliminar cliente</h3>
                <p className="text-sm text-white/60 mt-1">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-black/30 border border-[#EF4444]/20 rounded-xl p-4 mb-6 space-y-1">
              <p className="text-sm text-white">
                <span className="text-white/50">Cliente:</span> <span className="font-semibold">{clienteAEliminar.nombre}</span>
              </p>
              <p className="text-xs text-white/50 truncate">{clienteAEliminar.email}</p>
            </div>
            <p className="text-xs text-white/50 mb-6 leading-relaxed">
              Se eliminará la cuenta, el profile, diario, métricas, tareas, mensajes, notas, ratings, campañas y creativos asociados. El email quedará libre para reutilizarse.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setClienteAEliminar(null)}
                disabled={eliminando}
                className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarCliente}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {eliminando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Eliminar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: confirmar eliminacion de miembro del equipo (owner only)
          ═══════════════════════════════════════════════════════════════ */}
      {miembroAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#111110] border border-[#EF4444]/30 rounded-3xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#EF4444] rounded-t-3xl" />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Eliminar miembro</h3>
                <p className="text-sm text-white/60 mt-1">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="bg-black/30 border border-[#EF4444]/20 rounded-xl p-4 mb-6 space-y-1">
              <p className="text-sm text-white">
                <span className="text-white/50">Miembro:</span> <span className="font-semibold">{miembroAEliminar.nombre}</span>
              </p>
              {miembroAEliminar.email && <p className="text-xs text-white/50 truncate">{miembroAEliminar.email}</p>}
            </div>
            <p className="text-xs text-white/50 mb-6 leading-relaxed">
              Se revocará el acceso y se eliminará la cuenta del equipo. Las tareas que tuviera asignadas quedarán sin responsable.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMiembroAEliminar(null)}
                disabled={eliminando}
                className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarMiembro}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {eliminando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Eliminar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MANAGER CHECKLIST COMPONENT ────────────────────────────────────────────────

function ManagerChecklist({
  items,
  onToggle,
  loading,
}: {
  items: AdminChecklistItem[];
  onToggle: (id: string, completada: boolean) => void;
  loading: boolean;
}) {
  const categorias: { key: AdminChecklistItem['categoria']; label: string }[] = [
    { key: 'diaria', label: 'Tareas del día' },
    { key: 'semanal', label: 'Semanales' },
    { key: 'mensual', label: 'Mensuales' },
  ];

  const diarias = items.filter(i => i.categoria === 'diaria');
  const completadasDiarias = diarias.filter(i => i.completada).length;

  return (
    <div className="card-panel border border-[rgba(232,150,46,0.12)] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-[#E8962E]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8962E]">Checklist</h3>
      </div>
      {diarias.length > 0 && (
        <p className="text-[10px] text-[#F2EFE9]/40 font-medium">
          {completadasDiarias}/{diarias.length} tareas del día
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 text-[#E8962E] animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-xs text-[#F2EFE9]/30">Sin tareas asignadas</p>
      ) : (
        categorias.map(cat => {
          const catItems = items.filter(i => i.categoria === cat.key);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.key}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#F2EFE9]/40 mb-2">{cat.label}</p>
              <div className="space-y-1.5">
                {catItems.map(item => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#E8962E]/5 cursor-pointer transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onToggle(item.id, !item.completada)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        item.completada
                          ? 'bg-[#22C55E] border-[#22C55E] text-[#F2EFE9]'
                          : 'border-[rgba(232,150,46,0.18)] text-transparent hover:border-[#E8962E]/50'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <span className={`text-xs ${item.completada ? 'text-[#F2EFE9]/30 line-through' : 'text-[#F2EFE9]/80'}`}>
                      {item.titulo}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
