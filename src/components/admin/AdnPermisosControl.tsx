import { useState } from 'react';
import { toast } from 'sonner';
import { Bot, LayoutGrid, FileText, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AGENTES = [
  { id: 'diego', label: 'Diego' }, { id: 'vera', label: 'Vera' }, { id: 'sofi', label: 'Sofi' },
  { id: 'mateo', label: 'Mateo' }, { id: 'caro', label: 'Caro' }, { id: 'bruno', label: 'Bruno' },
  { id: 'lucas', label: 'Lucas' }, { id: 'ramiro', label: 'Ramiro' },
];

const MODULOS = [
  { id: 'campanas', label: 'Campañas' },
  { id: 'creativos', label: 'Creativos' },
];

const SECCIONES_ADN = [
  { id: 'ID', label: 'Identidad' }, { id: 'META', label: 'Meta' }, { id: 'IRR', label: 'Oferta' },
  { id: 'NEG', label: 'Negocio' }, { id: 'INF', label: 'Infraestructura' }, { id: 'CAP', label: 'Captación' },
  { id: 'MET', label: 'Métricas' },
];

interface Props {
  clienteId: string;
  agentesActuales?: string[];
  modulosActuales?: string[];
  adnActuales?: string[];
  onSaved?: () => void;
}

function Fila({ titulo, icon, items, activos, master, onToggle }: {
  titulo: string; icon: React.ReactNode;
  items: { id: string; label: string }[];
  activos: string[]; master?: string;
  onToggle: (next: string[]) => void;
}) {
  const allOn = master ? activos.includes(master) : false;
  const toggle = (id: string) => {
    if (master && id === master) return onToggle(allOn ? [] : [master]);
    const base = activos.filter((a) => a !== master);
    onToggle(base.includes(id) ? base.filter((a) => a !== id) : [...base, id]);
  };
  const isOn = (id: string) => allOn || activos.includes(id);

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gold/6 last:border-0">
      <div className="flex items-center gap-1.5 w-32 shrink-0 pt-0.5 text-[11px] font-bold text-cream/55 uppercase tracking-wider">
        {icon}{titulo}
      </div>
      <div className="flex flex-wrap gap-1">
        {master && (
          <button onClick={() => toggle(master)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-all ${
              allOn ? 'bg-gold text-black border-gold' : 'border-gold/25 text-gold/60 hover:text-gold'}`}>
            {master === 'todas' ? 'Todas' : 'Todos'}
          </button>
        )}
        {items.map((it) => (
          <button key={it.id} onClick={() => toggle(it.id)} disabled={allOn}
            className={`px-2 py-0.5 rounded-md text-[11px] border transition-all disabled:opacity-40 ${
              isOn(it.id) ? 'bg-gold/15 text-gold border-gold/30' : 'border-cream/10 text-cream/35 hover:text-cream/70'}`}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdnPermisosControl({ clienteId, agentesActuales, modulosActuales, adnActuales, onSaved }: Props) {
  const [agentes, setAgentes] = useState<string[]>(agentesActuales ?? []);
  const [modulos, setModulos] = useState<string[]>(modulosActuales ?? []);
  const [adn, setAdn] = useState<string[]>(adnActuales ?? []);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const wrap = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  async function guardar() {
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc('admin_migrate_profile', {
        target_user_id: clienteId,
        updates: { agentes_activos: agentes, modulos_activos: modulos, adn_edit_secciones: adn },
      });
      if (error) throw error;
      toast.success('Accesos actualizados');
      setDirty(false);
      onSaved?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-panel border border-gold/10 rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-bold text-cream/55 uppercase tracking-wider">Accesos del cliente</p>
        <button onClick={guardar} disabled={saving || !dirty}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
            dirty ? 'bg-gold text-black hover:bg-goldhi' : 'bg-cream/5 text-cream/45'} disabled:opacity-60`}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? 'Guardando' : dirty ? 'Guardar' : 'Guardado'}
        </button>
      </div>
      <Fila titulo="Agentes" icon={<Bot className="w-3 h-3" />} items={AGENTES} activos={agentes} master="todos" onToggle={wrap(setAgentes)} />
      <Fila titulo="Módulos" icon={<LayoutGrid className="w-3 h-3" />} items={MODULOS} activos={modulos} onToggle={wrap(setModulos)} />
      <Fila titulo="Edita su ADN" icon={<FileText className="w-3 h-3" />} items={SECCIONES_ADN} activos={adn} master="todas" onToggle={wrap(setAdn)} />
    </div>
  );
}
