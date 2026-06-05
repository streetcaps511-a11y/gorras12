/* === SERVICIO API === */
import api from "../../../shared/services/api";

/**
 * Obtiene los productos para la página de inicio
 */
export const getHomeProducts = async () => {
  const response = await api.get("/api/productos", { 
    params: { 
      todos: true,
      incluir_tallas: true // Si tu backend lo soporta
    } 
  });
  
  // Asegurar que traemos tallasStock completo
  return response.data?.data?.products || response.data?.data || [];
};