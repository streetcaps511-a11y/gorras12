// src/features/shared/components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="gm-global-loader">
      <div className="gm-spinner"></div>
      <p>Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;