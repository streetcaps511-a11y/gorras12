/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, FaStar, FaFire, FaPalette, FaRuler, FaEye
} from 'react-icons/fa';
import '../styles/SearchResults.css';
import { getProductTotalStock } from '../../shared/utils/productStock';

const SearchResultCard = ({ product, onAddToCart, index }) => {
  const stockTotal = getProductTotalStock(product);
  const isInStock = stockTotal > 0;

  return (
    <div 
      className="sr-product-card"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="sr-img-container">
        <img
          src={product.imagenes?.[0] || 'https://placehold.co/300x220?text=GM+CAPS'}
          alt={product.nombre}
          className="sr-product-img"
          loading="lazy"
        />
        <div className="sr-badges">
          <div>
            {product.hasDiscount && (
              <span className="sr-badge sr-badge-discount">
                <FaFire /> Oferta
              </span>
            )}
          </div>
          <div>
            {product.isFeatured && (
              <span className="sr-badge sr-badge-featured">
                <FaStar /> Destacado
              </span>
            )}
            {product.isNew && (
              <span className="sr-badge sr-badge-new">
                🆕 Nuevo
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sr-product-content">
        <h3 className="sr-product-name">{product.nombre}</h3>
        <p className="sr-product-category">{product.categoria}</p>

        <div className="sr-product-details">
          {product.colores?.length > 0 && (
            <div className="sr-detail-item">
              <FaPalette /> {product.colores.length} colores
            </div>
          )}
          {product.tallas?.length > 0 && (
            <div className="sr-detail-item">
              <FaRuler /> {product.tallas.length} tallas
            </div>
          )}
        </div>

        <div className="sr-price-row">
          <div className="sr-price-wrapper">
            {(product.hasDiscount || product.oferta) && product.precioOferta ? (
              <>
                <span className="sr-current-price">${product.precioOferta.toLocaleString()}</span>
                <span className="sr-original-price">${product.precio.toLocaleString()}</span>
              </>
            ) : (
              <span className="sr-current-price">${product.precio?.toLocaleString()}</span>
            )}
          </div>
          <span className={`sr-stock-status ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
            {isInStock ? `Stock: ${stockTotal}` : 'Agotado'}
          </span>
        </div>

        <div className="sr-product-actions">
          <button
            onClick={() => onAddToCart(product)}
            className={`sr-add-btn ${isInStock ? 'enabled' : 'disabled'}`}
            disabled={!isInStock}
          >
            <FaShoppingCart />
            {isInStock ? 'Agregar' : 'Agotado'}
          </button>
          <Link to={`/producto/${product.id}`} className="sr-view-btn">
            <FaEye /> Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
