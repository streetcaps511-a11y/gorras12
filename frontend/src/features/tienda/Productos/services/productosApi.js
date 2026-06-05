/* === SERVICIO API ===
Este archivo se encarga exclusivamente de la comunicación HTTP con el Backend. */
import api from "../../../shared/services/api";

/**
 * Obtener TODOS los productos activos
 */
export const getAllProducts = async () => {
  return await api.get('/api/productos', {
    params: { 
      todos: true
    }
  });
};

export const getProductos = (params = '') => 
  api.get(`/api/productos${params ? `?${params}` : ''}`);

export const getProductoById = (id) => 
  api.get(`/api/productos/${id}`);

export const getProductsByCategoryName = (categoria) => 
  api.get(`/api/productos/categoria/${categoria}`);

export const getCategorias = () => 
  api.get('/api/categorias');