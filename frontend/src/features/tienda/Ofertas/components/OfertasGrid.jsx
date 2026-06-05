/* === COMPONENTE REUTILIZABLE ===
Muestra ofertas con paginación inteligente (Desktop) y "Ver más" (Mobile). */
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ProductCard from './ProductCard';
import '../styles/OfertasGrid.css';

const ITEMS_PER_PAGE = 10;

const OfertasGrid = ({
  searchFiltered,
  searchTerm,
  setGlobalSearch,
  ofertas,
  openModal,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Lista a renderizar
  const displayProducts = searchFiltered !== null ? searchFiltered : ofertas;

  // Detectar pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCurrentPage(1);
      else setVisibleCount(ITEMS_PER_PAGE);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll al cambiar de página (Desktop)
  useEffect(() => {
    if (!isMobile && currentPage > 1) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  }, [currentPage, isMobile]);

  // Lógica Desktop (Paginación)
  const totalPages = Math.ceil((displayProducts?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = displayProducts?.slice(startIndex, endIndex) || [];

  // Lógica Mobile (Ver más)
  const visibleProducts = isMobile 
    ? displayProducts?.slice(0, visibleCount) || []
    : paginatedProducts;

  const hasMore = displayProducts && visibleCount < displayProducts.length;

  const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  const handlePageChange = (page) => { if (page !== currentPage) setCurrentPage(page); };

  // Paginación inteligente
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
      {/* Header de búsqueda */}
      {searchFiltered !== null && (
        <div className="gm-search-header-container">
          <div className="gm-search-results-header">
            <h2 className="gm-search-title">
              Resultados para: <span className="gm-search-term">&quot;{searchTerm}&quot;</span>
            </h2>
            <button onClick={() => setGlobalSearch("")} className="gm-clean-search-btn">
              <FaTimes size={14} /> Limpiar búsqueda
            </button>
          </div>
          <p className="gm-search-count">
            {searchFiltered.length} producto{searchFiltered.length !== 1 ? "s" : ""} encontrado{searchFiltered.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Estado de carga */}
      {loading ? (
        <div className="gm-loading-container">
          <div className="gm-loader"></div>
          <p>Cargando ofertas...</p>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="gm-no-offers">
          <p>{searchFiltered !== null ? "No se encontraron productos" : "No hay ofertas disponibles en este momento."}</p>
          {searchFiltered !== null && (
            <button onClick={() => setGlobalSearch("")} className="gm-pill-btn">Limpiar búsqueda</button>
          )}
        </div>
      ) : (
        <>
          {/* Grilla de Productos */}
          <div className="gm-products-grid">
            {visibleProducts.map(product => (
              <ProductCard key={product.id} product={product} openModal={openModal} />
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
                    Ver más ofertas
                  </button>
                  <p className="gm-load-more-hint">
                    Mostrando {visibleCount} de {displayProducts.length}
                  </p>
                </>
              ) : (
                <p className="gm-load-more-hint" style={{color: '#10b981'}}>
                  ✓ Ya no hay más ofertas
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OfertasGrid;