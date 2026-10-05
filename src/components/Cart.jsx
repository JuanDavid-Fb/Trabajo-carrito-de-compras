import { useEffect, useRef } from "react";
import CartItem from "./CartItem";
import { CloseIcon } from "./Icons";
import { formatCOP } from "../utils/format";

/** Panel lateral del carrito: se abre desde el navbar y se cierra con ✕, overlay o Escape. */
export default function Cart({
  open,
  onClose,
  lines,
  totalUnits,
  totalPrice,
  onSetQuantity,
  onAskRemove,
  onRemove,
  onMaxStock,
  onAskClear,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Evita que la página de fondo se desplace mientras el panel está abierto.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} data-testid="cart-overlay" />
      <aside className="cart" role="dialog" aria-label="Carrito de compras">
        <div className="cart__header">
          <h2>Tu carrito</h2>
          <button
            type="button"
            ref={closeRef}
            className="btn btn--round"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="cart__body">
          {lines.length === 0 ? (
            <div className="cart__empty">
              <span className="cart__empty-icon" aria-hidden="true">
                🧺
              </span>
              <p>Tu carrito está vacío.</p>
              <p className="cart__empty-hint">Agrega productos desde el catálogo.</p>
            </div>
          ) : (
            <ul className="cart__list">
              {lines.map((linea) => (
                <CartItem
                  key={linea.producto.id}
                  linea={linea}
                  onSetQuantity={onSetQuantity}
                  onAskRemove={onAskRemove}
                  onRemove={onRemove}
                  onMaxStock={onMaxStock}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="cart__footer">
          <dl className="cart__totals">
            <div>
              <dt>Total de unidades</dt>
              <dd data-testid="total-units">{totalUnits}</dd>
            </div>
            <div className="cart__total">
              <dt>Total de la compra</dt>
              <dd data-testid="total-price">{formatCOP(totalPrice)}</dd>
            </div>
          </dl>
          <div className="cart__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Seguir comprando
            </button>
            {lines.length > 0 && (
              <button type="button" className="btn btn--link" onClick={onAskClear}>
                Vaciar carrito
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
