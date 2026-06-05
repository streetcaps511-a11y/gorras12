/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React, { useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import '../style/Categorias.css';
import { useCategoriasLogic } from '../hooks/useCategoriasLogic';
import { StatusFilter } from '../components';
import EntityTable from '../../../shared/components/admin/EntityTable';

// Shared Components
import SearchInput from '../../../shared/components/admin/SearchInput';
import UniversalModal from '../../../shared/components/admin/UniversalModal';
import ConfirmDeleteModal from '../../../shared/components/admin/ConfirmDeleteModal';
import CustomPagination from '../../../shared/components/admin/CustomPagination';
import Alert from '../../../shared/components/admin/Alert';
import StatusPill from '../../../shared/components/admin/StatusPill';

const CategoriasPage = () => {
  const {
    alert, setAlert, modalState, deleteModalState, searchTerm, setSearchTerm,
    filterStatus, currentPage, totalItems, totalPages, startItem, endItem,
    paginatedCategories, handlePageChange, handleFilterSelect, clearSearch,
    openModal, closeModal, openDeleteModal, closeDeleteModal,
    handleSave, handleDelete, formData, errors,
    handleInputChange, loading, handleToggleStatus
  } = useCategoriasLogic();

  const isValidUrl = (url) => {
    if (!url) return true;
    if (String(url).startsWith('data:image/')) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };


  const imgInputRef = useRef(null);

  const handleImageFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange('imagenUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderField = (label, fieldName, type = 'text') => {
    const isReadOnly = modalState.mode === 'view';
    const isError = isReadOnly ? false : (errors[fieldName] || false);
    const value = isReadOnly ? (modalState.category?.[fieldName] || 'N/A') : (formData[fieldName] || '');

    return (
      <div className="form-field">
        <label className={`form-field__label ${isReadOnly ? 'readonly-field' : 'form-field__label--required'}`}>
          {label}:
        </label>
        {type === 'textarea' ? (
          <textarea
            name={fieldName}
            value={value}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field__textarea ${isReadOnly ? 'readonly-field' : ''} ${isError ? 'form-field__textarea--error' : ''}`}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
          />
        ) : fieldName === 'imagenUrl' && !isReadOnly ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              name={fieldName}
              type={type}
              value={value}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`form-field__input ${isError || (value && !isValidUrl(value)) ? 'form-field__input--error' : ''}`}
              placeholder={`Ingrese ${label.toLowerCase()}...`}
              style={{ flex: 1 }}
            />
            <label
              style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFC300', opacity: 0.85, width: '34px', height: '34px', border: '1px solid #334155', borderRadius: '6px', flexShrink: 0, backgroundColor: 'transparent', transition: 'all 0.2s' }}
              title="Subir imagen desde el computador"
            >
              <FaImage size={15} />
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImageFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <input
            name={fieldName}
            type={type}
            value={value}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field__input ${isReadOnly ? 'readonly-field' : ''} ${fieldName === 'imagenUrl' ? 'form-field__input--sm' : ''} ${isError || (fieldName === 'imagenUrl' && value && !isValidUrl(value)) ? 'form-field__input--error' : ''}`}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
          />
        )}
        
        {fieldName === 'imagenUrl' && value && value !== 'N/A' && !isValidUrl(value) && !isReadOnly && (
           <div className="form-field__error form-field__error--visible">
             <span className="form-field__error-icon">●</span> URL inválida
           </div>
        )}

        
        {fieldName === 'imagenUrl' && value && value !== 'N/A' && (
          <div className="image-preview" style={{ marginTop: '15px', height: '180px', display: 'flex', justifyContent: 'center', backgroundColor: '#0f172a', borderRadius: '8px', padding: '10px', border: '1px solid #1e293b' }}>
            <img src={value} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
          </div>
        )}
        
        {!isReadOnly && (
          <div className={`form-field__error ${isError ? 'form-field__error--visible' : ''}`}>
            {isError && (
              <>
                <span className="form-field__error-icon">●</span>
                {isError}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="categorias-page">
        {/* Header */}
        <div className="categorias-page__header">
          <div className="categorias-page__title-section">
            <div>
              <h1 className="categorias-page__title">Categorías</h1>
              <p className="categorias-page__subtitle">Administra las categorías de productos</p>
            </div>
            <button onClick={() => openModal('create')} className="btn-primary">
              Registrar Categoría
            </button>
          </div>
          <div className="categorias-page__actions" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', marginBottom: '2px' }}>
            <div style={{ flex: 1, marginRight: '15px' }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre o descripción..."
                onClear={clearSearch}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterChange={handleFilterSelect} />
          </div>
        </div>

        {/* Content Area */}
        <div className="categories-container">
          <div className="categories-table-wrapper">
            <EntityTable 
              entities={paginatedCategories}
              loading={loading}
              columns={[
                { header: 'Nombre', field: 'nombre', width: '220px' },
                { header: 'Descripción', field: 'descripcion', width: '350px' },
                { 
                  header: 'Estado', 
                  field: 'isActive',
                  width: '120px',
                  render: (cat) => <StatusPill status={cat.isActive} />
                }
              ]}
              onView={(cat) => openModal('view', cat)}
              onEdit={(cat) => openModal('edit', cat)}
              onDelete={(cat) => openDeleteModal(cat)}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              estadoField="isActive"
              moduleType="categorias"
            />
          </div>

          {totalItems > 0 && !loading && (
            <CustomPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              showingStart={startItem}
              endIndex={endItem}
              itemsName="categorías"
            />
          )}
        </div>
      </div>

      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Registrar categoría' : modalState.mode === 'edit' ? 'Editar categoría' : 'Detalles de la categoría'}
        subtitle={modalState.mode === 'create' ? 'Complete la información para registrar una nueva categoría' : modalState.mode === 'edit' ? 'Modifique la información de la categoría' : 'Información detallada de la categoría'}
        size="medium"
        loading={loading}
        actions={modalState.mode === 'view' ? [
          { label: 'Cerrar', variant: 'primary', onClick: closeModal }
        ] : [
          { label: 'Cancelar', variant: 'secondary', onClick: closeModal },
          { label: modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios', variant: 'primary', onClick: handleSave }
        ]}
      >
        <div className="modal-content__body">
          {renderField('Nombre', 'nombre')}
          {renderField('Descripción', 'descripcion', 'textarea')}
          {renderField('URL de Imagen', 'imagenUrl')}
        </div>
      </UniversalModal>

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="categoría"
        entityData={deleteModalState.category}
        loading={loading}
      />

      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
    </>
  );
};

export default CategoriasPage;