/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import '../style/index.css';
import React from 'react';
import { EntityTable, Alert, SearchInput, UniversalModal, ConfirmDeleteModal, CustomPagination, StatusPill } from '../../../shared/services';

import { useClientesLogic } from '../hooks/useClientesLogic';
import { StatusFilter } from '../components/StatusFilter';
import { ClienteFormFields } from '../components/ClienteFormFields';

const columns = [
  {
    header: 'N° Documento',
    field: 'numeroDocumento',
    width: '140px'
  },
  {
    header: 'Nombre',
    field: 'nombreCompleto',
    width: '180px'
  },
  {
    header: 'Email',
    field: 'email',
    width: '230px'
  },
  {
    header: 'Teléfono',
    field: 'telefono',
    width: '130px'
  },
  {
    header: 'Estado',
    field: 'isActive',
    width: '120px',
    render: (item) => (
      <StatusPill 
        status={item.isActive === true || item.isActive === 1 || item.isActive === 'true'} 
      />
    )
  }
];

const ClientesPage = () => {
  const {
    searchTerm, setSearchTerm, filterStatus, alert, setAlert, departamentos, ciudades, loadingCities,
    modalState, formData, errors, deleteModal, firstInputRef, filtered, loading,
    currentPage, setCurrentPage, totalPages, paginatedClientes, showingStart, endIndex,
    handleFilterSelect, openModal, closeModal, handleInputChange, handleSave,
    openDeleteModal, closeDeleteModal, handleDelete, handleToggleStatus
  } = useClientesLogic();



  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
      
      <div className="clientes-container">
        <div className="clientes-header">
          <div className="clientes-header-top">
            <div>
              <h1 className="clientes-title">Clientes</h1>
              <p className="clientes-subtitle">Gestión de clientes registrados</p>
            </div>
            <div className="clientes-actions">
              <button
                onClick={() => openModal("create")}
                className="clientes-btn-register"
              >
                Registrar Cliente
              </button>
            </div>
          </div>
        
          <div className="clientes-search-bar">
            <div className="clientes-search-container">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por documento, nombre, email o ciudad..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} handleFilterSelect={handleFilterSelect} />
          </div>
        </div>

        <div className="clientes-main-content">
          <div className="clientes-table-wrapper">
            <EntityTable 
              entities={paginatedClientes} 
              columns={columns} 
              onView={c => openModal('view', c)} 
              onEdit={c => openModal('edit', c)} 
              onDelete={openDeleteModal}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              showDeleteButton={true}
              loading={loading}
              moduleType="clientes"
              estadoField="isActive"
              actionIconSize={18}
              actionGap={12}
            />
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            showingStart={showingStart}
            endIndex={endIndex}
            itemsName="clientes"
          />
        </div>
      </div>

      {/* MODAL DE FORMULARIO */}
      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.mode === 'create' ? 'Registrar cliente' : 
          modalState.mode === 'edit' ? 'Editar cliente' : 
          'Detalles del cliente'
        }
        subtitle={modalState.mode === 'create' ? "Complete el formulario para registrar un nuevo cliente" : modalState.mode === 'edit' ? "Modifique los datos del cliente seleccionado" : "Consulta de información histórica del cliente"}
        size="medium"
        onSave={handleSave}
        actions={modalState.mode === 'view' ? [
          { label: 'Cerrar', variant: 'primary', onClick: closeModal }
        ] : [
          { label: 'Cancelar', variant: 'secondary', onClick: closeModal },
          { label: modalState.mode === 'edit' ? 'Guardar Cambios' : 'Guardar', variant: 'primary', onClick: handleSave }
        ]}
      >
        <div className="clientes-form-wrapper yellow-scrollbar">
          <ClienteFormFields 
            modalState={modalState} 
            formData={formData} 
            handleInputChange={handleInputChange} 
            errors={errors} 
            departamentos={departamentos} 
            ciudades={ciudades} 
            loadingCities={loadingCities} 
            firstInputRef={firstInputRef}
          />
        </div>
      </UniversalModal>
    
      <>
        <ConfirmDeleteModal 
          isOpen={deleteModal.isOpen} 
          onClose={closeDeleteModal} 
          onConfirm={handleDelete} 
          entityName="cliente"
          entityData={deleteModal.cliente}
          loading={loading}
        />

      </>
    </>
  );
};

export default ClientesPage;
