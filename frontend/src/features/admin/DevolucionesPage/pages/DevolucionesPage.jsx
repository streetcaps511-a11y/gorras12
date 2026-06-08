/* === PÁGINA PRINCIPAL ===
   Este componente es la interfaz visual principal de Devoluciones (Garantías y Cambios).
   Se encarga de renderizar la vista general: la barra de búsqueda y filtros, la tabla de
   registros (EntityTable) y la paginación.
   Para mantener el código limpio y mantenible, delega las vistas específicas de Formulario,
   Detalle y Modales a componentes hijos especializados:
   - DevolucionForm: Formulario de registro con búsquedas optimizadas.
   - DevolucionDetail: Ficha de visualización de detalles del cambio de producto.
   - DevolucionModals: Modales de confirmación para aprobar, rechazar, eliminar y ampliar imagen. */

import "../style/index.css";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import {
  EntityTable,
  Alert,
  SearchInput,
  CustomPagination,
  StatusPill,
  ConfirmDeleteModal,
} from "../../../shared/services";
import { useDevolucionesLogic } from "../hooks/useDevolucionesLogic";
import StatusFilter from "../components/StatusFilter";

// Componentes locales refacturados
import DevolucionForm from "../components/DevolucionForm";
import DevolucionDetail from "../components/DevolucionDetail";
import DevolucionModals from "../components/DevolucionModals";

const DevolucionesPage = () => {
  const {
    modoVista,
    availableStatuses,
    clientes,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    alert,
    setAlert,
    errors,
    devolucionViendo,
    setDevolucionViendo,
    formData,
    setFormData,
    loadingVentas,
    ventasCliente,
    productosVenta,
    productosMismoPrecio,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    handleImageUpload,
    handleSubmit,
    submitting,
    actionLoading,
    updateStatus,
    filtered,
    deleteDevolucion,
  } = useDevolucionesLogic();

  // Estados locales para acciones de los modales
  const [devParaAprobar, setDevParaAprobar] = useState(null);
  const [devParaRechazar, setDevParaRechazar] = useState(null);
  const [devParaAnular, setDevParaAnular] = useState(null);
  const [devParaEliminar, setDevParaEliminar] = useState(null);
  const [motivoRechazoTabla, setMotivoRechazoTabla] = useState("");
  const [expandedImage, setExpandedImage] = useState(null);

  const handleConfirmDelete = async () => {
    if (devParaEliminar) {
      await deleteDevolucion(devParaEliminar.id);
      setDevParaEliminar(null);
    }
  };

  // Reiniciar scroll al cambiar de vista o de registro en pantalla
  useEffect(() => {
    window.scrollTo(0, 0);
    const wrappers = document.querySelectorAll(
      ".devoluciones-container, .yellow-scrollbar"
    );
    wrappers.forEach((w) => (w.scrollTop = 0));
  }, [modoVista, devolucionViendo]);

  const columns = [
    {
      header: "N° de devolución",
      field: "noDevolucion",
      render: (item) => {
        let num = Number(item.noDevolucion || item.id);
        if (num < 10000) num += 10000;
        return <span className="dev-id-text">DEV-{num}</span>;
      },
    },
    {
      header: "Cliente",
      field: "cliente",
      render: (item) => <span className="dev-client-text">{item.cliente}</span>,
    },
    {
      header: "Producto/Orden",
      field: "productoOriginal",
      render: (item) => {
        if (item.pedidoCompleto) {
          const raw = item.noVenta || item.idVenta || "";
          const num = parseInt(raw);
          const formattedNum = (!isNaN(num) && num < 1000) ? String(1000 + num) : String(raw);
          return <span className="dev-product-text">Orden Completa #{formattedNum}</span>;
        }
        return <span className="dev-product-text">{item.productoOriginal}</span>;
      },
    },
    {
      header: "Valor",
      field: "precio",
      render: (item) => (
        <span className="dev-price-text">${item.precio.toLocaleString()}</span>
      ),
    },
    {
      header: "Estado",
      field: "estado",
      render: (item) => <StatusPill status={item.estado} />,
    },
  ];

  return (
    <React.Fragment>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() =>
            setAlert({ show: false, message: "", type: "success" })
          }
        />
      )}

      <div className="devoluciones-container">
        {/* CABECERA */}
        <div className="devoluciones-header">
          <div className="devoluciones-header-top">
            <div className="devoluciones-header-left">
              {(modoVista === "formulario" || modoVista === "detalle") && (
                <button
                  onClick={mostrarLista}
                  className="devoluciones-btn-back"
                >
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="devoluciones-title">
                  {modoVista === "lista" && "Devoluciones"}
                  {modoVista === "formulario" && "Registrar Devolución"}
                  {modoVista === "detalle" && "Detalle de Devolución"}
                </h1>
                <p className="devoluciones-subtitle">
                  {modoVista === "lista" &&
                    "Gestión de garantías y cambios de producto"}
                  {modoVista === "formulario" &&
                    "Ingrese los datos del producto y la evidencia necesaria"}
                  {modoVista === "detalle" &&
                    "Revisión de solicitud de devolución"}
                </p>
              </div>
            </div>

            {modoVista === "lista" && (
              <button
                onClick={mostrarFormulario}
                className="devoluciones-btn-register"
              >
                Registrar Devolución
              </button>
            )}

            {modoVista === "formulario" && (
              <button
                onClick={handleSubmit}
                className="devoluciones-btn-submit"
                id="btn-save-devolucion"
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "Guardar Solicitud"}
              </button>
            )}
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        {modoVista === "lista" && (
          <div className="devoluciones-search-bar">
            <div className="devoluciones-search-wrapper">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por cliente, ID o producto..."
                onClear={() => setSearchTerm("")}
                fullWidth={true}
              />
            </div>
            <div className="devoluciones-filter-container">
              <StatusFilter
                filterStatus={filterStatus}
                onFilterSelect={setFilterStatus}
                statuses={availableStatuses}
              />
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL SEGÚN EL MODO DE VISTA */}
        {modoVista === "lista" ? (
          <div className="devoluciones-main-content">
            <div className="devoluciones-table-wrapper">
              <EntityTable
                entities={filtered.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )}
                columns={columns}
                onView={mostrarDetalle}
                onApprove={(row) => setDevParaAprobar(row)}
                onReject={(row) => setDevParaRechazar(row)}
                moduleType="devoluciones"
              />
            </div>
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={
                filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
              }
              endIndex={Math.min(currentPage * itemsPerPage, filtered.length)}
              itemsName="devoluciones"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <DevolucionForm
            formData={formData}
            setFormData={setFormData}
            clientes={clientes}
            ventasCliente={ventasCliente}
            productosVenta={productosVenta}
            productosMismoPrecio={productosMismoPrecio}
            loadingVentas={loadingVentas}
            errors={errors}
            handleImageUpload={handleImageUpload}
          />
        ) : (
          <DevolucionDetail
            devolucionViendo={devolucionViendo}
            setDevolucionViendo={setDevolucionViendo}
            setExpandedImage={setExpandedImage}
          />
        )}
      </div>

      {/* MODALES DE CONTROL */}
      <DevolucionModals
        devParaAprobar={devParaAprobar}
        setDevParaAprobar={setDevParaAprobar}
        devParaRechazar={devParaRechazar}
        setDevParaRechazar={setDevParaRechazar}
        motivoRechazoTabla={motivoRechazoTabla}
        setMotivoRechazoTabla={setMotivoRechazoTabla}
        devParaAnular={devParaAnular}
        setDevParaAnular={setDevParaAnular}
        expandedImage={expandedImage}
        setExpandedImage={setExpandedImage}
        availableStatuses={availableStatuses}
        updateStatus={updateStatus}
        actionLoading={actionLoading}
      />

      <ConfirmDeleteModal
        isOpen={!!devParaEliminar}
        onClose={() => setDevParaEliminar(null)}
        onConfirm={handleConfirmDelete}
        entityName="devolución"
        entityData={{
          nombre: devParaEliminar ? `DEV-${Number(devParaEliminar.noDevolucion || devParaEliminar.id) < 10000 ? Number(devParaEliminar.noDevolucion || devParaEliminar.id) + 10000 : (devParaEliminar.noDevolucion || devParaEliminar.id)}` : '',
          descripcion: devParaEliminar ? `de cliente ${devParaEliminar.cliente} por valor $${devParaEliminar.precio.toLocaleString()}` : ''
        }}
        loading={actionLoading}
      />
    </React.Fragment>
  );
};

export default DevolucionesPage;