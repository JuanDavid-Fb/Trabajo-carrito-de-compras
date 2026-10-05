import { useCallback, useRef, useState } from "react";
import { PRODUCTOS } from "./data/productos";
import { useCart } from "./hooks/useCart";
import { useToasts } from "./hooks/useToasts";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import ToastContainer from "./components/ToastContainer";
import { MSG_STOCK_MAXIMO, MSG_MINIMO_TARJETA, MSG_MINIMO_ELIMINAR, MSG_VACIAR } from "./utils/messages";

export default function App() {
  const cart = useCart();
  const { toasts, show, dismiss } = useToasts();
  const [cartOpen, setCartOpen] = useState(false);
  const cartButtonRef = useRef(null);

  const avisarMaximo = () => show({ message: MSG_STOCK_MAXIMO, key: "max" });
  const avisarMinimoTarjeta = () => show({ message: MSG_MINIMO_TARJETA, key: "min-card" });

  // Cantidad mínima dentro del carrito: toast con botón para confirmar la eliminación.
  const preguntarEliminar = (producto) =>
    show({
      message: MSG_MINIMO_ELIMINAR,
      key: `min-${producto.id}`,
      action: { label: "Sí, eliminar", onClick: () => cart.removeItem(producto.id) },
    });

  const preguntarVaciar = () =>
    show({
      message: MSG_VACIAR,
      key: "vaciar",
      action: { label: "Sí, vaciar", onClick: cart.clearCart },
    });

  const agregar = (producto, cantidad) => {
    const { capped } = cart.addItem(producto.id, cantidad);
    if (capped) avisarMaximo();
  };

  const cerrarCarrito = useCallback(() => {
    setCartOpen(false);
    cartButtonRef.current?.focus();
  }, []);

  return (
    <>
      <a className="skip-link" href="#catalogo">
        Saltar al catálogo
      </a>

      <Navbar ref={cartButtonRef} totalUnits={cart.totalUnits} onOpenCart={() => setCartOpen(true)} />

      <main id="catalogo" className="catalog" tabIndex={-1}>
        <section className="hero">
          <p className="hero__eyebrow">Sabores de Palmira y del Valle</p>
          <p className="hero__lead">
            Elige tus productos, revisa el stock disponible y arma tu pedido sin sorpresas.
          </p>
        </section>

        <h2 className="catalog__title">Productos típicos de la región</h2>
        <div className="catalog__grid">
          {PRODUCTOS.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              enCarrito={cart.cantidadDe(producto.id)}
              onAdd={agregar}
              onMaxStock={avisarMaximo}
              onMinQuantity={avisarMinimoTarjeta}
            />
          ))}
        </div>
      </main>

      <footer className="footer">
        TIENDA PALMIRA · Reto práctico React · SENA – CBI Palmira
      </footer>

      <Cart
        open={cartOpen}
        onClose={cerrarCarrito}
        lines={cart.lines}
        totalUnits={cart.totalUnits}
        totalPrice={cart.totalPrice}
        onSetQuantity={cart.setQuantity}
        onAskRemove={preguntarEliminar}
        onRemove={cart.removeItem}
        onMaxStock={avisarMaximo}
        onAskClear={preguntarVaciar}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
