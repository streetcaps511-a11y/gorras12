/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaUserShield, FaSignOutAlt, FaRocket } from 'react-icons/fa';
import '../styles/SessionConflictModal.css';

const SessionConflictModal = ({ 
  title: _title = "SESIÓN INICIADA EN OTRO LUGAR", 
  description: _description = "¡Hola! Por seguridad, hemos detectado que tu cuenta se ha abierto en un nuevo navegador o dispositivo.",
  infoText: _infoText = "Para proteger tus datos, esta sesión ha sido desactivada automáticamente.",
  showUseHere = false,
  onUseHere,
  onClose
}) => {
  
  const handleUseHere = () => {
    if (onUseHere) {
      onUseHere();
    } else {
      sessionStorage.clear();
      window.location.href = '/login?ref=force';
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="sc-overlay">
      <div className="sc-container">
        <div className="sc-header-row">
          <FaUserShield size={24} color="#F5C81B" />
          <h2 className="sc-title">{_title}</h2>
        </div>
        
        <p className="sc-description">{_description}</p>
        
        {_infoText && (
          <p className="sc-info" style={{ color: '#94a3b8', fontSize: '12px', marginTop: '10px', textAlign: 'center', lineHeight: '1.4' }}>
            {_infoText}
          </p>
        )}

        <div className="sc-actions">
          <button className="sc-btn sc-btn-secondary" onClick={handleClose}>
            <FaSignOutAlt size={14} />
            <span>Cerrar</span>
          </button>

          {showUseHere && (
            <button className="sc-btn sc-btn-primary" onClick={handleUseHere}>
              <FaRocket size={14} />
              <span>Usar aquí</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default SessionConflictModal;
