/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getCategorias, getProductsByCategoryName } from "../services/categoriaApi";
import { useCart } from "../../../shared/contexts";
import { NitroCache } from "../../../shared/utils/NitroCache";

const getPersistentData = (catName) => {
  const cached = NitroCache.get(`cat_v2_${catName}`);
  return cached?.data || null;
};

const setPersistentData = (catName, data) => {
  NitroCache.set(`cat_v2_${catName}`, data);
};

const getCachedProducts = () => {
  // Revisar múltiples claves: catálogo compartido > categorías > home
  const keys = ['gm_catalog', 'tienda_productos', 'home_products'];
  for (const key of keys) {
    const cached = NitroCache.get(key);
    const data = cached?.data;
    if (Array.isArray(data) && data.length > 0) return data;
  }
  return [];
};

export const BULK_MIN_QTY = 6;
export const BULK_DISCOUNT = 0.1;

/* =========================
   HELPERS
   ========================= */
export const clampRating = (r) => {
  const n = Number(r);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
};

export const getRatingFromProduct = (p) =>
  clampRating(p?.rating) ??
  clampRating(p?.calificacion) ??
  clampRating(p?.stars) ??
  clampRating(p?.score) ??
  null;

export const normalizeSizes = (product) => {
  // 1. Usar tallasStock como fuente principal
  if (Array.isArray(product?.tallasStock) && product.tallasStock.length > 0) {
    return product.tallasStock.map(t => t.talla).filter(Boolean);
  }
  const t = product?.tallas;
  if (!t) return [];
  if (Array.isArray(t))
    return t.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  if (typeof t === "string")
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  if (typeof t === "object") return Object.keys(t);
  return [];
};

export const safeImg = (product) => {
  const first =
    product?.imagenes?.[0]?.trim?.() ||
    product?.imagen?.trim?.() ||
    "https://placehold.co/800x800?text=Sin+Imagen";
  return first;
};

export const useCategoriaDetalle = () => {
  const { nombreCategoria } = useParams();
  const { addToCart } = useCart();
  const [productos, setProductos] = useState(() => {
    const cat = decodeURIComponent(nombreCategoria || '').toLowerCase();
    const persistent = getPersistentData(cat);
    // Si existe la key en la caché, la usamos y evitamos parpadeos
    if (persistent !== null) return persistent;

    const cached = getCachedProducts();
    const filtered = cached.filter(p => p.categoria?.toLowerCase() === cat);
    return filtered;
  });
  const [descripcionCategoria, setDescripcionCategoria] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // FILTROS
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [loading, setLoading] = useState(() => {
    const cat = decodeURIComponent(nombreCategoria || '').toLowerCase();
    const persistent = getPersistentData(cat);
    // Si la key existe en la caché, no mostramos loader
    if (persistent !== null) return false;
    
    const cached = getCachedProducts();
    // En catálogo global comprobamos si hay al menos uno. Si no hay, ni modo, debe cargar.
    const hasCat = cached.some(p => p.categoria?.toLowerCase() === cat);
    if (hasCat) return false;
    
    return true; // Solo si no hay DE NADA en memoria ni en local, mostramos loader
  });

  useEffect(() => {
    const categoria = decodeURIComponent(nombreCategoria).toLowerCase();

    // Si ya tenemos persistencia, seteamos (incluso si es [] para evitar flickers de "sin productos")
    const persistent = getPersistentData(categoria);
    if (persistent !== null) {
      setProductos(persistent);
      setLoading(false);
    } else {
      const cached = getCachedProducts();
      if (cached.length > 0) {
        const filtradosCache = cached.filter(
          p => p.categoria?.toLowerCase() === categoria
        );
        if (filtradosCache.length > 0) {
          setProductos(filtradosCache);
          setLoading(false);
        }
      }
    }

    // ⚡ PASO 2: Refrescar en background si es necesario
    const isFresh = NitroCache.isFresh('gm_catalog', 10 * 60 * 1000); // 10 min
    const hasCategoryProducts = productos.length > 0;

    if (isFresh && hasCategoryProducts) {
      window.scrollTo(0, 0);
      return;
    }

    const fetchAndFilter = async () => {
      try {
        const res = await getProductsByCategoryName(categoria);
        const allProducts = res.data?.data?.products || res.data?.data?.rows || [];

        // Descripción en background, sin bloquear
        getCategorias().then(catRes => {
          const allCats = catRes.data?.data || catRes.data || [];
          const found = allCats.find(c => c.nombre?.toLowerCase() === categoria);
          if (found) setDescripcionCategoria(found.descripcion || "");
        }).catch(() => {});

        const mapProduct = p => {
          let totalS = Number(p.stock || 0);
          if (Array.isArray(p.tallasStock) && p.tallasStock.length > 0) {
             totalS = p.tallasStock.reduce((acc, t) => acc + (Number(t.cantidad) || 0), 0);
          }

          return {
            id: p.id,
            nombre: p.nombre,
            categoria: p.categoria || 'Gorra',
            precio: Number(p.precio || p.precioVenta || 0),
            precioOferta: Number(p.precioOferta || 0),
            enOferta: !!p.enOferta,
            descripcion: p.descripcion || "",
            tallas: p.tallas || [],
            colores: p.colores || [],
            imagenes: p.imagenes || [],
            destacado: !!p.destacado,
            sales: p.sales || p.salesCount || 0,
            isActive: p.isActive !== undefined ? p.isActive : true,
            stock: totalS,
            tallasStock: p.tallasStock || [],
            precioMayorista6: p.precioMayorista6 || 0,
            precioMayorista80: p.precioMayorista80 || 0,
          };
        };

        const finalProducts = allProducts.map(mapProduct);
        setProductos(finalProducts);
        
        // Guardar persistencia específica de categoría
        sessionStorage.setItem(`cat_persistent_${categoria}`, JSON.stringify(finalProducts));

        // Guardar en caché persistente de sesión
        setPersistentData(categoria, finalProducts);

        // Guardar en cache compartido
        NitroCache.set('tienda_productos', finalProducts);
        NitroCache.set('gm_catalog', finalProducts);

      } catch (err) {
        console.error("Error fetching products for category:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilter();
    window.scrollTo(0, 0);
  }, [nombreCategoria, productos.length]);

  const sizesForModal = selectedProduct ? normalizeSizes(selectedProduct) : [];

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setQuantity(1);
    setShowSizeError(false);
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
      setShowSizeError(false);
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }
    setQuantity((parseInt(quantity) || 0) + 1);
  };

  const decrementQuantity = () => {
    const qty = parseInt(quantity) || 0;
    if (qty > 1) {
      setQuantity(qty - 1);
    } else {
      setQuantity(1);
    }
  };

  const handleQuantityInput = (val) => {
    if (val === '' || val === null) {
      setQuantity('');
      return;
    }
    
    // Si empieza con 0 y hay más dígitos, quitamos el 0 a la izquierda
    let cleanVal = val.toString().replace(/^0+/, '');
    if (cleanVal === "") cleanVal = "0";

    const num = parseInt(cleanVal, 10);
    if (isNaN(num)) {
      setQuantity(0);
      return;
    }

    setQuantity(num);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (sizesForModal.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    const size = selectedSize || (sizesForModal.length > 0 ? sizesForModal[0] : "Única");
    const q = parseInt(quantity) || 0;
    if (q <= 0) return;

    // Calcular el precio final según la cantidad
    let finalPrice = selectedProduct.precioOferta && selectedProduct.enOferta
                    ? Math.round(selectedProduct.precioOferta) 
                    : Math.round(selectedProduct.precio || 0);

    if (q >= 80 && parseFloat(selectedProduct.precioMayorista80) > 0) {
      finalPrice = Math.round(selectedProduct.precioMayorista80);
    } else if (q >= 6 && parseFloat(selectedProduct.precioMayorista6) > 0) {
      finalPrice = Math.round(selectedProduct.precioMayorista6);
    }

    const cartItem = {
      id: selectedProduct.id,
      id_producto: selectedProduct.id,
      nombre: selectedProduct.nombre,
      name: selectedProduct.nombre,
      imagen: safeImg(selectedProduct),
      image: safeImg(selectedProduct),
      categoria: selectedProduct.categoria,
      categoria_nombre: selectedProduct.categoria,
      precio: finalPrice, 
      precio_normal: Math.round(selectedProduct.precio || 0),
      precioNormal: Math.round(selectedProduct.precio || 0),
      precioOferta: selectedProduct.precioOferta ? Math.round(selectedProduct.precioOferta) : null,
      precio_descuento: selectedProduct.precioOferta ? Math.round(selectedProduct.precioOferta) : null,
      precioMayorista6: selectedProduct.precioMayorista6,
      precio_mayorista6: selectedProduct.precioMayorista6,
      precioMayorista80: selectedProduct.precioMayorista80,
      precio_mayorista80: selectedProduct.precioMayorista80,
      enOfertaVenta: !!selectedProduct.enOferta,
      oferta: !!selectedProduct.enOferta,
      has_discount: !!selectedProduct.enOferta,
      quantity: q,
      talla: size,
      tallasStock: selectedProduct.tallasStock || [],
      stock: parseInt(selectedProduct.stock) || 0
    };

    addToCart(cartItem);

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    closeModal();
  };

  const filteredProductos = useMemo(() => {
    const hasFilters = selectedColors.length > 0 || selectedSizes.length > 0;
    if (!hasFilters) return productos;

    return productos.filter(p => {
      const pColores = Array.isArray(p.colores) ? p.colores : [p.colores || 'Negro'];
      const matchesColor = selectedColors.length === 0 || 
        selectedColors.some(c => pColores.some(pc => String(pc).toLowerCase() === c.toLowerCase()));

      const pTallas = normalizeSizes(p);
      const matchesSize = selectedSizes.length === 0 || 
        selectedSizes.some(s => pTallas.some(pt => String(pt).toLowerCase() === s.toLowerCase()));

      return matchesColor && matchesSize;
    });
  }, [productos, selectedColors, selectedSizes]);

  const allAvailableFilters = useMemo(() => {
    const colors = new Set();
    const sizes = new Set();

    // 🔥 Usamos todos los productos cacheados para que siempre haya filtros visibles
    const allProducts = getCachedProducts();
    const source = allProducts.length > 0 ? allProducts : productos;

    source.forEach(p => {
      const pColores = Array.isArray(p.colores) ? p.colores : [p.colores || 'Negro'];
      pColores.forEach(c => colors.add(c));
      const pTallas = normalizeSizes(p);
      pTallas.forEach(s => sizes.add(s));
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort()
    };
  }, [productos]);

  const toggleFilter = (type, value) => {
    const setters = {
      color: [selectedColors, setSelectedColors],
      size: [selectedSizes, setSelectedSizes]
    };
    if (!setters[type]) return;
    const [current, set] = setters[type];
    if (current.includes(value)) {
      set(current.filter(v => v !== value));
    } else {
      set([...current, value]);
    }
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  return {
    nombreCategoria: decodeURIComponent(nombreCategoria),
    descripcionCategoria,
    productos: filteredProductos,
    initialProductos: productos,
    selectedProduct,
    selectedSize,
    quantity,
    showSizeError,
    showSuccessToast,
    loading,
    sizesForModal,
    handleOpenModal,
    closeModal,
    handleSizeSelect,
    incrementQuantity,
    decrementQuantity,
    handleQuantityInput,
    handleAddToCart,
    getRatingFromProduct,
    safeImg,
    BULK_MIN_QTY,
    // Filtros
    selectedColors,
    selectedSizes,
    allAvailableFilters,
    toggleFilter,
    clearFilters,
    normalizeSizes
  };
};
