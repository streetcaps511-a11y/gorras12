/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaTag } from 'react-icons/fa';
import '../styles/SearchResults.css';

const SearchEmptyState = ({ searchTerm, suggestions, hasSearched, handleSearch }) => {
  if (hasSearched && searchTerm) {
    // No results state
    return (
      <div className="sr-empty-state">
        <div className="sr-empty-icon">🔍</div>
        <h2 className="sr-empty-title">No se encontraron resultados</h2>
        <p className="sr-empty-text">
          No encontramos productos relacionados con &quot;{searchTerm}&quot;.
          Prueba con términos más generales o explora nuestras categorías.
        </p>

        {suggestions.length > 0 && (
          <>
            <p className="sr-empty-text" style={{ fontSize: '14px', marginBottom: '10px' }}>
              Tal vez te interese:
            </p>
            <div className="sr-suggestions-grid">
              {suggestions.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => handleSearch(s)} className="sr-suggestion-btn">
                  <FaTag /> {s}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="sr-categories-section">
          <h3 className="sr-categories-title">Explora por categorías</h3>
          <div className="sr-categories-grid">
            <Link to="/categorias" className="sr-category-card"><span>👕</span><div>Categorías</div></Link>
            <Link to="/ofertas"    className="sr-category-card"><span>🔥</span><div>Ofertas</div></Link>
            <Link to="/nuevos"     className="sr-category-card"><span>🆕</span><div>Nuevos</div></Link>
            <Link to="/destacados" className="sr-category-card"><span>⭐</span><div>Destacados</div></Link>
          </div>
        </div>
      </div>
    );
  }

  // Default empty state (no query)
  return (
    <div className="sr-empty-state">
      <div className="sr-empty-icon">🔍</div>
      <h2 className="sr-empty-title">¿Qué estás buscando?</h2>
      <p className="sr-empty-text">
        Usa la barra de búsqueda para encontrar productos específicos en nuestro catálogo.
        Puedes buscar por nombre, categoría o características.
      </p>
      <div className="sr-suggestions-grid">
        {['Gorras', 'Accesorios', 'Deportes', 'Ropa', 'Ofertas', 'Nuevos'].map((term, i) => (
          <button key={i} onClick={() => handleSearch(term)} className="sr-suggestion-btn">
            <FaSearch /> {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchEmptyState;
