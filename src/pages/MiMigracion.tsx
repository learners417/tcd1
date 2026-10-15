/**
 * MI MIGRACIÓN — el cliente trae su trabajo y la app lo reconoce.
 *
 * Para los clientes que vienen de Discord con sus manuales ya hechos. El
 * equipo habilita; el cliente pega su material, revisa lo que salió, y queda
 * con su ADN cargado y su Camino al día.
 *
 * ═══ LAS DOS DECISIONES QUE IMPORTAN ═══
 *
 * 1 · ÉL REVISA ANTES DE QUE SE GUARDE. La extracción es un primer intento, no
 *     una verdad. Guardar directo sería meterle en su ADN —de donde salen sus
 *     anuncios, su página y su campaña— lo que un modelo entendió de un texto
 *     pegado. Lo revisa campo por campo y corrige lo que haga falta.
 *
 * 2 · LO VACÍO QUEDA PENDIENTE. No se marca por hecho lo que no está. El
 *     asistente del Admin marcaba `completada: true` incluso con el campo
 *     vacío, y así un cliente con material flojo quedaba con el Camino
 *     «completo» y el ADN con agujeros — y sus tres anuncios saliendo de un
 *     avatar que no existe. Acá se le dice cuánto le falta y cuál es.
 */
import { useMemo, useState } from 'react';
import { Loader2, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { extractFromText } from '../lib/migrationExtractor';
import type { ExtractedProfile } from '../lib/migrationTypes';
import {
  evaluarMigracion, loQueFaltaParaCampanas, ETIQUETA_CAMPO,
  QUE_TRAER, ANTES_DE_EMPEZAR, tieneContenido, CAMPOS_PARA_CAMPANAS,
} from '../lib/migracionDelCliente';
import { guardarMiMigracion } from '../lib/migracionDatos';

type Paso = 'traer' | 'revisar' | 'listo';

export default function MiMigracion({ clienteId, onIrACampanas }: {
  clienteId?: string;
  onIrACampanas?: () => void;
}) {
  const [paso, setPaso] = useState<Paso>('traer');
  const [texto, setTexto] = useState('');
  const [leyendo, setLeyendo] = useState(false);
  const [extraido, setExtraido] = useState<Partial<ExtractedProfile>>({});
  const [guardando, setGuardando] = useState(false);

  const evaluacion = useMemo(
    () => evaluarMigracion(extraido, []), [extraido]);
  const faltan = useMemo(() => loQueFaltaParaCampanas(extraido), [extraido]);

  const leer = async () => {
    if (texto.trim().length < 200) {
      // El umbral es a propósito: con menos de doscientos caracteres no hay
      // nada que extraer, y dejarlo correr devuelve campos vacíos que parecen
      // un error de la app.
      toast.error('Pega tus documentos completos. Con un párrafo no alcanza.');
      return;
    }
    setLeyendo(true);
    try {
      const r = await extractFromText(texto);
      setExtraido(r);
      setPaso('revisar');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No pude leer tu material. Probá de nuevo.');
    } finally {
      setLeyendo(false);
    }
  };

  const guardar = async () => {
    if (!clienteId) {
      toast.error('Vuelve a entrar a tu cuenta para guardar tu migración.');
      return;
    }
    setGuardando(true);
    try {
      await guardarMiMigracion(clienteId, extraido);
      setPaso('listo');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  /* ── PASO 1 · Traer el material ─────────────────────────────────── */
  if (paso === 'traer') {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>
            Trae tu trabajo
          </h1>
          <p className="text-[17px] text-cream/70 mt-1 leading-relaxed">
            Ya tienes tu plan, tu método y tu oferta hechos. No los vas a hacer de nuevo:
            los traes acá y tu Camino queda al día.
          </p>
        </div>

        <div className="card-panel p-5">
          <p className="text-[17px] font-bold text-cream mb-3">Qué traer</p>
          <div className="space-y-3">
            {QUE_TRAER.map((x) => (
              <div key={x.titulo}>
                <p className="text-[17px] font-bold text-gold/85">{x.titulo}</p>
                <p className="text-[17px] text-cream/70 leading-relaxed">{x.detalle}</p>
              </div>
            ))}
          </div>
          <p className="text-[17px] text-cream/60 leading-relaxed mt-4 border-t border-cream/10 pt-3">
            {ANTES_DE_EMPEZAR}
          </p>
        </div>

        <div className="card-panel p-5">
          <label className="block text-[17px] font-bold text-cream mb-2">
            Pega todo acá, uno debajo del otro
          </label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={12}
            placeholder="Tu plan de negocio, tu método, tu oferta y las frases de tus consultantes."
            className="w-full bg-black/20 border border-gold/15 rounded-xl px-3 py-3 text-cream text-[17px] focus:border-gold/50 placeholder-cream/25 leading-relaxed" />
          <p className="text-[15px] text-cream/50 mt-1">
            {texto.trim().length} caracteres
          </p>
          <button onClick={() => void leer()} disabled={leyendo}
            className="mt-3 w-full min-h-[44px] btn-primary rounded-xl text-[17px] font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {leyendo
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Leyendo tu material…</>
              : <>Leer mi material <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    );
  }

  /* ── PASO 2 · Revisar antes de guardar ──────────────────────────── */
  if (paso === 'revisar') {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>
            Revisa lo que salió
          </h1>
          <p className="text-[17px] text-cream/70 mt-1 leading-relaxed">
            Esto es lo que leí de tu material. Corrige lo que no suene tuyo antes de
            guardarlo: de acá salen tus anuncios y tu página.
          </p>
        </div>

        {/* LO QUE FALTA PARA CAMPAÑAS, PRIMERO Y CON EL POR QUÉ.
            Antes de los campos y no después: es lo que decide si puede activar. */}
        <div className={`card-panel p-5 ${
          faltan.length === 0 ? 'border-success/25' : 'border-gold/30'}`}>
          <p className="text-[17px] font-bold text-cream mb-1">
            {faltan.length === 0
              ? 'Tienes las cinco piezas que necesita tu campaña'
              : `Te faltan ${faltan.length} de ${CAMPOS_PARA_CAMPANAS.length} piezas`}
          </p>
          {faltan.length === 0 ? (
            <p className="text-[17px] text-cream/70 leading-relaxed">
              Guarda y pasas directo a activar tu campaña.
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {faltan.map((f) => (
                <p key={f.campo} className="text-[17px] text-cream/75 leading-relaxed">
                  <span className="text-cream/95 font-bold">{f.campo}</span> — {f.porQue}
                </p>
              ))}
              <p className="text-[17px] text-cream/60 leading-relaxed pt-2">
                Completalas abajo. Puedes guardar igual y hacerlas después: lo que quede
                vacío queda como sesión pendiente en tu Camino, no se da por hecho.
              </p>
            </div>
          )}
        </div>

        {/* LOS CAMPOS, EDITABLES */}
        <div className="card-panel p-5 space-y-4">
          {Object.entries(ETIQUETA_CAMPO).map(([campo, etiqueta]) => {
            const valor: unknown = extraido[campo as keyof ExtractedProfile];
            const texto = typeof valor === 'string' ? valor
              : Array.isArray(valor) ? (valor as string[]).join('\n')
              : '';
            const lleno = tieneContenido(valor);
            const esDeCampanas = CAMPOS_PARA_CAMPANAS.some((c) => c.campo === campo);
            return (
              <div key={campo}>
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <label className="text-[17px] font-bold text-cream">{etiqueta}</label>
                  <span className={`text-[15px] shrink-0 ${
                    lleno ? 'text-success' : esDeCampanas ? 'text-gold' : 'text-cream/45'}`}>
                    {lleno ? 'listo' : esDeCampanas ? 'hace falta' : 'opcional'}
                  </span>
                </div>
                <textarea
                  value={texto}
                  onChange={(e) => setExtraido((x) => ({ ...x, [campo]: e.target.value }))}
                  rows={texto.length > 200 ? 5 : 2}
                  className="w-full bg-black/20 border border-gold/15 rounded-xl px-3 py-2.5 text-cream text-[17px] focus:border-gold/50 leading-relaxed" />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => void guardar()} disabled={guardando}
            className="flex-1 min-h-[44px] btn-primary rounded-xl text-[17px] font-bold disabled:opacity-50">
            {guardando ? 'Guardando…' : 'Guardar mi trabajo'}
          </button>
          <button onClick={() => setPaso('traer')}
            className="min-h-[44px] px-5 rounded-xl border border-cream/20 text-cream/75 text-[17px] font-bold">
            Volver a pegar
          </button>
        </div>
      </div>
    );
  }

  /* ── PASO 3 · Listo ─────────────────────────────────────────────── */
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="card-panel p-6 border-success/25">
        <Check className="w-8 h-8 text-success mb-2" />
        <h1 className="text-2xl text-cream" style={{ fontFamily: 'var(--font-display)' }}>
          Tu trabajo está adentro
        </h1>
        <p className="text-[17px] text-cream/75 mt-2 leading-relaxed">{evaluacion.resumen}</p>

        {faltan.length === 0 ? (
          <button onClick={onIrACampanas}
            className="mt-4 w-full min-h-[44px] btn-primary rounded-xl text-[17px] font-bold inline-flex items-center justify-center gap-2">
            Ir a activar mi campaña <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="mt-4">
            <p className="text-[17px] text-cream/70 leading-relaxed flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-gold" />
              <span>
                Para activar tu campaña te faltan {faltan.length}{' '}
                {faltan.length === 1 ? 'pieza' : 'piezas'}. Están como sesiones
                pendientes en tu Camino: se hacen en una sentada.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
