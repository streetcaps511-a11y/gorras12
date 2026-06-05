/* === SUB-COMPONENTE DE DETALLE ===
   Este componente muestra la información en modo de solo lectura de una Compra seleccionada:
   - Información general (Proveedor, Factura, Método de Pago).
   - Resumen del total y fechas (Compra, Registro).
   - Listado detallado de productos adquiridos con sus tallas y cantidades. */

import React from 'react';
import { FaTruck, FaMoneyBillWave, FaFileInvoiceDollar, FaCalendarAlt, FaShoppingCart, FaSearch, FaTimes } from 'react-icons/fa';
import ProductoItemForm from './ProductoItemForm';

const CompraDetail = ({
  compraViendo,
  detalleSearch,
  setDetalleSearch,
}) => {
  return (
    <div className="compras-detail-container">
      <div className="compras-detail-grid">
        <div className="compras-form-card">
          <h3 className="compras-form-card-title">
            <FaTruck size={14} color="#F5C81B" /> Información general
          </h3>
          <div className="compras-form-group">
            <div>
              <label className="compras-form-label">Proveedor:</label>
              <div className="compras-detail-value-box">
                {compraViendo?.proveedor || '-'}
              </div>
            </div>
            <div className="compras-form-row">
              <div>
                <label className="compras-form-label">Método de pago:</label>
                <div className="compras-detail-value-box-with-icon">
                  <FaMoneyBillWave size={12} color="#8F9DB1" /> {compraViendo?.metodo || '-'}
                </div>
              </div>
              {compraViendo?.numeroRecibo && compraViendo.numeroRecibo !== '-' && (
                <div>
                  <label className="compras-form-label">N° Factura:</label>
                  <div className="compras-detail-value-box">
                    {compraViendo?.numeroRecibo || '-'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="compras-totals-card">
          <h3 className="compras-form-card-title">
            <FaFileInvoiceDollar size={14} color="#F5C81B" /> Resumen de compra
          </h3>
          
          <div className="compras-totals-box">
            <div className="compras-totals-row">
              <span className="compras-totals-label">Total factura:</span>
              <span className="compras-totals-value">
                ${Number(compraViendo?.total || 0).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <div className="compras-totals-dates">
            <div className="compras-totals-date-col">
              <label className="compras-form-label">Fecha de compra:</label>
              <div className="compras-detail-value-box-with-icon">
                <FaCalendarAlt size={12} color="#8F9DB1" /> {compraViendo?.fecha || '-'}
              </div>
            </div>
            {compraViendo?.fechaRegistro && compraViendo.fechaRegistro !== '-' && (
              <div className="compras-totals-date-col">
                <label className="compras-form-label">Fecha de registro:</label>
                <div className="compras-detail-value-box-with-icon">
                  <FaCalendarAlt size={12} color="#8F9DB1" /> {compraViendo?.fechaRegistro || '-'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="compras-products-card">
        <div className="compras-products-header">
          <h3 className="compras-products-title-wrapper">
            <FaShoppingCart size={14} color="#F5C81B" />{" "}
            <span className="compras-products-title-label">Productos detallados</span>
          </h3>
          <div className="compras-products-search-wrapper">
            <FaSearch size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar producto..."
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
        </div>
        <div>
          <div className="compras-products-grid-header view-mode">
            <span className="compras-products-grid-header-label"></span>
            <span className="compras-products-grid-header-label">Producto / Tallas</span>
            <span className="compras-products-grid-header-label">P. Compra</span>
            <span className="compras-products-grid-header-label">P. Venta</span>
            <span className="compras-products-grid-header-label">Mayor. 6</span>
            <span className="compras-products-grid-header-label">Mayor. 80</span>
          </div>
          {(compraViendo?.productos || []).filter(p => {
            if (!detalleSearch) return true;
            return (p.nombre || '').toLowerCase().includes(detalleSearch.toLowerCase());
          }).map((p, i) => (
            <ProductoItemForm key={i} index={i} producto={p} isViewMode={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompraDetail;
