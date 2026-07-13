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
    <div className="flex items-start gap-3 py-2 border-b border-[rgba(232,150,46,0.06)] last:border-0">
      <div className="flex items-center gap-1.5 w-32 shrink-0 pt-0.5 text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider">
        {icon}{titulo}
      </div>
      <div className="flex flex-wrap gap-1">
        {master && (
          <button onClick={() => toggle(master)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
              allOn ? 'bg-[#E8962E] text-black border-[#E8962E]' : 'border-[rgba(232,150,46,0.25)] text-[#E8962E]/60 hover:text-[#E8962E]'}`}>
            {master === 'todas' ? 'Todas' : 'Todos'}
          </button>
        )}
        {items.map((it) => (
          <button key={it.id} onClick={() => toggle(it.id)} disabled={allOn}
            className={`px-2 py-0.5 rounded-md text-[10px] border transition-all disabled:opacity-40 ${
              isOn(it.id) ? 'bg-[#E8962E]/15 text-[#E8962E] border-[#E8962E]/30' : 'border-[#F2EFE9]/10 text-[#F2EFE9]/35 hover:text-[#F2EFE9]/70'}`}>
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
    <div className="bg-[#111110] border border-[rgba(232,150,46,0.1)] rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider">Accesos del cliente</p>
        <button onClick={guardar} disabled={saving || !dirty}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
            dirty ? 'bg-[#E8962E] text-black hover:bg-[#F4B65C]' : 'bg-[#F2EFE9]/5 text-[#F2EFE9]/30'} disabled:opacity-60`}>
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
