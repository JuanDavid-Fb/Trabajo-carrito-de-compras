// Ilustración decorativa por producto (solo visual; el catálogo en data/productos.js no cambia).
const VISUALES = {
  1: { emoji: "☕", tono: "#f3e3d3" },
  2: { emoji: "🍯", tono: "#f8e8bd" },
  3: { emoji: "🫓", tono: "#fbf0c4" },
  4: { emoji: "🍫", tono: "#ead7cc" },
  5: { emoji: "🍬", tono: "#fbdde3" },
  6: { emoji: "🥃", tono: "#e3efd9" },
};

const POR_DEFECTO = { emoji: "🛍️", tono: "#e8efe6" };

export const visualDe = (id) => VISUALES[id] ?? POR_DEFECTO;

/** Umbral para avisar "Últimas unidades" en el catálogo. */
export const UMBRAL_POCAS_UNIDADES = 3;
