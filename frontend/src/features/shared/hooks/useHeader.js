/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch, useAuth, useCart } from "../contexts";
import api from '../services/api';
import { NitroCache } from "../utils/NitroCache";

/**
 * Custom hook to manage all Header component logic
 */
export const useHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: onLogout, isStaff } = useAuth();
  const { 
    cartItems, 
    cartItemCount, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Contexto global de búsqueda
  const { searchTerm: globalSearchTerm, setSearchTerm: setGlobalSearch } = useSearch();

  useEffect(() => {
    if (globalSearchTerm !== searchTerm) {
      setSearchTerm(globalSearchTerm || "");
    }
  }, [globalSearchTerm, searchTerm]);

  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const cartRef = useRef(null);
  const cartScrollRef = useRef(null);



  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const closeMenu = (e) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        !userButtonRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [isUserMenuOpen]);

  // Cerrar carrito al hacer clic fuera
  useEffect(() => {
    const closeCart = (e) => {
      if (isCartOpen && cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false);
        setShowClearCartConfirm(false);
      }
    };
    if (isCartOpen) document.addEventListener("mousedown", closeCart);
    return () => document.removeEventListener("mousedown", closeCart);
  }, [isCartOpen]);

  // Cerrar menú móvil al hacer clic en un link
  useEffect(() => {
    if (isMenuOpen) {
      const closeMobileMenu = () => setIsMenuOpen(false);
      const links = document.querySelectorAll('.mobile-menu-link');
      links.forEach(link => link.addEventListener('click', closeMobileMenu));
      return () => {
        links.forEach(link => link.removeEventListener('click', closeMobileMenu));
      };
    }
  }, [isMenuOpen]);

  // Manejar overflow del body cuando hay modales/menús abiertos
  useEffect(() => {
    if (isMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isCartOpen]);

  const increaseQuantity = (id, talla) => {
    const item = cartItems.find(i => String(i.id) === String(id) && String(i.talla || '') === String(talla || ''));
    if (item) updateQuantity(id, talla, (item.quantity || 1) + 1);
  };

  const decreaseQuantity = (id, talla) => {
    const item = cartItems.find(i => String(i.id) === String(id) && String(i.talla || '') === String(talla || ''));
    if (item) {
      const newQty = (item.quantity || 1) - 1;
      if (newQty <= 0) {
        removeFromCart(id, talla);
      } else {
        updateQuantity(id, talla, newQty);
      }
    }
  };

  const handleCartQuantityInput = (id, talla, val) => {
    if (val === '' || val === null || val === undefined) return;
    const cleanVal = val.toString().replace(/\D/g, "");
    if (cleanVal === "") return;
    const num = parseInt(cleanVal, 10);
    if (!isNaN(num) && num > 0) {
      updateQuantity(id, talla, num);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearCartConfirm(false);
  };

  const handleClearCartClick = () => {
    if (cartItems.length === 0) return;
    setShowClearCartConfirm(true);
  };

  const cancelClearCart = () => {
    setShowClearCartConfirm(false);
  };

  const getItemPrice = (item) => {
    const qty = Number(item.quantity) || 1;

    // Precio normal y precio de oferta
    const base  = Number(item.precioNormal || item.precio_normal || item.precio || 0);
    const offer = Number(item.precioOferta ?? item.precio_descuento ?? 0);

    // Detectar oferta: flag explícito O precio menor al normal
    const isOffer = !!(item.enOfertaVenta || item.oferta || item.has_discount || item.is_oferta)
                 || (offer > 0 && offer < base);

    // Precio unitario correcto
    let current = isOffer && offer > 0 ? offer : base;

    // Mayorista (sync con CartContext)
    const p6  = Number(item.precio_mayorista6  || item.precioMayorista6  || 0);
    const p80 = Number(item.precio_mayorista80 || item.precioMayorista80 || 0);
    if (qty >= 80 && p80 > 0) return p80;
    if (qty >= 6  && p6  > 0) return p6;

    return current;   // ← ya tiene el precio de oferta si aplica
  };

  const getItemImage = (item) => {
    if (item.imagen && item.imagen.trim() !== '') return item.imagen;
    if (item.imagenes && item.imagenes.length > 0) return item.imagenes[0];
    if (item.image && item.image.trim() !== '') return item.image;
    return 'https://placehold.co/50x50/1E293B/FFC107?text=GM';
  };

  const getItemName = (item) => {
    return item.nombre?.trim() || item.name?.trim() || 'Producto sin nombre';
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setGlobalSearch(value);

    // Cancelar el timeout anterior si el usuario sigue escribiendo (Debounce)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await api.get(`/api/productos?search=${encodeURIComponent(value)}&compact=true&limit=6`);
          const prods = Array.isArray(response.data) ? response.data : (response.data?.data?.products || []);
          setSearchResults(prods);

          const path = location.pathname;
          const isCatalogView = path === '/' || 
                                path.startsWith('/productos') || 
                                path.startsWith('/ofertas') || 
                                path.startsWith('/categorias');

          setShowSearchDropdown(!isCatalogView && prods.length > 0);
        } catch (error) {
          console.error('Error buscando productos:', error);
          setSearchResults([]);
        }
      }, 400); // Esperar 400ms después de que el usuario deje de escribir
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query.length > 0) {
      setShowSearchDropdown(false);
      setIsMenuOpen(false);
      setSearchResults([]);

      const path = location.pathname;
      const isCatalogView = path === '/' || 
                            path.startsWith('/productos') || 
                            path.startsWith('/ofertas') || 
                            path.startsWith('/categorias');

      if (!isCatalogView) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setGlobalSearch('');
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const handleImageError = (e) => {
    e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/1E293B/FFC107?text=GM';
  };

  return {
    user,
    isStaff,
    onLogout,
    cartItems,
    cartItemCount,
    cartTotal,
    removeFromCart,
    isMenuOpen,
    setIsMenuOpen,
    isCartOpen,
    setIsCartOpen,
    searchTerm,
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
  };
};

export default useHeader;
