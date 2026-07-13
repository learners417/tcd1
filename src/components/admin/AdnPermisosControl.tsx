import { useState } from 'react';
import { toast } from 'sonner';
import { Lock, Unlock, Bot, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AGENTES = [
  { id: 'mentor', label: 'Mentor' },  { id: 'diego', label: 'Diego · método' },
  { id: 'vera',  label: 'Vera · oferta' }, { id: 'sofi', label: 'Sofi · sistemas' },
  { id: 'mateo', label: 'Mateo · contenido' }, { id: 'caro', label: 'Caro · cámara' },
  { id: 'bruno', label: 'Bruno · WhatsApp' }, { id: 'lucas', label: 'Lucas · ventas' },
  { id: 'ramiro', label: 'Ramiro · métricas' },
];

const MODULOS = [
  { id: 'campanas',  label: 'Campañas' },
  { id: 'creativos', label: 'Creativos' },
];

interface Props {
  clienteId: string;
  agentesActuales?: string[];   // profiles.agentes_activos
  modulosActuales?: string[];   // profiles.modulos_activos
  onSaved?: () => void;
}

function ChipGroup({ titulo, icon, items, activos, master, onToggle }: {
  titulo: string; icon: React.ReactNode;
  items: { id: string; label: string }[];
  activos: string[]; master?: string;
  onToggle: (next: string[]) => void;
}) {
  const allOn = master ? activos.includes(master) : false;
  const toggle = (id: string) => {
    if (master && id === master) return onToggle(allOn ? [] : [master]);
    const base = activos.filter(a => a !== master);
    onToggle(base.includes(id) ? base.filter(a => a !== id) : [...base, id]);
  };
  const isOn = (id: string) => allOn || activos.includes(id);

  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-[#F2EFE9]/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {icon}{titulo}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {master && (
          <button onClick={() => toggle(master)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
              allOn ? 'bg-[#E8962E] text-black border-[#E8962E]'
                    : 'border-[rgba(232,150,46,0.25)] text-[#E8962E]/70 hover:text-[#E8962E]'}`}>
            {allOn ? <Unlock className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
            Todos
          </button>
        )}
        {items.map(it => (
          <button key={it.id} onClick={() => toggle(it.id)} disabled={allOn}
            className={`px-3 py-1.5 rounded-full text-[11px] border transition-all disabled:opacity-50 ${
              isOn(it.id) ? 'bg-[#E8962E]/15 text-[#E8962E] border-[#E8962E]/40'
                          : 'border-[#F2EFE9]/10 text-[#F2EFE9]/40 hover:text-[#F2EFE9]/70'}`}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdnPermisosControl({ clienteId, agentesActuales, modulosActuales, onSaved }: Props) {
  const [agentes, setAgentes] = useState<string[]>(agentesActuales ?? []);
  const [modulos, setModulos] = useState<string[]>(modulosActuales ?? []);
  const [saving, setSaving] = useState(false);

  async function guardar() {
    setSaving(true);
    try {
      const { error } = await supabase.rpc('admin_migrate_profile', {
        target_user_id: clienteId,
        updates: { agentes_activos: agentes, modulos_activos: modulos },
      });
      if (error) throw error;
      toast.success('Permisos actualizados');
      onSaved?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#080808] border border-[rgba(232,150,46,0.12)] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-[#F2EFE9] mb-4">Accesos del cliente</h3>
      <ChipGroup titulo="Agentes activos" icon={<Bot className="w-3 h-3" />}
        items={AGENTES} activos={agentes} master="todos" onToggle={setAgentes} />
      <ChipGroup titulo="Módulos habilitados" icon={<LayoutGrid className="w-3 h-3" />}
        items={MODULOS} activos={modulos} onToggle={setModulos} />
      <button onClick={guardar} disabled={saving}
        className="w-full mt-2 py-2.5 rounded-xl bg-[#E8962E] hover:bg-[#F4B65C] disabled:opacity-50 text-black text-sm font-bold transition-all">
        {saving ? 'Guardando...' : 'Guardar accesos'}
      </button>
    </div>
  );
}
