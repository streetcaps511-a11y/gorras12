import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductCard from './ProductCard'; // Ajusta la ruta si es necesario
import '../styles/Home.css';

const Carousel = ({
  id, title, items, link, showSeeAllCard,
  carouselRefs, carouselScrollState, handleScroll, handleCarouselScroll, onOpenDetail
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (handleScroll) handleScroll(id);
    }, 200);
    return () => clearTimeout(timer);
  }, [items, id, handleScroll]);

  if (!items || items.length === 0) return null;
  
  const displayItems = showSeeAllCard ? items.slice(0, 7) : items.slice(0, 8);

  const canScrollLeft = carouselScrollState[id]?.canScrollLeft ?? false;
  const canScrollRight = carouselScrollState[id]?.canScrollRight ?? (items.length > 1);

  return (
    <div className="gm-home-section">
      <div className="gm-home-header">
        <h2 className="gm-home-title">{title}</h2>
        {link && (
          <Link to={link} className="gm-home-pill">
            <span>Ver todos</span> <FaArrowRight size={13} />
          </Link>
        )}
      </div>
      
      <div className="gm-carousel-wrapper">
        <button
          className={`gm-arrow gm-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
          onClick={() => handleCarouselScroll(id, 'left')}
          disabled={!canScrollLeft}
          aria-label="Anterior" type="button"
        >
          <FaChevronLeft size={18} />
        </button>

        <div className="gm-carousel" ref={el => carouselRefs.current[id] = el} onScroll={() => handleScroll(id)}>
          {displayItems.map((product, index) => (
            <div key={product.id || `p-${index}`} className="gm-slot">
              <ProductCard 
                product={product} 
                onOpenDetail={onOpenDetail} // <--- PASAMOS LA PROP
              />
            </div>
          ))}
          {showSeeAllCard && link && (
            <Link to={link} className="gm-slot gm-card-see-all">
              <div className="gm-see-all-content">
                <div className="gm-see-all-icon"> <FaArrowRight size={18} /> </div>
                <h3>Ver todos</h3>
                <p>Ver toda la colección</p>
              </div>
            </Link>
          )}
        </div>

        <button
          className={`gm-arrow gm-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
          onClick={() => handleCarouselScroll(id, 'right')}
          disabled={!canScrollRight}
          aria-label="Siguiente" type="button"
        >
          <FaChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Carousel;