/* === PÁGINA PRINCIPAL ===
   Este componente es la interfaz visual principal del módulo de Compras.
   Muestra el listado de compras con filtros, barra de búsqueda (SearchInput) y paginación.
   Utiliza un Hook (useComprasLogic) para encapsular la lógica del negocio.
   Delega la renderización de las sub-vistas a componentes hijos especializados para mantener el código compacto:
   - CompraForm: Formulario para registrar o editar una compra.
   - CompraDetail: Ficha de vista de detalles de una compra seleccionada.
   - CompraModals: Diálogos de confirmación para completar o anular una compra. */

import '../style/index.css';
import '../../../shared/styles/ConfirmDeleteModal.css';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import {
  Alert, EntityTable, SearchInput, CustomPagination,
  StatusPill
} from '../../../shared/services';
import StatusFilter from '../components/StatusFilter';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';
import { useComprasLogic } from '../hooks/useComprasLogic';

// Componentes locales refacturados
import CompraModals from '../components/CompraModals';
import CompraForm from '../components/CompraForm';
import CompraDetail from '../components/CompraDetail';

const ComprasPage = () => {
  const location = useLocation();
  const [detalleSearch, setDetalleSearch] = useState('');
  
  const { modoVista, searchTerm, setSearchTerm, filterStatus, setFilterStatus, currentPage, setCurrentPage, itemsPerPage, alert, setAlert, errors, compraViendo, compraEditando, completarModal, setCompletarModal, annulModal, setAnnulModal, handleAnularCompra, nuevaCompra, setNuevaCompra, availableStatuses, availablePaymentMethods, availableSizes, proveedoresActivos, mostrarLista, mostrarFormulario, mostrarDetalle, agregarProducto, actualizarProducto, eliminarProducto, calcularTotal, handleSubmit, handleCompletarCompra, confirmCompletarCompra, filtered, loading, actionLoading, actionLoadingText, availableProducts, isLoadingProducts, handleInputChange, handleDateChange } = useComprasLogic(location);

  const columns = [
    { 
      header: 'N° Factura', 
      field: 'numeroRecibo', 
      width: '160px', 
      render: (item) => <span style={{ fontWeight: '600' }}>{item.numeroRecibo || item.numCompra || '-'}</span> 
    },
    { 
      header: 'Proveedor',
      field: 'proveedor', 
      width: '200px', 
      render: (item) => <span style={{ fontWeight: '600' }}>{item.proveedor}</span> 
    },
    { 
      header: 'Fecha',    
      field: 'fecha',     
      width: '100px', 
      render: (item) => <span>{item.fecha}</span> 
    },
    { 
      header: 'Total',    
      field: 'total',     
      width: '120px', 
      render: (item) => <span style={{ color: '#10B981', fontWeight: '700', fontSize: '14px' }}>${Number(item.total).toLocaleString('es-CO')}</span> 
    },
    { 
      header: 'Estado',   
      field: 'estado',    
      width: '110px', 
      render: (item) => <StatusPill status={item.estado} /> 
    }
  ];

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const exportCompraToPDF = (compra) => {
    if (!compra) return;
    const doc = new jsPDF();
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("GORRAS MEDELLÍN", 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let currentY = 28;
    const displayedNum = compra.numeroRecibo || compra.numCompra || '-';

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("INFORMACIÓN DE LA COMPRA", 20, currentY);

    const totalStr = `$${Number(compra.total || 0).toLocaleString('es-CO')}`;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const numFactura = compra.numeroRecibo && compra.numeroRecibo !== '-' ? compra.numeroRecibo : '-';
    doc.text(`N° Factura: ${numFactura}`, 195 - doc.getTextWidth(`N° Factura: ${numFactura}`), currentY);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const totalLabel = 'TOTAL: ';
    const totalLabelW = doc.getTextWidth(totalLabel);
    const totalValW = doc.getTextWidth(totalStr);
    doc.text(totalLabel, 195 - totalLabelW - totalValW, 35);
    doc.text(totalStr, 195 - totalValW, 35);
    
    currentY = 35;

    if (compra.fecha && compra.fecha !== '-') {
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha Compra:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(String(compra.fecha), 20 + doc.getTextWidth('Fecha Compra:') + 2, currentY);
      currentY += 7;
    }
    if (compra.fechaRegistro && compra.fechaRegistro !== '-') {
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha Registro:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(String(compra.fechaRegistro), 20 + doc.getTextWidth('Fecha Registro:') + 2, currentY);
      currentY += 7;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Proveedor:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(toTitleCase(String(compra.proveedor || '-')), 20 + doc.getTextWidth('Proveedor:') + 2, currentY);
    currentY += 7;

    if (compra.metodo && compra.metodo !== '-') {
      doc.setFont('helvetica', 'bold');
      doc.text('Método Pago:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(String(compra.metodo), 20 + doc.getTextWidth('Método Pago:') + 2, currentY);
      currentY += 7;
    }

    const tblTop = currentY + 8;
    const tblLeft = 15;
    const tblRight = 195;
    const tblWidth = tblRight - tblLeft;
    const rowHeight = 9;

    const colWidths = [12, 73, 35, 25, 35];
    const colX = [
      tblLeft,
      tblLeft + colWidths[0],
      tblLeft + colWidths[0] + colWidths[1],
      tblLeft + colWidths[0] + colWidths[1] + colWidths[2],
      tblLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
    ];

    doc.setFillColor(0, 0, 0);
    doc.rect(tblLeft, tblTop, tblWidth, rowHeight, 'F');

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(tblLeft, tblTop, tblWidth, rowHeight, 'S');
    colX.slice(1).forEach(x => {
      doc.line(x, tblTop, x, tblTop + rowHeight);
    });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item', colX[0] + 3, tblTop + 6);
    doc.text('Producto', colX[1] + 3, tblTop + 6);
    doc.text('Talla', colX[2] + 3, tblTop + 6);
    doc.text('Cant.', colX[3] + 3, tblTop + 6);
    doc.text('Subtotal', colX[4] + 3, tblTop + 6);

    const flatProducts = [];
    (compra.productos || []).forEach(p => {
      const vars = p.variantes && p.variantes.length > 0
        ? p.variantes
        : [{ talla: p.talla || '-', cantidad: p.cantidad || 0 }];
      
      vars.forEach(v => {
        flatProducts.push({
          nombre: p.nombre,
          talla: v.talla || '-',
          cantidad: parseInt(v.cantidad) || 0,
          precioCompra: p.precioCompra
        });
      });
    });

    const mergedProducts = flatProducts.reduce((acc, p) => {
      const existing = acc.find(item => item.nombre === p.nombre && item.talla === p.talla);
      if (existing) {
        existing.cantidad += p.cantidad;
      } else {
        acc.push({
          nombre: p.nombre,
          talla: p.talla,
          cantidad: p.cantidad,
          precioCompra: p.precioCompra
        });
      }
      return acc;
    }, []).sort((a, b) => a.nombre.localeCompare(b.nombre));

    let y = tblTop + rowHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    mergedProducts.forEach((p, idx) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      if (idx % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(tblLeft, y, tblWidth, rowHeight, 'F');
      }

      doc.setDrawColor(200, 200, 200);
      doc.rect(tblLeft, y, tblWidth, rowHeight, 'S');
      colX.slice(1).forEach(x => {
        doc.line(x, y, x, y + rowHeight);
      });

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(String(idx + 1), colX[0] + 3, y + 6);

      doc.setFont('helvetica', 'bold');
      const nombreText = toTitleCase(String(p.nombre || '')).substring(0, 32);
      doc.text(nombreText, colX[1] + 3, y + 6);

      doc.setFont('helvetica', 'normal');
      const tallaVal = p.talla && p.talla !== "undefined" && p.talla !== "null" ? String(p.talla) : '-';
      const tallaText = tallaVal.trim() === '' ? '-' : tallaVal;
      doc.text(tallaText, colX[2] + 3, y + 6);
      doc.text(String(p.cantidad || 0), colX[3] + 3, y + 6);
      const subtotal = (parseFloat(p.precioCompra) || 0) * (parseInt(p.cantidad) || 0);
      doc.text(`$${Number(subtotal).toLocaleString('es-CO')}`, colX[4] + 3, y + 6);

      y += rowHeight;
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("GORRAS MEDELLÍN - Tu estilo, nuestra pasión", 105, pageHeight - 18, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("Alfonzo López - Medellin | WhatsApp: +57 300 6158180", 105, pageHeight - 13, { align: 'center' });
    doc.text("Email: duvann1991@gmail.com | Instagram: @gorrasmedellin", 105, pageHeight - 8, { align: 'center' });

    doc.save(`Compra_${displayedNum}_GMCAPS.pdf`);
  };

  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="compras-container">
        <div className="compras-header">
          <div className="compras-header-top">
            <div className="compras-header-left">
              {modoVista !== "lista" && (
                <button onClick={mostrarLista} className="compras-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="compras-title">
                  {modoVista === "formulario" && (compraEditando ? "Editar Compra" : "Registrar Compra")}
                  {modoVista === "detalle" && "Detalle de Compra"}
                  {modoVista === "lista" && "Compras"}
                </h1>
                <p className="compras-subtitle">Gestiona y haz seguimiento de tus órdenes</p>
              </div>
            </div>

            {modoVista === "detalle" && (
              <button
                onClick={() => exportCompraToPDF(compraViendo)}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  padding: '0 15px',
                  height: '40px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FaFilePdf size={14} /> Descargar PDF
              </button>
            )}
            {modoVista === "lista" && (
              <button onClick={() => mostrarFormulario()} className="compras-btn-register">
                Registrar Compra
              </button>
            )}
            {modoVista === "formulario" && (
              <button 
                onClick={handleSubmit} 
                className={`compras-btn-submit ${actionLoading ? 'loading' : ''}`}
                disabled={actionLoading}
              >
                {actionLoading ? actionLoadingText : (compraEditando ? 'Actualizar Compra' : 'Registrar Compra')}
              </button>
            )}
          </div>

          {modoVista === "lista" && (
            <div className="compras-search-bar">
              <div className="devoluciones-search-wrapper">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar proveedor..."
                  onClear={() => setSearchTerm('')}
                  fullWidth={true}
                />
              </div>
              <div className="compras-filters">
                <StatusFilter 
                  filterStatus={filterStatus} 
                  onFilterSelect={setFilterStatus} 
                  statuses={availableStatuses}
                />
              </div>
            </div>
          )}
        </div>

        {modoVista === "lista" ? (
          <div className="compras-main-content">
            <div style={{ flex: '0 0 auto' }}>
              <EntityTable
                entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                columns={columns}
                onView={mostrarDetalle}
                onComplete={handleCompletarCompra}
                onAnular={v => setAnnulModal({ isOpen: true, compra: v })}
                moduleType="compras"
                loading={loading}
                className="compras-entity-table"
              />
            </div>

            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              endIndex={Math.min(currentPage * itemsPerPage, filtered.length)}
              itemsName="compras"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <CompraForm
            nuevaCompra={nuevaCompra}
            setNuevaCompra={setNuevaCompra}
            errors={errors}
            proveedoresActivos={proveedoresActivos}
            availablePaymentMethods={availablePaymentMethods}
            availableSizes={availableSizes}
            availableProducts={availableProducts}
            isLoadingProducts={isLoadingProducts}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            calcularTotal={calcularTotal}
            agregarProducto={agregarProducto}
            actualizarProducto={actualizarProducto}
            eliminarProducto={eliminarProducto}
            detalleSearch={detalleSearch}
            setDetalleSearch={setDetalleSearch}
          />
        ) : (
          <CompraDetail
            compraViendo={compraViendo}
            detalleSearch={detalleSearch}
            setDetalleSearch={setDetalleSearch}
          />
        )}
      </div>

      <CompraModals
        completarModal={completarModal}
        setCompletarModal={setCompletarModal}
        annulModal={annulModal}
        setAnnulModal={setAnnulModal}
        confirmCompletarCompra={confirmCompletarCompra}
        handleAnularCompra={handleAnularCompra}
        actionLoading={actionLoading}
      />
    </>
  );
};

export default ComprasPage;