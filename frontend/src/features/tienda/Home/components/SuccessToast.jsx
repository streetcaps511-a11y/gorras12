import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import '../styles/Home.css';

const SuccessToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="success-toast-container">
      <div className="success-toast-content">
        <FaCheckCircle size={24} color="#10B981" />
        <div className="toast-text">
          <h4>¡Agregado con éxito!</h4>
          <p>El producto está en tu carrito</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;