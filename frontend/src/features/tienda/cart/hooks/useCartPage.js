/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useCart } from '../../../shared/contexts';
import { PAYMENT_METHODS } from '../components/CheckoutModal';
import * as cartApi from '../services/cartApi';
import * as profileApi from '../../Profile/services/profileApi';

export const useCartPage = () => {
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity: updateCartQuantity, 
    removeFromCart: removeFromCartContext, 
    clearCart,
    cartTotal: total
  } = useCart();
  const subtotal = total;

  const [centerAlert, setCenterAlert] = useState({ visible: false, message: '', type: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, talla: null });
  const [productToDeleteName, setProductToDeleteName] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuthConfirm, setShowAuthConfirm] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deliveryType, setDeliveryType] = useState('envio');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.Direccion || user?.direccion || user?.address || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.Telefono || user?.telefono || user?.telefono_db || user?.phone || '');
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Asegurar que se pre-llene si el usuario se carga después del montaje
  useEffect(() => {
    if (user) {
      setDeliveryAddress(prev => prev || user.Direccion || user.direccion || user.address || '');
      setDeliveryPhone(prev => prev || user.Telefono || user.telefono || user.telefono_db || user.phone || '');
      
      // Si todavía faltan datos, intentar buscar el perfil completo
      const fetchProfile = async () => {
        try {
          const perfil = await profileApi.getMiPerfil();
          if (perfil) {
            const pData = Array.isArray(perfil) ? perfil[0] : perfil;
            setDeliveryAddress(prev => prev || pData.direccion || pData.Direccion || pData.address || '');
            setDeliveryPhone(prev => prev || pData.telefono || pData.Telefono || pData.telefono_db || '');
          }
        } catch (err) {
          console.error("Error cargando perfil en checkout:", err);
        }
      };
      
      fetchProfile();
    }
  }, [user]);

  // Texto dinámico de envío
  const getShippingText = () => {
    if (deliveryType === 'recoger') return 'no aplica (recogida)';
    if (!selectedPaymentMethod) return '';
    const method = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
    if (method?.group === 'upfront') return 'no incluido';
    if (method?.group === 'delivery') return 'al recibir (efectivo)';
    return '';
  };

  const handleRemoveFromCart = (productId, talla, productName) => {
    setItemToDelete({ id: productId, talla });
    setProductToDeleteName(`${productName}${talla ? ` (${talla})` : ''}`);
    setShowDeleteConfirm(true);
  };

  const confirmRemoveFromCart = () => {
    removeFromCartContext(itemToDelete.id, itemToDelete.talla);
    setShowDeleteConfirm(false);
  };

  const cancelRemoveFromCart = () => {
    setShowDeleteConfirm(false);
  };

  const getStockForSize = (item) => {
    try {
      const rawStock = item.tallasStock || item.tallas_stock;
      const globalStock = parseInt(item.stock || item.enInventario || 0);

      if (!rawStock) return globalStock;
      
      const stockArray = Array.isArray(rawStock) 
        ? rawStock 
        : (typeof rawStock === 'string' ? JSON.parse(rawStock) : []);
      
      if (!Array.isArray(stockArray) || stockArray.length === 0) {
        return globalStock;
      }

      const found = stockArray.find(s => 
        String(s.talla || '').trim().toLowerCase() === String(item.talla || '').trim().toLowerCase()
      );
      
      if (found) return parseInt(found.cantidad) || 0;
      
      // Si existe el array pero no la talla, devolvemos 0 porque la talla no existiría en inventario
      return 0;
    } catch {
      return parseInt(item.stock) || 0;
    }
  };

  const updateQuantity = (productId, talla, change) => {
    const item = cartItems.find(i => String(i.id) === String(productId) && String(i.talla) === String(talla));
    if (item) {
      const stock = getStockForSize(item);
      const currentQty = parseInt(item.quantity) || 1;
      let newQty = currentQty + change;
      
      if (newQty > stock) {
        newQty = stock;
      }
      
      if (newQty < 0) newQty = 0;
      updateCartQuantity(productId, talla, newQty);
    }
  };

  const handleManualQuantity = (productId, talla, val) => {
    const item = cartItems.find(i => String(i.id) === String(productId) && String(i.talla) === String(talla));
    if (!item) return;

    const raw = parseInt(val, 10);
    // Permite el 0 y el borrado (vacío)
    let newQty = Number.isNaN(raw) ? 0 : Math.max(0, raw);
    
    const stock = getStockForSize(item);
    if (newQty > stock) {
      newQty = stock;
    }
    
    updateCartQuantity(productId, talla, newQty);
  };

  const handleClearCart = () => setShowClearConfirm(true);

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleFinishPurchase = () => {
    if (cartItems.length === 0) {
      setCenterAlert({ visible: true, message: 'El carrito está vacío', type: 'error' });
      return;
    }

    if (!user) {
      setShowAuthConfirm(true);
      return;
    }

    // Verificar que ningún item tenga cantidad 0 o vacía
    const hasEmptyQty = cartItems.some(i => !parseInt(i.quantity) || parseInt(i.quantity) <= 0);
    if (hasEmptyQty) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    setShowCheckout(true);
  };

  const cancelCheckout = () => setShowCheckout(false);
  const cancelAuthConfirm = () => setShowAuthConfirm(false);
  const confirmAuthRedirect = () => {
    setShowAuthConfirm(false);
    navigate('/login', { state: { from: location } });
  };

  const confirmPurchaseFromCheckout = async () => {
    if (!selectedPaymentMethod) {
      setCenterAlert({ visible: true, message: 'Por favor selecciona un método de pago', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      // Convertir comprobante a Base64 si existe
      let comprobanteBase64 = null;
      if (receiptFile) {
        comprobanteBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(receiptFile);
        });
      }

      const orderData = {
        productos: cartItems.map(item => ({
          idProducto: item.id,
          nombre: item.nombre,
          cantidad: item.quantity,
          precio: getProductPrice(item),
          talla: item.talla || 'UNICA'
        })),
        total,
        subtotal,
        metodoPago: selectedPaymentMethod,
        tipoEntrega: deliveryType,
        direccionEnvio: deliveryType === 'envio' ? deliveryAddress : 'Recogida en local',
        telefono: deliveryPhone || user?.telefono_db || user?.telefono,
        idCliente: user?.id,
        comprobante: comprobanteBase64
      };

      const result = await cartApi.createPedido(orderData);
      
      // La API devuelve directamente los datos del pedido o un objeto con success
      if (result) {
        setInvoiceData(result.data || result);
        setShowCheckout(false);
        clearCart();
        // Mostrar alerta de éxito
        setCenterAlert({ visible: true, message: '¡Su pedido ha sido registrado con éxito!', type: 'success' });
        // Después de 2 segundos (cuando se auto-cierra CenterAlert), mostrar el modal final
        setTimeout(() => {
          setShowFinalMessage(true);
        }, 2000);
      } else {
        setCenterAlert({ visible: true, message: 'Error al procesar el pedido', type: 'error' });
      }
    } catch (error) {
      console.error('Error al finalizar compra:', error);
      const msg = error?.response?.data?.message || error?.message || 'Ocurrió un error inesperado al procesar tu compra';
      setCenterAlert({ visible: true, message: msg, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeInvoice = () => {
    setShowInvoice(false);
    setShowFinalMessage(true);
  };

  const finishAll = () => {
    setShowFinalMessage(false);
    navigate('/');
  };

  const getPriceInfo = (item) => {
    const isOffer = (item.has_discount || item.hasDiscount || item.oferta) && item.precioOferta;
    const qty = parseInt(item.quantity) || 1;
    
    let currentPrice = isOffer ? item.precioOferta : item.precio;
    if (qty >= 80 && parseFloat(item.precioMayorista80) > 0) currentPrice = item.precioMayorista80;
    else if (qty >= 6 && parseFloat(item.precioMayorista6) > 0) currentPrice = item.precioMayorista6;

    return {
      currentPrice,
      originalPrice: item.precio,
      isOffer,
      isWholesale: qty >= 6
    };
  };

  const getProductName = (item) => {
    return item?.nombre || 'Producto';
  };

  const getProductPrice = (item) => {
    if (!item) return 0;
    return getPriceInfo(item).currentPrice;
  };

  return {
    user,
    cartItems,
    total,
    subtotal,
    centerAlert,
    setCenterAlert,
    isProcessing,
    showClearConfirm,
    setShowClearConfirm,
    showDeleteConfirm,
    setShowDeleteConfirm,
    productToDeleteName,
    showInvoice,
    showCheckout,
    invoiceData,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    setDeliveryAddress,
    deliveryPhone,
    setDeliveryPhone,
    receiptFile,
    setReceiptFile,
    selectedDetailProduct,
    setSelectedDetailProduct,
    showFinalMessage,
    showErrors,
    getShippingText,
    handleRemoveFromCart,
    confirmRemoveFromCart,
    cancelRemoveFromCart,
    updateQuantity,
    handleManualQuantity,
    handleClearCart,
    confirmClearCart,
    handleFinishPurchase,
    cancelCheckout,
    confirmPurchaseFromCheckout,
    cancelAuthConfirm,
    confirmAuthRedirect,
    showAuthConfirm,
    closeInvoice,
    closeFinalMessage: finishAll,
    getPriceInfo,
    getStockForSize,
    getProductName,
    getProductPrice,
    getImageUrl: (item) => {
      let img = item?.imagen || item?.imagenes?.[0] || item?.image || '';
      if (typeof img === 'string') {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        if (img.startsWith('/uploads')) {
          return `${baseUrl}${img}`;
        }
        if (img.includes('urlmovil-1.onrender.com')) {
          return img.replace('https://urlmovil-1.onrender.com', baseUrl);
        }
      }
      return img || 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraazultodaNY_cyfchf.jpg';
    },
    handleImageError: (e) => {
      e.target.onerror = null; e.target.src = 'https://placehold.co/300x300?text=No+Imagen';
    },
    getProductCategory: (item) => {
      return item?.categoria || item?.Categorium?.nombre || 'General';
    }
  };
};
