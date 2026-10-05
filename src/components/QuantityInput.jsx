import { useState } from "react";

const TECLAS_BLOQUEADAS = ["e", "E", "+", "-", ".", ","];
const SOLO_DIGITOS = /^\d+$/;

/**
 * Campo de cantidad reutilizable (catálogo y carrito).
 * Solo acepta enteros positivos:
 *  - bloquea e, E, +, -, . y , al teclear (onKeyDown + preventDefault)
 *  - el pegado solo se acepta si son únicamente dígitos (onPaste)
 *  - onChange descarta cualquier valor que no sean dígitos
 *  - 0 no se acepta: conserva el valor anterior y llama a onBelowMin
 *  - la rueda del mouse no cambia el valor (onWheel -> blur)
 * El componente padre decide cómo tratar el máximo (stock) en onCommit.
 */
export default function QuantityInput({ value, onCommit, onBelowMin, label, disabled = false, id }) {
  // Texto temporal mientras el usuario edita (permite vaciar el campo para escribir otro número).
  const [borrador, setBorrador] = useState(null);

  const procesar = (texto) => {
    if (!SOLO_DIGITOS.test(texto)) return false;
    const n = parseInt(texto, 10);
    setBorrador(null);
    if (n < 1) {
      onBelowMin?.();
    } else {
      onCommit(n);
    }
    return true;
  };

  const handleKeyDown = (e) => {
    if (TECLAS_BLOQUEADAS.includes(e.key)) e.preventDefault();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const texto = (e.clipboardData?.getData("text") ?? "").trim();
    procesar(texto);
  };

  const handleChange = (e) => {
    const crudo = e.target.value;
    if (crudo === "") {
      setBorrador("");
      return;
    }
    procesar(crudo);
  };

  return (
    <input
      id={id}
      className="qty-input"
      type="number"
      inputMode="numeric"
      min={1}
      step={1}
      value={borrador ?? value}
      disabled={disabled}
      aria-label={label}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={handleChange}
      onBlur={() => setBorrador(null)}
      onWheel={(e) => e.currentTarget.blur()}
    />
  );
}
