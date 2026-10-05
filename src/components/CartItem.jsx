import QuantityInput from "./QuantityInput";
import { formatCOP } from "../utils/format";
import { visualDe } from "../utils/productVisuals";

/** Línea del carrito con botones −/+, campo de cantidad, subtotal y botón quitar. */
export default function CartItem({ linea, onSetQuantity, onAskRemove, onRemove, onMaxStock }) {
  const { producto, cantidad, subtotal } = linea;
  const visual = visualDe(producto.id);

  const cambiar = (n) => {
    const { capped } = onSetQuantity(producto.id, n);
    if (capped) onMaxStock();
  };

  const disminuir = () => {
    if (cantidad <= 1) onAskRemove(producto);
    else cambiar(cantidad - 1);
  };

  const aumentar = () => {
    if (cantidad >= producto.stock) onMaxStock();
    else cambiar(cantidad + 1);
  };

  return (
    <li className="cart-item">
      <span className="cart-item__thumb" style={{ background: visual.tono }} aria-hidden="true">
        {visual.emoji}
      </span>

      <div className="cart-item__main">
        <h3 className="cart-item__name">{producto.nombre}</h3>
        <p className="cart-item__unit">{formatCOP(producto.precio)} c/u</p>
        <div className="cart-item__controls">
          <button
            type="button"
            className="btn btn--round"
            onClick={disminuir}
            aria-label={`Disminuir cantidad de ${producto.nombre}`}
          >
            −
          </button>
          <QuantityInput
            value={cantidad}
            onCommit={cambiar}
            onBelowMin={() => onAskRemove(producto)}
            label={`Cantidad en el carrito de ${producto.nombre}`}
          />
          <button
            type="button"
            className="btn btn--round"
            onClick={aumentar}
            aria-label={`Aumentar cantidad de ${producto.nombre}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item__side">
        <span key={subtotal} className="cart-item__subtotal bump" aria-label={`Subtotal de ${producto.nombre}`}>
          {formatCOP(subtotal)}
        </span>
        <button
          type="button"
          className="btn btn--link"
          onClick={() => onRemove(producto.id)}
          aria-label={`Quitar ${producto.nombre} del carrito`}
        >
          Quitar
        </button>
      </div>
    </li>
  );
}
