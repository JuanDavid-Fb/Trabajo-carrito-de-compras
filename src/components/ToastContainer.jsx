import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "./Icons";

const ICONOS = { warning: "!", confirm: "?" };

function Toast({ toast, onDismiss }) {
  const timer = useRef(null);
  const inicio = useRef(0);
  const restante = useRef(toast.duration);
  const [pausado, setPausado] = useState(false);

  const reanudar = () => {
    if (timer.current) return;
    inicio.current = Date.now();
    timer.current = setTimeout(() => onDismiss(toast.id), Math.max(restante.current, 1500));
    setPausado(false);
  };

  const pausar = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    restante.current -= Date.now() - inicio.current;
    setPausado(true);
  };

  // Se cierra solo después de unos segundos (se pausa mientras el usuario lo lee).
  useEffect(() => {
    reanudar();
    return () => {
      clearTimeout(timer.current);
      timer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  const confirmar = () => {
    toast.action.onClick();
    onDismiss(toast.id);
  };

  return (
    <div
      className={`toast toast--${toast.variant}`}
      role="status"
      onMouseEnter={pausar}
      onMouseLeave={reanudar}
      onFocus={pausar}
      onBlur={reanudar}
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONOS[toast.variant] ?? "!"}
      </span>
      <div className="toast__body">
        <p className="toast__msg">{toast.message}</p>
        {toast.action && (
          <button type="button" className="btn btn--toast" onClick={confirmar}>
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
      >
        <CloseIcon size={16} />
      </button>
      <span
        className="toast__bar"
        aria-hidden="true"
        style={{
          animationDuration: `${toast.duration}ms`,
          animationPlayState: pausado ? "paused" : "running",
        }}
      />
    </div>
  );
}

/** Región anunciable por lectores de pantalla donde aparecen los toasts. */
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
