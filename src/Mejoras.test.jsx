import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, fireEvent, act, cleanup } from "@testing-library/react";
import App from "./App";

const MAX = "Este es el máximo de producto disponible en stock";
const CAFE = "Café de Huila 500 g";
const CHOCOLATE = "Chocolate de mesa";
const AGUARDIENTE = "Aguardiente 750 ml";

const escribir = (campo, valor) => fireEvent.change(campo, { target: { value: String(valor) } });
const tarjeta = (nombre) => within(screen.getByRole("article", { name: nombre }));
function agregar(nombre, cantidad) {
  escribir(screen.getByLabelText(`Cantidad de ${nombre}`), cantidad);
  fireEvent.click(screen.getByRole("button", { name: `Agregar ${nombre} al carrito` }));
}
const abrirCarrito = () => fireEvent.click(screen.getByRole("button", { name: /abrir carrito/i }));

beforeEach(() => {
  window.localStorage.clear();
  render(<App />);
});

describe("Mejoras (no afectan los requisitos del reto)", () => {
  afterEach(() => vi.useRealTimers());

  it("avisa 'Últimas unidades' solo cuando quedan pocas", () => {
    expect(tarjeta(CHOCOLATE).getByText("Últimas unidades")).toBeInTheDocument();
    expect(tarjeta(AGUARDIENTE).queryByText("Últimas unidades")).not.toBeInTheDocument();
    expect(tarjeta(CAFE).queryByText("Últimas unidades")).not.toBeInTheDocument();
  });

  it("muestra 'Agotado' y 'Sin stock disponible' cuando no queda stock", () => {
    agregar(CHOCOLATE, 1);
    expect(tarjeta(CHOCOLATE).getByText("Agotado")).toBeInTheDocument();
    expect(tarjeta(CHOCOLATE).getByText("Sin stock disponible")).toBeInTheDocument();
  });

  it("vaciar carrito pide confirmación con toast y luego vacía todo", () => {
    agregar(CAFE, 2);
    agregar(AGUARDIENTE, 1);
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));
    expect(screen.getByText("¿Desea vaciar todo el carrito?")).toBeInTheDocument();
    expect(screen.getByTestId("total-units")).toHaveTextContent("3");
    fireEvent.click(screen.getByRole("button", { name: "Sí, vaciar" }));
    expect(screen.getByText(/carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByTestId("total-price")).toHaveTextContent("$0");
    expect(screen.queryByTestId("cart-count")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Vaciar carrito" })).not.toBeInTheDocument();
  });

  it("'Seguir comprando' cierra el carrito", () => {
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: "Seguir comprando" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Escape y el fondo oscuro cierran el carrito y se libera el scroll", () => {
    abrirCarrito();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe("hidden");
    abrirCarrito();
    fireEvent.click(screen.getByTestId("cart-overlay"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("el carrito persiste al recargar y respeta el stock", () => {
    agregar(CAFE, 2);
    cleanup();
    render(<App />);
    expect(screen.getByTestId("cart-count")).toHaveTextContent("2");

    cleanup();
    window.localStorage.setItem("tienda-palmira-carrito", JSON.stringify([{ id: 2, cantidad: 99 }, { id: 99, cantidad: 1 }]));
    render(<App />);
    expect(screen.getByTestId("cart-count")).toHaveTextContent("3"); // Panela limitada a su stock; id inexistente ignorado
  });

  it("un localStorage dañado no rompe la app", () => {
    cleanup();
    window.localStorage.setItem("tienda-palmira-carrito", "{no es json");
    render(<App />);
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.queryByTestId("cart-count")).not.toBeInTheDocument();
  });

  it("el toast se pausa con el mouse encima y sigue al salir", () => {
    vi.useFakeTimers();
    escribir(screen.getByLabelText(`Cantidad de ${CAFE}`), 999);
    const toast = screen.getByText(MAX).closest(".toast");
    fireEvent.mouseEnter(toast);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText(MAX)).toBeInTheDocument();
    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(screen.queryByText(MAX)).not.toBeInTheDocument();
  });

  it("el toast de confirmación dura más para dar tiempo a decidir", () => {
    vi.useFakeTimers();
    agregar(CAFE, 1);
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: `Disminuir cantidad de ${CAFE}` }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("button", { name: "Sí, eliminar" })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByRole("button", { name: "Sí, eliminar" })).not.toBeInTheDocument();
  });

  it("la salida animada del carrito queda oculta a lectores de pantalla y se desmonta sola", () => {
    vi.useFakeTimers();
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: /cerrar carrito/i }));
    // Durante la animación el panel sigue en el DOM pero no es accesible ni interactivo.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("cart-overlay")).toHaveAttribute("aria-hidden", "true");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId("cart-overlay")).not.toBeInTheDocument();
  });

  it("reabrir el carrito durante la animación de salida muestra un solo panel", () => {
    abrirCarrito();
    fireEvent.keyDown(document, { key: "Escape" });
    abrirCarrito();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getAllByTestId("cart-overlay")).toHaveLength(1);
  });

  it("la barra de stock de la tarjeta refleja las unidades disponibles", () => {
    const medidor = () => tarjeta(CAFE).getByText("Stock disponible:").closest("div").querySelector(".card__meter span");
    expect(medidor()).toHaveStyle({ width: "100%" });
    agregar(CAFE, 2);
    expect(medidor()).toHaveStyle({ width: "75%" });
  });

  it("incluye enlace para saltar al catálogo y landmarks principales", () => {
    expect(screen.getByRole("link", { name: "Saltar al catálogo" })).toHaveAttribute("href", "#catalogo");
    expect(screen.getByRole("main")).toHaveAttribute("id", "catalogo");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("el botón del carrito anuncia las unidades (singular y plural)", () => {
    expect(screen.getByRole("button", { name: "Abrir carrito, 0 unidades" })).toBeInTheDocument();
    agregar(CAFE, 1);
    expect(screen.getByRole("button", { name: "Abrir carrito, 1 unidad" })).toBeInTheDocument();
    agregar(CAFE, 1);
    expect(screen.getByRole("button", { name: "Abrir carrito, 2 unidades" })).toBeInTheDocument();
  });
});
