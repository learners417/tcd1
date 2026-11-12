import BotonAudio from './sesion/BotonAudio';
import { guardarLetra } from '../lib/laFotoYLaLetra';
import HojaDeRuta from './camino/HojaDeRuta';
import { dictaminar } from '../lib/elDictamen';
import { getOrigen, setOrigen } from '../lib/origen';
import { DIMENSIONES_RUEDA, type ValoresRueda, guardarMedicion, setParaQue } from '../lib/rueda';
import { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, CheckCircle2, Sparkles, Map, LockKeyhole, UserCircle, Compass } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import { toast } from 'sonner';
import { PAISES } from '../lib/vozLocalizada';
import CustomSelect from './CustomSelect';

interface WelcomeWizardProps {
  profile: Profile;
  onComplete: (firstPage?: string) => void;
}

/**
 * ─── EL TRAMO ÚNICO (turno 17, 12 de noviembre) ────────────────────────────
 *
 * Javo eligió el 8 de noviembre que la entrada sea UN solo tramo largo. Antes
 * había diez pasos acá, y el mapa pedía «fundir los diez». Medido: de los diez
 * SEIS preguntaban —perfil, situación, diagnóstico, origen, números, rueda— y
 * los otros cuatro no son preguntas y no se pueden fundir con nada:
 *
 *   · `password` es autenticación, y pasa antes de que haya a quién preguntar;
 *   · `welcome` es el DICTAMEN, que es la salida de lo que contestó;
 *   · `pacto` es una firma, y una firma se firma sola;
 *   · `guide` es la orientación del final.
 *
 * Así que fundir los diez son los seis en uno: `radiografia`.
 *
 * Lo que la fusión arregla sin proponérselo: el salto de `guardarDiagnostico`
 * mandaba a `welcome` a quien ya tenía el origen contestado, y se llevaba
 * puestos los pasos de los números y la rueda. Ese cliente completaba la
 * bienvenida sin sus seis números —«sin esto no hay con qué comparar al
 * final»— y sin su rueda. En un tramo único no hay nada que saltar: las
 * secciones están todas en la misma pantalla.
 */
type Step = 'password' | 'radiografia' | 'welcome' | 'pacto' | 'guide';

/**
 * Los pasos de antes, para el que está a mitad de camino HOY.
 *
 * `tcd_wizard_step_v1` tiene en el teléfono de cualquiera que esté en la
 * bienvenida uno de los diez nombres viejos. Sin esta tabla, el que recarga
 * después de que esto suba encuentra un paso que ya no existe: la lista de
 * pasos no lo incluye, cae a `password` y le pide la contraseña de nuevo —o,
 * peor, se guarda tal cual y ninguna rama lo dibuja: pantalla en blanco con el
 * cliente adentro.
 */
const PASOS_VIEJOS: Record<string, Step> = {
  profile: 'radiografia', situacion: 'radiografia', diagnostico: 'radiografia',
  origen: 'radiografia', numeros: 'radiografia', rueda: 'radiografia',
};

const ESPECIALIDADES = [
  'Psicólogo/a',
  'Nutricionista',
  'Odontólogo/a',
  'Kinesiólogo/a',
  /*
   * Acá decía «Coach» —prohibida en esta casa— y el detector de vocabulario no
   * la veía: solo mira FRASES (quince caracteres, dos palabras de estructura),
   * y una prohibida parada sola como etiqueta de botón mide cinco. Las
   * etiquetas son justo donde más se lee el vocabulario de la casa.
   *
   * «Consultor/a» cubre a la misma persona, sigue el «/a» del resto de la
   * lista y no choca: «acompañante» es quien acompaña al cliente desde la
   * casa, y «mentor» es el Mentor IA. La clave vieja se queda en
   * MAPA_ESPECIALIDAD: quien ya eligió «Coach» tiene que seguir mapeando.
   */
  'Consultor/a',
  'Terapeuta',
  'Médico/a',
  'Otro',
];

const STEPS: Step[] = ['password', 'radiografia', 'welcome', 'pacto', 'guide'];

import PasoSituacion, { SITUACION_VACIA, situacionCompleta, type Situacion } from './onboarding/PasoSituacion';
import { destinoPorId } from '../lib/destinos';
import { VOC } from '../lib/vocabulario';
import { enElTramoDelNumero } from '../lib/planes';
import { CAMPOS, estaCompleta, loQueFalta, guardar, leer, KEY_ENTRADA, type Medicion } from '../lib/medicion';
import { leerRespuestas, anotar, olvidarBorrador, type Respuestas } from '../lib/laRadiografia';
import { arrancar, comoSeLee, olvidar as olvidarReloj, restante, sePaso } from '../lib/elRelojDeLaRadiografia';
import { subirArchivoDeLaRadiografia } from '../lib/losArchivosDeLaRadiografia';
import { PAISAJES } from '../lib/losCincoPaisajes';
import { mensajeDeFalla } from '../lib/conexion';

/**
 * CADA RESPUESTA SE ANOTA AL TIPEARLA, NO AL APRETAR EL BOTÓN.
 *
 * El estado de un campo de la bienvenida vive en dos lados a la vez: en la
 * pantalla, para que se vea, y en el borrador de la radiografía, para que
 * volver sea seguir. Esto los mantiene juntos sin tocar un solo `onChange`:
 * el único cambio está en cómo nace el estado.
 *
 * Por qué así y no con un efecto que guarde todo junto: un efecto corre
 * DESPUÉS del render, y el que cierra la pestaña a los nueve minutos no
 * siempre le da ese tiempo. Acá se escribe en la misma tecla.
 */
function useAnotado<K extends keyof Respuestas>(
  campo: K,
  inicial: Respuestas[K],
) {
  const [valor, setValorRaw] = useState<Respuestas[K]>(inicial);
  const set = (siguiente: Respuestas[K] | ((prev: Respuestas[K]) => Respuestas[K])) => {
    setValorRaw((prev) => {
      const v = typeof siguiente === 'function'
        ? (siguiente as (p: Respuestas[K]) => Respuestas[K])(prev)
        : siguiente;
      /* Anotar es una mezcla del mismo valor: repetirla no cambia nada. */
      anotar({ [campo]: v } as unknown as Partial<Respuestas>);
      return v;
    });
  };
  return [valor, set] as const;
}

export default function WelcomeWizard({ profile, onComplete }: WelcomeWizardProps) {
  const [step, setStepRaw] = useState<Step>(() => {
    // El wizard RECUERDA: si el teléfono recarga la página (volver de WhatsApp,
    // pestaña descartada), retomamos exactamente donde quedó — nunca más
    // "elegir contraseña" dos veces.
    try {
      const guardado = localStorage.getItem('tcd_wizard_step_v1');
      if (guardado && (STEPS as string[]).includes(guardado)) return guardado as Step;
      if (guardado && PASOS_VIEJOS[guardado]) return PASOS_VIEJOS[guardado];
    } catch { /* noop */ }
    return 'password';
  });
  const completarWizard = (primeraPagina?: string) => {
    try { localStorage.removeItem('tcd_wizard_step_v1'); } catch { /* noop */ }
    olvidarBorrador();
    olvidarReloj();
    onComplete(primeraPagina);
  };
  const setStep = (siguiente: Step) => {
    try { localStorage.setItem('tcd_wizard_step_v1', siguiente); } catch { /* noop */ }
    setStepRaw(siguiente);
  };
  /*
   * LO QUE YA CONTESTÓ, LEÍDO UNA VEZ AL ABRIR.
   *
   * Hasta el 9 de noviembre esto era solo la medición: los seis números eran
   * el único de veinte campos que volvía. El que recargaba caía en el paso
   * correcto con el formulario en blanco y tipeaba todo otra vez.
   */
  const [respuestas] = useState<Respuestas>(() => leerRespuestas());

  /*
   * ─── EL RELOJ ─────────────────────────────────────────────────────────────
   * Arranca la primera vez que el cliente ve el tramo y no se reinicia al
   * recargar: los quince son de una. Se redibuja cada segundo, y pasarse no
   * cierra nada —ver `elRelojDeLaRadiografia.ts`—.
   */
  const [ahora, setAhora] = useState(() => Date.now());

  /* ── Las cinco del turno 17 ── */
  const [fortaleza, setFortaleza] = useAnotado('fortaleza', respuestas.fortaleza);
  const [amenaza, setAmenaza] = useAnotado('amenaza', respuestas.amenaza);
  const [enlaces, setEnlaces] = useAnotado('enlaces', respuestas.enlaces);
  const [archivos, setArchivos] = useAnotado('archivos', respuestas.archivos);
  const [diasQueImportan, setDiasQueImportan] = useAnotado('dias_que_importan', respuestas.dias_que_importan);
  const [subiendo, setSubiendo] = useState(false);
  const [fallaDeSubida, setFallaDeSubida] = useState('');
  /** Qué sección pide el botón del final, cuando pide algo. */
  const [loQuePide, setLoQuePide] = useState('');
  const [cerrandoTramo, setCerrandoTramo] = useState(false);

  // ── Tu medición de entrada: los seis números del primer día ──
  const [medicionEntrada, setMedicionEntrada] = useAnotado('numeros', respuestas.numeros);

  // ── El Diagnóstico (Lote 1 · la semilla del ADN) ──
  const [dxAvatar, setDxAvatar] = useAnotado('avatar', respuestas.avatar);
  const [dxFreno, setDxFreno] = useAnotado('freno', respuestas.freno);
  const [dxNicho, setDxNicho] = useAnotado('nicho', respuestas.nicho);
  const [dxDinero, setDxDinero] = useAnotado('dinero', respuestas.dinero);
  const [dxTiempo, setDxTiempo] = useAnotado('tiempo', respuestas.tiempo);
  const [dxEstilo, setDxEstilo] = useAnotado('estilo', respuestas.estilo);
  const [dxFe, setDxFe] = useAnotado('fe', respuestas.fe);
  // ── S6: las siembras del ikigai ──
  const [ogPorque, setOgPorque] = useAnotado('porque', respuestas.porque);
  const [ogHerida, setOgHerida] = useAnotado('herida', respuestas.herida);
  const [ogPaciente, setOgPaciente] = useAnotado('paciente', respuestas.paciente);
  const [situacion, setSituacion] = useAnotado('situacion', respuestas.situacion);
  const [rutaAbierta, setRutaAbierta] = useState(false);
  const [ruedaIni, setRuedaIni] = useAnotado('rueda', respuestas.rueda);
  const [pqIni, setPqIni] = useAnotado('para_que', respuestas.para_que);

  // Las tres bases que faltaban: de dónde llegan hoy, qué entrega entre
  // sesiones y dónde publica. Con esto el Camino arranca con sus datos y no
  // le vuelve a preguntar lo mismo el día 22, el 47 y el 61.
  const [dxLlegan, setDxLlegan] = useAnotado('llegan', respuestas.llegan);
  const [dxEntrega, setDxEntrega] = useAnotado('entrega', respuestas.entrega);
  const [dxPublica, setDxPublica] = useAnotado('publica', respuestas.publica);

  /**
   * EL JSON `diagnostico`, COMPLETO, EN UN SOLO LUGAR.
   *
   * ═══ EL BUG QUE ESTO CIERRA (8 de noviembre) ═══
   *
   * `diagnostico` es una columna jsonb y los dos pasos de la bienvenida la
   * escribían por separado, cada uno con SU lista de campos:
   *
   *   guardarSituacion   → { freno … trabajo_espiritual, situacion }
   *   guardarDiagnostico → { freno … trabajo_espiritual, llegan, entrega, publica }
   *
   * El orden de los pasos es `situacion` y DESPUÉS `diagnostico`. Un UPDATE de
   * jsonb reemplaza el valor entero, no mezcla. Así que el segundo guardado
   * borraba `situacion` —la escalera del cliente, su oferta, lo que ya vende—
   * un minuto después de que lo escribiera. En la bienvenida, que es la
   * primera pantalla de alguien que acaba de pagar.
   *
   * No lo vio nadie porque las dos escrituras son correctas por separado, y la
   * sonda que recarga y pregunta si el trabajo sigue ahí mira El Camino, el
   * Diario y Mi Número — la bienvenida no estaba entre sus bucles.
   *
   * Ahora hay UN compositor. Los dos pasos escriben el objeto completo con lo
   * que haya hasta ese momento, así que ninguno puede dejar afuera un campo
   * del otro. Un campo nuevo se agrega acá y los dos lo escriben.
   */
  const payloadDiagnostico = (conSituacion: boolean) => ({
    freno: dxFreno,
    nicho_hipotesis: dxNicho,
    dinero: dxDinero,
    tiempo: dxTiempo,
    estilo_mentor: dxEstilo,
    trabajo_espiritual: dxFe,
    llegan: dxLlegan,
    entrega: dxEntrega,
    publica: dxPublica,
    /*
     * LAS CUATRO DEL PERFIL, que hasta el 9 de noviembre no se guardaban en
     * ninguna parte. El paso del perfil se las pregunta, el cliente las
     * contesta y se perdían al avanzar. Viajan acá porque este es el único
     * escritor de `diagnostico`: agregarlas en otro lado las volvería a
     * borrar, que es exactamente el bug del 8 de noviembre.
     */
    energia,
    frustracion,
    ingresos_mensuales: ingresosMensuales,
    horas_semana: horasSemana,
    /*
     * LAS CINCO DEL TURNO 17. Viajan acá por el mismo motivo que las cuatro del
     * perfil: este es el único escritor de `diagnostico`, y agregarlas en otra
     * escritura las borraría. `archivos` guarda CAMINOS de Storage, nunca el
     * archivo: el jsonb de un perfil no es donde va un PDF.
     */
    fortaleza,
    amenaza,
    enlaces,
    archivos,
    dias_que_importan: diasQueImportan,
    /* En el paso de la situación va la del formulario; en el diagnóstico, la
       que ya quedó guardada, que es justo la que se estaba perdiendo. */
    situacion: conSituacion ? situacion : situacionGuardada(),
  });

  /** La situación que ya está en el teléfono, para no pisarla con un vacío. */
  const situacionGuardada = (): Situacion => {
    if (situacionCompleta(situacion)) return situacion;
    try {
      const raw = localStorage.getItem('tcd_situacion');
      if (raw) return { ...SITUACION_VACIA, ...(JSON.parse(raw) as Situacion) };
    } catch { /* noop */ }
    return situacion;
  };

  // ── El Pacto (F3) ──
  const [pactoTexto, setPactoTexto] = useAnotado('pacto_texto', respuestas.pacto_texto);
  const [pactoFirma, setPactoFirma] = useAnotado('pacto_firma', respuestas.pacto_firma);

  // Step 1 — password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Step 2 — profile
  const [especialidad, setEspecialidad] = useAnotado('especialidad', respuestas.especialidad || (profile.especialidad ?? ''));
  const [especialidadOtro, setEspecialidadOtro] = useAnotado('especialidad_otro', respuestas.especialidad_otro);
  const [pais, setPais] = useAnotado('pais', respuestas.pais || (profile.pais ?? ''));
  const [ingresosMensuales, setIngresosMensuales] = useAnotado('ingresos_mensuales', respuestas.ingresos_mensuales);
  const [horasSemana, setHorasSemana] = useAnotado('horas_semana', respuestas.horas_semana);
  const [frustracion, setFrustracion] = useAnotado('frustracion', respuestas.frustracion);
  const [energia, setEnergia] = useAnotado('energia', respuestas.energia);
  /*
   * Cada nivel entra a SU camino: los 5 días o los 90.
   *
   * Lee el tramo, no por dónde entró: `plan` queda en 'ELNUMERO' para
   * siempre, así que quien pagó la entrada y después La Base antes de entrar la
   * primera vez veía la bienvenida de los 5 días con 12 abiertos.
   */
  const esCincoDias = enElTramoDelNumero(profile as Partial<Profile>);

  async function handlePasswordSubmit() {
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (!supabase) { setStep('radiografia'); return; }

    setSavingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStep('radiografia');
    } catch (err: unknown) {
      toast.error(mensajeDeFalla(err, 'cambiar tu contraseña'));
    } finally {
      setSavingPwd(false);
    }
  }

  /**
   * CERRAR EL TRAMO — un botón, un guardado, en orden.
   *
   * ═══ POR QUÉ ESTO NO PUEDE VOLVER A SER SEIS GUARDADOS ═══
   *
   * Hasta el turno 17 cada paso guardaba lo suyo al apretar su botón, y DOS de
   * ellos escribían la misma columna jsonb: de ahí salió el bug del 8 de
   * noviembre, que borraba la escalera del cliente un minuto después de que la
   * escribiera. El compositor lo tapó. En un tramo único el problema
   * desaparece de raíz: hay UNA escritura del jsonb y es la del compositor.
   *
   * El orden no es decorativo. Lo que vive en el teléfono va primero —es
   * instantáneo y no puede fallar por señal— y después lo que viaja. Así el que
   * pierde la conexión justo acá igual tiene su medición, su origen y su rueda
   * guardadas donde la app las lee.
   *
   * Lo único que el tramo EXIGE son los seis números, que es lo que ya exigía
   * su paso, y el avatar, que es lo que ya exigía el suyo. Todo lo demás se
   * puede dejar en blanco: el que abandona a los nueve minutos y vuelve sigue
   * donde estaba, y el que no quiere contestar algo entra igual.
   */
  async function cerrarElTramo() {
    if (!dxAvatar) {
      setLoQuePide('Falta una sola cosa: si ya tienes un método propio o todavía no. Está en «Tu diagnóstico».');
      return;
    }
    if (!estaCompleta(medicionEntrada)) {
      setLoQuePide(`Faltan ${loQueFalta(medicionEntrada).length} de tus seis números. Sin ellos no hay con qué comparar al final.`);
      return;
    }
    setLoQuePide('');
    setCerrandoTramo(true);

    /* ── 1. El teléfono, que no falla ── */
    guardarLetra(dxAvatar);
    guardar(KEY_ENTRADA, medicionEntrada);
    setOrigen({ porque: ogPorque.trim(), herida: ogHerida.trim(), paciente: ogPaciente.trim() });
    if (Object.keys(ruedaIni).length > 0) guardarMedicion(ruedaIni);
    if (pqIni.trim()) setParaQue(pqIni.trim());
    try {
      localStorage.setItem('tcd_situacion', JSON.stringify(situacion));
      localStorage.setItem('tcd_diagnostico', JSON.stringify({ freno: dxFreno, nicho: dxNicho, dinero: dxDinero, tiempo: dxTiempo, llegan: dxLlegan, entrega: dxEntrega, publica: dxPublica }));
      localStorage.setItem('tcd_estilo_mentor', dxEstilo || 'hueso');
      localStorage.setItem('tcd_fe', dxFe || 'no');
    } catch { /* noop */ }

    /* ── 2. Lo que viaja, con el mismo paracaídas móvil de antes ── */
    try {
      if (supabase) {
        const espFinal = especialidad === 'Otro' && especialidadOtro.trim()
          ? especialidadOtro.trim()
          : especialidad;
        /*
         * LA FILA VA ESCRITA ADENTRO DEL `update`, no en una variable aparte.
         *
         * No es gusto: `prueba-la-bienvenida-no-se-pisa.ts` lee este archivo y
         * comprueba que toda escritura de la columna `diagnostico` pase por el
         * compositor. Una lente que lee texto no puede seguir una variable, y
         * con la fila armada afuera la escritura le quedaba invisible: la
         * lente dijo «ninguna escritura encontrada» —verde por ciego— cuando
         * se probó así. Acá la escritura está a la vista de quien la mira.
         */
        const guardado = await Promise.race([
          new Promise<{ error?: unknown } | null>((res) => setTimeout(() => res(null), 8000)),
          supabase.from('profiles').update({
            avatar_tipo: dxAvatar,
            /* El ÚNICO escritor del jsonb, y ahora de verdad único. */
            diagnostico: payloadDiagnostico(true),
            adn_medicion_entrada: medicionEntrada,
            ...(espFinal ? { especialidad: espFinal } : {}),
            ...(pais ? { pais } : {}),
            ...(dxNicho.trim() ? { adn_nicho: dxNicho.trim() } : {}),
            ...(dxFreno ? { adn_diagnostico_capa: `Tu freno principal al arrancar: ${dxFreno}. El Camino lo trabaja desde la primera semana.` } : {}),
          }).eq('id', profile.id),
        ]);
        if (guardado && guardado.error) {
          console.error('[bienvenida] el tramo no se guardó en la base:', guardado.error);
        }
      }
    } catch (e) { console.error('[bienvenida] el tramo no se guardó en la base:', e); }

    setCerrandoTramo(false);
    setStep('welcome');
  }

  /*
   * `handleProfileSubmit` salió con la fusión (turno 17). Guardaba la
   * especialidad y el país y mandaba a `situacion`; las dos cosas las hace
   * ahora `cerrarElTramo`, en la misma escritura que todo lo demás.
   *
   * Su comentario largo sobre por qué el paso `situacion` nunca se alcanzaba
   * ya no describe nada: en un tramo único no hay un paso que otro paso pueda
   * saltear. Lo que ese comentario medía —`tcd_situacion` sin escribirse
   * jamás, y `carriles.ts` corriendo con la entrada vacía para TODOS— se
   * cierra acá por construcción.
   */

  /**
   * CERRAR EL ONBOARDING, COMPROBADO.
   *
   * ═══ POR QUÉ ESTA ES LA ESCRITURA MÁS IMPORTANTE DE LA APP ═══
   *
   * El wizard no se muestra según el navegador: se muestra según la base.
   * `App.tsx` pregunta `onboarding_completed === false` y lo dibuja.
   *
   * Y acá el resultado no se miraba. Supabase DEVUELVE el error, no lo lanza.
   * Así que con un corte de red de un segundo, el cliente terminaba su
   * onboarding, entraba a la app, recargaba —en una PWA pasa a cada rato— y
   * se encontraba el wizard otra vez. Y otra. Sin forma de salir, y sin nada
   * que le explicara por qué.
   *
   * Ahora se comprueba que la fila quedó escrita, se reintenta una vez, y si
   * no se puede, se le dice. Un cliente que sabe qué pasó escribe a Soporte;
   * uno que ve la misma pantalla por tercera vez pide la devolución.
   */
  const [noCerro, setNoCerro] = useState(false);

  async function handleComplete(firstPage?: string) {
    if (!supabase) { completarWizard(firstPage); return; }
    for (let intento = 0; intento < 2; intento++) {
      const { data, error } = await supabase.from('profiles')
        .update({ onboarding_completed: true, status: 'ACTIVE' })
        .eq('id', profile.id)
        .select('id');
      if (!error && data && data.length > 0) {
        setNoCerro(false);
        completarWizard(firstPage);
        return;
      }
      if (intento === 0) await new Promise((r) => setTimeout(r, 900));
    }
    // No se pudo. Se queda acá con el motivo, en vez de entrar y volver a
    // encontrarse esta pantalla al recargar.
    setNoCerro(true);
  }

  // `profile.nombre` puede venir vacío —el alta lo inserta con COALESCE a ''—
  // y si la columna acepta nulos, `.split` de null revienta el render entero.
  // Sin nombre el saludo va solo, en vez de «Hola, ».
  const nombreCorto = (profile.nombre ?? '').trim().split(' ')[0];
  const currentStepIndex = STEPS.indexOf(step);
  const enTramo = step === 'radiografia';

  /*
   * El reloj arranca al entrar al tramo y late una vez por segundo. El
   * intervalo se limpia al salir: un `setInterval` suelto en la primera
   * pantalla de alguien que acaba de pagar le calienta el teléfono por nada.
   */
  useEffect(() => {
    if (!enTramo) return;
    arrancar();
    setAhora(Date.now());
    const late = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(late);
  }, [enTramo]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 selection:bg-gold/30">
      {/*
        ─── ACÁ HABÍA DOS GLOBOS DE ORO DIFUMINADOS ────────────────────────
        Quinientos píxeles cada uno, `blur-[150px]`, uno arriba a la izquierda
        y otro abajo a la derecha. Es un glow, y la regla de la casa lo dice
        sin excepción: oro mate solo en líneas de 1px, versalitas y numerales
        — nunca relleno, nunca degradé, nunca glow.
        Y era la PRIMERA pantalla que ve quien acaba de pagar. El papel cálido
        no necesita una luz detrás para verse caro; esa luz es justamente lo
        que se ve barato.
      */}

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/*
         * ─── LOS DIEZ PASOS, EN LÍNEAS ──────────────────────────────────────
         *
         * Dos arreglos, los dos vistos en la captura y ninguno por un lente:
         *
         * 1. La barra es `sticky top-0` y NO tenía fondo: en cuanto el paso
         *    scrolleaba —y casi todos scrollean— el texto del formulario
         *    pasaba POR DETRÁS y se cruzaba con los puntos. Se leía roto.
         *    Lleva el mismo fondo que la pantalla.
         *
         * 2. Los puntos eran pastillas de `h-1.5`. Esto NO era una falta de
         *    regla —el oro como tinta de un dato lo aprueba la casa: el
         *    progreso de El Camino es un anillo de arcos dorados gruesos— sino
         *    una decisión de gusto: diez líneas finas se leen como el lomo de
         *    un libro, que es la estética que esta app persigue. El paso
         *    actual, una línea de oro más larga; los hechos, oro al 40%; los
         *    que faltan, la línea del papel.
         */}
        <div className="flex justify-center items-center gap-2 mb-8 sticky top-0 pt-3 pb-3 z-10 bg-ink">
          {STEPS.map((s, idx) => (
            <div
              key={s}
              className={`h-px rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-gold' :
                idx < currentStepIndex ? 'w-4 bg-gold/40' : 'w-4 bg-[var(--line2,#DFD3BC)]'
              }`}
            />
          ))}
        </div>

        {/*
          ─── EL RELOJ ───────────────────────────────────────────────────────
          Javo eligió «los 15 de una, cronometrados». Va a la vista, y la
          condición que eligió con él va escrita al lado, porque un reloj sin
          esa frase se lee como un examen: PASARSE NO CIERRA NADA.
          No hay ningún candado que lea `sePaso()`. Lo único que ponía en juego
          era el premio, y el premio no existe —ver el mapa, turno 17—.
        */}
        {enTramo && (
          <div className="mb-6 flex items-baseline justify-between gap-3 border-b pb-3"
            style={{ borderColor: 'var(--line, rgba(142,104,36,0.18))' }}>
            {/*
              17 px y no 15, medido: en esta pantalla el tamaño 15 ya tenía
              tres pesos —500 en las opciones, 600 en las preguntas, 700 en el
              numeral— y el techo de la regla de composición es tres por
              tamaño. Un cuarto peso en 15 es la única falta de diseño que este
              turno introdujo, y el medidor la cazó. En 17 el peso 400 ya
              existe: la frase entra sin agregar nada.
            */}
            <p className="text-[17px] text-cream/60">
              {sePaso(ahora)
                ? 'Te pasaste de los 15, y no pasa nada: sigue a tu ritmo.'
                : 'Son 15 minutos, de una sola sentada.'}
            </p>
            <p className={`num-tab shrink-0 text-[17px] tabular-nums ${sePaso(ahora) ? 'text-cream/45' : 'text-gold'}`}>
              {sePaso(ahora) ? `+${comoSeLee(restante(ahora))}` : comoSeLee(restante(ahora))}
            </p>
          </div>
        )}

        {/* ── STEP 1: PASSWORD ── */}
        {step === 'password' && (
          <div className="bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-8">
              {/*
                Era `bg-gold` —oro macizo— con un `shadow-[0_0_20px]` encima:
                relleno Y glow, los dos prohibidos, en el elemento más saturado
                de la primera pantalla. Ahora es la figura de la casa: la línea
                de oro de 1px con un lavado mínimo adentro, como el resto de
                los contenedores de ícono de la app.
              */}
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-5">
                <LockKeyhole className="w-5 h-5 text-gold" />
              </div>
              <h1 className="text-2xl font-semibold text-cream mb-2">Hola, {nombreCorto}</h1>
              <p className="text-sm text-cream/75 leading-relaxed">
                Para empezar, elige una contraseña personal. Desde ahora entras con la tuya.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-black/40 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-4 py-3 pr-12 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-cream/55 hover:text-cream/80 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Confirmar contraseña</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Repite la contraseña"
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-sm text-cream focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-500/50'
                      : 'border-[var(--line, rgba(142,104,36,0.18))] focus:border-gold/50'
                  }`}
                />
              </div>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 w-8 rounded-full transition-colors ${newPassword.length >= i * 4 ? 'bg-success' : 'bg-gold/10'}`} />
                  ))}
                </div>
                <span className="text-sm text-cream/55">
                  {newPassword.length < 4 ? 'Muy corta' : newPassword.length < 8 ? 'Casi...' : <span className="flex items-center gap-0.5">Lista <CheckCircle2 className="w-3 h-3 text-success inline" /></span>}
                </span>
              </div>
            )}

            <button
              onClick={handlePasswordSubmit}
              disabled={savingPwd || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full mt-6 min-h-[48px] py-3.5 rounded-xl btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Continuar</>}
            </button>
          </div>
        )}

        {/* ── STEP 2: PROFILE ── */}
        {enTramo && (
          /* ── SECCIÓN 1 · Quién eres y cómo estás hoy ── */
          <div className="bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-6">
              {/* El mismo cuadrado de oro macizo del primer paso, en otro paso
                  del wizard. Lo cazó la prueba leyendo el archivo: el medidor
                  solo abre el PRIMER paso, así que los otros nueve siguen sin
                  medirse. */}
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-5">
                {/* text-ink NO: el papel invierte --color-ink a #EAE4D9 y el
                    remapeo de index.css solo alcanza a `button.bg-gold`. Sobre
                    este oro al 10% quedaba cream claro sobre panel claro: el
                    cuadrado se veía VACÍO. Lo vi en la captura, no lo dijo
                    ningún lente. */}
                <UserCircle className="w-5 h-5 text-gold" />
              </div>
              <h1 className="text-2xl font-semibold text-cream mb-2">Cuéntanos sobre ti</h1>
              <p className="text-sm text-cream/75 leading-relaxed">
                Esta info le sirve a tu acompañante para conocerte mejor desde el día 1 y que el Mentor IA te dé respuestas más precisas.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">¿Cuál es tu profesión?</label>
                <div className="flex flex-wrap gap-2">
                  {ESPECIALIDADES.map(esp => (
                    <button
                      key={esp}
                      type="button"
                      onClick={() => setEspecialidad(esp)}
                      className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        especialidad === esp
                          ? 'bg-gold/20 text-gold border border-gold/40'
                          : 'bg-panel text-cream/75 border border-[var(--line, rgba(142,104,36,0.18))] hover:border-[var(--line2, rgba(142,104,36,0.30))] hover:text-cream/90'
                      }`}
                    >
                      {esp}
                    </button>
                  ))}
                </div>
                {especialidad === 'Otro' && (
                  <input
                    type="text"
                    autoFocus
                    value={especialidadOtro}
                    onChange={e => setEspecialidadOtro(e.target.value)}
                    placeholder="¿Cuál es tu profesión?"
                    className="mt-3 w-full bg-black/40 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-cream focus:outline-none focus:border-gold/60 transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
                  ¿Desde qué país trabajas? <span className="text-cream/45 normal-case font-normal">(la IA adapta el tono de las respuestas y de tu contenido)</span>
                </label>
                <CustomSelect
                  value={pais}
                  onChange={setPais}
                  placeholder="Elige tu país"
                  options={PAISES.map(p => ({ value: p.codigo, label: p.nombre }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
                  ¿Cómo está tu energía hoy? <span className="text-cream/45 normal-case font-normal">(1 = agotado/a · 10 = con todo)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEnergia(n)}
                      /*
                       * 16 px y no 15, medido con el medidor de diseño.
                       *
                       * Al fundir los seis pasos en uno, los cuatro pesos que
                       * antes vivían en PANTALLAS DISTINTAS quedaron en la
                       * misma vista: el tamaño 15 juntó 400 (las notas entre
                       * paréntesis), 500 (las opciones), 600 (las preguntas) y
                       * 700 (estos números). El techo de la regla es tres
                       * pesos por tamaño, y la falta la cazó el medidor — no
                       * la vio ninguna lente de texto.
                       *
                       * Se movió ESTE, de los cuatro, por dos razones: son los
                       * elementos menos numerosos del grupo, y 15 px la casa
                       * lo reserva para metadatos —`--text-xs`: «solo
                       * metadatos, nunca instrucciones»—. Un número que el
                       * cliente TOCA no es un metadato. En 16 el peso 700 no
                       * existía: entra sin empujar nada.
                       */
                      className={`w-11 h-11 rounded-lg text-base font-bold transition-all ${
                        n <= energia
                          ? 'bg-amber-500 text-ink shadow-sm shadow-amber-500/30'
                          : 'bg-panel text-cream/45 border border-[var(--line, rgba(142,104,36,0.18))] hover:border-[var(--line2, rgba(142,104,36,0.30))]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">
                  ¿Cuál es tu mayor frustración hoy en tu práctica? <span className="text-cream/45 normal-case font-normal">(opcional)</span>
                </label>
                <textarea
                  value={frustracion}
                  onChange={e => setFrustracion(e.target.value)}
                  placeholder="Ej: No sé cómo conseguir consultantes nuevos sin depender de referidos, siento que trabajo mucho y gano poco..."
                  rows={3}
                  className="w-full bg-black/40 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors resize-none"
                />
                {/* El botón de voz EXISTÍA y ya estaba en esta pantalla, colgado
                    del origen y del Para Qué. Lo que faltaba era ponerlo en los
                    demás campos abiertos: el turno 17 lo pedía como «pregunta
                    nueva» y no era una pregunta, era este botón acá. */}
                <div className="flex justify-end mt-1"><BotonAudio onTexto={(t) => setFrustracion((p) => (p ? p + '\n' : '') + t)} /></div>
                <p className="text-sm text-cream/45 mt-1.5">Tu Mentor va a leer esto para entenderte desde el inicio. Puedes responder hablando.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Ingresos mensuales (USD)</label>
                  <input
                    type="number" inputMode="numeric"
                    value={ingresosMensuales}
                    onChange={e => setIngresosMensuales(e.target.value)}
                    placeholder="Ej: 2000"
                    className="w-full bg-black/40 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cream/75 uppercase tracking-wider mb-2">Horas/semana</label>
                  <input
                    type="number" inputMode="numeric"
                    value={horasSemana}
                    onChange={e => setHorasSemana(e.target.value)}
                    placeholder="Ej: 40"
                    className="w-full bg-black/40 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* El botón de este paso salió con la fusión: en un tramo único hay
                un solo botón, al final de todo. El «Saltar» que había acá
                mandaba derecho a `welcome` y se llevaba las seis secciones por
                delante — en el tramo no hay a dónde saltar. */}
          </div>
        )}

        {/* ── STEP 3: TU SITUACIÓN ── */}
        {enTramo && (
          /* ── SECCIÓN 2 · Tu situación ── */
          <div>
            <PasoSituacion valor={situacion} onChange={setSituacion} />
            {!situacionCompleta(situacion) && (
              <p className="text-xs text-cream/45 mt-3 text-center">
                Puedes seguir sin completar todo. Lo que falte lo cerramos en tus
                primeros diez días.
              </p>
            )}
          </div>
        )}

        {enTramo && (
          /* ── SECCIÓN 3 · Tu diagnóstico ── */
          <div className="space-y-6 fade-rise">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Tu punto de partida</p>
              <h2 className="text-2xl font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Diez preguntas — la semilla de tu ADN</h2>
              <p className="text-sm text-cream/55 mt-1">Con esto tu plan arranca personalizado. Un minuto, sin vueltas.</p>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">1 · ¿Ya tienes una forma propia de trabajar con quienes atiendes — un método, aunque no tenga nombre?</p>
              <div className="space-y-2">
                {([['B','Sí. Tengo mi manera de hacer las cosas — la uso hace años.'],['A','No, o no lo tengo claro. Trabajo caso por caso.']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDxAvatar(v)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxAvatar === v ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">2 · ¿Qué te frena más hoy?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['No sé conseguir consultantes online','Me cuesta cobrar lo que valgo','No tengo tiempo — todo depende de mí','Un poco de todo'].map((o) => (
                  <button key={o} onClick={() => setDxFreno(o)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxFreno === o ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{o}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">3 · ¿A quién ayudas mejor? (la persona que mejor atiendes, en una frase)</p>
              <input value={dxNicho} onChange={(e) => setDxNicho(e.target.value)} placeholder="Ej: mujeres de 40-55 con problemas digestivos crónicos" className="w-full bg-black/20 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-4 py-3 text-sm text-cream placeholder-cream/25 focus:outline-none focus:border-gold/50" />
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">4 · Cuando tienes que decir tu precio, ¿qué pasa?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['Lo digo tranquilo','Lo bajo antes de que me lo pidan','Lo justifico con títulos y años','Evito el tema'].map((o) => (
                  <button key={o} onClick={() => setDxDinero(o)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxDinero === o ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{o}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">5 · ¿Cuánto tiempo real por día tienes para esto?</p>
              <div className="grid grid-cols-3 gap-2">
                {['30 min','1 hora','2+ horas'].map((o) => (
                  <button key={o} onClick={() => setDxTiempo(o)} className={`px-4 py-3 rounded-xl border text-sm transition-all ${dxTiempo === o ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{o}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[17px] font-medium text-cream/85 mb-2">{VOC('6 · ¿De dónde llegan hoy tus {{consultantes}}?')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['Me los recomiendan','De mis redes','De anuncios que pago','De un lugar donde atiendo'].map((o) => (
                  <button key={o} onClick={() => setDxLlegan(o)}
                    className={`text-left px-4 py-3 rounded-xl border text-[17px] min-h-[52px] transition-all ${dxLlegan === o ? 'elegido' : 'border-[var(--line2,#DFD3BC)] text-cream/70'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[17px] font-medium text-cream/85 mb-2">7 · Entre sesión y sesión, ¿qué le das hoy?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['Nada, hasta la próxima sesión','Mensajes cuando me escriben','Ejercicios o material que mando','Ya tengo una plataforma'].map((o) => (
                  <button key={o} onClick={() => setDxEntrega(o)}
                    className={`text-left px-4 py-3 rounded-xl border text-[17px] min-h-[52px] transition-all ${dxEntrega === o ? 'elegido' : 'border-[var(--line2,#DFD3BC)] text-cream/70'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[17px] font-medium text-cream/85 mb-2">8 · ¿Cada cuánto publicas hoy?</p>
              <div className="grid grid-cols-2 gap-2">
                {['Casi nunca','Cuando me acuerdo','Una vez por semana','Varias por semana'].map((o) => (
                  <button key={o} onClick={() => setDxPublica(o)}
                    className={`text-left px-4 py-3 rounded-xl border text-[17px] min-h-[52px] transition-all ${dxPublica === o ? 'elegido' : 'border-[var(--line2,#DFD3BC)] text-cream/70'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">9 · ¿Cómo quieres que te hable tu Mentor?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([['hueso', 'Directo al hueso. Sin vueltas, aunque incomode.'], ['guantes', 'Con guantes. Firme, pero más suave.']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDxEstilo(v)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxEstilo === v ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">10 · ¿El trabajo espiritual es parte de tu vida?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([['si', 'Sí — la fe, la oración o la gratitud son parte de mi camino.'], ['no', 'No — prefiero un lenguaje neutro.']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setDxFe(v)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${dxFe === v ? 'elegido' : 'border-[var(--line, rgba(142,104,36,0.18))] bg-black/20 text-cream/70 hover:border-gold/40'}`}>{l}</button>
                ))}
              </div>
            </div>

            {/* El cierre del primer día, que es el momento en que alguien decide
                si esto le sirve: iba al 45% en itálica, la letra de la nota al
                pie. */}
            {dxAvatar && (
              <p className="text-sm text-cream/80">Listo. Con esto tu ADN ya tiene su semilla. Tu plan: <strong className="text-gold">{VOC('10 {{consultantes}} a tu precio digno')} y 10 horas menos por semana — en 90 días</strong>. Cinco estaciones, del lago al bosque, una sesión por día.</p>
            )}

          </div>
        )}

        {enTramo && (
          /*
           * ─── SECCIÓN 4 · LO TUYO Y TUS DÍAS (turno 17) ───────────────────
           *
           * Las cuatro que el mapa pedía y no existían. Las que NO están acá
           * tienen su motivo escrito en `laRadiografia.ts`: la D y la O del
           * FODA ya se preguntan arriba —`freno`, `frustracion`, `nicho`,
           * `llegan`— y la regla de la casa es que nada se pregunta dos veces.
           *
           * Ninguna es obligatoria: el cierre del tramo no las mira.
           */
          <div className="space-y-6 fade-rise">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Lo tuyo</p>
              <h2 className="text-2xl font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Lo que ya tienes, y lo que te puede sacar</h2>
              <p className="text-sm text-cream/55 mt-1">Dos preguntas cortas. Lo primero que se te venga: casi siempre es lo verdadero.</p>
            </div>

            {[
              { v: fortaleza, set: setFortaleza,
                q: VOC('1 · ¿Qué haces mejor que cualquiera de tu especialidad?'),
                ph: 'Eso que tus {{consultantes}} te agradecen y a ti te parece normal…' },
              { v: amenaza, set: setAmenaza,
                q: VOC('2 · ¿Qué de afuera te puede sacar {{consultantes}} este año?'),
                ph: 'Lo que no depende de ti y te preocupa…' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-cream/85 mb-2">{item.q}</p>
                <textarea value={item.v} onChange={(e) => item.set(e.target.value)} rows={3} placeholder={VOC(item.ph)}
                  className="w-full bg-surface/50 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
                <div className="flex justify-end mt-1"><BotonAudio onTexto={(t) => item.set((item.v ? item.v + '\n' : '') + t)} /></div>
              </div>
            ))}

            {/* ── Sus archivos y sus enlaces ──
                El mapa dice por qué: «lo que ya publicó dice más de su negocio
                que lo que contesta en un formulario». */}
            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">3 · Tu web, tu Instagram, tu página — pega los enlaces</p>
              <textarea value={enlaces} onChange={(e) => setEnlaces(e.target.value)} rows={2} placeholder="Uno por línea. Lo que tengas."
                className="w-full bg-surface/50 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
            </div>

            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">Y si tienes un PDF, tu libro o un documento tuyo, súbelo</p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold text-cream cursor-pointer min-h-[44px]"
                style={{ borderColor: 'var(--line2, #DFD3BC)' }}>
                {subiendo ? 'Subiendo…' : archivos.length > 0 ? `✓ ${archivos.length} subido${archivos.length > 1 ? 's' : ''} · agregar otro` : 'Subir un archivo'}
                <input
                  type="file"
                  accept="image/*,audio/*,.pdf,.doc,.docx"
                  className="hidden"
                  disabled={subiendo}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSubiendo(true);
                    setFallaDeSubida('');
                    const r = await subirArchivoDeLaRadiografia(profile.id, file);
                    if (r.ok) setArchivos((prev) => [...prev, r.evidencia.path]);
                    else setFallaDeSubida(r.motivo);
                    setSubiendo(false);
                    /* El input se limpia: sin esto, subir el MISMO archivo dos
                       veces no dispara el cambio y parece que no hizo nada. */
                    e.target.value = '';
                  }}
                />
              </label>
              {fallaDeSubida && <p className="text-sm text-danger mt-2">{fallaDeSubida}</p>}
              <p className="text-sm text-cream/45 mt-2">Opcional. Si no tienes nada a mano, sigue: esto se puede subir después.</p>
            </div>

            {/* ── Qué días le importan ──
                Los cinco paisajes salen de `losCincoPaisajes.ts`, no escritos a
                mano: el día que se mueva una jornada, esta lista se mueve con
                ella. Es la misma lección que costó 21 días de app
                contradiciéndose sola. */}
            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">4 · De tus 90 días, ¿qué tramo te importa más? Marca los que quieras</p>
              <div className="space-y-2">
                {PAISAJES.map((pj) => {
                  const marcado = diasQueImportan.includes(pj.id);
                  return (
                    <button
                      key={pj.id}
                      type="button"
                      onClick={() => setDiasQueImportan((prev) => (
                        prev.includes(pj.id) ? prev.filter((x) => x !== pj.id) : [...prev, pj.id]
                      ))}
                      className={`w-full text-left px-4 py-3 rounded-xl border min-h-[52px] transition-colors ${marcado ? 'border-gold/60 bg-gold/[0.06]' : 'bg-surface/50'}`}
                      style={marcado ? undefined : { borderColor: 'var(--line, rgba(142,104,36,0.18))' }}
                    >
                      <p className={`text-[17px] ${marcado ? 'text-gold' : 'text-cream'}`}>{pj.nombre} · {pj.sistema}</p>
                      <p className="text-sm text-cream/55">{pj.dias} — {pj.ensena}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-cream/45 mt-2">Esto no cambia tu orden: el Camino es el mismo. Nos dice dónde apretar.</p>
            </div>
          </div>
        )}

        {/* ── S6 · SIEMBRA 2: TU ORIGEN — de aquí nace todo ── */}
        {enTramo && (
          /* ── SECCIÓN 5 · Tu origen ── */
          <div className="space-y-6 fade-rise">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Tu origen</p>
              <h2 className="text-2xl font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Tres preguntas — de aquí nace todo</h2>
              <p className="text-sm text-cream/55 mt-1">Tu historia contiene tus dones, y tus dones señalan a quién vienes a servir. Puedes responder hablando.</p>
            </div>
            {[
              { v: ogPorque, set: setOgPorque, q: '1 · ¿Por qué elegiste esta profesión?', ph: 'Lo que te trajo hasta acá…' },
              { v: ogHerida, set: setOgHerida, q: '2 · ¿Qué herida propia sanaste (o sigues sanando)?', ph: 'Casi siempre, ' + VOC('tu {{consultante}} ideal') + ' es tu yo del pasado…' },
              { v: ogPaciente, set: setOgPaciente, q: VOC('3 · ¿De qué {{consultante}} no te olvidas, y por qué?'), ph: 'Esa historia es tu prueba de que tu trabajo transforma…' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-cream/85 mb-2">{item.q}</p>
                <textarea value={item.v} onChange={(e) => item.set(e.target.value)} rows={3} placeholder={item.ph}
                  className="w-full bg-surface/50 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
                <div className="flex justify-end mt-1"><BotonAudio onTexto={(t) => item.set((item.v ? item.v + '\n' : '') + t)} /></div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tu medición de entrada: sin esto no hay con qué comparar al final ── */}
        {enTramo && (
          /* ── SECCIÓN 6 · Tus seis números ── */
          <div className="space-y-6 fade-rise">
            <div>
              <p className="text-[15px] font-bold uppercase tracking-[0.3em] text-gold">Tu punto de partida</p>
              <h2 className="text-[26px] font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
                Seis números de hoy
              </h2>
              <p className="text-[17px] text-cream/70 mt-1">
                Los mismos seis se vuelven a medir al final. Ahí vas a ver, en números, qué cambió.
                Pon lo que hay hoy, aunque no te guste: es tu punto de partida, no tu examen.
              </p>
            </div>

            {CAMPOS.map((c) => (
              <div key={c.id}>
                <label htmlFor={`med-${c.id}`} className="block text-[17px] font-medium text-cream/90 mb-2">
                  {VOC(c.pregunta)}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`med-${c.id}`}
                    type="number"
                    inputMode="decimal"
                    value={medicionEntrada[c.id] ?? ''}
                    onChange={(e) => setMedicionEntrada((prev) => ({
                      ...prev,
                      [c.id]: e.target.value === '' ? NaN : Number(e.target.value),
                    }))}
                    className="w-36 min-h-[52px] bg-surface/50 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-3.5 text-[19px] text-cream"
                  />
                  <span className="text-[17px] text-cream/60">{c.unidad}</span>
                </div>
              </div>
            ))}

            {!estaCompleta(medicionEntrada) && (
              <p className="text-[17px] text-cream/55">
                Te faltan {loQueFalta(medicionEntrada).length} de 6. Son los únicos
                que el tramo pide completos: sin ellos no hay con qué comparar al
                final.
              </p>
            )}
          </div>
        )}

        {/* ── S6 · SIEMBRA 3: TU RUEDA + TU PARA QUÉ — la foto vital de partida ── */}
        {enTramo && !esCincoDias && (
          /* ── SECCIÓN 7 · Tu rueda. No va para los cinco días: su medición es otra. ── */
          <div className="space-y-6 fade-rise">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gold">Tu foto vital de partida</p>
              <h2 className="text-2xl font-light text-cream mt-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Tus siete libertades — el día 90 las vas a mirar</h2>
              <p className="text-sm text-cream/55 mt-1">Un toque por libertad: ¿cómo está hoy, del 1 al 10? No viniste solo a hacer dinero.</p>
            </div>
            <div className="space-y-3">
              {DIMENSIONES_RUEDA.map((d) => {
                const v = ruedaIni[d.id];
                return (
                  <div key={d.id}>
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <p className="min-w-0 text-[15px] text-cream">
                        {d.label}
                        <span className="text-cream/55"> · {d.pregunta}</span>
                      </p>
                      <p className="text-[15px] text-cream/55 shrink-0">{typeof v === 'number' ? v + '/10' : '—'}</p>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const lleno = typeof v === 'number' && i < v;
                        return (
                          <button key={i} type="button" onClick={() => setRuedaIni((p) => ({ ...p, [d.id]: i + 1 }))}
                            className="flex h-11 flex-1 items-center min-w-0"
                            aria-label={d.label + ' ' + (i + 1)}>
                            {/*
                              La barra se dibuja fina; lo que se toca es toda la altura.
                              Cada libertad lleva su color del paisaje de la tapa. El
                              canal vacío es un surco y no el papel, así una libertad
                              de color claro igual se distingue de lo que falta.
                            */}
                            <span
                              className="h-4 w-full rounded transition-colors"
                              style={{ background: lleno ? d.color : 'var(--matrix-cell-divider, rgba(43,39,36,0.10))' }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-sm font-medium text-cream/85 mb-2">Y tu Para Qué: ¿qué vas a crear con el tiempo, el dinero y la energía que recuperes?</p>
              <textarea value={pqIni} onChange={(e) => setPqIni(e.target.value)} rows={3} placeholder="Para qué es todo esto…"
                className="w-full bg-surface/50 border border-[var(--line, rgba(142,104,36,0.18))] rounded-xl px-3.5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/50" />
              <div className="flex justify-end mt-1"><BotonAudio onTexto={(t) => setPqIni((p) => (p ? p + '\n' : '') + t)} /></div>
            </div>
          </div>
        )}

        {/*
          ─── EL ÚNICO BOTÓN DEL TRAMO ──────────────────────────────────────
          Donde antes había seis. Lo que pide, lo dice: `loQuePide` nombra la
          sección que falta en vez de quedarse apagado sin explicar por qué,
          que es lo que hacía el botón del diagnóstico cuando el avatar estaba
          sin elegir.
        */}
        {enTramo && (
          <div className="mt-8">
            {loQuePide && (
              <p className="text-[17px] text-gold leading-relaxed mb-3">{loQuePide}</p>
            )}
            <button
              onClick={cerrarElTramo}
              disabled={cerrandoTramo}
              className="w-full py-4 rounded-xl btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cerrandoTramo
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
                : <><ArrowRight className="w-4 h-4" /> Listo, dame mi punto de partida</>}
            </button>
            <p className="text-sm text-cream/45 text-center mt-3">
              Todo lo que escribiste ya quedó guardado. Si cierras y vuelves,
              sigues desde acá.
            </p>
          </div>
        )}

        {step === 'welcome' && !rutaAbierta && (
          <div className="bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-3xl p-8 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Era verde macizo de 64×64 con un `shadow-[0_0_30px]` encima: lo
                más saturado de la pantalla, más un GLOW, que la regla de la
                casa prohíbe sin excepción. Mismo arreglo que el cuadrado de oro
                del primer paso: el color queda en el borde y en el ícono. */}
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>

            <h1 className="text-2xl font-semibold text-cream mb-3">Bienvenido/a al Camino, {nombreCorto}</h1>

            {/* El panel entero lleva `text-center`, y debajo del título había
                quince renglones de PROSA centrada. El centrado sirve para un
                título; para un párrafo obliga a buscar dónde empieza cada
                renglón, que es justo lo que esta app evita por diseño. El
                encabezado queda centrado y el cuerpo a la izquierda, igual que
                las tarjetas de abajo. */}
            <div className="text-left">
            <p className="text-sm text-gold/90 leading-relaxed mb-3 font-medium">
              {VOC('Ya diste el primer paso más difícil: decidir que tu trabajo vale lo suficiente como para invertir en él. Eso mismo — cobrar con dignidad — es lo que vas a aprender a hacer con cada {{consultante}}.')}
            </p>
            <p className="text-sm text-cream/70 leading-relaxed mb-2">
              {esCincoDias ? <>Estás por empezar <strong className="text-cream/90">tus 5 días</strong>: una micro-sesión guiada por día — 30 minutos, un paso por pantalla. El viernes nos vemos en vivo y el lunes cobras tu precio nuevo.</> : <>Estás por empezar un camino de 90 días: <strong className="text-cream/90">una sesión de trabajo por día</strong> (de 45 minutos a 2 horas; la primera semana, la del dinero, pide un poco más), de lunes a viernes. Cada sesión te deja algo construido. Cada hito se prueba con evidencia. Cada logro real gana un grado, del blanco al negro: <strong className="text-gold">{VOC('10 {{consultantes}} de $1.000')}</strong>.
            </>}</p>
            <p className="text-sm text-cream/80 leading-relaxed mb-6">
              <span className="text-gold font-semibold">Nuestro equipo</span> te acompaña en todo el proceso — seguimos tu progreso, respondemos tus dudas y te guiamos paso a paso. Puedes escribirnos en cualquier momento desde Contacto.
            </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-8 sm:grid-cols-3">
              {/*
               * El ícono sale de `destinos.ts`, no copiado a mano: acá el
               * Mentor tenía un robot y Entrenadores tenía el ícono del
               * Mentor, así que las dos tarjetas de esta pantalla mostraban la
               * MISMA cara. Leyéndolo del destino no se pueden volver a
               * separar: si mañana cambia el ícono del menú, cambia acá solo.
               */}
              {[
                { id: 'roadmap', label: 'El Camino', desc: 'Tu sesión de cada día. Todo pasa acá.' },
                { id: 'coach', label: 'Mentor IA', desc: 'Te acompaña y destraba. No hace tu trabajo.' },
                { id: 'entrenadores', label: 'Entrenadores', desc: 'Especialistas que aparecen cuando toca' },
              ].map(({ id, label, desc }) => ({ icon: destinoPorId(id)?.icon ?? Map, label, desc })).map(item => (
                /*
                 * Dos arreglos vistos en la captura:
                 *  · el nombre iba en `text-xs` (15px) y su descripción en
                 *    `text-sm` (17px): el título era MÁS CHICO que su propio
                 *    cuerpo. Jerarquía al revés.
                 *  · la tarjeta heredaba el `text-center` del panel, pero un
                 *    `<svg>` de lucide es `display:block` y `text-align` no lo
                 *    mueve: el ícono quedaba pegado a la izquierda y el texto
                 *    centrado, en la misma tarjeta. Van las tres a la
                 *    izquierda, como el resto de la app.
                 */
                <div key={item.label} className="bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-2xl p-4 text-left">
                  <item.icon className="w-6 h-6 text-gold mb-2" />
                  <p className="text-base font-semibold text-cream mb-1">{item.label}</p>
                  <p className="text-sm text-cream/55">{item.desc}</p>
                </div>
              ))}
            </div>

            {/*
              EL DICTAMEN.
              La bienvenida no cierra con un resumen de lo que contestó: cierra
              con un veredicto. Le nombra la etapa en la que está, con sus
              datos, y le muestra la puerta por donde entra. Javo eligió esta
              forma entre tres el 8 de noviembre.
              La etapa sale de `elDictamen.ts`, que decide por los HECHOS del
              cliente y no por qué pantalla los trajo: cuando el onboarding se
              rehaga, esto sigue andando.
            */}
            {(() => {
              const d = dictaminar({
                avatar: dxAvatar,
                vendioAlPrecio: situacionGuardada().vendio_al_precio,
                escalera: situacionGuardada().escalera,
                llegan: dxLlegan,
              });
              return (
                /* `text-left` a propósito: el panel hereda el centrado de la
                   pantalla, y un párrafo de tres líneas centrado queda con el
                   borde dentado y se lee peor — más todavía para alguien con
                   TDAH. Las tarjetas de arriba ya van a la izquierda. */
                <div className="mb-6 rounded-2xl border p-5 text-left"
                  style={{ borderColor: 'var(--line2, #DFD3BC)' }}>
                  <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
                    Tu punto de partida
                  </p>
                  <p className="mt-3 text-[17px] leading-snug text-cream">{d.tienes}</p>
                  <p className="mt-1 text-[17px] leading-snug text-cream">{d.teFalta}</p>

                  <p className="mt-5 text-[15px] font-bold uppercase tracking-[0.16em] text-goldhi">
                    Tu etapa
                  </p>
                  <p className="mt-2 text-[22px] leading-tight text-cream"
                    style={{ fontFamily: 'var(--font-display)', fontStyle: 'normal' }}>
                    {d.etapa}
                  </p>

                  <p className="mt-5 text-[17px] leading-snug text-cream/80">
                    Tu ADN provisorio ya está escrito con lo que acabas de contarme.
                    Se sella el día <span className="num-tab text-gold">{d.diaDeSellado}</span>,
                    cuando pongas tu precio nuevo.
                  </p>
                  <p className="mt-3 text-[17px] leading-snug text-cream/80">
                    De acá al día <span className="num-tab">90</span> pasas por cinco
                    paisajes. Empiezas en {d.primeraEstacion}.
                  </p>
                </div>
              );
            })()}

            {/*
              SUS NOVENTA DÍAS, ANTES DE EMPEZARLOS.
              El mapa del viaje pide que la bienvenida cierre mostrándole su
              calendario día por día, con las estaciones a la vista, y dice por
              qué: es donde la app se gana el precio. Alguien que acaba de
              pagar necesita ver que lo que compró ya está escrito.
              No va embutido acá: la Hoja de Ruta son trece semanas plegables y
              esta pantalla tiene una idea sola. Se abre como vista propia, la
              misma que ya se abre desde el Camino, con el mismo componente —
              no hay una segunda copia del calendario.
            */}
            <button
              type="button"
              onClick={() => { setRutaAbierta(true); window.scrollTo({ top: 0 }); }}
              className="w-full min-h-[52px] mb-3 rounded-xl border text-[17px] font-semibold text-cream flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--line2, #DFD3BC)' }}
            >
              <Map className="w-4 h-4 text-gold" /> Ver mis 90 días
            </button>

            <button
              onClick={() => setStep('pacto')}
              className="w-full py-4 rounded-xl btn-primary flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" /> Continuar
            </button>
          </div>
        )}

        {/*
          La Hoja de Ruta, abierta desde la bienvenida.

          REEMPLAZA al panel, no se le cuelga abajo. La primera versión la
          montaba debajo del botón, igual que en el Camino, y ahí es correcto
          porque la página entera es el Camino. Acá el wizard vive dentro de un
          contenedor que scrollea: la hoja aparecía fuera de la vista y el
          cliente tocaba «Ver mis 90 días» sin ver pasar nada. Un botón que no
          parece hacer nada es lo mismo que un botón muerto.

          Entra vacía y en el día 1: todavía no completó ninguna jornada.
        */}
        {rutaAbierta && (
          <HojaDeRuta
            fechaInicio={profile.fecha_inicio ?? null}
            completadas={new Set<string>()}
            diaDeHoy={1}
            onCerrar={() => setRutaAbierta(false)}
          />
        )}


        {/* ── STEP: EL PACTO ── */}
        {step === 'pacto' && (
          <div className="bg-panel border border-[var(--line2, rgba(142,104,36,0.30))] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="text-center mb-6">
                            <h1 className="text-2xl font-semibold text-cream mb-1" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>El Pacto</h1>
              <p className="text-sm uppercase tracking-[0.3em] text-gold font-bold">Tu palabra empeñada es el primer cinturón</p>
            </div>

            <div className="rounded-2xl border border-cream/10 bg-[var(--bg-card,#17150F)] p-5 mb-5">
              <p className="text-sm text-cream/80 leading-relaxed">
                Es una promesa, y las promesas se hacen con nombre y apellido.
              </p>
              <p className="text-sm text-cream/80 leading-relaxed mt-3">
                Y no la haces solo. Al firmar te sumas a los <strong className="text-gold">Sanadores Libres</strong> — profesionales que se negaron a elegir entre su vocación y vivir dignamente de ella. Contra la vieja idea de que el que sana tiene que ser pobre, acá caminamos juntos.
              </p>
              <p className="text-sm text-cream/80 leading-relaxed mt-3">
                <strong className="text-cream">A los tuyos:</strong> a quienes te formaron y a quienes dependen de ti.{' '}
                <strong className="text-cream">A tus {VOC('{{consultantes}}')}:</strong> a los que ya ayudaste y a los diez que todavía no te encontraron.{' '}
                <strong className="text-cream">Y a ti:</strong> al profesional que hoy decide dejar de sobrevivir.
              </p>
              <p className="text-sm text-gold/90 leading-relaxed mt-3 font-medium">
                {esCincoDias ? 'Mi primer compromiso: hacer mis 5 días completos y llegar a mi sesión del viernes con mi precio sellado.' : 'Mi primer compromiso: llegar al Cinturón Amarillo — sanar mi relación con el dinero — antes del día 10.'}
              </p>
            </div>

            <label className="text-sm uppercase tracking-widest text-gold font-bold">Escribe tu pacto con tus palabras (por qué haces esto, por quién)</label>
            <textarea
              value={pactoTexto}
              onChange={(e) => setPactoTexto(e.target.value)}
              rows={4}
              placeholder="Hago este camino porque…"
              className="w-full mt-1.5 px-4 py-3 rounded-xl bg-ink border border-cream/15 text-cream text-sm focus:border-gold/50 focus:outline-none resize-none"
            />
            <div className="flex justify-end mt-1 mb-4"><BotonAudio onTexto={(t) => setPactoTexto((p) => (p ? p + '\n' : '') + t)} /></div>
            <label className="text-sm uppercase tracking-widest text-gold font-bold">Tu firma (nombre completo)</label>
            <input
              value={pactoFirma}
              onChange={(e) => setPactoFirma(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full mt-1.5 mb-6 px-4 py-3 rounded-xl bg-ink border border-cream/15 text-cream text-sm italic focus:border-gold/50 focus:outline-none"
              style={{ fontFamily: 'var(--font-display)' }}
            />
            <button
              onClick={() => {
                if (pactoTexto.trim().length < 20 || pactoFirma.trim().length < 5) return;
                try {
                  localStorage.setItem('tcd_pacto', JSON.stringify({ texto: pactoTexto.trim(), firma: pactoFirma.trim(), fecha: new Date().toISOString() }));
                } catch { /* noop */ }
                setStep('guide');
              }}
              disabled={pactoTexto.trim().length < 20 || pactoFirma.trim().length < 5}
              className="w-full py-4 rounded-xl btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              FIRMO MI PACTO
            </button>
            <p className="text-sm text-cream/45 text-center mt-3">Tu pacto queda guardado. Lo vas a volver a leer el día de tu graduación.</p>
          </div>
        )}

        {/* ── STEP 10: LA GUÍA ── */}
        {step === 'guide' && (
          <div className="bg-panel border border-[var(--line, rgba(142,104,36,0.18))] rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="mb-6 text-center">
              {/* Tres cosas a la vez en la ÚLTIMA pantalla del wizard: un
                  degradé naranja saturado, un glow de 20px y un cohete. El
                  degradé y el glow los prohíbe la regla; el cohete es el cliché
                  de despegue, que es el tono del que esta casa se diferencia.
                  La pregunta es «¿por dónde empezar?» —orientación, no
                  despegue—, así que va una brújula. */}
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
                <Compass className="w-5 h-5 text-gold" />
              </div>
              <h1 className="text-xl font-semibold text-cream mb-2">¿Por dónde empezar?</h1>
              <p className="text-sm text-cream/75">Estos son tus primeros 3 pasos concretos:</p>
            </div>

            <div className="space-y-3 mb-8">
              {([
                {
                  num: '1',
                  title: 'Abre El Camino',
                  desc: esCincoDias ? 'Tu Día 1 te espera: entras a tu micro-sesión y sales con tu número. 30 minutos.' : 'Tu sesión de hoy te espera: el Día 1 completo — tu Foto de Partida. Una sesión por día, todo se hace ahí.',
                  styles: {
                    card: 'bg-gold/5 border-gold/20 hover:bg-gold/10',
                    icon: 'bg-gold/20',
                    iconColor: 'text-gold',
                    step: 'text-gold/60',
                    title: 'text-gold',
                    arrow: 'text-gold/40 group-hover:text-gold',
                  },
                  page: 'roadmap',
                },
                {
                  num: '2',
                  title: 'Conoce tu ritmo',
                  desc: 'Lunes a viernes: tu sesión (45 min a 2 h). Sábado y domingo: descanso — tu racha queda protegida.',
                  styles: {
                    card: 'bg-gold/5 border-gold/20 hover:bg-gold/10',
                    icon: 'bg-gold/20',
                    iconColor: 'text-gold',
                    step: 'text-gold/60',
                    title: 'text-gold',
                    arrow: 'text-gold/40 group-hover:text-gold',
                  },
                  page: 'mensajes',
                },
                {
                  num: '3',
                  title: 'Prueba el Mentor IA',
                  desc: 'Tu guía del camino. Pregúntale cuando te trabes — te destraba y te devuelve a tu sesión. Él no hace tu trabajo: te acompaña.',
                  styles: {
                    card: 'bg-gold/5 border-gold/20 hover:bg-gold/10',
                    icon: 'bg-gold/20',
                    iconColor: 'text-gold',
                    step: 'text-gold/60',
                    title: 'text-gold',
                    arrow: 'text-gold/40 group-hover:text-gold',
                  },
                  page: 'coach',
                },
              /* Igual que en el paso anterior: el ícono sale del destino al que
                 lleva la tarjeta (`page`), no escrito a mano. Acá la del Mentor
                 tenía un robot y la de Acompañamiento tenía el ícono del Mentor. */
              ] as const).map((it) => ({ ...it, icon: destinoPorId(it.page)?.icon ?? Map })).map(item => (
                <button
                  key={item.num}
                  onClick={() => handleComplete(item.page)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all group ${item.styles.card}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.styles.icon}`}>
                      <item.icon className={`w-4 h-4 ${item.styles.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-bold uppercase tracking-wider ${item.styles.step}`}>Paso {item.num}</span>
                      <p className={`text-sm font-semibold mb-0.5 mt-0.5 ${item.styles.title}`}>{item.title}</p>
                      <p className="text-xs text-cream/55 leading-relaxed">{item.desc}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-colors shrink-0 mt-2 ${item.styles.arrow}`} />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleComplete('dashboard')}
              className="w-full py-3 rounded-xl bg-gold/5 border border-[var(--line, rgba(142,104,36,0.18))] hover:bg-gold/10 text-cream/75 hover:text-cream text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Ir al dashboard primero
            </button>

            {/* Si el cierre no se guardó, se dice acá y no se entra: entrar
                con esto sin guardar es volver a encontrar esta pantalla al
                recargar, sin entender por qué. */}
            {noCerro && (
              <div className="rounded-xl border border-gold/35 bg-gold/[0.06] p-4">
                <p className="text-[17px] text-cream/90 leading-relaxed">
                  Tu conexión cortó justo al guardar este paso. Toca el botón otra vez.
                </p>
                <p className="text-[15px] text-cream/65 leading-relaxed mt-1.5">
                  Si vuelve a pasar, escríbenos y lo cerramos nosotros: tus respuestas
                  ya quedaron guardadas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
