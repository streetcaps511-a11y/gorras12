/* === SUB-COMPONENTE DE MODALES ===
   Este componente contiene los modales de confirmación del módulo de Compras:
   - Confirmar completado de registro de compra.
   - Confirmar anulación de una compra. */

import React from 'react';

const CompraModals = ({
  completarModal,
  setCompletarModal,
  annulModal,
  setAnnulModal,
  confirmCompletarCompra,
  handleAnularCompra,
  actionLoading,
}) => {
  return (
    <>
      {/* MODAL DE CONFIRMACIÓN DE COMPLETAR */}
      {completarModal.isOpen && (
        <div className="gm-confirm-modal-overlay">
          <div className="gm-confirm-modal-box">
            <h3 className="gm-confirm-modal-title">Confirmar Registro</h3>
            <p className="gm-confirm-modal-text">
              ¿Estás seguro de que deseas completar el registro de la compra <strong>#{completarModal.compra?.numCompra}</strong>?
            </p>
            <div className="gm-confirm-modal-buttons">
              <button 
                onClick={() => setCompletarModal({ isOpen: false, compra: null })}
                className="gm-confirm-modal-btn-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmCompletarCompra}
                className="gm-confirm-modal-btn-confirm"
                disabled={actionLoading}
              >
                {actionLoading ? 'Completando...' : 'Completar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ANULAR */}
      {annulModal.isOpen && (
        <div className="delete-modal-backdrop">
          <div className="delete-modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="delete-modal-title">Anular Compra</h2>

            <div className="delete-modal-message-container">
              <p className="delete-modal-message" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                ¿Estás seguro que deseas <span style={{ color: '#F5C81B', fontWeight: '800' }}>anular la compra #{annulModal.compra?.numeroRecibo || annulModal.compra?.id || annulModal.compra?.numCompra}</span>?
              </p>
            </div>

            <div className="delete-modal-actions">
              <button 
                onClick={() => setAnnulModal({ isOpen: false, compra: null })} 
                className="delete-modal-btn delete-modal-btn-cancel"
              >
                Cancelar
              </button>

              <button 
                onClick={handleAnularCompra} 
                className="delete-modal-btn delete-modal-btn-confirm"
                disabled={actionLoading}
              >
                {actionLoading ? 'Anulando...' : 'Anular compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompraModals;
