/**
 * EL ENEAGRAMA, ADENTRO DE LA APP.
 *
 * Es la jornada del día 3: cómo te frenas y cómo te empujas. No existía nada
 * parecido en la app y un test ajeno no se puede copiar, así que estas
 * cuarenta y cinco preguntas están escritas acá, con ejemplos del día a día de
 * un consultorio.
 *
 * El resultado no es una etiqueta: es el material del día 4, cuando escribe su
 * protocolo, y del sistema 1 completo. Por eso cada tipo dice también cómo se
 * le nota con el dinero.
 *
 * Cuando los dos primeros tipos quedan a menos de tres puntos, el test pide
 * tres elecciones más para desempatar.
 */

export interface TipoEneagrama {
  id: number;
  nombre: string;
  entero: string;
  cansado: string;
  conElDinero: string;
}

export const TIPOS: TipoEneagrama[] = [
  { id: 1, nombre: 'El que hace las cosas bien',
    entero: 'Ordenado, confiable, con criterio propio. Lo que entrega está bien hecho.',
    cansado: 'Se pone rígido, corrige de más y se enoja en silencio.',
    conElDinero: 'Le cuesta cobrar lo que vale porque siempre siente que podría estar mejor.' },
  { id: 2, nombre: 'El que está para los demás',
    entero: 'Cálido, atento, la persona a la que todos acuden.',
    cansado: 'Se olvida de sí mismo y después le pesa que nadie le pregunte.',
    conElDinero: 'Regala sesiones, estira horarios y le cuesta cobrar la cancelación.' },
  { id: 3, nombre: 'El que llega a los resultados',
    entero: 'Eficiente, rápido, sabe mostrar lo que hace.',
    cansado: 'Vive para el logro siguiente y se olvida de por qué empezó.',
    conElDinero: 'Sube el precio sin problema y después trabaja el doble para sostenerlo.' },
  { id: 4, nombre: 'El que busca lo verdadero',
    entero: 'Sensible, con mirada propia, hace las cosas a su manera.',
    cansado: 'Se compara, siente que le falta algo y se aleja.',
    conElDinero: 'Le cuesta vender algo que no siente completamente suyo.' },
  { id: 5, nombre: 'El que primero entiende',
    entero: 'Estudioso, claro, no habla de lo que no sabe.',
    cansado: 'Se encierra a prepararse y no sale a mostrarse.',
    conElDinero: 'Sigue formándose en vez de salir a vender lo que ya sabe.' },
  { id: 6, nombre: 'El que se prepara para todo',
    entero: 'Leal, previsor, sostiene cuando las cosas se ponen difíciles.',
    cansado: 'Duda, consulta a todos y posterga la decisión.',
    conElDinero: 'Baja el precio por miedo a quedarse sin nadie.' },
  { id: 7, nombre: 'El que abre puertas',
    entero: 'Entusiasta, creativo, arranca proyectos que a otros no se les ocurren.',
    cansado: 'Empieza muchas cosas y termina pocas.',
    conElDinero: 'Cambia de oferta antes de darle tiempo a funcionar.' },
  { id: 8, nombre: 'El que toma el mando',
    entero: 'Directo, protector, no le tiembla decidir.',
    cansado: 'Se impone, discute de más y no muestra cuándo le duele.',
    conElDinero: 'Cobra sin culpa y a veces se lleva puesto a su propio equipo.' },
  { id: 9, nombre: 'El que sostiene la calma',
    entero: 'Tranquilo, escucha bien, hace sentir cómodo a cualquiera.',
    cansado: 'Evita el conflicto y deja pasar lo que le molesta.',
    conElDinero: 'Posterga la conversación de subir el precio, una y otra vez.' },
];

export interface ItemEneagrama {
  tipo: number;
  texto: string;
}

/** Las cuarenta y cinco: cinco por tipo, mezcladas al mostrarse. */
export const ITEMS: ItemEneagrama[] = [
  { tipo: 1, texto: 'Reviso mi trabajo varias veces antes de darlo por terminado' },
  { tipo: 1, texto: 'Me molesta cuando algo queda a medio hacer' },
  { tipo: 1, texto: 'Tengo una idea clara de cómo deberían hacerse las cosas' },
  { tipo: 1, texto: 'Me cuesta delegar porque después lo tengo que rehacer' },
  { tipo: 1, texto: 'Me critico por dentro más de lo que se nota afuera' },
  { tipo: 2, texto: 'Me doy cuenta de lo que necesita el otro antes de que lo pida' },
  { tipo: 2, texto: 'Me cuesta decir que no cuando alguien me necesita' },
  { tipo: 2, texto: 'Doy más de lo que me devuelven y lo dejo pasar' },
  { tipo: 2, texto: 'Me importa caer bien a las personas con las que trabajo' },
  { tipo: 2, texto: 'Pospongo lo mío para resolver lo de otro' },
  { tipo: 3, texto: 'Me mido por lo que logro, no por lo que siento' },
  { tipo: 3, texto: 'Ajusto cómo me muestro según con quién estoy' },
  { tipo: 3, texto: 'Me cuesta parar cuando hay algo por terminar' },
  { tipo: 3, texto: 'Comparo mis resultados con los de otros de mi rubro' },
  { tipo: 3, texto: 'Prefiero avanzar rápido antes que hacerlo perfecto' },
  { tipo: 4, texto: 'Siento que mi forma de trabajar es distinta a la de mis colegas' },
  { tipo: 4, texto: 'Me afecta más que a otros lo que pasa en una sesión' },
  { tipo: 4, texto: 'Me cuesta hacer las cosas de una manera que no sea la mía' },
  { tipo: 4, texto: 'Hay días en que siento que me falta algo que otros sí tienen' },
  { tipo: 4, texto: 'Prefiero profundidad antes que velocidad' },
  { tipo: 5, texto: 'Antes de largar algo necesito entenderlo a fondo' },
  { tipo: 5, texto: 'Me canso cuando tengo demasiadas personas alrededor' },
  { tipo: 5, texto: 'Prefiero escribir o leer antes que exponerme' },
  { tipo: 5, texto: 'Me guardo lo que pienso hasta estar seguro' },
  { tipo: 5, texto: 'Necesito tiempo a solas para recuperarme' },
  { tipo: 6, texto: 'Pienso de antemano qué puede salir mal' },
  { tipo: 6, texto: 'Consulto con alguien de confianza antes de decidir' },
  { tipo: 6, texto: 'Me cuesta confiar en propuestas que suenan demasiado buenas' },
  { tipo: 6, texto: 'Cumplo con lo que prometo aunque me cueste' },
  { tipo: 6, texto: 'Cuando decido algo grande, vuelvo a revisarlo varias veces' },
  { tipo: 7, texto: 'Se me ocurren ideas nuevas todo el tiempo' },
  { tipo: 7, texto: 'Me aburro cuando algo se vuelve repetitivo' },
  { tipo: 7, texto: 'Prefiero tener varios proyectos a la vez' },
  { tipo: 7, texto: 'Esquivo las conversaciones pesadas' },
  { tipo: 7, texto: 'Dejo cosas por la mitad cuando aparece algo mejor' },
  { tipo: 8, texto: 'Digo lo que pienso aunque incomode' },
  { tipo: 8, texto: 'Me cuesta que otro decida por mí' },
  { tipo: 8, texto: 'Protejo a los míos aunque me cueste' },
  { tipo: 8, texto: 'Me impaciento con las vueltas y los rodeos' },
  { tipo: 8, texto: 'Me cuesta mostrar cuándo algo me afecta' },
  { tipo: 9, texto: 'Evito los conflictos incluso cuando tengo razón' },
  { tipo: 9, texto: 'Me acomodo a lo que quiere el otro para no discutir' },
  { tipo: 9, texto: 'Dejo para después lo que me incomoda' },
  { tipo: 9, texto: 'Me cuesta darme cuenta de qué quiero yo' },
  { tipo: 9, texto: 'Puedo estar mucho tiempo sin que nada cambie' },
];

/** Las cuatro respuestas. Sin punto medio: el medio no dice nada. */
export const RESPUESTAS = [
  { valor: 0, texto: 'Casi nunca' },
  { valor: 1, texto: 'A veces' },
  { valor: 2, texto: 'Seguido' },
  { valor: 3, texto: 'Casi siempre' },
];

export interface Resultado {
  tipo: number;
  puntajes: Record<number, number>;
  /** El segundo, cuando queda cerca: ahí el test pide desempate. */
  empateCon: number | null;
}

/** Suma por tipo y devuelve el más alto, avisando si hay empate. */
export function resultadoDe(respuestas: Record<number, number>): Resultado {
  const puntajes: Record<number, number> = {};
  for (const t of TIPOS) puntajes[t.id] = 0;
  ITEMS.forEach((item, i) => {
    puntajes[item.tipo] += respuestas[i] ?? 0;
  });
  const orden = [...TIPOS].sort((a, b) => puntajes[b.id] - puntajes[a.id]);
  const primero = orden[0].id;
  const segundo = orden[1].id;
  return {
    tipo: primero,
    puntajes,
    empateCon: puntajes[primero] - puntajes[segundo] < 3 ? segundo : null,
  };
}

/** Tres elecciones forzadas entre los dos tipos que quedaron cerca. */
export function desempate(a: number, b: number): Array<{ a: string; b: string }> {
  const deA = ITEMS.filter((x) => x.tipo === a).map((x) => x.texto);
  const deB = ITEMS.filter((x) => x.tipo === b).map((x) => x.texto);
  return [0, 2, 4].map((i) => ({ a: deA[i], b: deB[i] }));
}

export function tipo(id: number): TipoEneagrama | undefined {
  return TIPOS.find((t) => t.id === id);
}
