/**
 * domTranslationGuard.ts
 *
 * Protege contra el crash recurrente:
 *   "NotFoundError: Failed to execute 'removeChild' on 'Node'"
 *   "NotFoundError: Failed to execute 'insertBefore' on 'Node'"
 *
 * Ocurre cuando un traductor del navegador (Google Translate en Chrome Mobile,
 * extensiones de Edge/Firefox, etc.) reescribe los nodos de texto que React
 * controla, envolviéndolos en <font>. Al cambiar de vista React intenta remover
 * un nodo que el traductor ya movió/reemplazó y el DOM lanza una excepción que
 * tumba toda la app (la captura el ErrorBoundary y se ve la pantalla de error).
 *
 * El `<meta name="google" content="notranslate">` + `lang="es" translate="no"`
 * en index.html cubren a Google Translate, pero no todos los traductores los
 * respetan. Este parche es la red de seguridad: si el nodo a remover/insertar ya
 * no pertenece al padre esperado, se hace no-op en vez de lanzar.
 *
 * Mitigación recomendada por la comunidad mientras React no trae fix nativo:
 * https://github.com/facebook/react/issues/11538
 */
export function installDomTranslationGuard(): void {
  if (typeof Node === 'undefined' || !Node.prototype) return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      // El nodo ya fue movido por un traductor del navegador → evitamos el throw.
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // El nodo de referencia fue movido por un traductor → insertamos al final.
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
