/* === COMPONENTE REUTILIZABLE ===
Muestra la grilla de productos con:
- Paginación inteligente en Desktop.
- Botón "Ver más" en Móvil. */
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductosGrid.css';

const ITEMS_PER_PAGE = 10;
const MOBILE_ITEMS_PER_PAGE = 6;

const ProductosGrid = ({
  initialProducts,
  openModal,
  loading = false,
  searchTerm = '',
  clearSearch,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [visibleCount, setVisibleCount] = useState(window.innerWidth < 768 ? MOBILE_ITEMS_PER_PAGE : ITEMS_PER_PAGE);

  // Detectar pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCurrentPage(1);
        setVisibleCount(MOBILE_ITEMS_PER_PAGE);
      } else {
        setVisibleCount(ITEMS_PER_PAGE);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll al banner/hero al cambiar de página
  useEffect(() => {
    if (!isMobile && currentPage > 1) {
      const heroBanner = document.querySelector('.gm-productos-page') || 
                         document.querySelector('.gm-hero') || 
                         document.querySelector('.gm-container');
      if (heroBanner) {
        heroBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentPage, isMobile]);

  // Lógica Desktop (Paginación)
  const totalPages = Math.ceil((initialProducts?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = initialProducts?.slice(startIndex, endIndex) || [];

  // Lógica Móvil (Ver más)
  const visibleProducts = isMobile 
    ? initialProducts?.slice(0, visibleCount) || []
    : paginatedProducts;

  const hasMore = initialProducts && visibleCount < initialProducts.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + MOBILE_ITEMS_PER_PAGE);
  };

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Generador de botones inteligente
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button key={i} className={`gm-page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(i)}>
            {i}
          </button>
        );
      }
    } else {
      const showFirst = currentPage <= 3;
      const showLast = currentPage >= totalPages - 2;

      if (showFirst) {
        for (let i = 1; i <= 4; i++) {
           buttons.push(<button key={i} className={`gm-page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(i)}>{i}</button>);
        }
        buttons.push(<span key="dot1" className="gm-page-ellipsis">...</span>);
        buttons.push(<button key={totalPages} className="gm-page-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>);
      } else if (showLast) {
        buttons.push(<button key={1} className="gm-page-btn" onClick={() => handlePageChange(1)}>1</button>);
        buttons.push(<span key="dot2" className="gm-page-ellipsis">...</span>);
        for (let i = totalPages - 3; i <= totalPages; i++) {
           buttons.push(<button key={i} className={`gm-page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(i)}>{i}</button>);
        }
      } else {
        buttons.push(<button key={1} className="gm-page-btn" onClick={() => handlePageChange(1)}>1</button>);
        buttons.push(<span key="dot3" className="gm-page-ellipsis">...</span>);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
           buttons.push(<button key={i} className={`gm-page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => handlePageChange(i)}>{i}</button>);
        }
        buttons.push(<span key="dot4" className="gm-page-ellipsis">...</span>);
        buttons.push(<button key={totalPages} className="gm-page-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>);
      }
    }
    return buttons;
  };

  return (
    <div className="gm-container">
      {loading && (!initialProducts || initialProducts.length === 0) && (
        <div className="gm-loading-container">
          <div className="gm-loader"></div>
          <p>Cargando catálogo...</p>
        </div>
      )}

      {!loading && searchTerm && (
        <div className="gm-home-header" style={{ marginBottom: '20px' }}>
          <h2 className="gm-home-title">Resultados para: &quot;{searchTerm}&quot;</h2>
          {clearSearch && (
            <button onClick={clearSearch} className="gm-home-pill">
              <span>Limpiar búsqueda</span> <span style={{fontSize: '12px', marginLeft: '5px'}}>✕</span>
            </button>
          )}
        </div>
      )}

      {!loading && visibleProducts.length > 0 && (
        <>
          <div className="gm-products-grid-simple">
            {visibleProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                openModal={openModal}
              />
            ))}
          </div>

          {/* PAGINACIÓN (Desktop) */}
          {!isMobile && totalPages > 1 && (
            <div className="gm-pagination">
              <button
                className="gm-page-btn gm-page-arrow"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              {renderPaginationButtons()}
              
              <button
                className="gm-page-btn gm-page-arrow"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}

          {/* VER MÁS (Mobile) */}
          {isMobile && (
            <div className="gm-load-more-wrapper">
              {hasMore ? (
                <>
                  <button onClick={handleLoadMore} className="gm-load-more-btn">
                    Ver más productos
                  </button>
                  <p className="gm-load-more-hint">
                    Mostrando {visibleCount} de {initialProducts.length}
                  </p>
                </>
              ) : (
                <p className="gm-load-more-hint" style={{color: '#64748b'}}>
                  ✓ Ya no hay más productos
                </p>
              )}
            </div>
          )}
        </>
      )}

      {!loading && initialProducts && initialProducts.length === 0 && (
        <div className="gm-no-results">
          {searchTerm ? (
            <>
              <p>No se encontraron productos que coincidan con <strong>&quot;{searchTerm}&quot;</strong>.</p>
              {clearSearch && (
                <button className="gm-clear-search-btn" onClick={clearSearch}>
                  Limpiar búsqueda
                </button>
              )}
            </>
          ) : (
            <p>No hay productos disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductosGrid;