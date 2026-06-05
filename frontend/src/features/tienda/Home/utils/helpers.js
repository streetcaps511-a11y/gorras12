import { PLACEHOLDER_IMG } from './constants';

export const clampRating = (r) => {
  const n = Number(r);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
};

export const getRatingFromProduct = (p) =>
  clampRating(p?.rating) ??
  clampRating(p?.calificacion) ??
  clampRating(p?.stars) ??
  clampRating(p?.score) ??
  null;

export const normalizeSizes = (product) => {
  if (Array.isArray(product?.tallasStock) && product.tallasStock.length > 0) {
    return product.tallasStock.map(t => t.talla).filter(Boolean);
  }
  const t = product?.tallas;
  if (!t) return [];
  if (Array.isArray(t))
    return t.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  if (typeof t === "string")
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  if (typeof t === "object") return Object.keys(t);
  return [];
};

export const safeImg = (product) => {
  const first =
    product?.imagen?.trim?.() ||
    product?.imagenes?.[0]?.trim?.() ||
    PLACEHOLDER_IMG;
  return first;
};

export const normalizeText = (str) =>
  (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const formatPrice = (price) => 
  Math.round(Number(price) || 0).toLocaleString();