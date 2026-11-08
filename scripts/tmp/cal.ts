import { SEED_ROADMAP_V3 } from '../../src/lib/roadmapSeed';
const EST=(d:number)=>d<=7?'LAGO':d<=14?'MONTA':d<=56?'VIENT':d<=70?'RIO  ':d<=84?'BOSQU':'CIERR';
const filas:any[]=[];
for (const p of SEED_ROADMAP_V3 as any[]) for (const m of p.metas)
  if (typeof m.dia_asignado==='number') filas.push({p:p.id,d:m.dia_asignado,c:m.codigo,t:m.titulo});
filas.sort((a,b)=>a.d-b.d);
for (const f of filas) console.log(`${String(f.d).padStart(2)} ${EST(f.d)} ${String(f.p).padEnd(4)} ${String(f.c).padEnd(10)} ${f.t}`);
