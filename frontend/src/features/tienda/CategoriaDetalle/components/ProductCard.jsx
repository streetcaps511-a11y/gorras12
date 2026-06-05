/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz (como Tarjetas, Modales o Botones).
Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */
import React, { useState, useRef, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { getProductTotalStock } from "../../shared/utils/productStock";

const ProductCard = ({ product, openModal }) => {
  // 🔥 1. PRIMERO: Todos los Hooks al inicio (ANTES de cualquier return)
  const [imgIndex, setImgIndex] = useState(0);
  const scrollerRef = useRef(null);

  // 🔥 useEffect para el carrusel de imágenes
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = (e) => {
      const scrollLeft = e.target.scrollLeft;
      const width = e.target.offsetWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== imgIndex) setImgIndex(newIndex);
      }
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [imgIndex]);

  // 🔥 2. DESPUÉS: Validaciones y early returns
  if (!product) return null;

  // 🔥 3. Lógica del componente
  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
    ? product.imagenes.filter(Boolean).map((x) => String(x).trim()).filter(Boolean).slice(0, 4)
    : [product.safeImg || product.imagen || "https://placehold.co/800x800?text=Sin+Imagen"];
    
  const isAgotado = getProductTotalStock(product) <= 0;
  const isOffer = (product.enOferta || product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta;
  const discountPct = isOffer && product.precio > 0
    ? Math.round(((product.precio - product.precioOferta) / product.precio) * 100) : 0;

  const setIndex = (i) => {
    setImgIndex(i);
    if (scrollerRef.current) {
      const width = scrollerRef.current.offsetWidth;
      scrollerRef.current.scrollTo({ left: i * width, behavior: 'smooth' });
    }
  };

  const handleImgWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.currentTarget.scrollLeft += e.deltaX;
    }
  };

  const handleOpenDetail = () => { if (openModal) openModal(product); };

  return (
    <div className="gm-card">
      <div className="gm-img-wrapper">
        {isAgotado && <div className="gm-img-badge-corner agotado">AGOTADO</div>}
        {isOffer && <div className="gm-img-badge-corner oferta">OFERTA</div>}
        
        <div className="gm-img-scroller" onWheel={handleImgWheel} ref={scrollerRef}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${product.nombre} - ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                if (images.length > 1) {
                  setIndex((idx + 1) % images.length);
                } else {
                  handleOpenDetail();
                }
              }}
              loading="lazy"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://placehold.co/800x800?text=Sin+Imagen"; 
              }}
            />
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="gm-img-dots">
            {images.map((_, i) => (
              <div key={i} className={"gm-dot" + (i === imgIndex ? " active" : "")} onMouseEnter={() => setIndex(i)} />
            ))}
          </div>
        )}
      </div>
      
      <div className="gm-info" onClick={handleOpenDetail} style={{ cursor: 'pointer' }}>
        <h3 className="gm-product-name">{product.nombre}</h3>
        
        {/* Descripción removida a petición del usuario */}
        {/* 
         {product.descripcion && (
           <div className="gm-desc-wrapper">
             <p className={`gm-product-desc ${expandedDesc ? 'gm-desc-expanded' : 'gm-desc-collapsed'}`}>
               {product.descripcion}
             </p>
             <button
               className="gm-desc-toggle-btn"
               onClick={(e) => {
                 e.stopPropagation();
                 setExpandedDesc(!expandedDesc);
               }}
               type="button"
             >
               {expandedDesc ? 'Ver menos ▲' : 'Ver más ▼'}
             </button>
           </div>
         )}
         */}
        
        <div className="gm-actions-row">
          <div className="gm-price-actions">
            {isOffer ? (
              <>
                <div className="gm-price-main-row">
                  <span className="gm-current-price">${Math.round(product.precioOferta).toLocaleString('es-CO')}</span>
                  {discountPct > 0 && <span className="gm-discount-tag">-{discountPct}%</span>}
                </div>
                <span className="gm-old-price">${Math.round(product.precio).toLocaleString('es-CO')}</span>
                <span className="gm-saving-pill">Ahorras ${Math.round(product.precio - product.precioOferta).toLocaleString('es-CO')}</span>
              </>
            ) : (
              <span className="gm-current-price">${Math.round(product.precio || 0).toLocaleString('es-CO')}</span>
            )}

          </div>
          <button className="gm-btn-cart" onClick={(e) => { e.stopPropagation(); handleOpenDetail(); }} type="button">
            <FaShoppingCart size={15} color="#000" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;