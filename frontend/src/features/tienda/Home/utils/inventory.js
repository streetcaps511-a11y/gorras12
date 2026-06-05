import { normalizeSizes } from './helpers';

export const buildInitialInventoryFromProducts = (products) => {
  const inv = {};
  for (const p of products) {
    const sizes = normalizeSizes(p);
    const pid = String(p.id);
    
    // Si no tiene tallas pero sí tiene stock, registrarlo con clave _total
    if (!sizes.length) {
      const stockVal = Number(p.stock ?? 0);
      if (stockVal > 0) {
        inv[pid] = { _total: stockVal };
      }
      continue;
    }
    inv[pid] = {};

    if (p.tallasStock) {
      try {
        const dbStock = typeof p.tallasStock === 'string' 
          ? JSON.parse(p.tallasStock) 
          : p.tallasStock;
        
        if (dbStock && typeof dbStock === 'object') {
          if (Array.isArray(dbStock)) {
            dbStock.forEach(item => {
              if (item.talla) inv[pid][item.talla] = Number(item.cantidad || 0);
            });
          } else {
            sizes.forEach(s => {
              inv[pid][s] = Number(dbStock[s] ?? 0);
            });
          }
          continue;
        }
      } catch (e) {
        console.warn("Error parseando stock:", e);
      }
    }

    const total = Math.max(0, Number(p.stock ?? 0));
    const per = Math.floor(total / sizes.length);
    let rem = total - per * sizes.length;
    for (const s of sizes) {
      const add = rem > 0 ? 1 : 0;
      inv[pid][s] = Math.max(0, per + add);
      if (rem > 0) rem -= 1;
    }
  }
  return inv;
};


export const getAvailableFor = (inv, productId, talla) => {
  const pid = String(productId);
  return Math.max(0, Number(inv?.[pid]?.[talla] ?? 0));
};

export const decreaseInventory = (inv, productId, talla, qty) => {
  const pid = String(productId);
  const next = { ...inv, [pid]: { ...(inv[pid] || {}) } };
  const current = getAvailableFor(inv, productId, talla);
  next[pid][talla] = Math.max(0, current - Math.max(0, qty));
  return next;
};