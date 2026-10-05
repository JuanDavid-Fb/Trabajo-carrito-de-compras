import { useCallback, useRef, useState } from "react";

/**
 * Cola de toasts. `show({ message, action, duration, key, variant })`:
 *  - `key` evita apilar toasts repetidos (el nuevo reemplaza al anterior).
 *  - `action` = { label, onClick } agrega un botón (p. ej. confirmar eliminación).
 *  - `variant`: "warning" (por defecto) o "confirm" (cuando pide una decisión).
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const contador = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(({ message, action = null, duration, key, variant }) => {
    contador.current += 1;
    const id = contador.current;
    const toast = {
      id,
      key: key ?? message,
      message,
      action,
      variant: variant ?? (action ? "confirm" : "warning"),
      duration: duration ?? (action ? 8000 : 4000),
    };
    setToasts((prev) => [...prev.filter((t) => t.key !== toast.key), toast].slice(-4));
    return id;
  }, []);

  return { toasts, show, dismiss };
}
