/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz (como Tarjetas, Modales o Botones).
Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */
import '../../styles/UniversalModal.css';
import React, { useEffect } from 'react';

const UniversalModal = ({
  isOpen,
  onClose,
  title = "Detalles",
  subtitle,
  children,
  showActions = false,
  showCancel = true,  // ✅ NUEVO PROP - Controla si se muestra el botón Cancelar
  onCancel,
  onConfirm,
  onSave,
  confirmText = "Guardar",
  actionLabel,
  customStyles = {},
  actions = [],
  size = 'medium',
  loading = false,
  loadingText
}) => {
  /* ============================
     CERRAR CON ESC
     ============================ */
  useEffect(() => {
    if (!isOpen) return;
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Also lock scroll for admin main layout content area (.al-main)
    const mainElements = document.querySelectorAll('.al-main');
    const originalMainOverflows = Array.from(mainElements).map(el => el.style.overflow);
    mainElements.forEach(el => {
      el.style.overflow = 'hidden';
    });

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalBodyOverflow;
      mainElements.forEach((el, idx) => {
        el.style.overflow = originalMainOverflows[idx] || '';
      });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCancel = onCancel || onClose || (() => {});

  // Estilos personalizados si vienen por props
  const modalContentStyle = customStyles.content || {};
  const modalOverlayStyle = customStyles.overlay || {};

  return (
    <div
      className="universal-modal-overlay"
      onMouseDown={() => {}}
      style={modalOverlayStyle}
    >
      <div
        className={`universal-modal-container modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={modalContentStyle}
      >
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="modal-header-section">
          <h2 className="modal-title-main">{title}</h2>
          {subtitle && (
            <p className="modal-subtitle-text">{subtitle}</p>
          )}
        </div>

        {/* FORM CONTAINER WITH STICKY FOOTER */}
        <form
          className="modal-form-wrapper"
          style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (loading) return;
            
            if (showActions || actions.length > 0) {
              const primaryAction = actions.find(a => a.variant !== 'secondary') || { onClick: onSave || onConfirm };
              primaryAction.onClick?.();
            } else {
              (onSave || onConfirm)?.();
            }
          }}
        >
          {/* CONTENT */}
          <div className="modal-content-scroll" style={{ overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '4px' }}>
            {children}
          </div>

          {/* STICKY FOOTER */}
          {(showActions || actions.length > 0) && (
            <div className="modal-footer-actions">
              {actions.length > 0 ? (
                actions.map((action, idx) => (
                  <button
                    key={idx}
                    type={action.variant === 'secondary' ? 'button' : 'submit'}
                    onClick={() => {
                      if (action.variant === 'secondary') {
                        if (loading) return;
                        action.onClick?.();
                        if (action.closeOnClick !== false) onClose();
                      }
                    }}
                    className={`btn-modal-base ${action.variant === 'secondary' ? 'btn-modal-cancel' : 'btn-modal-confirm'} ${loading ? 'loading' : ''}`}
                    disabled={loading || action.disabled}
                  >
                    {loading && action.variant !== 'secondary' ? (loadingText || "Procesando...") : action.label}
                  </button>
                ))
              ) : (
                <>
                  {/* ✅ BOTÓN CANCELAR - CONDICIONAL */}
                  {showCancel && (
                    <button
                      type="button"
                      onClick={() => { if (!loading) handleCancel(); }}
                      className="btn-modal-base btn-modal-cancel"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    type="submit"
                    className={`btn-modal-base btn-modal-confirm ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {actionLabel || confirmText}
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UniversalModal;