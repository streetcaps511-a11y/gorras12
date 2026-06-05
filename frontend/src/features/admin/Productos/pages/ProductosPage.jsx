/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import '../style/index.css';

// ===== COMPONENTES COMPARTIDOS =====
import { Alert, EntityTable, SearchInput, ConfirmDeleteModal, StatusPill } from '../../../shared/services';
import CustomPagination from '../../../shared/components/admin/CustomPagination';

import CategoryFilter from '../components/CategoryFilter';
import StatusFilter from '../components/StatusFilter';
import DetalleProductoView from '../components/DetalleProductoView';
import ProductoForm from '../components/ProductoForm';

// ===== HOOKS =====
import { useProductosLogic } from '../hooks/useProductosLogic';

const columns = [
  {
    header: 'Producto',
    field: 'nombre',
    width: '250px'
  },
  {
    header: 'Categoría',
    field: 'categoria',
    width: '240px'
  },
  {
    header: 'Precio',
    field: 'precioVenta',
    width: '130px',
    render: (item) => <span className="price-text">${Math.round(Number(item.precioVenta || 0)).toLocaleString('es-CO')}</span>
  },
  {
    header: 'Stock',
    field: 'stock',
    width: '100px',
    render: (item) => {
      // Sumar cantidades de todas las tallas para el stock total
      const hasTallasStock = Array.isArray(item.tallasStock) && item.tallasStock.length > 0;
      const totalStock = hasTallasStock
        ? item.tallasStock.reduce((acc, ts) => acc + (Number(ts.cantidad) || 0), 0)
        : Number(item.stock || 0);
      return (
        <span style={{ 
          color: totalStock > 20 ? '#10B981' : (totalStock > 10 ? '#F5C81B' : '#EF4444'),
          fontWeight: '700'
        }}>
          {totalStock} uds
        </span>
      );
    }
  },
  {
    header: 'Estado',
    field: 'status_display',
    width: '120px',
    render: (item) => (
      <StatusPill 
        status={item.isActive === true || item.isActive === 1 || item.isActive === 'true'} 
      />
    )
  }
];

const ProductosPage = () => {
  const {
    modoVista,
    productoEditando,
    productoViendo,
    searchTerm, setSearchTerm,
    categoriaFiltro: _categoriaFiltro,
    currentPage, setCurrentPage,
    alert, setAlert,
    deleteModal,
    formData,
    tallasStock,
    categoriasRaw,
    categoriasUnicas,
    availableTallas,
    availableStatuses,
    urlsImagenes,
    coloresProducto,
    errors,
    loading,
    filterStatus,
    filteredProductos,
    paginatedProductos,
    totalPages,
    showingStart,
    endIndex,
    handleFilterSelect: _handleFilterSelect,
    handleStatusSelect,
    agregarTalla,
    eliminarTalla,
    handleTallaChange,
    incrementarCantidad,
    decrementarCantidad,
    agregarUrlImagen,
    eliminarUrlImagen,
    actualizarUrlImagen,
    agregarColor,
    eliminarColor,
    actualizarColor,
    handleCantidadChange,
    mostrarLista,
    mostrarFormulario,
    handleSubmit,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleInputChange,
    handleVerDetalle,
    handleEditarProducto,
    handleToggleStatus
  } = useProductosLogic();

  return (
    <div className="productos-page-wrapper">
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="producto"
        entityData={deleteModal.producto}
        customMessage={deleteModal.customMessage}
        loading={loading}
      />



      <div className="productos-container">
        {/* HEADER */}
        <div className="productos-header">
          <div className="productos-header-top">
            <div className="productos-header-left">
              {(modoVista === "formulario" || modoVista === "detalle") && (
                <button onClick={mostrarLista} className="productos-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="productos-title">
                  {modoVista === "formulario" && (productoEditando ? "Editar Producto" : "Registrar Productos")}
                  {modoVista === "detalle" && "Detalle del Producto"}
                  {modoVista === "lista" && "Productos"}
                </h1>
                <p className="productos-subtitle">
                  {modoVista === "formulario" && (productoEditando ? "Modifique la información del producto seleccionado" : "Complete el formulario para registrar un nuevo producto")}
                  {modoVista === "detalle" && `Información detallada de "${productoViendo?.nombre}"`}
                  {modoVista === "lista" && 'Gestión de productos y stock'}
                </p>
              </div>
            </div>

            <div className="productos-actions">
              {modoVista === "lista" && (
                <button onClick={() => mostrarFormulario()} className="productos-btn-register">
                  Registrar Productos
                </button>
              )}

              {modoVista === "formulario" && (
                <button type="submit" form="productoForm" className="productos-btn-submit" disabled={loading}>
                  {loading ? "Guardando..." : (productoEditando ? "Actualizar" : "Registrar Producto")}
                </button>
              )}
            </div>
          </div>

          {modoVista === "lista" && (
            <div className="productos-search-bar">
              <div style={{ flex: 1, marginRight: '20px' }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar productos por nombre..."
                  onClear={() => setSearchTerm('')}
                  fullWidth={true}
                />
              </div>
              <div className="productos-filter-container">
                <StatusFilter 
                  filterStatus={filterStatus}
                  onFilterSelect={handleStatusSelect}
                />
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        {modoVista === "lista" ? (
          <div className="productos-main-content">
            <div className="productos-table-wrapper">
              <EntityTable
                entities={paginatedProductos}
                columns={columns}
                onView={handleVerDetalle}
                onEdit={handleEditarProducto}
                onDelete={openDeleteModal}
                onAnular={handleToggleStatus}
                onReactivar={handleToggleStatus}
                showDeleteButton={true}
                idField="id"
                estadoField="isActive"
                actionIconSize={18}
                actionGap={12}
                moduleType="productos"
                loading={loading}
                className="productos-entity-table"
              />
            </div>

            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredProductos.length}
              showingStart={showingStart}
              endIndex={endIndex}
              itemsName="productos"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <ProductoForm 
            formData={formData}
            errors={errors}
            categoriasRaw={categoriasRaw}
            categoriasUnicas={categoriasUnicas}
            tallasStock={tallasStock}
            availableTallas={availableTallas}
            availableStatuses={availableStatuses}
            coloresProducto={coloresProducto}
            urlsImagenes={urlsImagenes}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            agregarTalla={agregarTalla}
            eliminarTalla={eliminarTalla}
            handleTallaChange={handleTallaChange}
            incrementarCantidad={incrementarCantidad}
            decrementarCantidad={decrementarCantidad}
            agregarUrlImagen={agregarUrlImagen}
            eliminarUrlImagen={eliminarUrlImagen}
            actualizarUrlImagen={actualizarUrlImagen}
            agregarColor={agregarColor}
            eliminarColor={eliminarColor}
            actualizarColor={actualizarColor}
            handleCantidadChange={handleCantidadChange}
          />
        ) : (
          <DetalleProductoView producto={productoViendo} />
        )}
      </div>
    </div>
  );
};

export default ProductosPage;
