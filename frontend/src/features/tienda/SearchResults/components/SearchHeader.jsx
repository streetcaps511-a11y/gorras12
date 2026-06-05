/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import '../styles/SearchResults.css';

const SearchHeader = ({ searchTerm, resultsCount, navigate, handleSearch }) => {
  const [query, setQuery] = useState(searchTerm || '');

  useEffect(() => {
    setQuery(searchTerm || '');
  }, [searchTerm]);

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (handleSearch) {
      handleSearch(trimmed);
    } else if (navigate) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="sr-header">
      <div className="sr-header-content">
        <div className="sr-search-icon-box">
          <FaSearch />
        </div>
        <div className="sr-header-text">
          <h1 className="sr-title">Resultados de Búsqueda</h1>
          <p className="sr-subtitle">
            {searchTerm ? (
              <>
                Mostrando resultados para: <span className="sr-term-highlight">&quot;{searchTerm}&quot;</span>
              </>
            ) : (
              'Ingresa un término de búsqueda para encontrar productos'
            )}
          </p>
        </div>
      </div>

      <form className="sr-search-form" onSubmit={onSubmit}>
        <input
          type="text"
          className="sr-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar gorras..."
          aria-label="Buscar productos"
        />
        <button type="submit" className="sr-search-submit">
          Buscar
        </button>
      </form>

      <div className="sr-stats-row">
      <div className="sr-count">
        <span>{resultsCount}</span>
        {resultsCount === 1 ? 'producto encontrado' : 'productos encontrados'}
      </div>
      <div className="sr-header-actions">
        <button onClick={() => navigate('/search')} className="sr-new-search-btn">
          <FaEye /> Nueva Búsqueda
        </button>
        <Link to="/" className="sr-back-btn">
          <FaTimes /> Volver al Inicio
        </Link>
      </div>
    </div>
  </div>
);
};

export default SearchHeader;
