import React, { useEffect } from 'react';
import "../styles/SuccessToast.css";  // ✅ Correcto
const SuccessToast = ({ show, message = '¡Éxito!', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="success-toast">
      <span>✓ {message}</span>
    </div>
  );
};

export default SuccessToast;  // ← ESTO ES LO MÁS IMPORTANTE