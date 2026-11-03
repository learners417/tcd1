/**
 * estado-lleno.mts — El estado de una cuenta CON DATOS, derivado del seed.
 *
 * ═══ POR QUÉ EXISTE ═══
 *
 * El medidor abría la app con la cuenta vacía en las 48 vistas. Su propio
 * `preparar()` declara `hechas=12`, lo pasa a la función del navegador, lo
 * destructura… y nunca lo usa: el parámetro está muerto desde que se escribió.
 * Así que todo lo medido hasta ahora fue la app del día uno, con cero jornadas
 * hechas, cero piezas del ADN, cero en cada contador.
 *
 * Lo que solo aparece con datos: las listas largas, los numerales de cinco
 * cifras que desbordan su caja, los textos que el cliente escribió —su
 * historia, su método— que son párrafos enteros, los nombres largos, las
 * barras llenas. Nada de eso se midió nunca.
 *
 * Las claves se derivan del seed y no se escriben a mano, porque son
 * `${pilar.numero}-${meta.codigo}` y esa correspondencia vive en un solo
 * lugar. Escritas a mano envejecen con el primer reordenamiento del camino.
 *
 * Se corre así, y el medidor lo llama solo:
 *
 *     npx tsx scripts/estado-lleno.mts
 *
 * ═══ Y EL MODO --largo ═══
 *
 * Los textos de arriba son realistas pero CORTOS: el campo se llama
 * `historia_300` —trescientas palabras— y tiene cincuenta y cinco. El cliente
 * que escribe mucho no es un caso raro: es el que llena el campo como la app
 * se lo pide.
 *
 *     npx tsx scripts/estado-lleno.mts --largo
 *
 * Devuelve el mismo estado con cada campo en la extensión que su propio
 * nombre pide, un nombre de persona largo y numerales de SIETE cifras. Lo que
 * se busca es la caja que no aguanta: el párrafo que se corta, el panel que
 * se estira sobre nada, el numeral que se parte.
 *
 * Los textos largos se arman repitiendo oraciones reales con conectores que
 * varían, no con relleno: para medir una caja lo que importa es el largo y
 * cómo caen las palabras, y un «lorem ipsum» no cae como el castellano.
 */
import { SEED_ROADMAP_V3, TOTAL_METAS } from '../src/lib/roadmapSeed';

/** Las claves de jornada hechas hasta el día `hasta`, inclusive. */
function jornadasHechas(hasta: number): string[] {
  const claves: string[] = [];
  for (const p of SEED_ROADMAP_V3) {
    for (const m of p.metas) {
      if ((m.dia_asignado ?? 0) <= hasta) claves.push(`${p.numero}-${m.codigo}`);
    }
  }
  return claves;
}

/*
 * Textos largos de verdad, como los escribe alguien que trabaja hace años.
 * Un campo del ADN con «ok» no mide nada: lo que rompe una caja es el párrafo
 * que escribe una psicóloga contando de dónde viene su método.
 */
const HISTORIA = 'Empecé atendiendo en el living de mi casa, con dos sillas '
  + 'prestadas y una libreta. Venía de trabajar seis años en un hospital '
  + 'público donde veía quince personas por día y no me alcanzaba el tiempo '
  + 'para ninguna. Un martes a la noche, después de una guardia de doce horas, '
  + 'entendí que si seguía así iba a terminar odiando lo único que sé hacer.';

const METODO = 'Trabajo en tres fases que siempre van en el mismo orden: '
  + 'primero la historia —de dónde viene el síntoma y qué función cumplió—, '
  + 'después el permiso —qué se está prohibiendo y a cambio de qué— y al '
  + 'final la práctica, que es lo que sostiene el cambio cuando ya no estoy yo.';

/*
 * El diario: cuarenta y cinco días escritos, que es lo que lleva alguien
 * constante en el día 72. Con el diario vacío, «Días con diario» daba 0
 * mientras las jornadas iban en 71 — y el Dashboard, Métricas y el Mentor
 * leen las tres cosas, así que la cuenta no era coherente consigo misma.
 */
function diarioDe(dias: number) {
  const LOGROS = [
    'Cerré la oferta de las doce semanas y le puse precio.',
    'Grabé los tres videos del anuncio en una sola tarde.',
    'Dos consultantes nuevas agendaron sin que yo escribiera primero.',
    'Dejé de contestar mensajes a las once de la noche.',
    'Terminé el guion de la llamada y lo usé tal cual.',
  ];
  const BLOQUEOS = [
    'Me cuesta cobrar lo que puse sin explicarlo tres veces.',
    'Sigo abriendo la agenda los domingos.',
    '',
  ];
  const hoy = new Date();
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoy); d.setDate(d.getDate() - i);
    const fecha = d.toISOString().slice(0, 10);
    return {
      id: `e-${fecha}`,
      fecha,
      energia: 6 + (i % 4),
      cuerpo: 5 + (i % 5),
      mente: 6 + (i % 4),
      emociones: 5 + (i % 5),
      logro: LOGROS[i % LOGROS.length],
      tareas: [],
      checkeos: [],
      bloqueo: BLOQUEOS[i % BLOQUEOS.length],
      score: 60 + (i % 35),
    };
  });
}

/** ¿Se pidió el modo largo? */
const LARGO = process.argv.includes('--largo');

/**
 * Alarga un texto hasta `palabras`, repitiendo sus oraciones con conectores
 * que cambian. No es relleno: son oraciones del castellano, que es lo que
 * decide dónde cortan los renglones.
 */
function alargar(base: string, palabras: number): string {
  const CONECTORES = ['Y algo más:', 'Después entendí otra cosa.', 'Lo mismo me pasó al año siguiente.',
    'Con el tiempo lo vi distinto.', 'Hay una parte que no conté todavía.', 'Eso cambió todo.'];
  const oraciones = base.split(/(?<=\.)\s+/).filter(Boolean);
  const salida: string[] = [];
  let i = 0;
  while (salida.join(' ').split(/\s+/).length < palabras) {
    if (i > 0 && i % oraciones.length === 0) salida.push(CONECTORES[(i / oraciones.length - 1) % CONECTORES.length]);
    salida.push(oraciones[i % oraciones.length]);
    i++;
    if (i > 400) break;
  }
  return salida.join(' ');
}

const estado = {
  /** Día 72 de 90: la cuenta llena de verdad, con el camino casi cerrado. */
  dias: 72,
  /* El país decide el dialecto de sus landings y anuncios: sin él, el selector
     del Manual queda en «Elige tu país» con el resto del ADN completo. */
  pais: 'AR',
  /*
   * Un nombre largo de verdad. La barra de arriba lleva el nombre de la
   * pantalla y el saludo, y «Julia» no mide lo mismo que un nombre compuesto
   * con dos apellidos — que es como se llama buena parte de sus clientes.
   */
  nombre: LARGO ? 'María Fernanda Etchegaray Villanueva' : 'Julia',
  hechas: jornadasHechas(70),
  totalMetas: TOTAL_METAS,
  diario: diarioDe(45),
  /*
   * Las veintiocho claves son las del Manual del Negocio, y se escriben con
   * esos nombres exactos: la primera versión de este archivo inventó diez
   * (`adn_historia`, `adn_metodo_nombre`…) que la app no lee, y el Manual
   * siguió diciendo «1 de 28» con el ADN supuestamente lleno. Un estado de
   * prueba que no coincide con el dato real mide la pantalla vacía creyendo
   * que la mide llena — el mismo error que el parámetro muerto, una capa más
   * abajo.
   */
  adn: {
    adn_linea_tiempo: 'Hospital público (2014-2020) · consultorio propio '
      + '(2020-2024) · programa grupal (desde 2024)',
    historia_300: LARGO ? alargar(HISTORIA, 300) : HISTORIA,
    historia_150: 'Pasé seis años en un hospital público viendo quince personas '
      + 'por día sin tiempo para ninguna. Hoy acompaño a mujeres que sostienen a '
      + 'todos y no se sostienen a ellas.',
    historia_50: 'De las guardias de doce horas a un método propio.',
    adn_cinco_por_que: '1. Porque no quiero repetir el cansancio de mi casa.\n'
      + '2. Porque vi a mi madre llegar a los sesenta sin descanso.\n'
      + '3. Porque creo que se puede curar sin romperse.\n'
      + '4. Porque lo que sé hacer alcanza para vivir bien.\n'
      + '5. Porque quiero llegar a los cincuenta con ganas.',
    proposito: 'Que una mujer pueda elegir su vida sin tener que romperse '
      + 'primero para darse permiso.',
    adn_carta_futuro: 'Cuando leas esto vas a estar atendiendo doce personas '
      + 'por semana en vez de treinta, cobrando el triple y con los viernes '
      + 'libres. No lo vas a creer hasta que lo veas en tu propia agenda.',
    legado: 'Dejar escrito un método que otras puedan usar sin mí.',
    adn_pacientes_reales: 'Treinta y una consultantes activas, la mayoría por '
      + 'recomendación de otra consultante.',
    adn_avatar: 'Mujeres de 35 a 50 que sostienen a todos y no se sostienen a '
      + 'ellas, con trabajo estable y la sensación de estar cumpliendo una vida '
      + 'que no eligieron.',
    adn_nicho: 'Mujeres profesionales con sobrecarga de cuidado.',
    adn_usp: 'El único método que trabaja el permiso antes que el hábito: '
      + 'primero se desarma la culpa, después se cambia la rutina.',
    adn_transformaciones: 'De sostener a todos a sostenerse. De la agenda '
      + 'llena a la agenda elegida. De cobrar con culpa a cobrar con criterio.',
    matriz_a: 'Llega agotada, con la agenda llena y la sensación de que su vida '
      + 'la maneja otro.',
    matriz_b: 'La culpa de poner un límite y la creencia de que descansar es '
      + 'abandonar a alguien.',
    matriz_c: 'Trabaja doce personas por semana, cobra el triple y tiene los '
      + 'viernes libres.',
    metodo_nombre: LARGO ? 'El Permiso · Método de Reordenamiento del Cuidado Propio' : 'El Permiso',
    metodo_pasos: LARGO ? alargar(METODO, 250) : METODO,
    adn_proceso_actual: 'Primera entrevista, ocho sesiones semanales y un '
      + 'cierre a los tres meses.',
    oferta_mid: 'Volver a Elegir · doce semanas · 1.200 USD',
    oferta_high: 'Acompañamiento anual · 4.800 USD',
    oferta_low: 'Los siete días del permiso · 27 USD',
    lead_magnet: 'Las cinco frases que te sacan el permiso',
    adn_landing_copy: 'Sostenés a todos. ¿Quién te sostiene a vos? Doce '
      + 'semanas para volver a elegir tu vida, con un método que podés seguir '
      + 'usando cuando yo ya no esté.',
    adn_anuncios: 'Te recomendaron tanto que ya no te entra nadie más en la '
      + 'agenda. ¿Y si el problema no es la agenda?',
    script_venta: 'Contame cómo es tu semana. ¿Cuántas personas ves? ¿Y cuántas '
      + 'querrías ver? ¿Qué hay en el medio?',
    adn_protocolo_servicio: 'Bienvenida en 24 horas, primera sesión en la '
      + 'primera semana, informe de cierre a los tres meses.',
    adn_identidad_sistema: 'Papel, tinta y una línea de oro. Nada brillante.',
  },
  /*
   * Números de un mes bueno: cinco cifras en pesos, que es donde se ve si la
   * caja del numeral aguanta. Con los ceros del estado vacío esto no se medía.
   */
  numeros: LARGO ? {
    /* Siete cifras: el mes de alguien que ya factura. Es donde una caja de
       numeral que aguantó cinco cifras deja de aguantar. */
    gasto_ads: 1275000,
    mensajes_recibidos: 18400,
    formularios_completados: 2130,
    agendados: 480,
    shows: 310,
    llamadas_tomadas: 310,
    ventas_cerradas: 110,
    ingresos_cobrados: 13200000,
    horas_trabajadas_semana: 38,
  } : {
    gasto_ads: 127500,
    mensajes_recibidos: 1840,
    formularios_completados: 213,
    agendados: 48,
    shows: 31,
    llamadas_tomadas: 31,
    ventas_cerradas: 11,
    ingresos_cobrados: 1320000,
    horas_trabajadas_semana: 38,
  },
};

console.log(JSON.stringify(estado));
