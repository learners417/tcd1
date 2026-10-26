/**
 * ACOMPAÑAMIENTO — una pantalla, y lo que ve depende de lo que contrató.
 *
 * Reemplaza a Discord y a Skool. Acá están las tres cosas que vivían afuera:
 * los canales grupales, las mentorías con su link, y la vía para preguntar.
 *
 * ═══ LO QUE DECIDE QUÉ SE VE ═══
 *
 * No hay dos pantallas ni un candado. Es una, y `viaDe(servicio)` decide:
 *
 *   La Base ($1.000)      El reporte, Victorias en lectura, y la invitación.
 *   Con acompañamiento     El chat, los cinco canales, las mentorías.
 *
 * Lo que no tiene no aparece con un candado encima. Un candado es una promesa
 * incumplida en la cara y lo primero que provoca es «¿por qué yo no?». En su
 * lugar ve una invitación, que termina en venta y no en reclamo.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Send, Video, Calendar, Lock, MessageSquare, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  viaDe, canalesDe, puedeEscribirEn, INVITACION_AL_ACOMPANAMIENTO, A_DONDE_VA,
  elDiaYElTema, losTresEncuentros,
  type IdCanal,
} from '../lib/viaDeContacto';
import {
  mensajesDelCanal, escribirEnCanal, misReportes, mandarReporte,
  proximasGrupales, grabacionesGrupales, marcarQueEntro,
  type MensajeDeCanal, type Reporte, type SesionGrupal,
} from '../lib/acompanamientoDatos';
import type { Ticket } from '../lib/cuadroTickets';
import Mensajes from './Mensajes';

interface Props {
  clienteId?: string;
  nombre?: string;
  servicio?: Ticket | null;
  onUnreadChange?: (n: number) => void;
}

/*
 * El día y el tema salían de un mapa escrito acá, con las claves crudas del
 * canal: la pantalla imprimía «Miércoles · marketing», que es el
 * identificador de la base y además una palabra que la casa no usa. El canal
 * se llama «Captación» desde su propia línea en `CANALES`, así que el día y
 * el nombre salen de ahí: `elDiaYElTema`.
 */

import { sinLeerDelCliente } from '../lib/soporteDatos';
import { mensajeDeFalla } from '../lib/conexion';

export default function Acompanamiento({ clienteId, nombre, servicio, onUnreadChange }: Props) {
  const via = useMemo(() => viaDe(servicio), [servicio]);
  const canales = useMemo(() => canalesDe(servicio), [servicio]);
  const [pestana, setPestana] = useState<IdCanal | 'contacto' | 'calendario'>(
    via.via === 'chat' ? 'producto' : 'contacto');

  /*
   * ═══ SI TIENE UNA RESPUESTA SIN ABRIR, ABRE EN CONTACTO ═══
   *
   * El globo del menú dice «2 sin leer» sobre Contacto. El cliente tocaba,
   * aterrizaba en el canal de comunidad —la pestaña por default para quien
   * tiene chat— y el globo se apagaba igual, porque el menú lo apagaba con
   * solo estar en la pantalla. Se iba sin haber visto la respuesta, y el
   * contador volvía al recargar: en la base seguía sin leer.
   *
   * Ahora la respuesta sin abrir gana la pestaña. Es lo que vino a buscar.
   */
  useEffect(() => {
    if (!clienteId || via.via !== 'chat') return;
    let vivo = true;
    void sinLeerDelCliente(clienteId).then((n) => {
      if (vivo && n > 0) setPestana('contacto');
    }).catch(() => { /* sin contador, queda la pestaña de siempre */ });
    return () => { vivo = false; };
  }, [clienteId, via.via]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          Acompañamiento
        </h1>
        <p className="text-sm text-cream/65 mt-1 leading-relaxed">{via.queEs}</p>
      </div>

      {/* LAS PESTAÑAS — solo las que tiene. Sin huecos, sin candados. */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-3 border-b border-gold/10">
        <Pestana activa={pestana === 'contacto'} onClick={() => setPestana('contacto')}
          icono={MessageSquare} label={via.nombre} />
        {via.tieneMentorias && (
          <Pestana activa={pestana === 'calendario'} onClick={() => setPestana('calendario')}
            icono={Calendar} label="Mentorías" />
        )}
        {canales.map((c) => (
          <Pestana key={c.id} activa={pestana === c.id} onClick={() => setPestana(c.id)}
            icono={c.id === 'victorias' ? Trophy : MessageSquare} label={c.nombre} />
        ))}
      </div>

      {pestana === 'contacto' && (
        via.via === 'reporte'
          ? <ElReporte clienteId={clienteId} />
          : <Mensajes userId={clienteId} onUnreadChange={onUnreadChange} />
      )}

      {pestana === 'calendario' && <LasMentorias clienteId={clienteId} />}

      {canales.map((c) => pestana === c.id && (
        <UnCanal key={c.id} canal={c.id}
          puedeEscribir={puedeEscribirEn(servicio, c.id)}
          clienteId={clienteId} nombre={nombre} />
      ))}

      {/* LA INVITACIÓN — para La Base, al pie y una sola vez. */}
      {!via.tieneMentorias && pestana === 'contacto' && (
        <div className="card-panel p-5 border-gold/25">
          <p className="text-sm font-bold text-cream mb-2">
            {INVITACION_AL_ACOMPANAMIENTO.titulo}
          </p>
          <div className="space-y-1.5">
            {INVITACION_AL_ACOMPANAMIENTO.queGana.map((x) => (
              <p key={x} className="text-sm text-cream/75 leading-relaxed">· {x}</p>
            ))}
          </div>
          <p className="text-sm text-gold mt-3 leading-relaxed">
            {INVITACION_AL_ACOMPANAMIENTO.comoSeSuma}
          </p>
        </div>
      )}
    </div>
  );
}

function Pestana({ activa, onClick, icono: Icono, label }: {
  activa: boolean; onClick: () => void;
  icono: React.ComponentType<{ className?: string }>; label: string;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 min-h-[44px] rounded-lg text-sm font-bold whitespace-nowrap border ${
        activa ? 'bg-gold/15 text-gold border-gold/30'
        : 'text-cream/65 border-transparent'}`}>
      <Icono className="w-4 h-4" /> {label}
    </button>
  );
}

/* ══════════════════ EL REPORTE — la vía de La Base ══════════════════ */

function ElReporte({ clienteId }: { clienteId?: string }) {
  const [donde, setDonde] = useState('');
  const [trabo, setTrabo] = useState('');
  const [necesito, setNecesito] = useState('');
  const [mandando, setMandando] = useState(false);
  const [mios, setMios] = useState<Reporte[] | null>(null);

  const cargar = () => {
    if (!clienteId) { setMios([]); return; }
    void misReportes(clienteId).then(setMios).catch(() => setMios([]));
  };
  useEffect(cargar, [clienteId]);

  const esperando = (mios ?? []).some((r) => !r.respuesta);

  const mandar = async () => {
    if (!clienteId) { toast.error('Vuelve a entrar a tu cuenta para mandarlo.'); return; }
    if (!donde.trim() && !trabo.trim() && !necesito.trim()) return;
    setMandando(true);
    try {
      await mandarReporte({
        clienteId, dondeEstoy: donde, queTrabo: trabo, queNecesito: necesito,
      });
      setDonde(''); setTrabo(''); setNecesito('');
      cargar();
      toast.success('Lo tengo. Te contesto en 48 horas hábiles.');
    } catch (e) {
      toast.error(mensajeDeFalla(e, 'mandar tu mensaje'));
    } finally {
      setMandando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Las tres preguntas separadas. Un campo libre devuelve «no me sale
          nada», y eso no se puede contestar de una sola vez — que es
          justamente lo que esta vía ofrece. */}
      <div className="card-panel p-5">
        <p className="text-sm font-bold text-cream mb-1">Escribe tu reporte</p>
        <p className="text-sm text-cream/60 leading-relaxed mb-3">
          Te contesto por escrito en 48 horas hábiles, de lunes a viernes.
          Cuanto más concreto, más sirve la respuesta.
        </p>

        {esperando && (
          <p className="text-sm text-gold leading-relaxed mb-3">
            Tienes uno esperando respuesta. Puedes mandar otro, y los contesto los dos.
          </p>
        )}

        {[
          { v: donde, set: setDonde, label: '¿Dónde estás?',
            ayuda: 'En qué sesión o en qué paso de tu campaña.' },
          { v: trabo, set: setTrabo, label: '¿Qué trabó?',
            ayuda: 'Lo concreto que intentaste y no salió.' },
          { v: necesito, set: setNecesito, label: '¿Qué necesitas?',
            ayuda: 'Una revisión, una decisión, un paso a paso.' },
        ].map((c) => (
          <div key={c.label} className="mb-3">
            <label className="block text-sm font-bold text-cream/80">{c.label}</label>
            <p className="text-sm text-cream/50 mb-1.5">{c.ayuda}</p>
            <textarea value={c.v} onChange={(e) => c.set(e.target.value)} rows={2}
              className="w-full bg-black/20 border border-gold/15 rounded-xl px-3 py-2.5 text-cream text-sm focus:border-gold/50" />
          </div>
        ))}

        <button onClick={() => void mandar()} disabled={mandando}
          className="w-full min-h-[44px] btn-primary rounded-xl text-sm font-bold disabled:opacity-50">
          {mandando ? 'Mandando…' : 'Mandar mi reporte'}
        </button>
      </div>

      {/* A DÓNDE VA CADA COSA — antes de escribir, no después de la respuesta. */}
      <div className="card-panel p-5">
        <p className="text-sm font-bold text-cream mb-2">Antes de escribir, mira si ya está acá</p>
        <div className="space-y-1.5">
          {A_DONDE_VA.map((d) => (
            <p key={d.loQueTrae} className="text-sm text-cream/70 leading-relaxed">
              <span className="text-cream/90">{d.loQueTrae}</span> — {d.donde}
              {d.quien ? ` · ${d.quien}` : ''}
            </p>
          ))}
        </div>
      </div>

      {mios === null ? (
        <p className="text-sm text-cream/55">Buscando tus reportes…</p>
      ) : mios.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-cream">Tus reportes</p>
          {mios.map((r) => (
            <div key={r.id} className={`card-panel p-4 ${
              r.respuesta ? 'border-success/20' : 'border-gold/20'}`}>
              <p className="text-xs uppercase tracking-wider text-cream/45">
                {new Date(r.creado_en).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                {r.respuesta ? ' · respondido' : ' · esperando'}
              </p>
              {r.donde_estoy && <p className="text-sm text-cream/80 mt-1.5">{r.donde_estoy}</p>}
              {r.que_trabo && <p className="text-sm text-cream/70 mt-1">{r.que_trabo}</p>}
              {r.que_necesito && <p className="text-sm text-cream/70 mt-1">{r.que_necesito}</p>}
              {r.respuesta && (
                <div className="mt-3 pt-3 border-t border-cream/10">
                  <p className="text-xs uppercase tracking-wider text-gold/70 mb-1">La respuesta</p>
                  <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">
                    {r.respuesta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ EL CHAT ══════════════════
 *
 * No se dibuja acá: se incrusta la pantalla de Soporte que ya existe, con su
 * historial y su bandeja. Hacer un segundo chat habría dejado dos bandejas con
 * mensajes distintos, y la que el equipo no mire es la que queda sin contestar.
 */

/* ══════════════════ LAS MENTORÍAS ══════════════════ */

function LasMentorias({ clienteId }: { clienteId?: string }) {
  const [sesiones, setSesiones] = useState<SesionGrupal[] | null>(null);
  /**
   * Las grabaciones de las que ya pasaron.
   *
   * `grabacionesGrupales` estaba escrita y no la llamaba nadie, así que el
   * cliente solo veía la grabación de una sesión todavía próxima: todo el
   * histórico quedaba inalcanzable, aunque las filas tuvieran su enlace. Y
   * justo quien se perdió la sesión es el que la necesita.
   */
  const [grabadas, setGrabadas] = useState<SesionGrupal[]>([]);

  useEffect(() => {
    void proximasGrupales().then(setSesiones).catch(() => setSesiones([]));
    void grabacionesGrupales().then(setGrabadas).catch(() => { /* queda sin archivo */ });
  }, []);

  const entrar = (s: SesionGrupal) => {
    if (clienteId) void marcarQueEntro(s.id, clienteId);
    window.open(s.url_reunion, '_blank', 'noopener,noreferrer');
  };

  if (sesiones === null) {
    return <p className="text-sm text-cream/55 flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Buscando tus encuentros…
    </p>;
  }

  return (
    <div className="space-y-3">
      <div className="card-panel p-5">
        <p className="text-sm font-bold text-cream mb-1">Tus tres encuentros por semana</p>
        <p className="text-sm text-cream/70 leading-relaxed">
          {losTresEncuentros()}. El link está acá: entras directo, sin que
          nadie te lo mande.
        </p>
      </div>

      {sesiones.length === 0 ? (
        <div className="card-panel p-5">
          <p className="text-sm text-cream/70 leading-relaxed">
            Todavía no hay encuentros cargados. Cuando el equipo los suba, aparecen
            acá con su link.
          </p>
        </div>
      ) : sesiones.map((s) => {
        const cuando = new Date(s.empieza_en);
        const ahora = Date.now();
        const empieza = cuando.getTime();
        // «En vivo» desde 10 minutos antes: quien entra puntual lo hace unos
        // minutos antes, y hasta ahora el botón recién se encendía a la hora.
        const enVivo = ahora > empieza - 10 * 60 * 1000
          && ahora < empieza + s.duracion_min * 60 * 1000;
        return (
          <div key={s.id} className={`card-panel p-4 ${enVivo ? 'border-success/40' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-gold/70">
                  {elDiaYElTema(s.tema)}
                </p>
                <p className="text-sm font-bold text-cream mt-0.5">
                  {cuando.toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                  {' · '}
                  {cuando.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {enVivo && <p className="text-sm text-success mt-0.5">Está pasando ahora</p>}
              </div>
              {s.url_reunion && (
                <button onClick={() => entrar(s)}
                  className={`min-h-[44px] px-4 rounded-xl text-sm font-bold shrink-0 ${
                    enVivo ? 'btn-primary' : 'border border-gold/35 text-gold'}`}>
                  Entrar
                </button>
              )}
            </div>
            {s.url_grabacion && (
              <a href={s.url_grabacion} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-cream/70">
                <Video className="w-4 h-4" /> Ver la grabación
              </a>
            )}
          </div>
        );
      })}

      {/* EL ARCHIVO. Las que ya pasaron y quedaron grabadas. */}
      {grabadas.length > 0 && (
        <div className="card-panel p-5">
          <p className="text-sm font-bold text-cream mb-1">Las que te perdiste</p>
          <p className="text-sm text-cream/60 leading-relaxed mb-3">
            Quedan grabadas. Si faltaste a una, está acá.
          </p>
          <div className="space-y-2">
            {grabadas.map((g) => (
              <a key={g.id} href={g.url_grabacion ?? '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 min-h-[44px] rounded-xl border border-cream/12 px-3 py-2">
                <Video className="w-4 h-4 text-gold/70 shrink-0" />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-cream">
                    {elDiaYElTema(g.tema)}
                  </span>
                  <span className="block text-sm text-cream/55">
                    {new Date(g.empieza_en).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════ UN CANAL ══════════════════ */

function UnCanal({ canal, puedeEscribir, clienteId, nombre }: {
  canal: IdCanal; puedeEscribir: boolean; clienteId?: string; nombre?: string;
}) {
  const [mensajes, setMensajes] = useState<MensajeDeCanal[] | null>(null);
  const [texto, setTexto] = useState('');
  const [mandando, setMandando] = useState(false);

  const cargar = () => {
    void mensajesDelCanal(canal).then(setMensajes).catch(() => setMensajes([]));
  };
  useEffect(cargar, [canal]);

  const mandar = async () => {
    const t = texto.trim();
    if (!t || !clienteId) return;
    setMandando(true);
    try {
      await escribirEnCanal({
        canal, autorId: clienteId, autorNombre: nombre ?? '', texto: t,
      });
      setTexto('');
      cargar();
    } catch (e) {
      toast.error(mensajeDeFalla(e, 'publicar lo que escribiste'));
    } finally {
      setMandando(false);
    }
  };

  return (
    <div className="card-panel p-5">
      {mensajes === null ? (
        <p className="text-sm text-cream/55">Cargando…</p>
      ) : mensajes.length === 0 ? (
        <p className="text-sm text-cream/70 leading-relaxed">
          Todavía no escribió nadie.
          {puedeEscribir ? ' Puedes abrirlo tú.' : ''}
        </p>
      ) : (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto overscroll-contain mb-3">
          {mensajes.map((m) => (
            <div key={m.id}>
              <p className="text-xs uppercase tracking-wider text-cream/45">
                {m.autor_nombre || 'Alguien'}
                {m.del_equipo ? ' · del equipo' : ''}
                {' · '}
                {new Date(m.creado_en).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
              </p>
              <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                m.del_equipo ? 'text-gold/90' : 'text-cream/85'}`}>
                {m.texto}
              </p>
            </div>
          ))}
        </div>
      )}

      {puedeEscribir ? (
        <div className="flex gap-2">
          <input value={texto} onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void mandar(); } }}
            placeholder="Escribe acá"
            className="flex-1 min-h-[44px] bg-black/20 border border-gold/15 rounded-xl px-4 text-cream text-sm focus:border-gold/50 placeholder-cream/25" />
          <button onClick={() => void mandar()} disabled={mandando || !texto.trim()}
            className="min-h-[44px] px-4 rounded-xl btn-primary disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* El único canal que ve La Base es Victorias, y lo lee. Se dice por qué
           en positivo: lo que puede hacer, no lo que le falta. */
        <p className="text-sm text-cream/60 leading-relaxed flex gap-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Acá lees lo que están logrando los demás. Para escribir y preguntar
          en los canales, súmate al acompañamiento.</span>
        </p>
      )}
    </div>
  );
}
