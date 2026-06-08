/* === HOOK DE LÓGICA ===
Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo.
Separa la 'inteligencia' de la interfaz visual para mantener el código limpio.
Recibe eventos de la UI y se comunica con los Servicios API. */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  fetchAllDevoluciones,
  createNewDevolucion,
  updateExistingDevolucion,
  fetchAllClientes,
  fetchAllProductosData,
  deleteDevolucionApi
} from '../services/devolucionesApi';
import { NitroCache } from '../../../shared/utils/NitroCache';

// 🧠 MEMORIA GLOBAL (Caché Nitro) con TTL de 90 segundos
const CACHE_TTL_MS = 90 * 1000;

const getInitialDevs = () => {
  const cached = NitroCache.get('devoluciones');
  return cached?.data || [];
};

const isCacheFresh = () => {
  const cached = NitroCache.get('devoluciones_meta');
  if (!cached?.data?._savedAt) return false;
  return (Date.now() - cached.data._savedAt) < CACHE_TTL_MS;
};

let devolucionesCache = {
  devoluciones: getInitialDevs(),
  isInitialized: false
};

// ==========================================
// HELPERS DE PROCESAMIENTO
// ==========================================
const normalizeTalla = (t) => {
  if (!t || String(t).trim() === '') return 'UNICA';
  // ✅ CORREGIDO: \/ → / (no necesita escape dentro de [])
  return String(t).replace(/[-\s/]/g, '').toUpperCase().trim();
};

const getPriceNum = (val) => {
  if (typeof val === 'number') return Math.floor(val);
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/,/g, '.'));
  return isNaN(num) ? 0 : Math.floor(num);
};

export const useDevolucionesLogic = () => {
  const [modoVista, setModoVista] = useState("lista");
  const [devoluciones, setDevoluciones] = useState(devolucionesCache.devoluciones);
  const [availableStatuses, setAvailableStatuses] = useState(['Pendiente', 'Completada', 'Rechazada']);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  // ✅ CORREGIDO: Solo se usa el setter, no la variable 'loading'
  const [, setLoading] = useState(!devolucionesCache.isInitialized && devolucionesCache.devoluciones.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [devolucionViendo, setDevolucionViendo] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    cliente: '',
    idCliente: '',
    productoOriginalId: '',
    productoCambioId: '',
    mismoModelo: false,
    motivo: '',
    evidencia: null,
    evidencia2: null,
    viewingEvidencia: 1,
    idVenta: '',
    fecha: new Date().toLocaleDateString('es-CO'),
    estado: '',
    motivoRechazo: ''
  });
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [ventasCliente, setVentasCliente] = useState([]);
  const [productosVenta, setProductosVenta] = useState([]);

  const loadData = useCallback(async (loadAll = false, bypassCache = false) => {
    if (!bypassCache && !loadAll && isCacheFresh() && devolucionesRef.current.length > 0) {
      return;
    }
    if (devolucionesRef.current.length === 0) setLoading(true);
    
    try {
      const promises = [
        fetchAllDevoluciones(),
        import('../services/devolucionesApi').then(m => m.getStatuses())
      ];
      
      if (loadAll) {
        promises.push(fetchAllClientes(), fetchAllProductosData());
      }

      const results = await Promise.all(promises);
      const devers = results[0];
      const statusData = results[1];
      
      setDevoluciones(devers);
      
      const rawStatuses = Array.isArray(statusData) ? statusData : [];
      let filteredStatuses = rawStatuses
        .map(s => typeof s === 'object' ? (s.nombre || s.Nombre || s.Estado) : s)
        .filter(s => s && !['anulada', 'anulado'].includes(String(s).toLowerCase()));
      
      if (filteredStatuses.length === 0) {
        filteredStatuses = ['Pendiente', 'Completada', 'Rechazada'];
      }
      
      setAvailableStatuses(filteredStatuses);
      
      if (loadAll && results.length > 2) {
        setClientes(results[2]);
        setProductos(results[3]);
      }

      NitroCache.set('devoluciones', devers);
      NitroCache.set('devoluciones_meta', { _savedAt: Date.now() });
      devolucionesCache = { devoluciones: devers, isInitialized: true };

    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ loadData no depende de nada externo

  // ✅ CORREGIDO: Agregadas dependencias faltantes
  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => {
      if (modoVista === "lista") {
        loadData();
      }
    }, 60000);
    return () => clearInterval(intervalId);
  }, [loadData, modoVista]); // ✅ Agregadas loadData y modoVista

  const devolucionesRef = useRef(devoluciones);
  useEffect(() => {
    devolucionesRef.current = devoluciones;
  }, [devoluciones]);

  // 🔥 EFECTO: Cargar compras cuando cambia el cliente
  useEffect(() => {
    const fetchCompras = async () => {
      if (!formData.idCliente) {
        setVentasCliente([]);
        return;
      }
      setLoadingVentas(true);
      try {
        const { fetchVentasPorCliente } = await import('../services/devolucionesApi');
        const ventas = await fetchVentasPorCliente(formData.idCliente);
        const completedSales = (ventas || []).filter(v => {
          const status = String(v.idEstado || v.IdEstado || v.estado || '').toLowerCase();
          return status.includes('completad') || status.includes('aproba');
        }).map(v => ({
          ...v,
          label: `ORDEN #${(() => {
            const raw = v.id || v.IdVenta;
            const num = Number(raw);
            return (!isNaN(num) && num < 1000) ? num + 1000 : raw;
          })()}`
        }));
        setVentasCliente(completedSales);
        setProductosVenta([]);
      } catch (_) {
        void _; // ✅ CORREGIDO: "Usa" la variable para silenciar ESLint
      } finally {
        setLoadingVentas(false);
      }
    };
    fetchCompras();
  }, [formData.idCliente]);

  const ventasFiltradas = useMemo(() => {
    return ventasCliente.filter(v => {
      const saleId = String(v.id || v.IdVenta);
      const details = v.detalles || v.Detalles || v.DetalleVenta || [];
      const activeReturnsForSale = devoluciones.filter(d => {
        const relSaleId = String(d.idVenta || d.ventaOriginal?.id || '');
        const devStatus = String(d.estado || d.Estado || '').toLowerCase();
        return relSaleId === saleId && !devStatus.includes('rechazad');
      });
      return activeReturnsForSale.length < details.length;
    });
  }, [ventasCliente, devoluciones]);

  // 🔥 EFECTO: Consolidar productos de las ventas
  // ✅ CORREGIDO: Agregadas dependencias faltantes
  useEffect(() => {
    if (ventasFiltradas.length === 0) {
      setProductosVenta([]);
      return;
    }
    const targetSales = formData.idVenta 
      ? [ventasFiltradas.find(v => String(v.id || v.IdVenta) === String(formData.idVenta))]
      : ventasFiltradas;

    const consolidatedProducts = [];
    targetSales.forEach(sale => {
      if (!sale) return;
      const details = sale.detalles || sale.Detalles || sale.DetalleVenta || [];
      const saleId = sale.id || sale.IdVenta;
      
      details.forEach((d, index) => {
        const p = d.producto || d.Producto || d;
        const pid = p.id || p.IdProducto || p.idProducto || d.idProducto || d.IdProducto;
        const pNombre = p.nombre || p.Nombre || d.nombre || d.Nombre;
        const uniqueKey = `${saleId}-${pid}-${index}`;

        const hasExistingReturn = devoluciones.some(dev => {
          const relSaleId = String(dev.idVenta || dev.ventaOriginal?.id || '');
          const relProdId = String(dev.productoOriginalId || dev.idProducto || dev.IdProducto || '');
          const devStatus = String(dev.estado || dev.Estado || '').toLowerCase();
          return relSaleId === String(saleId) && String(relProdId) === String(pid) && !devStatus.includes('rechazad');
        });

        if (hasExistingReturn) return;

        consolidatedProducts.push({
          ...p,
          _tempId: uniqueKey, 
          id: uniqueKey,
          realId: pid,
          idVenta: saleId, 
          nombre: pNombre,
          precio: (() => {
            const val = d.precio || d.Precio || d.precioVenta || p.precio || p.Precio || p.precioVenta || 0;
            if (typeof val === 'number') return Math.floor(val);
            const num = parseFloat(String(val).replace(/,/g, '.'));
            return isNaN(num) ? 0 : Math.floor(num);
          })(),
          tallaComprada: d.talla || d.Talla || 'N/A',
          cantidadComprada: d.cantidad || d.Cantidad || 1,
          imagenes: p.imagenes || p.Imagenes || p.imagenesAsociadas || []
        });
      });
    });
    setProductosVenta(consolidatedProducts);
  }, [formData.idVenta, ventasFiltradas, devoluciones]); // ✅ Agregadas dependencias

  const productosMismoPrecio = useMemo(() => {
    if (!formData.productoOriginalId) return [];
    const pOrig = productosVenta.find(p => String(p._tempId || p.id) === String(formData.productoOriginalId));
    if (!pOrig) return [];

    const targetPrice = getPriceNum(pOrig.precio);
    const targetTallaNorm = normalizeTalla(pOrig.tallaComprada);

    return productos.filter(p => {
      const pPrice = getPriceNum(p.precioVenta || p.PrecioVenta || p.precio || p.Precio);
      const priceMatch = Math.abs(pPrice - targetPrice) < 100;
      if (!priceMatch) return false;

      const tallasArray = p.tallas || p.Tallas || [];
      let tallasDisponibles = [];
      if (Array.isArray(tallasArray) && tallasArray.length > 0) {
        tallasDisponibles = tallasArray.map(t => normalizeTalla(t));
      } else {
        const stockPorTalla = p.tallasStock || p.TallasStock || p.tallasAsociadas || [];
        if (Array.isArray(stockPorTalla)) {
          tallasDisponibles = stockPorTalla.map(t => normalizeTalla(t.talla || t.Nombre || t.tallaNombre || t));
        }
      }

      const hasMatchingSize = tallasDisponibles.includes(targetTallaNorm);
      const isUniqueMatch = (targetTallaNorm === 'AJUSTABLE' || targetTallaNorm === 'UNICA' || targetTallaNorm === 'N/A') && 
                            (tallasDisponibles.includes('AJUSTABLE') || tallasDisponibles.includes('UNICA') || tallasDisponibles.length === 0);
      return (hasMatchingSize || isUniqueMatch || tallasDisponibles.length === 0);
    });
  }, [formData.productoOriginalId, productos, productosVenta]);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const mostrarLista = () => {
    setModoVista("lista");
    setDevolucionViendo(null);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const mostrarFormulario = () => {
    loadData(true);
    setFormData({
      cliente: '',
      idCliente: '',
      productoOriginalId: '',
      productoCambioId: '',
      mismoModelo: false,
      motivo: '',
      evidencia: null,
      evidencia2: null,
      viewingEvidencia: 1,
      fecha: new Date().toLocaleDateString('es-CO'),
      estado: availableStatuses[0] || '',
      motivoRechazo: '',
      idVenta: ''
    });
    setVentasCliente([]);
    setProductosVenta([]);
    setErrors({});
    setModoVista("formulario");
  };

  const mostrarDetalle = (devolucion) => {
    setDevolucionViendo(devolucion);
    setIsRejecting(false);
    setRejectionReason('');
    setModoVista("detalle");
  };

  const handleImageUpload = (e, slot = 1) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const field = slot === 1 ? 'evidencia' : 'evidencia2';
        setFormData(prev => ({ ...prev, [field]: reader.result, viewingEvidencia: slot }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getPrice = (id) => {
    const pVenta = productosVenta.find(p => String(p._tempId || p.id) === String(id));
    if (pVenta) return getPriceNum(pVenta.precio);
    const pCat = productos.find(p => String(p.IdProducto || p.id) === String(id));
    return getPriceNum(pCat?.precioVenta || pCat?.PrecioVenta || pCat?.Precio || pCat?.precio || 0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;
    const e_fields = {};
    if (!formData.idCliente) e_fields.cliente = true;
    if (!formData.idVenta) e_fields.idVenta = true;
    if (!formData.productoOriginalId) e_fields.prodOrig = true;
    if (!formData.mismoModelo && !formData.productoCambioId) e_fields.prodCambio = true;
    if (!formData.motivo) e_fields.motivo = true;
    if (!formData.evidencia) e_fields.evidencia = true;

    if (!formData.mismoModelo && formData.productoOriginalId && formData.productoCambioId) {
      const p1Price = getPrice(formData.productoOriginalId);
      const p2Price = getPrice(formData.productoCambioId);
      if (Math.abs(p1Price - p2Price) > 10) {
        e_fields.price_mismatch = true;
      }
    }

    if (Object.keys(e_fields).length > 0) {
      setErrors(e_fields);
      if (e_fields.price_mismatch) showAlert("Los precios de los productos deben coincidir", "error");
      else showAlert("Por favor complete los campos obligatorios", "error");
      return;
    }

    setSubmitting(true);
    const selectedProdOrig = productosVenta.find(p => String(p._tempId || p.id) === String(formData.productoOriginalId));

    const payload = {
      ...formData,
      idProductoOriginal: selectedProdOrig?.realId || selectedProdOrig?.id || formData.productoOriginalId,
      idProductoCambio: formData.productoCambioId || null,
      idCliente: formData.idCliente,
      idVenta: formData.idVenta,
      talla: selectedProdOrig?.tallaComprada || 'N/A',
      precioUnitario: selectedProdOrig?.precio || 0,
      cantidad: selectedProdOrig?.cantidadComprada || 1,
      cantidadOriginal: selectedProdOrig?.cantidadComprada || 1
    };
     
    try {
      await createNewDevolucion(payload);
      showAlert("Devolución registrada correctamente");
      await loadData(false, true);
      mostrarLista();
    } catch {
      showAlert("Error al registrar la devolución", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDevolucion = async (id) => {
    setActionLoading(true);
    try {
      await deleteDevolucionApi(id);
      showAlert("Devolución eliminada correctamente");
      await loadData(false, true);
    } catch {
      showAlert("Error al eliminar la devolución", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (dev, statusObj, reason = '') => {
    if (!dev) return;
    const statusName = typeof statusObj === 'object' ? (statusObj.nombre || statusObj.Nombre) : statusObj;
    const devId = dev.id ?? (dev.noDevolucion ? (parseInt(dev.noDevolucion) - 10000).toString() : String(dev.numDevolucion).replace('DEV-', ''));

    const prevDevs = [...devoluciones];
    setDevoluciones(current => current.map(d => 
      String(d.id) === String(dev.id) ? { ...d, estado: statusName, motivoRechazo: reason || d.motivoRechazo } : d
    ));

    try {
      await updateExistingDevolucion(devId, { 
        Estado: statusName, 
        MotivoRechazo: reason || dev.motivoRechazo 
      });
      
      showAlert(`Devolución ${statusName.toLowerCase()} correctamente`);
      loadData(false, true);
      
      if (devolucionViendo && String(devolucionViendo.id) === String(dev.id)) {
        setDevolucionViendo(prev => ({ ...prev, estado: statusName, motivoRechazo: reason || prev.motivoRechazo, viewingEvidencia: 1 }));
      }
      if (statusName === 'Rechazada') setIsRejecting(false);
    } catch {
      // ✅ CORREGIDO: Bare catch (sin parámetro)
      setDevoluciones(prevDevs);
      showAlert("Error al actualizar el estado", "error");
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return devoluciones.filter(d => {
      const searchString = (d.cliente + d.id + d.productoOriginal).toLowerCase();
      const matchesSearch = searchString.includes(q);
      const matchesStatus = filterStatus === 'Todos' || d.estado === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [devoluciones, searchTerm, filterStatus]);

  return {
    modoVista, setModoVista,
    devoluciones, setDevoluciones,
    availableStatuses,
    clientes, productos,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    itemsPerPage,
    alert, setAlert,
    errors, setErrors,
    devolucionViendo, setDevolucionViendo,
    isRejecting, setIsRejecting,
    rejectionReason, setRejectionReason,
    formData, setFormData,
    loadingVentas,
    ventasCliente: ventasFiltradas,
    productosVenta,
    productosMismoPrecio,
    showAlert,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    handleImageUpload,
    handleSubmit,
    deleteDevolucion,
    submitting,
    actionLoading,
    updateStatus,
    filtered
  };
};