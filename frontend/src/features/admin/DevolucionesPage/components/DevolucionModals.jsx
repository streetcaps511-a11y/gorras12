/* === SUB-COMPONENTE DE MODALES ===
   Este componente contiene todos los modales de confirmación del módulo de Devoluciones:
   - Aprobación de devolución.
   - Rechazo de devolución (con motivo obligatorio).
   - Eliminación de devolución (para borrar duplicados).
   - Vista ampliada de la imagen de evidencia. */

import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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
              >
                CANCELAR
              </button>
              <button
                className="delete-modal-btn delete-modal-btn-confirm"
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
                APROBAR AHORA
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
              >
                CANCELAR
              </button>
              <button
                className="delete-modal-btn delete-modal-btn-confirm"
                style={{ opacity: !motivoRechazoTabla.trim() ? 0.5 : 1 }}
                disabled={!motivoRechazoTabla.trim()}
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
                RECHAZAR SOLICITUD
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL DE IMAGEN EXPANDIDA */}
      {expandedImage && (
        <div
          className="dev-expanded-image-backdrop"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="dev-expanded-image-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="dev-expanded-image-close"
            >
              X
            </button>
            <img
              src={expandedImage}
              alt="Evidencia Ampliada"
              className="dev-expanded-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DevolucionModals;
