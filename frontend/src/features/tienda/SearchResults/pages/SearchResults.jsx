/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React from 'react';
import { useSearchResults } from '../hooks/useSearchResults';
import SearchHeader from '../components/SearchHeader';
import SearchResultCard from '../components/SearchResultCard';
import SearchEmptyState from '../components/SearchEmptyState';
import '../styles/SearchResults.css';

const SearchResults = () => {
  const {
    results,
    loading,
    searchTerm,
    suggestions,
    hasSearched,
    toast,
    handleAddToCart,
    handleSearch,
    navigate
  } = useSearchResults();

  if (loading) {
    return (
      <div className="sr-loading">
        <div className="sr-loading-icon">🔍</div>
        <h2 className="sr-empty-title">Buscando productos...</h2>
        <p className="sr-empty-text">Estamos buscando &quot;{searchTerm}&quot; en nuestro catálogo</p>
        <div className="sr-spinner" />
      </div>
    );
  }

  return (
    <div className="sr-page">
      <SearchHeader
        searchTerm={searchTerm}
        resultsCount={results.length}
        navigate={navigate}
        handleSearch={handleSearch}
      />

      {results.length > 0 ? (
        <div className="sr-products-grid">
          {results.map((product, index) => (
            <SearchResultCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              index={index}
            />
          ))}
        </div>
      ) : (
        <SearchEmptyState
          searchTerm={searchTerm}
          suggestions={suggestions}
          hasSearched={hasSearched}
          handleSearch={handleSearch}
        />
      )}


      {toast.open && (
        <div className="sr-toast">{toast.text}</div>
      )}
    </div>
  );
};

export default SearchResults;
