import { useEffect, useMemo, useState } from "react";
import { PRODUCTOS } from "../data/productos";

const STORAGE_KEY = "tienda-palmira-carrito";

const buscarProducto = (id) => PRODUCTOS.find((p) => p.id === id);

// Lee el carrito guardado y lo valida contra el catálogo y el stock.
function cargarCarrito() {
  try {
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];
    return datos
      .map(({ id, cantidad }) => {
        const producto = buscarProducto(id);
        if (!producto || !Number.isInteger(cantidad) || cantidad < 1) return null;
        return { id, cantidad: Math.min(cantidad, producto.stock) };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Estado del carrito. Cada producto aparece como máximo una vez ({ id, cantidad })
 * y la cantidad nunca supera el stock del catálogo.
 * `addItem` y `setQuantity` devuelven { capped } para que la UI avise con un toast.
 */
export function useCart() {
  const [items, setItems] = useState(cargarCarrito);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }, [items]);

  const cantidadDe = (id) => items.find((i) => i.id === id)?.cantidad ?? 0;

  const addItem = (id, cantidad) => {
    const producto = buscarProducto(id);
    if (!producto || !Number.isInteger(cantidad) || cantidad < 1) return { capped: false };
    const deseada = cantidadDe(id) + cantidad;
    const final = Math.min(deseada, producto.stock);
    setItems((prev) =>
      prev.some((i) => i.id === id)
        ? prev.map((i) => (i.id === id ? { ...i, cantidad: final } : i))
        : [...prev, { id, cantidad: final }]
    );
    return { capped: deseada > producto.stock };
  };

  const setQuantity = (id, cantidad) => {
    const producto = buscarProducto(id);
    if (!producto || !Number.isInteger(cantidad) || cantidad < 1) return { capped: false };
    const final = Math.min(cantidad, producto.stock);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: final } : i)));
    return { capped: cantidad > producto.stock };
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => setItems([]);

  const lines = useMemo(
    () =>
      items.map((i) => {
        const producto = buscarProducto(i.id);
        return { producto, cantidad: i.cantidad, subtotal: producto.precio * i.cantidad };
      }),
    [items]
  );

  const totalUnits = useMemo(() => lines.reduce((s, l) => s + l.cantidad, 0), [lines]);
  const totalPrice = useMemo(() => lines.reduce((s, l) => s + l.subtotal, 0), [lines]);

  return { lines, totalUnits, totalPrice, cantidadDe, addItem, setQuantity, removeItem, clearCart };
}
