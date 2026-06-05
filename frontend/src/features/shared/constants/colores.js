/* === CONSTANTES DE COLORES ===
Centraliza todos los mapeos y utilidades de colores. */

// Mapeo de nombres de color a valores HEX
export const COLOR_HEX_MAP = {
  "azul marino": "#000080",
  negro: "#000000",
  black: "#000000",
  blanco: "#ffffff",
  white: "#ffffff",
  rojo: "#ff0000",
  red: "#ff0000",
  azul: "#0000ff",
  blue: "#0000ff",
  verde: "#008000",
  green: "#008000",
  amarillo: "#ffff00",
  yellow: "#ffff00",
  morado: "#800080",
  purple: "#800080",
  gris: "#808080",
  gray: "#808080",
  grey: "#808080",
  naranja: "#ffa500",
  orange: "#ffa500",
  rosa: "#ffc0cb",
  pink: "#ffc0cb",
  cafe: "#6f4e37",
  café: "#6f4e37",
  brown: "#6f4e37",
  marrón: "#6f4e37",
  beige: "#f5f5dc",
  crema: "#fffdd0",
  celeste: "#87ceeb",
  lila: "#e6e6fa",
  hueso: "#f5f5dc",
  dorado: "#d4ac0d",
  gold: "#d4ac0d",
  plata: "#c0c0c0",
  silver: "#c0c0c0",
};

// ✅ NUEVO: Exportamos la lista de nombres de colores (Las llaves del mapa)
// Esto es lo que tu 'ProductoForm' necesita para llenar el select/dropdown.
export const COMMON_COLORS = Object.entries(COLOR_HEX_MAP).map(([name, hex]) => ({ name, hex }));

// Lista de colores claros (para decidir si usar texto oscuro o claro)
export const LIGHT_COLORS = [
  "white", "blanco", "yellow", "amarillo", "beige", "crema", "cream",
  "ivory", "marfil", "oro", "gold", "dorado", "lime", "cyan", "aqua",
  "silver", "plata", "celeste", "lila", "hueso", "rosa", "pink",
];

// Función utilitaria: ¿Es un color claro?
export const isLightColor = (colorName) => {
  if (!colorName) return false;
  return LIGHT_COLORS.includes(colorName.toLowerCase().trim());
};

// Función utilitaria: Obtener HEX desde nombre de color
export const getColorHex = (colorName) => {
  if (!colorName) return "#cccccc";
  return COLOR_HEX_MAP[colorName.toLowerCase().trim()] || colorName;
};

// Función utilitaria: Obtener color de borde para el swatch
export const getSwatchBorderColor = (hex) => {
  if (hex === "#000000") return "#ffffff";
  return isLightColor(hex) ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)";
};