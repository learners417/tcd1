/**
 * El entorno de navegador mínimo, para poder MONTAR las pantallas fuera del
 * navegador. Sin esto no se puede probar que una pantalla no reviente al
 * abrirse — que es lo único que el compilador no ve.
 *
 * Se usa así:  npx tsx --import ./scripts/entorno-navegador.mjs <archivo>
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://tcd.test',
});

// `navigator` en Node 22 solo tiene getter: se define, no se asigna.
const definir = (nombre, valor) => {
  try {
    Object.defineProperty(globalThis, nombre, {
      value: valor, writable: true, configurable: true,
    });
  } catch { /* si no se puede, el que lo use lo va a notar */ }
};

definir('window', dom.window);
definir('document', dom.window.document);
definir('navigator', dom.window.navigator);
definir('localStorage', dom.window.localStorage);
definir('sessionStorage', dom.window.sessionStorage);
definir('HTMLElement', dom.window.HTMLElement);
definir('Element', dom.window.Element);
definir('Node', dom.window.Node);
definir('CustomEvent', dom.window.CustomEvent);
definir('getComputedStyle', dom.window.getComputedStyle);

// Vite inyecta import.meta.env dentro del navegador; acá hay que darlo.
process.env.VITE_SUPABASE_URL = 'https://prueba.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'clave-de-prueba';
