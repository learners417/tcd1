/**
 * VISOR · LOS ENCARGOS — para mirarlos, que es lo único confiable.
 *
 * Un encargo se juzga leyéndolo: si entra en la pantalla, si los datos del
 * cliente quedaron donde tienen que quedar, si el aviso de lo que falta se
 * entiende. Nada de eso se ve en una prueba de texto.
 *
 * Monta cada uno con un cliente a medio sellar, que es el caso real: ya tiene
 * su nicho y su promesa, todavía no su oferta ni su precio. Así se ve el
 * encargo lleno Y el hueco explícito, juntos.
 */
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import ElEncargo from '../../src/components/sesion/ElEncargo';
import { ENCARGOS } from '../../src/lib/elEncargo';

localStorage.setItem('tcd_profile', JSON.stringify({
  nombre: 'Marina',
  especialidad: 'nutricionista',
  pais: 'Ecuador',
  adn_nicho: 'mujeres con hipotiroidismo',
  adn_avatar: 'mujeres de 35 a 50 que ya probaron de todo',
  adn_promesa: 'comer sin contar calorías y sostenerlo en el tiempo',
  adn_metodo: 'los cuatro tiempos del plato',
}));

createRoot(document.getElementById('root')!).render(
  <div style={{ maxWidth: 390, margin: '0 auto', padding: '16px' }}>
    {Object.keys(ENCARGOS).map((codigo) => (
      <div key={codigo} style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 15, opacity: 0.6, marginBottom: 8 }}>{codigo}</p>
        <ElEncargo codigo={codigo} />
      </div>
    ))}
  </div>,
);
