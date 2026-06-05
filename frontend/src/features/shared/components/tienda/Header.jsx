/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/Header.css';
// src/components/Header.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaShoppingCart, FaUser, FaSearch, FaTimes, FaTrash,
  FaHome, FaTags, FaFire, FaSignInAlt, FaPlus, FaMinus, FaBars,
  FaTrashAlt, FaBox, FaExclamationTriangle
} from "react-icons/fa";
import UserMenu from "./UserMenu";
import useHeader from "../../hooks/useHeader";
import { ConfirmModal } from "../../../tienda/Profile/components/ProfileModals";

const Header = () => {
  const {
    user,
    isStaff,
    cartItems,
    cartItemCount,
    cartTotal,
    isMenuOpen,
    setIsMenuOpen,
    isCartOpen,
    setIsCartOpen,
    searchTerm,
    setSearchTerm,
    showClearCartConfirm,
    setShowClearCartConfirm,
    isUserMenuOpen,
    setIsUserMenuOpen,
    searchResults,
    showSearchDropdown,
    setShowSearchDropdown,
    userMenuRef,
    userButtonRef,
    cartRef,
    cartScrollRef,
    increaseQuantity,
    decreaseQuantity,
    handleCartQuantityInput,
    removeFromCart,
    handleClearCart,
    handleClearCartClick,
    cancelClearCart,
    getItemPrice,
    getItemImage,
    getItemName,
    handleSearchChange,
    handleSearchSubmit,
    handleClearSearch,
    handleImageError,
    handleLogoutClick,
    showLogoutConfirm,
    confirmLogout,
    cancelLogout,
    navigate
  } = useHeader();
  const location = useLocation();

  // Estado LOCAL para mostrar el input de cantidad de forma independiente
  const [quantityDisplays, setQuantityDisplays] = React.useState({});

  // Sincronizar el display cuando cambia el carrito externamente (ej: botones + / -)
  React.useEffect(() => {
    const newDisplays = {};
    cartItems.forEach(item => {
      const key = `${item.id}_${item.talla}`;
      const inputEl = document.getElementById(`input-qty-${key}`);
      if (inputEl && document.activeElement === inputEl) {
        newDisplays[key] = quantityDisplays[key] !== undefined ? quantityDisplays[key] : String(item.quantity);
      } else {
        newDisplays[key] = item.quantity === 0 ? '' : String(item.quantity);
      }
    });
    setQuantityDisplays(newDisplays);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <header className="header-container">
        <div className="header-inner">
          <Link to="/" className="logo-link">
            <img src="/logo.png" className="logo-img" alt="Logo GM CAPS" />
          </Link>

          <button
            className="header-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <nav className="header-nav">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <FaHome size={14} /> <span>Inicio</span>
            </Link>

            <Link to="/productos" className={`nav-link ${isActive('/productos') ? 'active' : ''}`}>
              <FaBox size={14} /> <span>Productos</span>
            </Link>

            <Link to="/categorias" className={`nav-link ${isActive('/categorias') ? 'active' : ''}`}>
              <FaTags size={14} /> <span>Categorías</span>
            </Link>

            <Link to="/ofertas" className={`nav-link ${isActive('/ofertas') ? 'active' : ''}`}>
              <FaFire size={14} /> <span>Ofertas</span>
            </Link>

            <form className="header-search" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <FaSearch className="search-icon-inside" />
                <input
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setShowSearchDropdown(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
                  placeholder="Buscar gorras..."
                  aria-label="Buscar productos"
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear-button"
                    onClick={handleClearSearch}
                    aria-label="Limpiar búsqueda"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Dropdown de resultados en tiempo real */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((product, index) => (
                    <div
                      key={product.id || index}
                      className="search-result-item"
                      onClick={() => {
                        const query = product.nombre || product.name || '';
                        setShowSearchDropdown(false);
                        setSearchTerm(query);
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                      }}
                    >
                      <img 
                        src={getItemImage(product)} 
                        className="search-result-image" 
                        alt={product.nombre || product.name}
                        onError={handleImageError}
                      />
                      <div className="search-result-info">
                        <p className="search-result-name">{product.nombre || product.name}</p>
                        <p className="search-result-price">${getItemPrice(product).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            <div style={{ position: "relative" }} ref={cartRef}>
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)} 
                className="icon-button"
                aria-label={`Carrito (${cartItemCount} items)`}
              >
                <FaShoppingCart />
                {cartItemCount > 0 && (
                  <span className="badge-count">{cartItemCount}</span>
                )}
              </button>

              {isCartOpen && (
                <div className="cart-panel-responsive">
                  <div className="cart-header">
                    <div className="cart-header-left">
                      <h4 className="cart-title">Carrito ({cartItemCount})</h4>
                      {cartItems.length > 0 && (
                        <button 
                          onClick={handleClearCartClick}
                          className="clear-cart-btn"
                          aria-label="Vaciar carrito"
                          title="Vaciar carrito"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        setShowClearCartConfirm(false);
                      }} 
                      className="close-button"
                      aria-label="Cerrar carrito"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {showClearCartConfirm && (
                    <div className="clear-cart-confirm">
                      <p className="confirm-text">¿Estás seguro de que quieres vaciar el carrito?</p>
                      <div className="confirm-buttons">
                        <button onClick={handleClearCart} className="confirm-yes-btn">Sí, vaciar</button>
                        <button onClick={cancelClearCart} className="confirm-no-btn">Cancelar</button>
                      </div>
                    </div>
                  )}

                  <div ref={cartScrollRef} className="cart-items-container cart-scroll-invisible">
                    {cartItems.length === 0 ? (
                      <div className="empty-cart">
                        <p className="empty-cart-text">Tu carrito está vacío</p>
                      </div>
                    ) : (
                      cartItems.map((item, index) => (
                        <div key={item.id || index} className="cart-item">
                          <img 
                            src={getItemImage(item)} 
                            className="cart-item-image" 
                            alt={getItemName(item)}
                            onError={handleImageError}
                          />

                          <div className="cart-item-info" style={{ minWidth: 0 }}>
                            <p className="cart-item-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getItemName(item)}</p>
                          
                            <div className="cart-item-controls">
                              <div className="quantity-controls">
                                <button 
                                  onClick={() => decreaseQuantity(item.id, item.talla)} 
                                  className="qty-btn"
                                  aria-label="Disminuir"
                                >
                                  <FaMinus size={10} />
                                </button>
                                <input
                                   id={`input-qty-${item.id}_${item.talla}`}
                                   type="number"
                                   className="quantity-text"
                                   value={quantityDisplays[`${item.id}_${item.talla}`] ?? (item.quantity === 0 ? '' : item.quantity)}
                                   onChange={(e) => {
                                     const key = `${item.id}_${item.talla}`;
                                     const raw = e.target.value;
                                     setQuantityDisplays(prev => ({ ...prev, [key]: raw }));
                                   }}
                                   onBlur={(e) => {
                                     const key = `${item.id}_${item.talla}`;
                                     const parsed = parseInt(e.target.value);
                                     const finalQty = isNaN(parsed) ? 0 : Math.max(0, parsed);
                                     handleCartQuantityInput(item.id, item.talla, String(finalQty));
                                     setQuantityDisplays(prev => ({ ...prev, [key]: finalQty === 0 ? '' : String(finalQty) }));
                                   }}
                                   onFocus={(e) => e.target.select()}
                                   style={{
                                     width: '45px',
                                     textAlign: 'center',
                                     background: 'transparent',
                                     border: 'none',
                                     color: 'white',
                                     fontSize: '0.9rem',
                                     outline: 'none'
                                   }}
                                 />
                                <button 
                                  onClick={() => increaseQuantity(item.id, item.talla)} 
                                  className="qty-btn"
                                  aria-label="Aumentar"
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>
                          
                              <div className="price-row">
                                <span className="item-price">
                                  ${(getItemPrice(item) * (item.quantity || 1)).toLocaleString('es-CO')}
                                </span>
                                <button 
                                  onClick={() => removeFromCart(item.id, item.talla)} 
                                  className="remove-btn"
                                  aria-label="Eliminar"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="cart-footer">
                      <div className="total-row">
                        <span className="total-label">Total: </span>
                        <span className="total-amount">${cartTotal.toLocaleString('es-CO')}</span>
                      </div>
                  
                      <Link 
                        to="/carrito" 
                        onClick={() => {
                          setIsCartOpen(false);
                          setShowClearCartConfirm(false);
                        }} 
                        className="view-cart-btn"
                      >
                        Ver Carrito Completo
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  ref={userButtonRef}
                  onClick={() => {
                    if (isStaff) {
                      navigate('/admin');
                      return;
                    }
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="icon-button"
                  aria-label="Menú de usuario"
                >
                  <FaUser />
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu-responsive" ref={userMenuRef}>
                    <UserMenu 
                      isStaff={isStaff}
                      onLogout={handleLogoutClick} 
                      onClose={() => setIsUserMenuOpen(false)} 
                    />
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                <FaSignInAlt size={14} /> <span style={{ marginLeft: 6 }}>Iniciar sesión</span>
              </Link>
            )}
          </nav>
        </div>

        <div className={`header-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-header">
            <div className="mobile-user-info">
              {user ? (
                <>
                  <div className="mobile-avatar">
                    <FaUser size={20} />
                  </div>
                  <div>
                    <p className="mobile-user-name">{user.nombre || user.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mobile-avatar">
                    <FaUser size={20} />
                  </div>
                  <div>
                    <p className="mobile-user-name">Bienvenido</p>
                  </div>
                </>
              )}
            </div>
          
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="mobile-close-btn"
              aria-label="Cerrar menú"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="search-mobile-container">
            <form onSubmit={handleSearchSubmit} className="search-mobile-form">
              <div className="search-mobile-input-wrapper">
                <FaSearch className="search-mobile-icon-inside" size={14} />
                <input
                  className="search-mobile-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar..."
                  aria-label="Buscar en móvil"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="search-mobile-clear-button" 
                    onClick={handleClearSearch}
                    aria-label="Limpiar"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <nav className="mobile-nav">
            <Link 
              to="/" 
              className={`mobile-menu-link mobile-nav-item ${isActive('/') ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome size={16} className="mobile-nav-icon" /> 
              <span>Inicio</span>
            </Link>
          
            <Link 
              to="/productos" 
              className={`mobile-menu-link mobile-nav-item ${isActive('/productos') ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <FaBox size={16} className="mobile-nav-icon" /> 
              <span>Productos</span>
            </Link>

            <Link 
              to="/categorias" 
              className={`mobile-menu-link mobile-nav-item ${isActive('/categorias') ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTags size={16} className="mobile-nav-icon" /> 
              <span>Categorías</span>
            </Link>
          
            <Link 
              to="/ofertas" 
              className={`mobile-menu-link mobile-nav-item ${isActive('/ofertas') ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <FaFire size={16} className="mobile-nav-icon" /> 
              <span>Ofertas</span>
            </Link>
          
            <Link 
              to="/carrito" 
              className="mobile-menu-link mobile-nav-item" 
              onClick={() => setIsMenuOpen(false)}
            >
              <FaShoppingCart size={16} className="mobile-nav-icon" /> 
              <span>Carrito</span>
              {cartItemCount > 0 && (
                <span className="mobile-badge">{cartItemCount}</span>
              )}
            </Link>
          </nav>

          <div className="user-mobile-section">
            {user ? (
              <>
                <Link 
                  to={isStaff ? "/admin" : "/perfil"} 
                  className="mobile-menu-link profile-mobile-btn" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser size={14} style={{ marginRight: 10 }} /> 
                  {isStaff ? "Panel Admin" : "Mi Perfil"}
                </Link>
                <button 
                  onClick={handleLogoutClick}
                  className="logout-mobile-btn"
                >
                  <FaSignInAlt size={14} style={{ marginRight: 10 }} /> 
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                className="mobile-menu-link login-mobile-btn" 
                onClick={() => setIsMenuOpen(false)}
              >
                <FaSignInAlt size={16} style={{ marginRight: 10 }} /> 
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 🔥 MODAL DE CIERRE DE SESIÓN PREMIUM */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="logout-modal-title">Confirmar Cierre de Sesión</h2>
            
            <p className="logout-modal-message">
              ¿Estás seguro de que deseas cerrar sesión, <span className="highlight-user">{user?.nombre || user?.email}</span>? 
              <br/>
              <span className="highlight-yellow">¿Deseas continuar?</span>
            </p>

            <div className="logout-modal-actions">
              <button 
                className="logout-modal-btn logout-modal-btn-cancel"
                onClick={cancelLogout}
              >
                Cancelar
              </button>
              <button 
                className="logout-modal-btn logout-modal-btn-confirm"
                onClick={confirmLogout}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
