/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz (como Tarjetas, Modales o Botones).
Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */
import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaBan,
  FaLink,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// ✅ RUTAS CORREGIDAS (Solo subes 2 niveles desde /tienda/ hasta /shared/)
import { getColorHex, isLightColor } from "../../constants/colores";
import { useCart } from "../../contexts";
import "../../../shared/styles/ProductModal.css";

const ProductModal = ({
  product,
  closeModal,
  inventory,
  selectedSize,
  handleSizeSelect,
  quantity,
  incrementQuantity,
  handleModalAddToCart,
  showSizeError,
  handleQuantityInput,
  safeImg,
  normalizeSizes = (p) => {
    if (Array.isArray(p?.tallasStock) && p.tallasStock.length > 0) {
      return p.tallasStock.map(t => t.talla).filter(Boolean);
    }
    const t = p?.tallas;
    if (!t) return [];
    if (Array.isArray(t)) return t.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
    if (typeof t === "string") return t.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  },
}) => {
  const { cartItems } = useCart();
  // Estados locales del modal
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [copied, setCopied] = useState(false);
  const descRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [shouldShowViewMore, setShouldShowViewMore] = useState(false);

  // Detectar si la descripción es larga
  useEffect(() => {
    if (descRef.current && !expandedDesc) {
      const lineHeight = parseFloat(window.getComputedStyle(descRef.current).lineHeight);
      const height = descRef.current.scrollHeight;
      setShouldShowViewMore(Math.ceil(height / lineHeight) > 2);
    }
  }, [product?.descripcion, expandedDesc]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const [fullProduct, setFullProduct] = useState(null);

  // Cargar info completa: siempre hace fetch si le faltan tallas O descripción
  useEffect(() => {
    if (!product || fullProduct) return;
    // Si ya tiene tallasStock con datos Y descripción real, no hace falta refetch
    const hasTallas = Array.isArray(product.tallasStock) && product.tallasStock.length > 0;
    const hasDesc = product.descripcion && product.descripcion.trim() !== "";
    if (hasTallas && hasDesc) return;
    const fetchFullData = async () => {
      try {
        const { getProductoById } = await import('../../../tienda/cart/services/cartApi.js');
        const res = await getProductoById(product.id);
        if (res?.data?.data) {
          setFullProduct(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching full product details:", err);
      }
    };
    fetchFullData();
  }, [product, fullProduct]);

  if (!product) return null;
  const displayProduct = fullProduct || product;

  // Imágenes
  const images = Array.isArray(displayProduct.imagenes) && displayProduct.imagenes.filter(Boolean).length
    ? displayProduct.imagenes.filter(Boolean).map((x) => String(x).trim()).filter(Boolean)
    : [safeImg(displayProduct)];

  // Tallas
  const sizes = normalizeSizes(displayProduct);

  // Si tenemos datos completos del producto (fullProduct), usamos su tallasStock directo
  // para no depender del inventory construido desde datos minimal
  const effectiveInventory = fullProduct ? null : inventory;

  const getQtyInCartFor = (size) => {
    if (!cartItems) return 0;
    const itemInCart = cartItems.find(
      (item) => String(item.id) === String(product.id) && String(item.talla || '').trim().toLowerCase() === String(size || '').trim().toLowerCase()
    );
    return itemInCart ? Number(itemInCart.quantity || 0) : 0;
  };

  // Lógica de Stock Unificada
  const getAvailableFor = (size) => {
    let rawAvailable = 0;
    if (effectiveInventory) {
      const pid = String(product.id);
      rawAvailable = Math.max(0, Number(effectiveInventory?.[pid]?.[size] ?? 0));
    } else {
      // Fallback para vista de Productos
      if (!displayProduct.tallasStock) {
        rawAvailable = Number(displayProduct.stock || 0);
      } else {
        try {
          const stockObj = typeof displayProduct.tallasStock === "string" ? JSON.parse(displayProduct.tallasStock) : displayProduct.tallasStock;
          if (Array.isArray(stockObj)) {
            const found = stockObj.find(item => String(item.talla || "").toLowerCase() === String(size).toLowerCase());
            rawAvailable = found ? Number(found.cantidad || 0) : 0;
          } else {
            rawAvailable = Number(stockObj[size] ?? 0);
          }
        } catch {
          rawAvailable = Number(displayProduct.stock || 0);
        }
      }
    }
    const qtyInCart = getQtyInCartFor(size);
    return Math.max(0, rawAvailable - qtyInCart);
  };

  const remaining = selectedSize ? getAvailableFor(selectedSize) : 0;

  const getProductTotalStockLeft = () => {
    if (sizes && sizes.length > 0) {
      return sizes.reduce((acc, sz) => acc + getAvailableFor(sz), 0);
    }
    const globalQtyInCart = cartItems
      ? cartItems.filter(item => String(item.id) === String(product.id)).reduce((acc, item) => acc + Number(item.quantity || 0), 0)
      : 0;
    return Math.max(0, Number(displayProduct.stock || 0) - globalQtyInCart);
  };

  const totalStock = getProductTotalStockLeft();
  const isAgotado = totalStock <= 0;

  // Precios y Descuentos
  const isOffer = (displayProduct.enOferta || displayProduct.hasDiscount || displayProduct.has_discount || displayProduct.oferta) && displayProduct.precioOferta;
  
  const getWholesalePrice = (qty, prod) => {
    const q = parseInt(qty) || 0;
    if (q >= 80 && parseFloat(prod.precioMayorista80) > 0) return prod.precioMayorista80;
    if (q >= 6 && parseFloat(prod.precioMayorista6) > 0) return prod.precioMayorista6;
    return isOffer ? prod.precioOferta : prod.precio;
  };

  const currentPrice = getWholesalePrice(quantity, displayProduct) || (isOffer ? parseFloat(displayProduct.precioOferta) : parseFloat(displayProduct.precio)) || parseFloat(displayProduct.precio) || 0;

  // Handlers

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (images.length <= 1) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (diff > threshold) {
      setModalImgIndex((prev) => (prev + 1) % images.length);
    } else if (diff < -threshold) {
      setModalImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    touchEndX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      touchEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (images.length <= 1) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40;
    if (diff > threshold) {
      setModalImgIndex((prev) => (prev + 1) % images.length);
    } else if (diff < -threshold) {
      setModalImgIndex((prev) => (prev - 1 + images.length) % images.length);
    } else {
      setModalImgIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/productos?producto=${product.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasMayorista = parseFloat(displayProduct.precioMayorista6) > 0;

  return (
    <div className="gm-modal-overlay" onClick={closeModal}>
      <div className={`gm-modal ${(product?.nombre || "").length <= 28 ? "gm-modal--short-name" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        {/* ✅ BOTÓN COMPARTIR CON TOOLTIP (En la posición interna/izquierda) */}
        <div className="gm-modal-btn-tooltip-wrapper" style={{ position: 'absolute', top: '18px', right: '60px', zIndex: 10 }}>
          <button className="gm-share-simple-btn" onClick={handleCopyLink} type="button" aria-label="Copiar enlace del producto">
            {copied ? <FaCheck size={16} /> : <FaLink size={16} />}
          </button>
          <span className="gm-modal-btn-tooltip">Compartir</span>
        </div>

        {/* Botón Cerrar CON TOOLTIP (En la posición externa/derecha) */}
        <div className="gm-modal-btn-tooltip-wrapper" style={{ position: 'absolute', top: '18px', right: '18px', zIndex: 10 }}>
          <button className="gm-modal-close" onClick={closeModal} type="button" aria-label="Cerrar modal">
            <FaTimes size={18} />
          </button>
          <span className="gm-modal-btn-tooltip" style={{ right: 0, left: 'auto', transform: 'none' }}>Cerrar</span>
        </div>
        
        {copied && (
          <div className="gm-copy-toast" style={{ position: 'absolute', top: '62px', right: '18px', zIndex: 101, backgroundColor: '#13192b', color: '#F5C81B' }}>✓ Enlace copiado</div>
        )}

        {/* LEFT: IMAGE */}
        <div className="gm-modal-left">
          <div className="gm-modal-imgbox">
            {isAgotado && (
              <div className="gm-img-badge-corner agotado">AGOTADO</div>
            )}
            {isOffer && (
              <div className="gm-img-badge-corner oferta">OFERTA</div>
            )}

            <img 
              src={images[modalImgIndex]} 
              alt={displayProduct.nombre} 
              className="gm-modal-img" 
              style={{ cursor: images.length > 1 ? 'pointer' : 'default', userSelect: 'none', WebkitUserDrag: 'none' }}
              onDragStart={(e) => e.preventDefault()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            {images.length > 1 && (
              <div className="gm-modal-dots">
                {images.map((_, i) => (
                  <button key={i} className={`gm-modal-dot ${i === modalImgIndex ? "active" : ""}`} onClick={() => setModalImgIndex(i)} type="button" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="gm-modal-right">
          <div className="gm-modal-right-content">
            
            {/* 1. Header */}
            <div className="gm-modal-title-colors">
              <h2 className="gm-modal-title">{displayProduct.nombre}</h2>
              <div className="gm-modal-meta-row">
                {displayProduct.colores?.length > 0 && (
                  <div className="gm-modal-colors-inline">
                    {displayProduct.colores.filter(Boolean).map((c, idx) => {
                      const hex = getColorHex(c);
                      const isLight = isLightColor(c);
                      const swatchBg = c.toLowerCase() === "negro" || hex === "#000000" ? "#000" : hex;
                      return (
                        <span key={idx} className="gm-color-chip">
                          <span className="gm-color-chip-swatch" style={{ backgroundColor: swatchBg, borderColor: hex === "#000" ? "#FFF" : (isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)") }} />
                          {c}
                        </span>
                      );
                    })}
                  </div>
                )}
                {displayProduct.categoria && (
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: "#f5c81b",
                      color: "#000",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "10px",
                      fontWeight: "900",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      order: 99,
                      boxShadow: "0 2px 6px rgba(245, 200, 27, 0.25)",
                    }}
                  >
                    🏷{" "}
                    {displayProduct.categoria || displayProduct.Categoria || displayProduct.category}
                  </span>
                )}
              </div>
            </div>

            {/* 2. Price Row */}
            <div className="gm-price-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div className="gm-modal-price-main">${Math.round(currentPrice).toLocaleString("es-CO")}</div>
              {isOffer && (
                <>
                  <span className="gm-original-price">Antes: ${Math.round(displayProduct.precio).toLocaleString("es-CO")}</span>
                  <span className="gm-discount-badge">{Math.round(((displayProduct.precio - displayProduct.precioOferta) / displayProduct.precio) * 100)}% OFF</span>
                </>
              )}
            </div>

            {/* 3. Bulk Info (Con contenedor azul como antes + badge en el mismo renglón) */}
            {hasMayorista && (
              <div className="gm-bulk-info-box" style={{
                background: 'rgba(42, 74, 111, 0.35)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '6px',
                padding: '5px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px',
                width: 'fit-content',
                flexWrap: 'wrap'
              }}>
                <span className="gm-bulk-info-text" style={{
                  fontSize: '0.74rem',
                  fontWeight: '500',
                  color: '#93c5fd',
                  whiteSpace: 'nowrap'
                }}>
                  A partir de 6 unidades eres mayorista
                </span>
                
                {/* Badges de mayorista condicionados por la cantidad elegida */}
                {parseInt(quantity) >= 80 && parseFloat(displayProduct.precioMayorista80) > 0 ? (
                  <span className="gm-wholesale-badge" style={{
                    fontSize: '11px',
                    color: '#F5C81B',
                    border: '1px solid rgba(245, 200, 27, 0.5)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(245, 200, 27, 0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    Mayorista +80
                  </span>
                ) : parseInt(quantity) >= 6 && parseFloat(displayProduct.precioMayorista6) > 0 ? (
                  <span className="gm-wholesale-badge" style={{
                    fontSize: '11px',
                    color: '#F5C81B',
                    border: '1px solid rgba(245, 200, 27, 0.5)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(245, 200, 27, 0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    Mayorista +6
                  </span>
                ) : null}
              </div>
            )}

            {/* 3. Description */}
            <div className={`gm-modal-desc-box ${expandedDesc ? "gm-desc-expanded" : "gm-desc-collapsed"}`}>
              <p className="gm-modal-description" ref={descRef}>
                <span className="gm-desc-label-inline">Descripción: </span>
                {displayProduct.descripcion || "Sin descripción disponible."}
              </p>
              {shouldShowViewMore && (
                <button className="gm-desc-view-more-btn" onClick={() => setExpandedDesc(!expandedDesc)} type="button" style={{ position: 'relative', background: 'transparent' }}>
                  {expandedDesc ? "Ver menos ▲" : "Ver más ▼"}
                </button>
              )}
            </div>

            {/* 4. Sizes */}
            {sizes.length > 0 && (
              <div className="gm-sizes">
                <div className="gm-sizes-head"><span className="gm-sizes-label">Talla: </span></div>
                <div className="gm-sizes-wrap">
                  {sizes.map((t) => {
                    const ava = getAvailableFor(t);
                    const disabled = ava <= 0 || isAgotado;
                    return (
                      <div key={t} className="gm-size-chip-container">
                        <div className="gm-size-tooltip">{disabled ? "Agotado" : `Disp: ${ava}`}</div>
                        <button type="button" className={`gm-size-chip ${disabled ? "is-disabled" : ""} ${selectedSize === t ? "is-selected" : ""}`} onClick={() => !disabled && handleSizeSelect(t)}>{t}</button>
                      </div>
                    );
                  })}
                </div>
                {showSizeError && <div className="gm-size-error-msg">⚠️ Selecciona una talla</div>}
              </div>
            )}

            {/* 5. Quantity + Stock */}
            <div className="gm-quantity-selector">
              <div className="gm-quantity-label">Cantidad: </div>
              <div className="gm-quantity-row">
                <div className="gm-quantity-controls">
                  <button 
                    className="gm-qty-btn" 
                    onClick={() => {
                      const current = parseInt(quantity) || 0;
                      if (current > 1) {
                        handleQuantityInput(current - 1);
                      } else {
                        handleQuantityInput(1);
                      }
                    }} 
                    disabled={isAgotado || (typeof quantity === 'number' && quantity <= 0)} 
                    type="button"
                  >
                    <FaMinus size={10} />
                  </button>
                  
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="gm-qty-input-manual"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') { handleQuantityInput(''); return; }
                      const cleanVal = val.replace(/\D/g, "");
                      let num = parseInt(cleanVal, 10);
                      if (isNaN(num)) {
                        handleQuantityInput('');
                        return;
                      }
                      if (selectedSize && num > remaining) {
                        num = remaining;
                      }
                      handleQuantityInput(num);
                    }}
                    disabled={isAgotado}
                    onFocus={(e) => e.target.select()}
                  />
                  
                  <button 
                    className="gm-qty-btn" 
                    onClick={() => {
                      if (!selectedSize) {
                        incrementQuantity(); // parent will show size error
                        return;
                      }
                      const current = parseInt(quantity) || 0;
                      if (current < remaining) {
                        handleQuantityInput(current + 1);
                      }
                    }} 
                    disabled={isAgotado || (selectedSize && parseInt(quantity) >= remaining)} 
                    type="button"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
                {selectedSize && parseInt(quantity) >= remaining && remaining > 0 && (
                  <span className="gm-stock-badge" style={{ color: '#10b981', borderColor: '#10b98144', backgroundColor: '#10b98111' }}>
                    {remaining} RESTANTES
                  </span>
                )}
              </div>
            </div>

            {/* 6. Add to Cart */}
            <button 
              className={`gm-btn-add-cart ${(isAgotado || (selectedSize && remaining <= 0)) ? "gm-btn-disabled-agotado" : ""}`} 
              onClick={handleModalAddToCart} 
              disabled={isAgotado || (selectedSize && remaining <= 0)}
            >
              {isAgotado ? (
                <><FaBan size={18} /> <span>Agotado</span></>
              ) : (selectedSize && remaining <= 0) ? (
                <><FaBan size={18} /> <span>Sin stock disponible</span></>
              ) : (
                <><FaShoppingCart size={18} /> <span className="gm-btn-label-desktop">Añadir al carrito</span><span className="gm-btn-label-mobile">Añadir</span></>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;