/* === SUB-COMPONENTE DE MODALES ===
   Este componente contiene todos los modales de confirmación del módulo de Devoluciones:
   - Aprobación de devolución.
   - Rechazo de devolución (con motivo obligatorio).
   - Eliminación de devolución (para borrar duplicados).
   - Vista ampliada de la imagen de evidencia. */

import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const DevExpandedImageModal = ({ src, onClose }) => {
  const [zoomed, setZoomed] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoomed(!zoomed);
  };

  return (
    <div
      className="dev-expanded-image-backdrop"
      onClick={onClose}
    >
      <div
        className="dev-expanded-image-container"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'hidden', borderRadius: '12px' }}
      >
        <button
          onClick={onClose}
          className="dev-expanded-image-close"
        >
          X
        </button>
        <div
          onMouseMove={handleMouseMove}
          onClick={toggleZoom}
          style={{
            overflow: 'hidden',
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '12px'
          }}
        >
          <img
            src={src}
            alt="Evidencia Ampliada"
            className="dev-expanded-image"
            style={{
              transition: zoomed ? 'none' : 'transform 0.2s ease',
              transformOrigin: `${position.x}% ${position.y}%`,
              transform: zoomed ? 'scale(2.5)' : 'scale(1)',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const DevolucionModals = ({
  devParaAprobar,
  setDevParaAprobar,
  devParaRechazar,
  setDevParaRechazar,
  motivoRechazoTabla,
  setMotivoRechazoTabla,
  expandedImage,
  setExpandedImage,
  availableStatuses,
  updateStatus,
  actionLoading,
}) => {
  return (
    <>
      {/* MODAL DE CONFIRMACIÓN: APROBAR */}
      {devParaAprobar && (
        <div
          className="delete-modal-backdrop"
          onClick={() => setDevParaAprobar(null)}
        >
          <div
            className="delete-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="delete-modal-title">Confirmar Aprobación</h3>
            <div className="delete-modal-message-container">
              <p className="delete-modal-message">
                ¿Estás seguro de que deseas{" "}
                <span style={{ color: "#F5C81B", fontWeight: 800 }}>
                  APROBAR
                </span>{" "}
                la devolución para{" "}
                <span className="delete-modal-highlight">
                  {devParaAprobar.cliente}
                </span>
                ?
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-btn delete-modal-btn-cancel"
                onClick={() => setDevParaAprobar(null)}
                disabled={actionLoading}
              >
                CANCELAR
              </button>
              <button
                className="delete-modal-btn delete-modal-btn-confirm"
                disabled={actionLoading}
                onClick={() => {
                  const status =
                    availableStatuses.find((s) => {
                      const str = String(s).toLowerCase();
                      return str.includes("aprob") || str.includes("complet");
                    }) || "Completada";
                  updateStatus(devParaAprobar, status);
                  setDevParaAprobar(null);
                }}
              >
                {actionLoading ? "APROBANDO..." : "APROBAR AHORA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RECHAZO: MOTIVO OBLIGATORIO */}
      {devParaRechazar && (
        <div
          className="delete-modal-backdrop"
          onClick={() => {
            setDevParaRechazar(null);
            setMotivoRechazoTabla("");
          }}
        >
          <div
            className="delete-modal-container"
            style={{ maxWidth: "550px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="delete-modal-title">Rechazar Solicitud</h3>
            <div className="delete-modal-message-container">
              <p className="delete-modal-message">
                Indique el motivo del rechazo para la solicitud de{" "}
                <span className="delete-modal-highlight">
                  {devParaRechazar.cliente}
                </span>
                :
              </p>
              <textarea
                className="dev-field-textarea dev-rejection-reason-textarea"
                placeholder="Escriba aquí el motivo detallado (Obligatorio)..."
                value={motivoRechazoTabla}
                onChange={(e) => setMotivoRechazoTabla(e.target.value)}
                disabled={actionLoading}
                autoFocus
              />
            </div>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-btn delete-modal-btn-cancel"
                onClick={() => {
                  setDevParaRechazar(null);
                  setMotivoRechazoTabla("");
                }}
                disabled={actionLoading}
              >
                CANCELAR
              </button>
              <button
                className="delete-modal-btn delete-modal-btn-confirm"
                style={{ opacity: (!motivoRechazoTabla.trim() || actionLoading) ? 0.5 : 1 }}
                disabled={!motivoRechazoTabla.trim() || actionLoading}
                onClick={() => {
                  const status =
                    availableStatuses.find((s) =>
                      String(s).toLowerCase().includes("rechaz")
                    ) || "Rechazada";
                  updateStatus(devParaRechazar, status, motivoRechazoTabla);
                  setDevParaRechazar(null);
                  setMotivoRechazoTabla("");
                }}
              >
                {actionLoading ? "RECHAZANDO..." : "RECHAZAR SOLICITUD"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL DE IMAGEN EXPANDIDA */}
      {expandedImage && (
        <DevExpandedImageModal src={expandedImage} onClose={() => setExpandedImage(null)} />
      )}
    </>
  );
};

export default DevolucionModals;
