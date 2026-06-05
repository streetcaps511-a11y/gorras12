/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/ProductCard.css';
// src/components/ProductCard.jsx
import React from "react";

const calculateDiscountPercentage = (original, current) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

const colorMap = {
  negro: "#111827", blanco: "#F9FAFB", rojo: "#EF4444", azul: "#3B82F6",
  verde: "#22C55E", amarillo: "#FACC15", naranja: "#F97316", morado: "#A855F7",
  rosa: "#EC4899", gris: "#6B7280", café: "#92400E", beige: "#D4B896",
  celeste: "#7DD3FC", navy: "#1E3A5F", caqui: "#8B8060",
};

const ProductCard = ({ product, onAddToCart }) => {
  const discountPercentage = calculateDiscountPercentage(
    product.originalPrice,
    product.precio
  );

  const isNuevo = product.tags?.includes("NUEVO");

  const handleAddToCart = () => {
    onAddToCart(product);
    // Mostrar notificación
    alert(`${product.nombre} agregado al carrito`);
  };

  return (
    <div className="product-card product-card-animate">
      {/* Imagen */}
      <div className="product-card-image-content">
        {product.imagenes?.[0] ? (
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            className="product-card-img"
          />
        ) : (
          <div className="product-card-placeholder">🖼</div>
        )}

        {/* Badges */}
        <div className="product-card-badges">
          {isNuevo && (
            <span className="badge-nuevo">
              NUEVO
            </span>
          )}
          <span className="badge-discount">
            -{discountPercentage}%
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="product-card-info">
        <h3 className="product-card-title">
          {product.nombre}
        </h3>

        {/* Colores */}
        <div className="product-card-colors-ctx">
          <span className="colors-label">Colores:</span>
          <div className="colors-list">
            {product.colores?.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="color-circle"
                style={{
                  backgroundColor: colorMap[color.toLowerCase()] || "#FFFFFF"
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Precio */}
        <div className="product-card-prices">
          <span className="price-now">
            ${product.precio.toLocaleString()}
          </span>
          <span className="price-old">
            ${product.originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          className="btn-add-cart"
        >
          <span className="cart-icon-span">🛒</span>
          <span>Agregar al Carrito</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
