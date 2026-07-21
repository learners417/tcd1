/**
 * LA CADENA DEL ADN — S10. Los 9 eslabones del ikigai, encendiéndose:
 * historia → herida → dones → a quién sirvo → propósito → PUV → método →
 * oferta → precio. Cadena completa = listo para grabar anuncios y lanzar.
 */
import React from 'react';
import { getOrigen } from '../lib/origen';

function sello(id: string): boolean {
  try { return Boolean((JSON.parse(localStorage.getItem('tcd_adn_sellos_v1') ?? '{}'))[id]); } catch { return false; }
}
function perfilCampo(campo: string): boolean {
  try { return Boolean(String((JSON.parse(localStorage.getItem('tcd_profile') ?? '{}'))[campo] ?? '').trim()); } catch { return false; }
}
function progreso(codigo: string): boolean {
  try { return (JSON.parse(localStorage.getItem('tcd_hoja_ruta_v2') ?? '[]') as string[]).includes(codigo); } catch { return false; }
}

export default function CadenaADN() {
  const o = getOrigen();
  const eslabones = [
    { label: 'Historia', on: Boolean(o.porque) || sello('H-P1.3') },
    { label: 'Herida', on: Boolean(o.herida) },
    { label: 'Dones', on: Boolean(o.paciente) },
    { label: 'A quién sirvo', on: perfilCampo('avatar_cliente') || sello('H-P4.3') || sello('H-P6.3') },
    { label: 'Propósito', on: sello('H-P2.3') || sello('H-P2.2') },
    { label: 'PUV', on: perfilCampo('posicionamiento') || sello('H-P5.2') },
    { label: 'Método', on: perfilCampo('metodo_nombre') || sello('H-P7.3') },
    { label: 'Oferta', on: perfilCampo('oferta_mid') || sello('H-P8.2') },
    { label: 'Precio', on: progreso('1-P1.5') },
  ];
  const listos = eslabones.filter((e) => e.on).length;
  return (
    <div className="card-panel px-5 py-4">
      <div className="flex items-baseline justify-between mb-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/60">🧬 Tu ADN</p>
        <p className="text-[11px] font-bold text-gold">{listos === 9 ? 'Completo — listo para grabar y lanzar' : `${listos} de 9 sellados`}</p>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {eslabones.map((e, i) => (
          <React.Fragment key={e.label}>
            {i > 0 && <div className={`h-px w-2 shrink-0 ${e.on && eslabones[i - 1].on ? 'bg-gold/60' : 'bg-cream/15'}`} />}
            <div className="shrink-0 text-center" title={e.label}>
              <div className={`w-3 h-3 rounded-full mx-auto ${e.on ? 'bg-gold ring-2 ring-gold/25' : 'bg-cream/15'}`} />
              <p className={`text-[9px] mt-1 whitespace-nowrap ${e.on ? 'text-cream/75' : 'text-cream/35'}`}>{e.label}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
