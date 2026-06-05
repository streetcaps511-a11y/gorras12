import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart, useSearch } from '../../../shared/contexts';
import api from '../../../shared/services/api';
import { NitroCache } from '../../../shared/utils/NitroCache';
import { buildInitialInventoryFromProducts } from '../utils/inventory';
import { normalizeSizes, safeImg, normalizeText, formatPrice } from '../utils/helpers';
import { BULK_MIN_QTY, SECTIONS_CONFIG, PLACEHOLDER_IMG } from '../utils/constants';

export const useHome = () => {
  const { addToCart } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const { pathname } = useLocation();

  const [initialProducts, setInitialProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventory, setInventory] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [carouselScrollState, setCarouselScrollState] = useState({});

  const hasFetchedRef = useRef(false);
  const initialProductsRef = useRef(initialProducts);
  const carouselRefs = useRef({});

  useEffect(() => {
    initialProductsRef.current = initialProducts;
  }, [initialProducts]);

  useEffect(() => {
    const fetchProductos = async (isFocus = false) => {
      if (initialProductsRef.current.length > 0 && !initialProductsRef.current[0]?.id) {
        NitroCache.clear('home_productos');
      }
      if (!isFocus && hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        if (isFocus) NitroCache.clear('home_productos');
        
        const response = await api.get(`/api/productos`);
        // ✅ CORRECCIÓN: Acceso seguro a response.data
        const resData = response?.data;

        // ✅ CORRECCIÓN: Validar que resData exista y tenga el formato esperado
        if (resData?.status === 'success' && resData?.data?.products) {
          const productosDatabase = resData.data.products.map((product) => ({
            id: product.id,
            nombre: product.nombre,
            categoria: product.categoria || 'Gorra',
            precio: Number(product.precio || 0),
            precioOferta: product.precioOferta ? Number(product.precioOferta) : null,
            precioMayorista6: Number(product.precioMayorista6 || 0),
            precioMayorista80: Number(product.precioMayorista80 || 0),
            enOferta: product.enOferta || (product.precioOferta !== null && product.precioOferta < product.precio),
            porcentajeDescuento: product.porcentajeDescuento || null,
            descripcion: product.descripcion || "",
            tallas: product.tallasDisponibles || [],
            colores: product.colores || ["Negro"],
            imagenes: product.imagenes || (product.imagen ? [product.imagen] : []),
            imagen: product.imagen || (product.imagenes?.[0]) || '',
            destacado: !!product.destacado,
            sales: product.sales || product.salesCount || 0,
            stock: Number(product.stock || 0),
            tallasStock: product.tallasStock || [],
            isActive: product.isActive !== false,
          }));

          setInitialProducts(productosDatabase);
          NitroCache.set('home_productos', productosDatabase);
        } else {
           console.warn("Formato de respuesta inesperado:", resData);
        }
      } catch (error) {
        console.warn("Error al cargar productos: ", error.message);
      }
    };

    fetchProductos();

    const syncChannel = new BroadcastChannel('app_sync');
    syncChannel.onmessage = (event) => {
      if (event.data === 'productos_updated' || event.data === 'home_products_updated') {
        fetchProductos(true);
      }
    };

    const handleFocus = () => fetchProductos(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      syncChannel.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Clear stale Home cache so fresh data loads
  useEffect(() => {
    try {
      const raw = localStorage.getItem('home_productos');
      if (raw) {
        localStorage.removeItem('home_productos');
        localStorage.removeItem('nitro_cache_v29_home_productos');
      }
    } catch  {
      // Bloque catch seguro
    }
  }, []);

  useEffect(() => {
    if (initialProducts.length > 0) {
      const inv = buildInitialInventoryFromProducts(initialProducts);
      setInventory(inv);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(null);
      setQuantity(1);
      setShowSizeError(false);
    }
  }, [selectedProduct]);

  // Cargar información completa del producto seleccionado para validación de tallas
  useEffect(() => {
    if (!selectedProduct) return;
    // Si ya tiene tallasStock completo, no hace falta fetch
    if (Array.isArray(selectedProduct.tallasStock) && selectedProduct.tallasStock.length > 0 && selectedProduct.descripcion) return;
    
    let isMounted = true;
    const fetchFullProduct = async () => {
      try {
        const response = await api.get(`/api/productos/${selectedProduct.id}`);
        if (response?.data?.data && isMounted) {
          setSelectedProduct(prev => {
            if (prev?.id === response.data.data.id) {
              return { ...prev, ...response.data.data };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Error fetching full product details in useHome hook:", err);
      }
    };
    fetchFullProduct();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = normalizeText(searchTerm);
    return initialProducts.filter((p) => {
      if (!p.isActive) return false;
      return (
        normalizeText(p.nombre).includes(query) ||
        normalizeText(p.categoria).includes(query) ||
        (p.descripcion && normalizeText(p.descripcion).includes(query))
      );
    });
  }, [searchTerm, initialProducts]);

  const sectionsData = useMemo(() => {
    return SECTIONS_CONFIG.map(section => ({
      ...section,
      data: section.filter ? section.filter(initialProducts) : []
    }));
  }, [initialProducts]);

  const handleScroll = useCallback((id) => {
    const el = carouselRefs.current[id];
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 10;
    const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 10;
    setCarouselScrollState(prev => ({
      ...prev,
      [id]: { canScrollLeft, canScrollRight }
    }));
  }, []);

  const handleCarouselScroll = useCallback((section, direction) => {
    const container = carouselRefs.current[section];
    if (!container) return;
    const slot = container.querySelector('.gm-slot');
    if (!slot) return;
    const scrollAmount = slot.offsetWidth;
    const currentScroll = container.scrollLeft;
    const targetScroll = direction === "left"
      ? Math.max(0, currentScroll - scrollAmount)
      : currentScroll + scrollAmount;
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setTimeout(() => handleScroll(section), 800);
  }, [handleScroll]);

  const addQuickToCart = (product, size, qty) => {
    if (!size) return;
    const q = parseInt(qty) || 0;
    
    let finalPrice = product.precioOferta 
      ? Math.round(product.precioOferta) 
      : Math.round(product.precio || 0);

    if (q >= 80 && parseFloat(product.precioMayorista80) > 0) {
      finalPrice = Math.round(product.precioMayorista80);
    } else if (q >= 6 && parseFloat(product.precioMayorista6) > 0) {
      finalPrice = Math.round(product.precioMayorista6);
    }

    const cartItem = {
      id: product.id,
      id_producto: product.id,
      nombre: product.nombre,
      name: product.nombre,
      imagen: safeImg(product),
      image: safeImg(product),
      categoria: product.categoria,
      categoria_nombre: product.categoria,
      precio: finalPrice,
      precio_normal: Math.round(product.precio || 0),
      precioNormal: Math.round(product.precio || 0),
      precioOferta: product.precioOferta ? Math.round(product.precioOferta) : null,
      precio_descuento: product.precioOferta ? Math.round(product.precioOferta) : null,
      precioMayorista6: product.precioMayorista6,
      precioMayorista80: product.precioMayorista80,
      enOfertaVenta: !!product.enOferta,
      oferta: !!product.enOferta,
      has_discount: !!product.enOferta,
      quantity: q,
      talla: size,
      tallasStock: product.tallasStock || [],
      stock: parseInt(product.stock) || 0
    };

    addToCart(cartItem);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    setSelectedProduct(null);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
    setShowSizeError(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
      setQuantity(0);
    } else {
      setSelectedSize(talla);
      setQuantity(1);
      setShowSizeError(false);
    }
  };

  const handleQuantityChange = (val) => {
    if (val === '' || val === null || val === undefined) {
      setQuantity('');
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setQuantity('');
      return;
    }
    if (num > 0) {
      setQuantity(num);
    }
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    const sizesForModal = normalizeSizes(selectedProduct);
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    const size = selectedSize || sizesForModal[0] || "Única";
    const q = parseInt(quantity) || 0;
    if (q <= 0) return;

    addQuickToCart(selectedProduct, size, q);
  };

  const incrementQuantity = () => {
    const sizesForModal = selectedProduct ? normalizeSizes(selectedProduct) : [];
    if (!selectedSize && sizesForModal.length > 0) {
      setShowSizeError(true);
      return;
    }
    const current = parseInt(quantity) || 0;
    setQuantity(current + 1);
  };

  const decrementQuantity = () => {
    const current = parseInt(quantity) || 0;
    if (current > 1) {
      setQuantity(current - 1);
    } else {
      setQuantity(1);
    }
  };

  return {
    initialProducts,
    selectedProduct,
    setSelectedProduct,
    inventory, // Se devuelve por compatibilidad, pero Home.jsx usará el local
    selectedSize,
    quantity,
    showSuccessToast,
    showSizeError,
    carouselScrollState,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    sectionsData,
    carouselRefs,
    handleScroll,
    handleCarouselScroll,
    closeModal,
    handleSizeSelect,
    handleQuantityChange,
    handleModalAddToCart,
    incrementQuantity,
    decrementQuantity,
    normalizeSizes,
    safeImg,
    formatPrice,
    BULK_MIN_QTY,
    PLACEHOLDER_IMG,
  };
};