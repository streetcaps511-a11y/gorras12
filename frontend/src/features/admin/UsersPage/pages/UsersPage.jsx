/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta de Usuarios. 
   Se encarga de dibujar el listado de usuarios del sistema, la barra de búsqueda y filtros,
   e invoca el Hook useUsersLogic para obtener todas las funciones y estados necesarios. */

import '../style/index.css';
import React, { useMemo } from 'react';

// ===== COMPONENTES COMPARTIDOS =====
import { Alert, EntityTable, SearchInput, UniversalModal, ConfirmDeleteModal, CustomPagination, StatusPill } from '../../../shared/services';

// ===== COMPONENTES LOCALES =====
import StatusFilter from '../components/StatusFilter';
import UserFormFields from '../components/UserFormFields';

// ===== HOOKS =====
import { useUsersLogic } from '../hooks/useUsersLogic';

const UsersPage = () => {
  const { users, searchTerm, setSearchTerm, filterStatus, setFilterStatus, currentPage, setCurrentPage, loading, alert, setAlert, formData, errors, isModalOpen, editingUser, isConfirmOpen, userToDelete, isDetailsOpen, selectedUser, filteredUsers, paginatedUsers, totalPages, openModal, closeModal, handleInputChange, handleSave, openDeleteModal, closeDeleteModal, handleDelete, viewUserDetails, closeDetails, isAdministrador, availableStatuses: _availableStatuses, availableRoles, handleToggleStatus } = useUsersLogic();

  // Definir columnas dentro del componente para acceder a las funciones del hook
  const columns = useMemo(() => [
    {
      header: 'Nombre',
      field: 'nombreCompleto',
      width: '200px',
      render: (item) => (
        <span className="user-name-text">
          {item.nombre} {item.apellido}
        </span>
      )
    },
    {
      header: 'Email',
      field: 'email',
      width: '220px',
      render: (item) => (
        <span className="user-email-text">{item.email}</span>
      )
    },
    {
      header: 'Rol',
      field: 'rol',
      width: '130px',
      render: (item) => {
        const googleBadge = item.googleId || item.authProvider === 'google' || item.proveedor === 'google';
        return (
          <div className="users-role-container">
            <span className={`user-role-text ${item.rol === 'Administrador' ? 'admin' : ''}`}>
              {item.rol}
            </span>
            {googleBadge && (
              <span className="users-google-badge">
                Google
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Estado',
      field: 'isActive',
      width: '100px',
      render: (item) => <StatusPill status={item.isActive} />
    },
  ], []);

  const _isFormView = isModalOpen || isDetailsOpen;

  return (
    <div className="users-page-wrapper">
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(prev => ({ ...prev, show: false }))} 
        />
      )}

      <>
        <ConfirmDeleteModal
          isOpen={isConfirmOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          entityName="usuario"
          entityData={userToDelete}
          loading={loading}
        />

      </>

      <div className="users-container">
        {/* HEADER */}
        <div className="users-header">
          <div className="users-header-top">
            <div>
              <h1 className="users-title">Usuarios</h1>
              <p className="users-subtitle">Gestión de usuarios del sistema</p>
            </div>
            <button
              onClick={() => openModal()}
              className="users-btn-add users-btn-register-custom"
            >
              Registrar Usuario
            </button>
          </div>

          <div className="users-controls users-controls-custom">
            <div className="users-search-wrapper">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, email o documento..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <div className="users-filter-container">
              <StatusFilter 
                filterStatus={filterStatus} 
                onFilterSelect={setFilterStatus} 
                statuses={['ACTIVO', 'INACTIVO']}
              />
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="users-table-container">
          <div className="users-table-wrapper yellow-scrollbar">
            <EntityTable
              entities={paginatedUsers}
              columns={columns}
              onView={viewUserDetails}
              onEdit={openModal}
              onDelete={openDeleteModal}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              moduleType="usuarios"
              loading={loading}
              idField="id"
              estadoField="isActive"
              isAdministradorCheck={isAdministrador}
            />
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            showingStart={filteredUsers.length > 0 ? ((currentPage - 1) * 7) + 1 : 0}
            endIndex={Math.min(currentPage * 7, filteredUsers.length)}
            itemsName="usuarios"
          />
        </div>
      </div>

      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser?.id ? 'Editar usuario' : 'Registrar usuario'}
        subtitle={editingUser?.id ? "Modifique los datos de acceso y perfil del usuario" : "Complete el formulario para crear un nuevo acceso al sistema"}
        size="medium"
        onSave={handleSave}
        actions={[
          { label: 'Cancelar', variant: 'secondary', onClick: closeModal },
          { label: editingUser?.id ? 'Guardar Cambios' : 'Guardar', variant: 'primary', onClick: handleSave }
        ]}
      >
        <div className="users-form-wrapper yellow-scrollbar">
          <UserFormFields 
            editingUser={editingUser}
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            users={users}
            isAdministrador={isAdministrador}
            availableRoles={availableRoles}
          />
        </div>
      </UniversalModal>

      <UniversalModal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        title="Detalles del usuario"
        subtitle="Información completa y permisos del usuario seleccionado"
        size="medium"
        actions={[
          { label: 'Cerrar', variant: 'primary', onClick: closeDetails }
        ]}
      >
        <div className="users-form-wrapper yellow-scrollbar">
          <UserFormFields 
            editingUser={selectedUser}
            formData={{
              nombreCompleto: `${selectedUser?.nombre || ''} ${selectedUser?.apellido || ''}`.trim() || selectedUser?.nombreCompleto,
              email: selectedUser?.email || '',
              tipoDocumento: selectedUser?.tipoDocumento || '',
              numeroDocumento: selectedUser?.numeroDocumento || selectedUser?.NumeroDocumento || '',
              contacto: selectedUser?.telefono || selectedUser?.Telefono || selectedUser?.contacto || '',
              rol: selectedUser?.rol || '',
              idRol: selectedUser?.idRol || selectedUser?.IdRol || '',
              clave: '',
              isActive: selectedUser?.isActive
            }}
            handleInputChange={() => {}}
            errors={{}}
            users={users}
            isAdministrador={isAdministrador}
            availableRoles={availableRoles}
            isReadOnly={true}
          />
        </div>
      </UniversalModal>
    </div>
  );
};

export default UsersPage;
