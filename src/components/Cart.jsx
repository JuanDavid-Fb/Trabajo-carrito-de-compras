import { useEffect, useRef, useState } from "react";
import CartItem from "./CartItem";
import { CloseIcon } from "./Icons";
import { formatCOP } from "../utils/format";

// Debe coincidir con la duración de las animaciones de salida en styles.css.
const CIERRE_MS = 200;

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
  const estabaAbierto = useRef(open);
  // Solo visual: mantiene el panel montado unos ms para animar la salida (oculto a lectores de pantalla).
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    let t;
    if (estabaAbierto.current && !open) {
      setSaliendo(true);
      t = setTimeout(() => setSaliendo(false), CIERRE_MS);
    } else if (open) {
      setSaliendo(false);
    }
    estabaAbierto.current = open;
    return () => clearTimeout(t);
  }, [open]);

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

  if (!open && !saliendo) return null;

  const estadoSalida = open ? "" : " is-closing";
  const ocultoAyudas = open ? undefined : true;

  return (
    <>
      <div
        className={`overlay${estadoSalida}`}
        onClick={onClose}
        data-testid="cart-overlay"
        aria-hidden={ocultoAyudas}
      />
      <aside className={`cart${estadoSalida}`} role="dialog" aria-label="Carrito de compras" aria-hidden={ocultoAyudas}>
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
              <dd key={totalUnits} className="bump" data-testid="total-units">
                {totalUnits}
              </dd>
            </div>
            <div className="cart__total">
              <dt>Total de la compra</dt>
              <dd key={totalPrice} className="bump" data-testid="total-price">
                {formatCOP(totalPrice)}
              </dd>
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
