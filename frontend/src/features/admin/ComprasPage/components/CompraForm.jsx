/* === SUB-COMPONENTE DE FORMULARIO ===
   Este componente contiene el formulario de registro de Compras.
   Permite seleccionar el proveedor, ingresar el número de factura, método de pago,
   fechas de compra/registro, y gestionar el listado de productos adquiridos con sus respectivas tallas y precios. */

import React from 'react';
import { FaTruck, FaFileInvoiceDollar, FaShoppingCart, FaSearch, FaTimes } from 'react-icons/fa';
import { DateInputWithCalendar } from '../../../shared/services';
import ProductoItemForm from './ProductoItemForm';

const CompraForm = ({
  nuevaCompra,
  setNuevaCompra,
  errors,
  proveedoresActivos,
  availablePaymentMethods,
  availableSizes,
  availableProducts,
  isLoadingProducts,
  handleInputChange,
  handleDateChange,
  calcularTotal,
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
  detalleSearch,
  setDetalleSearch,
}) => {
  return (
    <div className="compras-form-container">
      <div className="compras-form-grid">
        {/* PANEL IZQUIERDO: Datos Generales */}
        <div className="compras-form-card">
          <h3 className="compras-form-card-title">
            <FaTruck size={14} color="#F5C81B" /> Datos del proveedor
          </h3>
          
          <div className="compras-form-group">
            <div>
              <label className="compras-form-label">
                Proveedor: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={nuevaCompra.proveedor}
                onChange={(e) => {
                  const pvr = proveedoresActivos.find(p => p.nombre === e.target.value);
                  handleInputChange('idProveedor', pvr?.id || '');
                  handleInputChange('proveedor', e.target.value);
                }}
                className={`compras-form-select ${errors?.proveedor ? 'error' : ''}`}
              >
                <option value="">Seleccionar proveedor activo...</option>
                {proveedoresActivos.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="compras-form-row">
              <div>
                <label className="compras-form-label">
                  N° Factura: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Nº ${nuevaCompra.nextFacturaPlaceholder || '10001'}`}
                  value={nuevaCompra.numeroFactura || ''}
                  onChange={(e) => handleInputChange('numeroFactura', e.target.value)}
                  className={`compras-form-input ${errors?.numeroFactura ? 'error' : ''}`}
                />
              </div>
              <div>
                <label className="compras-form-label">Método de pago:</label>
                <select
                  value={nuevaCompra.metodoPago}
                  onChange={(e) => setNuevaCompra(p => ({ ...p, metodoPago: e.target.value }))}
                  className="compras-form-select"
                >
                  {availablePaymentMethods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Resumen de Totales */}
        <div className="compras-totals-card">
          <h3 className="compras-form-card-title">
            <FaFileInvoiceDollar size={14} color="#F5C81B" /> Resumen de compra
          </h3>

          <div className="compras-totals-box">
            <div className="compras-totals-row">
              <span className="compras-totals-label">Total factura:</span>
              <span className="compras-totals-value">${calcularTotal().toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="compras-totals-dates">
            <div className="compras-totals-date-col">
              <label className="compras-form-label">Fecha de compra:</label>
              <DateInputWithCalendar
                value={nuevaCompra.fecha}
                onChange={(d) => handleDateChange('fecha', d)}
                error={!!errors?.fecha}
              />
              {errors?.fecha && (
                <span className="compras-error-message">
                  {errors.fecha}
                </span>
              )}
            </div>
            <div className="compras-totals-date-col">
              <label className="compras-form-label">Fecha de registro:</label>
              <DateInputWithCalendar
                value={nuevaCompra.fechaRegistro}
                onChange={(d) => handleDateChange('fechaRegistro', d)}
                error={!!errors?.fechaRegistro}
              />
              {errors?.fechaRegistro && (
                <span className="compras-error-message">
                  {errors.fechaRegistro}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DE PRODUCTOS */}
      <div className="compras-products-card">
        <div className="compras-products-header">
          <h3 className="compras-products-title-wrapper">
            <FaShoppingCart size={14} color="#F5C81B" />{" "}
            <span className="compras-products-title-label">Productos adquiridos</span>
          </h3>
          <div className="compras-products-controls">
            <div className="compras-products-search-wrapper">
              <FaSearch size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Buscar en productos..."
                value={detalleSearch}
                onChange={(e) => setDetalleSearch(e.target.value)}
                className="compras-products-search-input"
              />
              {detalleSearch && (
                <button
                  type="button"
                  onClick={() => setDetalleSearch('')}
                  className="compras-products-search-clear"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={agregarProducto}
              className="btn-primary"
              style={{ height: '34px' }}
            >
              + Añadir Producto
            </button>
          </div>
        </div>

        <div>
          <div className="compras-products-grid-header">
            <span className="compras-products-grid-header-label"></span>
            <span className="compras-products-grid-header-label">Producto / Tallas</span>
            <span className="compras-products-grid-header-label">P. Compra</span>
            <span className="compras-products-grid-header-label">P. Venta</span>
            <span className="compras-products-grid-header-label">May 6</span>
            <span className="compras-products-grid-header-label">May 80</span>
            <span className="compras-products-grid-header-label"></span>
          </div>
          {nuevaCompra.productos
            .map((p, originalIdx) => ({ ...p, originalIdx }))
            .filter(p => {
              if (!detalleSearch) return true;
              return (p.nombre || '').toLowerCase().includes(detalleSearch.toLowerCase());
            })
            .map((prod) => (
              <ProductoItemForm
                key={prod._tempKey || prod.originalIdx}
                index={prod.originalIdx}
                producto={prod}
                isFirst={prod.originalIdx === 0}
                onRemove={() => eliminarProducto(prod.originalIdx)}
                onChange={(i, campo, valor) => actualizarProducto(i, campo, valor)}
                errors={errors}
                availableProducts={availableProducts}
                availableSizes={availableSizes}
                isLoadingProducts={isLoadingProducts}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default CompraForm;
