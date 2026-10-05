import { useState } from "react";
import QuantityInput from "./QuantityInput";
import { formatCOP } from "../utils/format";
import { UMBRAL_POCAS_UNIDADES, visualDe } from "../utils/productVisuals";

/** Tarjeta del catálogo: nombre, precio, stock, cantidad (inicia en 1) y botón Agregar. */
export default function ProductCard({ producto, enCarrito, onAdd, onMaxStock, onMinQuantity }) {
  const [cantidad, setCantidad] = useState(1);
  const disponible = producto.stock - enCarrito;
  const sinDisponible = disponible <= 0;
  const pocasUnidades = !sinDisponible && disponible <= UMBRAL_POCAS_UNIDADES;
  const titleId = `producto-${producto.id}-titulo`;
  const visual = visualDe(producto.id);

  const handleCommit = (n) => {
    if (n > producto.stock) {
      setCantidad(producto.stock);
      onMaxStock();
    } else {
      setCantidad(n);
    }
  };

  const handleAdd = () => {
    onAdd(producto, cantidad);
    setCantidad(1);
  };

  return (
    <article className={`card${sinDisponible ? " card--soldout" : ""}`} aria-labelledby={titleId}>
      <div className="card__media" style={{ background: visual.tono }}>
        <span className="card__emoji" aria-hidden="true">
          {visual.emoji}
        </span>
        {pocasUnidades && <span className="chip chip--warn">Últimas unidades</span>}
        {sinDisponible && <span className="chip chip--out">Agotado</span>}
      </div>

      <div className="card__body">
        <h2 className="card__title" id={titleId}>
          {producto.nombre}
        </h2>
        <p className="card__price">{formatCOP(producto.precio)}</p>
        <p className="card__stock">
          Stock disponible: <strong>{producto.stock}</strong>
          {enCarrito > 0 && <span className="card__incart"> · {enCarrito} en el carrito</span>}
        </p>
      </div>

      <div className="card__actions">
        <QuantityInput
          value={cantidad}
          onCommit={handleCommit}
          onBelowMin={onMinQuantity}
          label={`Cantidad de ${producto.nombre}`}
          disabled={sinDisponible}
        />
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleAdd}
          disabled={sinDisponible}
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          Agregar
        </button>
      </div>
      {sinDisponible && <p className="card__soldout">Sin stock disponible</p>}
    </article>
  );
}
