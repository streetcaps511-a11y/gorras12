/* === HOOK DE LÓGICA ===
Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo.
Separa la 'inteligencia' de la interfaz visual para mantener el código limpio.
Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NitroCache } from '../../../shared/utils/NitroCache';
import Swal from 'sweetalert2';
import {
  fetchAllCompras,
  createNewCompra,
  fetchAllProveedores,
  getPaymentMethods,
  updateCompraStatus,
  fetchAllProductos,
  recalcularStockFromCompras
} from '../services/comprasApi';

// 🧠 MEMORIA GLOBAL (Caché Nitro)
const getInitialCompras = () => {
  const cached = NitroCache.get('compras_v2');
  return Array.isArray(cached?.data) ? cached.data : [];
};

const getInitialProv = () => {
  const cached = NitroCache.get('compras_prov');
  return cached?.data || [];
};

let localCache = { isInitialized: false };

export const useComprasLogic = (location) => {
  const [modoVista, setModoVista] = useState("lista");
  const [compras, setCompras] = useState(() => getInitialCompras());
  const [proveedores, setProveedores] = useState(() => getInitialProv());
  
  // ✅ Eliminados setters no usados
  const [availableStatuses] = useState(['Todos', 'Completada', 'Anulada']);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState(['Efectivo', 'Transferencia']);
  const [availableSizes] = useState([
    { value: 'Ajustable', label: 'Ajustable' },
    { value: '7', label: '7' },
    { value: '7/1/4', label: '7/1/4' },
    { value: '7/1/8', label: '7/1/8' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [productoPage, setProductoPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [compraViendo, setCompraViendo] = useState(null);
  const [compraEditando, setCompraEditando] = useState(null);
  const [completarModal, setCompletarModal] = useState({ isOpen: false, compra: null });
  const [annulModal, setAnnulModal] = useState({ isOpen: false, compra: null });
  const [productos, setProductos] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // ✅ Solo se usa el setter, no la variable 'loading'
  const [, setLoading] = useState(true);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLoadingText, setActionLoadingText] = useState('Procesando...');
  const [isRecalculando, setIsRecalculando] = useState(false);
  
  const [nuevaCompra, setNuevaCompra] = useState({
    proveedor: '',
    idProveedor: '',
    metodoPago: 'Efectivo',
    fecha: '',
    productos: [{
      id: '',
      nombre: '',
      variantes: [{ talla: '', cantidad: 1, _tempKey: Math.random() }],
      precioCompra: '',
      precioVenta: '',
      precioMayorista6: '',
      precioMayorista80: '',
      _tempKey: Math.random()
    }],
    estado: 'Completada',
    numeroFactura: '',
    fechaRegistro: ''
  });

  const isFutureDate = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const fechaIngresada = new Date(year, month, day);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      return !isNaN(fechaIngresada.getTime()) && fechaIngresada > hoy;
    }
    return false;
  };

  const handleInputChange = useCallback((field, value) => {
    setNuevaCompra(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const copy = { ...prev };
      if (value) {
        delete copy[field];
      } else {
        if (field === 'proveedor' || field === 'numeroFactura') {
          copy[field] = 'Este campo es obligatorio';
        }
      }
      return copy;
    });
  }, []);

  const handleDateChange = useCallback((field, value) => {
    setNuevaCompra(prev => ({ ...prev, [field]: value }));
    const isFuture = isFutureDate(value);
    setErrors(prev => {
      const copy = { ...prev };
      if (!value) {
        if (field === 'fecha') {
          copy.fecha = 'La fecha de compra es obligatoria';
        } else {
          delete copy[field];
        }
      } else if (isFuture) {
        copy[field] = 'Fecha no puede ser futura';
      } else {
        delete copy[field];
      }
      return copy;
    });
  }, []);

  const proveedoresActivos = useMemo(() => {
    if (!Array.isArray(proveedores)) return [];
    return proveedores.map(s => ({
      id: s.IdProveedor || s.id,
      nombre: s.Nombre || s.nombre || s.companyName || s.contactName || 'Sin Nombre'
    }));
  }, [proveedores]);

  const fetchData = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const [cData, pData, methods, prData] = await Promise.all([
        fetchAllCompras(),
        fetchAllProveedores(),
        getPaymentMethods(),
        fetchAllProductos()
      ]);

      const sorted = [...(cData || [])].sort((a, b) => (parseInt(b.numCompra) || 0) - (parseInt(a.numCompra) || 0));
      
      setCompras(sorted);
      setProveedores(pData || []);
      NitroCache.set('compras_v2', sorted);
      NitroCache.set('compras_prov', pData || []);
      
      if (Array.isArray(methods)) {
        setAvailablePaymentMethods(methods.map(m => typeof m === 'string' ? m : (m.Nombre || m.nombre)));
      }

      if (Array.isArray(prData)) {
        const mapped = prData.map(p => ({
          ...p,
          nombre: p.nombre || p.Nombre,
          id: p.id || p.IdProducto,
          precioCompra: p.precioCompra || p.PrecioCompra,
          precioVenta: p.precioVenta || p.PrecioVenta
        }));
        setProductos(mapped);
      }
      localCache.isInitialized = true;
    } catch (e) {
      console.error("Error fetchData Compras:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const mostrarLista = useCallback(() => {
    setModoVista("lista");
    setCompraEditando(null);
    setCompraViendo(null);
    setProductoPage(1);
  }, []);

  const mostrarFormulario = useCallback(async (compra = null) => {
    setModoVista("formulario");
    setProductoPage(1);
    setErrors({});
    
    if (productos.length === 0) {
      setIsLoadingProducts(true);
      fetchAllProductos().then(prData => {
        const mapped = (Array.isArray(prData) ? prData : []).map(p => ({
          ...p,
          nombre: p.nombre || p.Nombre,
          id: p.id || p.IdProducto,
          precioCompra: p.precioCompra || p.PrecioCompra,
          precioVenta: p.precioVenta || p.PrecioVenta
        }));
        setProductos(mapped);
        setIsLoadingProducts(false);
      }).catch(() => setIsLoadingProducts(false));
    }

    if (compra) {
      if (compra.estado === 'Anulada') {
        showAlert('Las compras anuladas no se pueden editar', 'error');
        setModoVista("lista");
        return;
      }
      setCompraEditando(compra);
      setNuevaCompra({
        proveedor: compra.proveedor,
        idProveedor: compra.idProveedor || '',
        metodoPago: compra.metodo,
        fecha: compra.fecha,
        productos: (compra.productos || []).reduce((acc, p) => {
          const existing = acc.find(item => item.nombre === p.nombre);
          if (existing) {
            existing.variantes.push({ talla: p.talla, cantidad: p.cantidad, _tempKey: Math.random() });
          } else {
            acc.push({
              ...p,
              variantes: [{ talla: p.talla, cantidad: p.cantidad, _tempKey: Math.random() }],
              _tempKey: Math.random()
            });
          }
          return acc;
        }, []),
        estado: compra.estado,
        numeroFactura: compra.numeroRecibo || '',
        fechaRegistro: compra.fechaRegistro || ''
      });
    } else {
      const nextFactura = '10001';
      setCompraEditando(null);
      setNuevaCompra({
        proveedor: '',
        idProveedor: '',
        metodoPago: 'Efectivo',
        fecha: '',
        productos: [{
          id: '',
          nombre: '',
          variantes: [{ talla: '', cantidad: 1, _tempKey: Math.random() }],
          precioCompra: '',
          precioVenta: '',
          precioMayorista6: '',
          precioMayorista80: '',
          _tempKey: Math.random()
        }],
        estado: 'Completada',
        numeroFactura: '',
        nextFacturaPlaceholder: nextFactura,
        fechaRegistro: ''
      });
    }
  }, [showAlert, productos.length]); // ✅ Eliminada dependencia 'compras' no usada

  const mostrarDetalle = useCallback((compra) => {
    if (!compra) return;
    const productosAgrupados = (compra.productos || []).reduce((acc, p) => {
      const existing = acc.find(item => item.nombre === p.nombre);
      const variantesDelProducto = p.variantes || [{ talla: p.talla, cantidad: p.cantidad }];

      if (existing) {
        variantesDelProducto.forEach(v => {
          const vExists = existing.variantes.find(ev => ev.talla === v.talla);
          if (vExists) vExists.cantidad += (v.cantidad || 0);
          else existing.variantes.push({ ...v, _tempKey: Math.random() });
        });
      } else {
        acc.push({
          ...p,
          variantes: variantesDelProducto.map(v => ({ ...v, _tempKey: Math.random() })),
          _tempKey: Math.random()
        });
      }
      return acc;
    }, []);

    setCompraViendo({ ...compra, productos: productosAgrupados });
    setModoVista("detalle");
    setProductoPage(1);
  }, []);

  useEffect(() => {
    if (location?.state?.openModal) {
      mostrarFormulario();
    }
  }, [location, mostrarFormulario]);

  const agregarProducto = useCallback(() => {
    setProductoPage(1);
    setNuevaCompra(p => ({
      ...p,
      productos: [...p.productos, {
        id: '',
        nombre: '',
        variantes: [{ talla: '', cantidad: 1, _tempKey: Math.random() }],
        precioCompra: '',
        precioVenta: '',
        precioMayorista6: '',
        precioMayorista80: '',
        _tempKey: Math.random()
      }]
    }));
  }, []);

  const actualizarProducto = useCallback((index, campo, valor) => {
    const errorKey = `prod_${index}`;
    if (errors[errorKey] || errors[`qty_${index}`] || errors[`price_${index}`] || errors[`sell_${index}`] || errors[`talla_${index}`]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[errorKey]; delete n[`qty_${index}`]; delete n[`price_${index}`]; delete n[`sell_${index}`]; delete n[`talla_${index}`];
        return n;
      });
    }
    setNuevaCompra(p => {
      const n = [...p.productos];
      const actualValor = typeof valor === 'function' ? valor(n[index][campo] || []) : valor;
      if (campo === 'variantes') {
        n[index] = { ...n[index], variantes: actualValor };
      } else {
        n[index] = { ...n[index], [campo]: actualValor };
      }
      return { ...p, productos: n };
    });
  }, [errors]);

  const eliminarProducto = useCallback((index) => {
    setNuevaCompra(p => {
      if (index === 0) {
        const newProducts = [...p.productos];
        newProducts[0] = {
          id: '',
          nombre: '',
          variantes: [{ talla: '', cantidad: 1, _tempKey: Math.random() }],
          precioCompra: '',
          precioVenta: '',
          precioMayorista6: '',
          precioMayorista80: '',
          _tempKey: Math.random()
        };
        return { ...p, productos: newProducts };
      } else {
        return {
          ...p,
          productos: p.productos.filter((_, i) => i !== index)
        };
      }
    });
  }, []);

  const calcularTotal = useCallback(() =>
    nuevaCompra.productos.reduce((t, p) => {
      const totalCant = (Array.isArray(p.variantes) ? p.variantes : []).reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0);
      const cleanPrice = parseFloat(String(p.precioCompra || 0).replace(/\./g, '').replace(',', '.')) || 0;
      return t + (totalCant * cleanPrice);
    }, 0),
    [nuevaCompra.productos]
  );

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    const e_fields = {};
    if (!nuevaCompra.proveedor) e_fields.proveedor = 'El proveedor es obligatorio';
    if (!nuevaCompra.numeroFactura) e_fields.numeroFactura = 'El N° Factura es obligatorio';
    
    // Validación de fecha: no puede ser futura
    if (nuevaCompra.fecha) {
      if (isFutureDate(nuevaCompra.fecha)) {
        e_fields.fecha = 'Fecha de compra no puede ser futura';
      }
    } else {
      e_fields.fecha = 'La fecha es obligatoria';
    }

    // Validación de fecha de registro: no puede ser futura
    if (nuevaCompra.fechaRegistro) {
      if (isFutureDate(nuevaCompra.fechaRegistro)) {
        e_fields.fechaRegistro = 'Fecha de registro no puede ser futura';
      }
    }
    
    nuevaCompra.productos.forEach((p, i) => {
      if (!p.nombre) e_fields[`prod_${i}`] = true;
      (p.variantes || []).forEach((v, vi) => {
        if (!v.talla) e_fields[`talla_${i}_${vi}`] = true;
        if (!v.cantidad || v.cantidad <= 0) e_fields[`qty_${i}_${vi}`] = true;
      });
      if (!p.precioCompra || p.precioCompra <= 0) e_fields[`price_${i}`] = true;
      if (!p.precioVenta || p.precioVenta <= 0) e_fields[`sell_${i}`] = true;
    });

    if (Object.keys(e_fields).length > 0) {
      setErrors(e_fields);
      if (e_fields.fecha || e_fields.fechaRegistro) {
        showAlert(e_fields.fecha || e_fields.fechaRegistro, 'error');
      } else {
        showAlert('Completa los campos marcados en rojo', 'error');
      }
      return;
    }

    const total = calcularTotal();
    const pvr = proveedoresActivos.find(p => p.nombre === nuevaCompra.proveedor);

    // 🚀 ENVIAR ESTRUCTURA AGRUPADA (Como espera el Backend)
    const productosParaEnviar = nuevaCompra.productos.map(p => ({
      idProducto: p.id,
      nombre: p.nombre,
      precioCompra: parseFloat(String(p.precioCompra).replace(/\./g, '').replace(',', '.')) || 0,
      precioVenta: parseFloat(String(p.precioVenta).replace(/\./g, '').replace(',', '.')) || 0,
      precioMayorista6: parseFloat(String(p.precioMayorista6).replace(/\./g, '').replace(',', '.')) || 0,
      precioMayorista80: parseFloat(String(p.precioMayorista80).replace(/\./g, '').replace(',', '.')) || 0,
      variantes: p.variantes.map(v => ({
        talla: v.talla,
        cantidad: parseInt(v.cantidad) || 0
      }))
    }));

    const payload = {
      idProveedor: pvr?.id || '',
      numeroRecibo: nuevaCompra.numeroFactura,
      metodoPago: nuevaCompra.metodoPago,
      fecha: nuevaCompra.fecha || new Date(),
      productos: productosParaEnviar,
      total
    };

    try {
      setActionLoadingText(compraEditando ? 'Actualizando...' : 'Guardando...');
      setActionLoading(true);
      if (compraEditando) {
        showAlert('Funcionalidad de edición conectando...');
      } else {
        await createNewCompra(payload);
        showAlert('Compra registrada correctamente');
        // Notificar al resto de la app (sync) para que recarguen stock
        const channel = new BroadcastChannel('app_sync');
        channel.postMessage('productos_updated');
        channel.close();
        await fetchData();
      }
      setTimeout(() => mostrarLista(), 500);
    } catch (error) {
      console.error('Error post-submit:', error);
      showAlert('Error al procesar la compra', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [nuevaCompra, compraEditando, proveedoresActivos, calcularTotal, fetchData, mostrarLista, showAlert]);

  const filtered = useMemo(() => {
    return compras.filter(c => {
      const search = (c.proveedor + c.id).toLowerCase().includes(searchTerm.toLowerCase());
      const status = filterStatus === 'Todos' || c.estado === filterStatus.slice(0, -1) || c.estado === filterStatus;
      let matchDate = true;
      if (filterDate) {
        const [, year, month, day] = filterDate.match(/(\d{4})-(\d{2})-(\d{2})/) || [];
        if (year && month && day) {
          const formattedFilter = new Date(`${year}-${month}-${day}T12:00:00`).toLocaleDateString('es-CO');
          matchDate = (c.fecha === formattedFilter);
        }
      }
      return search && status && matchDate;
    });
  }, [compras, searchTerm, filterStatus, filterDate]);

  const handleCompletarCompra = useCallback((compra) => {
    if (compra.estado !== 'Pendiente') return;
    setCompletarModal({ isOpen: true, compra });
  }, []);

  const confirmCompletarCompra = useCallback(async () => {
    if (!completarModal.compra) return;
    setActionLoadingText('Completando...');
    setActionLoading(true);
    try {
      await updateCompraStatus(completarModal.compra.numCompra, 'Completada');
      showAlert('Registro completado correctamente');
      setCompletarModal({ isOpen: false, compra: null });
      fetchData();
    } catch (error) {
      void error; // ✅ Silencia ESLint sin romper funcionalidad
      showAlert('Error al actualizar el estado', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [completarModal.compra, fetchData, showAlert]);

  const handleAnularCompra = useCallback(async () => {
    if (!annulModal.compra) return;
    setActionLoadingText('Anulando...');
    setActionLoading(true);
    try {
      await updateCompraStatus(annulModal.compra.id || annulModal.compra.numCompra, 'Anulada');
      showAlert('Compra anulada correctamente');
      setAnnulModal({ isOpen: false, compra: null });
      // Notificar al resto de la app (sync) para que recarguen stock
      const channel = new BroadcastChannel('app_sync');
      channel.postMessage('productos_updated');
      channel.close();
      await fetchData();
    } catch (error) {
      void error; // ✅ Silencia ESLint sin romper funcionalidad
      showAlert('Error al anular la compra', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [annulModal.compra, fetchData, showAlert]);

  const recalcularStock = useCallback(async () => {
    setIsRecalculando(true);
    try {
      const result = await recalcularStockFromCompras();
      showAlert(result?.message || 'Stock recalculado correctamente ✅');
      // Notificar al módulo de Productos para que recargue
      const channel = new BroadcastChannel('app_sync');
      channel.postMessage('productos_updated');
      channel.close();
    } catch (error) {
      console.error('Error recalculando stock:', error);
      showAlert('Error al recalcular el stock', 'error');
    } finally {
      setIsRecalculando(false);
    }
  }, [showAlert]);

  return {
    modoVista, setModoVista,
    compras,
    availableStatuses,
    availablePaymentMethods,
    availableSizes,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    filterDate, setFilterDate,
    currentPage, setCurrentPage,
    itemsPerPage,
    productoPage, setProductoPage,
    alert, setAlert,
    errors, setErrors,
    compraViendo, setCompraViendo,
    compraEditando, setCompraEditando,
    completarModal, setCompletarModal,
    nuevaCompra, setNuevaCompra,
    proveedoresActivos,
    showAlert,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    calcularTotal,
    handleSubmit,
    handleCompletarCompra,
    confirmCompletarCompra,
    handleAnularCompra,
    annulModal, setAnnulModal,
    filtered,
    actionLoading,
    actionLoadingText,
    availableProducts: productos,
    isLoadingProducts,
    recalcularStock,
    isRecalculando,
    handleInputChange,
    handleDateChange
  };
};