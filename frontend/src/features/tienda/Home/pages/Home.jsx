/* === PÁGINA PRINCIPAL === */
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "../styles/Home.css";
import "../styles/HomeHero.css";
import "../styles/ProductCard.css";
import { useHome } from "../hooks/useHome";
import Hero from "../components/Hero";
import Carousel from "../components/Carousel";
import ProductCard from "../components/ProductCard";
import ProductModal from "../../../shared/components/tienda/ProductModal";
import SuccessToast from "../components/SuccessToast";

const Home = () => {
  const { selectedProduct, setSelectedProduct, searchTerm, setSearchTerm, filteredProducts, sectionsData, carouselScrollState, carouselRefs, handleScroll, handleCarouselScroll, closeModal, handleSizeSelect, handleQuantityChange, handleModalAddToCart, incrementQuantity, decrementQuantity, showSuccessToast, showSizeError, normalizeSizes, safeImg, quantity, inventory, formatPrice, BULK_MIN_QTY, PLACEHOLDER_IMG, selectedSize } = useHome();

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="gm-home page-container">
      <Hero />

      <div className="gm-container">
        {searchTerm ? (
          <div className="gm-home-section" style={{ minHeight: "60vh" }}>
            <div className="gm-home-header">
              <h2 className="gm-home-title">
                Resultados para: &quot;{searchTerm}&quot;
              </h2>
              <button
                onClick={() => setSearchTerm("")}
                className="gm-home-pill"
              >
                <span>Limpiar búsqueda</span> <FaTimes size={13} />
              </button>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="gm-search-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="gm-slot-search">
                    <ProductCard
                      product={product}
                      onOpenDetail={handleOpenDetail}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="gm-no-results-home">
                <p>
                  No se encontraron productos que coincidan con &quot;
                  {searchTerm}&quot;
                </p>
              </div>
            )}
          </div>
        ) : (
          sectionsData.map((section) => (
            <Carousel
              key={section.id}
              id={section.id}
              title={section.title}
              items={section.data}
              link={section.link}
              showSeeAllCard={section.showSeeAllCard}
              carouselRefs={carouselRefs}
              carouselScrollState={carouselScrollState}
              handleScroll={handleScroll}
              handleCarouselScroll={handleCarouselScroll}
              onOpenDetail={handleOpenDetail}
            />
          ))
        )}
      </div>

      {/* Modal EXACTO como Ofertas: usa inventory/quantity/selectedSize del hook */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          closeModal={closeModal}
          inventory={inventory}
          selectedSize={selectedSize}
          handleSizeSelect={handleSizeSelect}
          quantity={quantity}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          handleQuantityInput={handleQuantityChange}
          handleModalAddToCart={handleModalAddToCart}
          showSizeError={showSizeError}
          normalizeSizes={normalizeSizes}
          safeImg={safeImg}
          BULK_MIN_QTY={BULK_MIN_QTY}
          formatPrice={formatPrice}
          PLACEHOLDER_IMG={PLACEHOLDER_IMG}
        />
      )}

      <SuccessToast show={showSuccessToast} />
    </div>
  );
};

export default Home;
