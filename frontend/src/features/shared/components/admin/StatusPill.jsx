/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/StatusPill.css';
import React from 'react';

const StatusPill = React.memo(({ status, name = null, size = 'medium' }) => {
  let normalizedStatus = '';
  if (typeof status === 'boolean') {
    normalizedStatus = status ? 'activo' : 'inactivo';
  } else {
    normalizedStatus = status?.toString().toLowerCase() || '';
  }
  
  // Mapear estado a clase
  const getStatusClass = () => {
    if (normalizedStatus.includes('inactivo') || normalizedStatus === 'inactive' || normalizedStatus.includes('anulad') || normalizedStatus.includes('rechazad') || normalizedStatus === 'cancelado') return 'inactive';
    if (normalizedStatus.includes('activo') || normalizedStatus === 'active' || normalizedStatus === 'enviado' || normalizedStatus === 'entregado' || normalizedStatus === 'finalizado') return 'active';
    if (normalizedStatus.includes('pendiente') || normalizedStatus === 'pending') return 'pending';
    if (normalizedStatus === 'por enviar') return 'purple';
    if (normalizedStatus.includes('completad') || normalizedStatus === 'completed') return 'completed';
    if (normalizedStatus === 'en espera') return 'default';
    return 'default';
  };

  const statusType = getStatusClass();
  
  const getDisplayText = () => {
    if (name) return name;
    if (typeof status === 'boolean') return status ? 'Activo' : 'Inactivo';
    if (normalizedStatus.includes('anulad')) return 'Anulada';
    if (normalizedStatus.includes('rechazad')) return 'Rechazada';
    if (normalizedStatus === 'cancelado') return 'Cancelado';
    if (normalizedStatus === 'finalizado' || normalizedStatus === 'entregado') return 'Entregado';
    if (normalizedStatus === 'enviado') return 'Enviado';
    if (normalizedStatus === 'por enviar') return 'Por enviar';
    if (normalizedStatus === 'en espera') return 'En espera';
    if (statusType === 'active') return 'Activo';
    if (statusType === 'inactive') return 'Inactivo';
    if (statusType === 'pending') return 'Pendiente';
    if (statusType === 'completed') return 'Completado';
    return String(status || 'N/A');
  };

  const displayText = getDisplayText();

  const sizeClass = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';

  return (
    <span className={`status-pill-container status-pill-${sizeClass} status-pill-${statusType}`}>
      {displayText}
    </span>
  );
});

StatusPill.displayName = 'StatusPill';

export default StatusPill;
