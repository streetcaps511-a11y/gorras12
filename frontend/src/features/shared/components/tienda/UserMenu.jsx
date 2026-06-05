/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/UserMenu.css';
// src/components/UserMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

// 🔹 COMPONENTES REUTILIZABLES
// 🔹 COMPONENTES REUTILIZABLES
const MenuLink = ({ to, label, Icon, onClose }) => {
  const handleClick = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };
  return (
    <Link
      to={to}
      onClick={handleClick}
      className="user-menu-base-item"
    >
      <Icon size={15} />
      {label}
    </Link>
  );
};

const MenuButton = ({ label, Icon, onClick, className = "", bold = false }) => {
  return (
    <button
      onClick={onClick}
      className={`user-menu-base-item ${bold ? "bold" : ""} ${className}`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
};

// 🔹 COMPONENTE PRINCIPAL
const UserMenu = ({ onClose, onLogout, isStaff = false }) => {

  // ✅ CORREGIDO: Cerrar sesión y redirigir al home
  const handleSupport = () => {
    window.open("https://wa.me/573006158180", "_blank");
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    if (onClose) onClose();
    if (onLogout) {
      await onLogout(); // Espera a que el servidor cierre la sesión
    }
  };

  return (
    <div className="user-menu-dropdown">
      <MenuLink
        to={isStaff ? "/admin" : "/perfil"}
        label={isStaff ? "Panel Admin" : "Perfil"}
        Icon={FaUser}
        onClose={onClose}
      />
      
      <MenuButton
        label="Centro de Ayuda"
        Icon={FaQuestionCircle}
        onClick={handleSupport}
        className="support-item"
      />
      
      {/* DIVISOR */}
      <div className="user-menu-divider" />
      
      {/* CERRAR SESIÓN (ROJO) */}
      <MenuButton
        label="Cerrar Sesión"
        Icon={FaSignOutAlt}
        onClick={handleLogout}
        className="logout"
        bold
      />
    </div>
  );
};

export default UserMenu;
