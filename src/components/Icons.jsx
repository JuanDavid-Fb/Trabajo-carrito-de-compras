// Íconos SVG decorativos (aria-hidden): el nombre accesible lo da el botón que los contiene.
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export function CartIcon({ size = 26 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
      <circle cx="10" cy="20.2" r="1" />
      <circle cx="17" cy="20.2" r="1" />
    </svg>
  );
}

export function CloseIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
