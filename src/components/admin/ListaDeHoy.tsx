import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Send, ArrowUpRight, Plus, AlertTriangle } from 'lucide-react';
import {
  ordenar, porArea, titularDelDia, comoSeResuelve, aQuienEscala,
  avisoDeEscalado, ETIQUETA_DESTINO, POR_QUE,
  type TareaDelCerebro, type TareaOrdenada, type AperturaDeTarea,
} from '../../lib/cerebro';
import { miListaDeHoy, cerrar, mandarleAlCliente } from '../../lib/cerebroStorage';
import { mensajesEsperando, crearTareasDeSoporte } from '../../lib/soporteStorage';
import { mensajeDeFalla } from '../../lib/conexion';
import Termino from '../Termino';
import TarjetaCliente, { type Semaforo } from './TarjetaCliente';

/**
 * LA LISTA ÚNICA — todo el trabajo del día, venga de donde venga.
 *
 * ═══ LO QUE CAMBIA ═══
 *
 * Antes había dos listas: la que la app calculaba —que desaparecía al
 * recargar— y la que alguien escribía a mano en otra tab. **Nunca se veían
 * juntas**, así que no había forma de entender el día completo ni de contestar
 * «¿por qué esta tarea?».
 *
 * Ahora es una sola, cada tarea dice de dónde vino, y **cada botón abre lo que
 * hace falta para resolverla**. Nunca «búscalo tú».
 */

export default function ListaDeHoy({
  personaId,
  onAbrir,
  onNuevaTarea,
  clientes = [],
}: {
  personaId: string;
  /** Para poder mirar quién está esperando respuesta. */
  clientes?: Array<{ id: string; nombre: string }>;
  /** La pantalla que sabe navegar decide CÓMO; acá solo se dice QUÉ abrir. */
  onAbrir?: (a: AperturaDeTarea) => void;
  onNuevaTarea?: () => void;
}) {
  const [tareas, setTareas] = useState<TareaOrdenada[] | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      // Primero se miran los mensajes esperando y se convierten en tareas.
      // Va ANTES de traer la lista para que aparezcan en la misma pasada: si
      // se hiciera después, habría que recargar para verlos y quien no
      // recarga no se entera — que es el problema que esto viene a arreglar.
      if (clientes.length > 0) {
        const esperando = await mensajesEsperando(clientes);
        if (esperando.length > 0) await crearTareasDeSoporte(esperando, personaId);
      }

      const crudas = await miListaDeHoy(personaId);
      setTareas(ordenar(crudas));
      setProblema(null);
    } catch (err) {
      setProblema(mensajeDeFalla(err, 'traer tu lista'));
      setTareas([]);
    }
  }, [personaId, clientes]);

  useEffect(() => {
    let vivo = true;
    void (async () => { if (vivo) await cargar(); })();
    return () => { vivo = false; };
  }, [cargar]);

  const mandar = async (t: TareaOrdenada) => {
    if (!t.clienteId || !t.textoListo) return;
    setTrabajando(t.id ?? '');
    const ok = await mandarleAlCliente({
      clienteId: t.clienteId, deQuien: personaId,
      texto: t.textoListo, tareaId: t.id,
    });
    setTrabajando(null);
    if (!ok) {
      // Se dice, no se calla: creer que el mensaje salió cuando no salió es
      // exactamente el error que esta pantalla vino a arreglar.
      setProblema('No se pudo mandar el mensaje. No salió: prueba de nuevo.');
      return;
    }
    await cargar();
  };

  const marcarHecha = async (t: TareaOrdenada) => {
    if (!t.id) return;
    setTrabajando(t.id);
    await cerrar(t.id, personaId);
    setTrabajando(null);
    await cargar();
  };

  // Sin persona no hay lista posible, y decirlo es mejor que un cargando
  // eterno: un «mirando…» que nunca termina parece que la app se colgó.
  if (!personaId) {
    return (
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-sm text-cream/70">
          No se pudo identificar tu usuario, así que no puedo traerte tu lista.
        </p>
        <p className="text-sm text-cream/45 mt-1">
          Sal y vuelve a entrar. Si sigue igual, avisale al equipo.
        </p>
      </div>
    );
  }

  if (tareas === null) {
    return (
      <div className="rounded-2xl border border-cream/12 p-5">
        <p className="text-sm text-cream/60">Mirando tu lista…</p>
        <p className="text-sm text-cream/35 mt-1">
          Traigo todo tu trabajo del día: lo que detectó la app, lo que
          escribiste tú y lo que te asignaron.
        </p>
      </div>
    );
  }

  const grupos = porArea(tareas);

  return (
    <div className="space-y-4">

      <div className={`rounded-2xl border p-5 ${
        tareas.some((t) => t.vencida) ? 'border-danger/40 bg-danger/[0.05]'
        : tareas.length > 0 ? 'border-gold/30 bg-gold/[0.05]'
        : 'border-success/30 bg-success/[0.05]'}`}>
        <p className="text-xl text-cream leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
          {titularDelDia(tareas)}
        </p>
        {tareas.length > 0 && (
          <p className="text-sm text-cream/50 mt-1.5">
            Es la misma lista que ves en Tareas. Lo que agregues allá aparece acá.
          </p>
        )}
      </div>

      {problema && (
        <div className="rounded-xl border border-danger/40 bg-danger/[0.06] p-3">
          <p className="text-sm text-cream/85">{problema}</p>
        </div>
      )}

      {grupos.map((g) => (
        <div key={g.nombre} className="rounded-2xl border border-cream/12 p-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cream/50 mb-3">
            {g.nombre} · {g.tareas.length}
          </p>
          <div className="space-y-3">
            {g.tareas.map((t) => (
              <Tarjeta
                key={t.id ?? t.titulo}
                t={t}
                ocupado={trabajando === t.id}
                onMandar={() => void mandar(t)}
                onHecha={() => void marcarHecha(t)}
                onAbrir={onAbrir}
              />
            ))}
          </div>
        </div>
      ))}

      {onNuevaTarea && (
        <button onClick={onNuevaTarea}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed
            border-cream/20 py-3 text-sm text-cream/60 hover:text-cream/85 hover:border-cream/35">
          <Plus size={14} /> Agregar una tarea
        </button>
      )}
    </div>
  );
}

/**
 * Cada tarea, con la tarjeta de cliente.
 *
 * Antes esta tarjeta dibujaba seis botones a la vista. Con seis botones,
 * **elegir cuesta más que hacer** — y quien atiende veinte cuentas paga ese
 * costo veinte veces. Ahora: un número, una frase, un botón, y el resto
 * detrás de los tres puntos.
 */
function Tarjeta({
  t, ocupado, onMandar, onHecha, onAbrir,
}: {
  t: TareaOrdenada;
  ocupado: boolean;
  onMandar: () => void;
  onHecha: () => void;
  onAbrir?: (a: AperturaDeTarea) => void;
}) {
  const apertura = comoSeResuelve(t);
  const escala = t.destino === 'escalar' ? aQuienEscala(t) : null;

  const semaforo: Semaforo = t.vencida ? 'frenado'
    : t.origen === 'soporte' ? 'atencion' : 'bien';

  // El único botón visible: el que la app recomienda.
  const principal = t.destino === 'mensaje' && t.textoListo
    ? { label: ocupado ? 'Mandando…' : 'Mandárselo', onClick: onMandar }
    : escala
      ? { label: `Pasar a ${escala.rol === 'desarrollo' ? 'desarrollo' : 'dirección'}`, onClick: onHecha }
      : apertura && onAbrir
        ? { label: ETIQUETA_DESTINO[t.destino], onClick: () => onAbrir(apertura) }
        : { label: 'Ya lo hice', onClick: onHecha };

  const extras = [
    ...(apertura && onAbrir && t.destino === 'mensaje'
      ? [{ id: 'abrir', label: ETIQUETA_DESTINO[t.destino], onClick: () => onAbrir(apertura) }]
      : []),
    { id: 'hecha', label: 'Marcarla hecha', onClick: onHecha },
  ];

  // El número que se lee de lejos sale del título si lo trae; si no, del peso.
  const numeros = t.titulo.match(/(\d+)\D+(\d+)/);

  return (
    <TarjetaCliente
      nombre={t.titulo.split('—')[0].trim()}
      estado={t.porQueAca}
      semaforo={semaforo}
      numero={numeros ? numeros[1] : (t.vencida ? '!' : '·')}
      numeroDe={numeros ? numeros[2] : undefined}
      etiqueta={POR_QUE[t.origen]}
      frase={t.descripcion}
      accionPrincipal={principal}
      mensajeListo={t.textoListo}
      extras={extras}
    />
  );
}
