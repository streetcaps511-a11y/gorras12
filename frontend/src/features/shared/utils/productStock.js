/**
 * Calcula el stock total de un producto sumando todas sus tallas.
 * @param {Object} product - El objeto del producto.
 * @param {Object} inventory - (Opcional) Objeto de inventario global si se usa contexto.
 * @returns {number} - La cantidad total de stock disponible.
 */
export const getProductTotalStock = (product, inventory = null) => {
  if (!product) return 0;

  // 1. Si usamos un inventario externo (contexto/global), lo priorizamos
  if (inventory) {
    const pid = String(product.id);
    let total = 0;
    if (inventory[pid]) {
      // Si solo tiene _total (producto sin tallas), usar ese valor directamente
      if ('_total' in inventory[pid] && Object.keys(inventory[pid]).length === 1) {
        return Number(inventory[pid]._total || 0);
      }
      Object.entries(inventory[pid]).forEach(([key, qty]) => {
        if (key !== '_total') total += Number(qty || 0);
      });
      // Si hay _total como fallback adicional
      if (total === 0 && inventory[pid]._total) return Number(inventory[pid]._total);
    } else {
      // Si el producto no está en inventory, usar su propio campo stock
      return Number(product.stock || 0);
    }
    return total;
  }

  // 2. Si no hay inventario externo, calculamos desde el objeto producto
  // Caso A: Tiene array detallado de tallasStock (ej: [{talla: 'M', cantidad: 5}, ...])
  if (Array.isArray(product.tallasStock) && product.tallasStock.length > 0) {
    return product.tallasStock.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
  }

  // Caso B: Tiene un campo stock simple numérico
  if (product.stock !== undefined) {
    return Number(product.stock);
  }

  // Caso C: No tiene información de stock, asumimos 0 o 1 según lógica de negocio
  // Por seguridad, si hay precios pero no stock, podríamos asumir que sí hay, 
  // pero lo correcto es 0 para evitar vender aire.
  return 0;
};