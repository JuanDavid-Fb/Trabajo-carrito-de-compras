import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { PRODUCTOS } from "./data/productos";
import { formatCOP } from "./utils/format";

const MAX = "Este es el máximo de producto disponible en stock";
const CAFE = "Café de Huila 500 g";
const PANELA = "Panela orgánica 1 kg";
const AREPA = "Arepa de choclo x6";
const CHOCOLATE = "Chocolate de mesa";

const campoCatalogo = (nombre) => screen.getByLabelText(`Cantidad de ${nombre}`);
const botonAgregar = (nombre) => screen.getByRole("button", { name: `Agregar ${nombre} al carrito` });
const campoCarrito = (nombre) => screen.getByLabelText(`Cantidad en el carrito de ${nombre}`);
const escribir = (campo, valor) => fireEvent.change(campo, { target: { value: String(valor) } });

function agregar(nombre, cantidad) {
  escribir(campoCatalogo(nombre), cantidad);
  fireEvent.click(botonAgregar(nombre));
}
const abrirCarrito = () => fireEvent.click(screen.getByRole("button", { name: /abrir carrito/i }));

beforeEach(() => {
  window.localStorage.clear();
  render(<App />);
});

describe("Datos y navbar", () => {
  it("usa exactamente el array de productos del PDF", () => {
    expect(PRODUCTOS).toEqual([
      { id: 1, nombre: "Café de Huila 500 g", precio: 28500, stock: 8 },
      { id: 2, nombre: "Panela orgánica 1 kg", precio: 9800, stock: 3 },
      { id: 3, nombre: "Arepa de choclo x6", precio: 12000, stock: 12 },
      { id: 4, nombre: "Chocolate de mesa", precio: 15400, stock: 1 },
      { id: 5, nombre: "Bocadillo veleño", precio: 6500, stock: 20 },
      { id: 6, nombre: "Aguardiente 750 ml", precio: 62000, stock: 5 },
    ]);
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });

  it("Caso 12: carrito a la derecha del navbar con contador de unidades (oculto en 0)", () => {
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("heading", { name: /TIENDA PALMIRA/i })).toBeInTheDocument();
    expect(header.lastElementChild).toBe(screen.getByRole("button", { name: /abrir carrito/i }));
    expect(screen.queryByTestId("cart-count")).not.toBeInTheDocument();
    agregar(CAFE, 2);
    agregar(PANELA, 3);
    expect(screen.getByTestId("cart-count")).toHaveTextContent("5");
  });

  it("el carrito abre y cierra", () => {
    abrirCarrito();
    expect(screen.getByRole("dialog", { name: /carrito/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cerrar carrito/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Validaciones del campo numérico", () => {
  it("Caso 1: no escribe e, E, +, -, . ni , (catálogo y carrito)", async () => {
    const user = userEvent.setup();
    const campo = campoCatalogo(CAFE);
    for (const tecla of ["e", "E", "+", "-", ".", ","]) {
      await user.type(campo, tecla);
      expect(campo).toHaveValue(1);
    }
    agregar(CAFE, 2);
    abrirCarrito();
    const enCarrito = campoCarrito(CAFE);
    for (const tecla of ["e", "E", "+", "-", ".", ","]) {
      await user.type(enCarrito, tecla);
      expect(enCarrito).toHaveValue(2);
    }
  });

  it("Caso 2: pegar -5, 3e2 o abc no cambia el campo; pegar dígitos sí", () => {
    const campo = campoCatalogo(CAFE);
    for (const texto of ["-5", "3e2", "abc", "1.5", "+4"]) {
      fireEvent.paste(campo, { clipboardData: { getData: () => texto } });
      expect(campo).toHaveValue(1);
    }
    fireEvent.paste(campo, { clipboardData: { getData: () => "4" } });
    expect(campo).toHaveValue(4);
  });

  it("Caso 3: escribir 0 en la tarjeta conserva el valor y muestra toast de mínimo 1", () => {
    const campo = campoCatalogo(CAFE);
    escribir(campo, 3);
    escribir(campo, 0);
    expect(campo).toHaveValue(3);
    expect(screen.getByText(/cantidad mínima es 1/i)).toBeInTheDocument();
  });

  it("negativos y valores no enteros no se aceptan", () => {
    const campo = campoCatalogo(CAFE);
    for (const v of ["-3", "2.5", "3e2"]) {
      escribir(campo, v);
      expect(campo).toHaveValue(1);
    }
  });

  it("la rueda del mouse no modifica el valor (el campo pierde el foco)", () => {
    const campo = campoCatalogo(CAFE);
    campo.focus();
    expect(campo).toHaveFocus();
    fireEvent.wheel(campo, { deltaY: -100 });
    expect(campo).not.toHaveFocus();
    expect(campo).toHaveValue(1);
  });
});

describe("Stock máximo", () => {
  it("Caso 5: escribir 999 con stock 8 corrige a 8 y muestra el toast", () => {
    const campo = campoCatalogo(CAFE);
    escribir(campo, 999);
    expect(campo).toHaveValue(8);
    expect(screen.getByText(MAX)).toBeInTheDocument();
  });

  it("Caso 6: Panela (stock 3): 2 + 2 queda en 3 con toast y botón deshabilitado", () => {
    agregar(PANELA, 2);
    expect(screen.queryByText(MAX)).not.toBeInTheDocument();
    agregar(PANELA, 2);
    expect(screen.getByText(MAX)).toBeInTheDocument();
    expect(screen.getByTestId("cart-count")).toHaveTextContent("3");
    abrirCarrito();
    expect(campoCarrito(PANELA)).toHaveValue(3);
    expect(botonAgregar(PANELA)).toBeDisabled();
  });

  it("Caso 7: en el carrito, + con cantidad = stock no sube y muestra el toast", () => {
    agregar(PANELA, 3);
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: `Aumentar cantidad de ${PANELA}` }));
    expect(campoCarrito(PANELA)).toHaveValue(3);
    expect(screen.getByText(MAX)).toBeInTheDocument();
  });

  it("en el carrito, escribir un número mayor al stock corrige al máximo con toast", () => {
    agregar(PANELA, 1);
    abrirCarrito();
    escribir(campoCarrito(PANELA), 50);
    expect(campoCarrito(PANELA)).toHaveValue(3);
    expect(screen.getByText(MAX)).toBeInTheDocument();
  });

  it("+ y − del carrito cambian la cantidad dentro del rango", () => {
    agregar(CAFE, 2);
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: `Aumentar cantidad de ${CAFE}` }));
    expect(campoCarrito(CAFE)).toHaveValue(3);
    fireEvent.click(screen.getByRole("button", { name: `Disminuir cantidad de ${CAFE}` }));
    expect(campoCarrito(CAFE)).toHaveValue(2);
  });

  it("Caso 11: al agregar todo el stock el botón Agregar queda deshabilitado", () => {
    expect(botonAgregar(CHOCOLATE)).toBeEnabled();
    agregar(CHOCOLATE, 1);
    expect(botonAgregar(CHOCOLATE)).toBeDisabled();
  });
});

describe("Mínimo 1 y eliminación", () => {
  beforeEach(() => {
    agregar(CAFE, 1);
    abrirCarrito();
  });

  it("Caso 4: escribir 0 en el carrito no cambia la cantidad y ofrece eliminar", () => {
    escribir(campoCarrito(CAFE), 0);
    expect(campoCarrito(CAFE)).toHaveValue(1);
    expect(screen.getByText(/cantidad mínima/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sí, eliminar" })).toBeInTheDocument();
  });

  it("Caso 8: − con cantidad 1 muestra el toast y al confirmar elimina y recalcula", () => {
    fireEvent.click(screen.getByRole("button", { name: `Disminuir cantidad de ${CAFE}` }));
    expect(campoCarrito(CAFE)).toHaveValue(1);
    expect(screen.getByText(/cantidad mínima/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));
    expect(screen.queryByLabelText(`Cantidad en el carrito de ${CAFE}`)).not.toBeInTheDocument();
    expect(screen.getByTestId("total-price")).toHaveTextContent("$0");
    expect(screen.getByTestId("total-units")).toHaveTextContent("0");
    expect(screen.queryByTestId("cart-count")).not.toBeInTheDocument();
  });

  it("el botón Quitar elimina directamente y recalcula", () => {
    fireEvent.click(screen.getByRole("button", { name: `Quitar ${CAFE} del carrito` }));
    expect(screen.getByText(/carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByTestId("total-price")).toHaveTextContent("$0");
  });
});

describe("Líneas, subtotales y totales", () => {
  it("Caso 9: agregar dos veces el mismo producto deja una sola línea con cantidades sumadas", () => {
    agregar(CAFE, 1);
    agregar(CAFE, 2);
    abrirCarrito();
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getAllByRole("listitem")).toHaveLength(1);
    expect(campoCarrito(CAFE)).toHaveValue(3);
  });

  it("Caso 10: Café ×2, Panela ×3, Arepa ×1 → $57.000, $29.400, $12.000, total $98.400", () => {
    agregar(CAFE, 2);
    agregar(PANELA, 3);
    agregar(AREPA, 1);
    abrirCarrito();
    expect(screen.getByLabelText(`Subtotal de ${CAFE}`)).toHaveTextContent("$57.000");
    expect(screen.getByLabelText(`Subtotal de ${PANELA}`)).toHaveTextContent("$29.400");
    expect(screen.getByLabelText(`Subtotal de ${AREPA}`)).toHaveTextContent("$12.000");
    expect(screen.getByTestId("total-price")).toHaveTextContent("$98.400");
    expect(screen.getByTestId("total-units")).toHaveTextContent("6");
  });

  it("los totales se actualizan al cambiar cantidades", () => {
    agregar(CAFE, 2);
    abrirCarrito();
    fireEvent.click(screen.getByRole("button", { name: `Aumentar cantidad de ${CAFE}` }));
    expect(screen.getByTestId("total-price")).toHaveTextContent("$85.500");
    expect(screen.getByTestId("total-units")).toHaveTextContent("3");
  });

  it("formatea moneda COP", () => {
    expect(formatCOP(28500)).toBe("$28.500");
    expect(formatCOP(9800)).toBe("$9.800");
    expect(formatCOP(98400)).toBe("$98.400");
    expect(formatCOP(0)).toBe("$0");
  });
});

describe("Toasts", () => {
  afterEach(() => vi.useRealTimers());

  it("se cierran manualmente", () => {
    escribir(campoCatalogo(CAFE), 999);
    fireEvent.click(screen.getByRole("button", { name: /cerrar notificación/i }));
    expect(screen.queryByText(MAX)).not.toBeInTheDocument();
  });

  it("se cierran solos después de unos segundos", () => {
    vi.useFakeTimers();
    escribir(campoCatalogo(CAFE), 999);
    expect(screen.getByText(MAX)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(screen.queryByText(MAX)).not.toBeInTheDocument();
  });

  it("no se apilan toasts repetidos", () => {
    escribir(campoCatalogo(CAFE), 999);
    escribir(campoCatalogo(CAFE), 999);
    expect(screen.getAllByText(MAX)).toHaveLength(1);
  });
});
