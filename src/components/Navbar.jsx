import { forwardRef } from "react";
import { CartIcon } from "./Icons";

/** Barra fija superior: nombre de la tienda a la izquierda, carrito a la derecha. */
const Navbar = forwardRef(function Navbar({ totalUnits, onOpenCart }, cartButtonRef) {
  return (
    <header className="navbar">
      <h1 className="navbar__brand">
        <span className="navbar__logo" aria-hidden="true">
          🌿
        </span>
        TIENDA PALMIRA
      </h1>
      <button
        type="button"
        ref={cartButtonRef}
        className="navbar__cart"
        onClick={onOpenCart}
        aria-label={`Abrir carrito, ${totalUnits} ${totalUnits === 1 ? "unidad" : "unidades"}`}
      >
        <CartIcon />
        {totalUnits > 0 && (
          // `key` reinicia la animación cada vez que cambia el total.
          <span key={totalUnits} className="navbar__badge" data-testid="cart-count" aria-hidden="true">
            {totalUnits}
          </span>
        )}
      </button>
    </header>
  );
});

export default Navbar;
