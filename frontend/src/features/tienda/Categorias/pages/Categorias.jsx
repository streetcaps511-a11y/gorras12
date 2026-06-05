/* === PÁGINA PRINCIPAL ===
Este componente es la interfaz visual principal de la ruta.
Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */
import '../styles/Categorias.css';
import '../styles/CategoryHero.css';
import React from "react";
import { useCategories } from '../hooks/useCategories';
import CategoryCard from '../components/CategoryCard';

const Categorias = () => {
  const {
    // searchQuery,  ← ELIMINADO (no se usaba)
    sortedCategories,
    loading,
    getCategoryImage
  } = useCategories();

  return (
    <div className="gm-home">
      <div className="gm-hero">
        <div className="gm-hero-bg" />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title">Explora Nuestras Categorías</h1>
          <p className="gm-hero-sub">
            Descubre nuestra amplia selección de gorras organizadas por categorías.
            Desde estilos clásicos hasta las últimas tendencias, encuentra la gorra
            perfecta para ti.
          </p>
        </div>
      </div>
      
      <div className="categorias-grid">
        {sortedCategories.length > 0 ? (
          sortedCategories.map((cat, i) => (
            <CategoryCard 
              key={i}
              category={cat}
              imgUrl={getCategoryImage(cat)}
            />
          ))
        ) : !loading ? (
          <div className="gm-no-results">
            No se encontraron categorías.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Categorias;