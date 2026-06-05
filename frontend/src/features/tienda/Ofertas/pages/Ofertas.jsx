/* === PÁGINA PRINCIPAL ===
Este componente es la interfaz visual principal de la ruta.
Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */
import React from 'react';
import OfertasHero from '../components/OfertasHero';
import OfertasGrid from '../components/OfertasGrid';
import ProductModal from "../../../shared/components/tienda/ProductModal";
import SuccessToast from '../components/SuccessToast';
import { useOfertas } from '../hooks/useOfertas';
import '../styles/Ofertas.css';

const Ofertas = () => {
  const {
    loading,
    ofertas,
    searchFiltered,
    searchTerm,
    setGlobalSearch,
    selectedProduct,
    inventory,
    getAvailableFor,
    selectedSize,
    quantity,
    showSuccessToast,
    showSizeError,
    openModal,
    closeModal,
    handleSizeSelect,
    incrementQuantity,
    decrementQuantity,
    handleModalAddToCart,
    normalizeSizes,
    safeImg,
    getRatingFromProduct,
    BULK_MIN_QTY,
    handleQuantityInput,
  } = useOfertas();

  return (
    <div className="page-container">
      <OfertasHero />

      <div className="gm-container">
        <div className="gm-products-page-layout" style={{ marginTop: '30px' }}>
          <main className="gm-products-main-content">
            <OfertasGrid 
              ofertas={ofertas}
              searchFiltered={searchFiltered}
              searchTerm={searchTerm}
              setGlobalSearch={setGlobalSearch}
              openModal={openModal}
              safeImg={safeImg}
              getRatingFromProduct={getRatingFromProduct}
              loading={loading}
            />
          </main>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          closeModal={closeModal}
          inventory={inventory}
          getAvailableFor={getAvailableFor}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          quantity={quantity}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          handleModalAddToCart={handleModalAddToCart}
          showSizeError={showSizeError}
          normalizeSizes={normalizeSizes}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
          handleQuantityInput={handleQuantityInput}
        />
      )}

      <SuccessToast show={showSuccessToast} />
    </div>
  );
};

export default Ofertas;