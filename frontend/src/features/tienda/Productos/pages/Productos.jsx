import React from 'react';
import ProductosHero from '../components/ProductosHero';
import ProductosGrid from '../components/ProductosGrid';
import ProductModal from "../../../shared/components/tienda/ProductModal";
import { useProductos } from '../hooks/useProductos';
import SuccessToast from '../../Home/components/SuccessToast';
import '../styles/Productos.css';

const Productos = () => {
  const {
    loading,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedProduct,
    openModal,
    closeModal,
    selectedSize,
    handleSizeSelect,
    quantity,
    incrementQuantity,
    decrementQuantity,
    handleQuantityInput,
    handleModalAddToCart,
    showSizeError,
    showSuccessToast,
    normalizeSizes,
    safeImg,
    getRatingFromProduct,
    BULK_MIN_QTY,
    loadingDetail
  } = useProductos();

  return (
    <div className="gm-productos-page">
      {/* TOAST DE ÉXITO - igual que en Home */}
      <SuccessToast show={showSuccessToast} />
      {/* HERO SECTION (Opcional, si quieres mantener el banner superior) */}
      <ProductosHero />

      {/* CONTENIDO PRINCIPAL: SOLO LA GRILLA */}
      <div className="gm-container" style={{ marginTop: '30px' }}>
        <ProductosGrid 
          initialProducts={filteredProducts}
          openModal={openModal}
          loading={loading}
          searchTerm={searchTerm}
          clearSearch={() => setSearchTerm('')}
        />
      </div>

      {/* MODAL DE DETALLE (Se mantiene igual) */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          closeModal={closeModal}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          quantity={quantity}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          handleQuantityInput={handleQuantityInput}
          handleModalAddToCart={handleModalAddToCart}
          showSizeError={showSizeError}
          normalizeSizes={normalizeSizes}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
          getRatingFromProduct={getRatingFromProduct}
          loading={loadingDetail}
        />
      )}
    </div>
  );
};

export default Productos;