/* === SERVICIO API ===
Obtiene solo los productos con ofertas activas */
import api from "../../../shared/services/api";

/**
 * Obtener productos en oferta
 * Filtra productos con enOfertaVenta = true y precioOferta > 0
 */
export const fetchOffers = async () => {
  const res = await api.get("/api/productos", {
    params: {
      todos: true,
      oferta: true // Si tu backend soporta este filtro
    }
  });
  
  const allProducts = res.data?.data?.products || res.data?.data || [];
  
  // FILTRAR SOLO LOS QUE TIENEN OFERTA ACTIVA
  const offers = allProducts.filter(p => 
    (p.enOfertaVenta === true || p.enOferta === true) && 
    Number(p.precioOferta || 0) > 0
  );
  
  return offers;
};

export const getProductoById = (id) => 
  api.get(`/api/productos/${id}`);