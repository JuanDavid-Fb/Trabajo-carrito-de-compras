// Formato de moneda COP: $28.500 (separador de miles con punto, sin decimales).
export function formatCOP(valor) {
  const entero = Math.round(Number(valor) || 0);
  const signo = entero < 0 ? "-" : "";
  const miles = String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${signo}$${miles}`;
}
