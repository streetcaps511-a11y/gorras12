/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/AuthForms.css';

const RegisterForm = ({ 
  registerData, 
  setRegisterData, 
  handleRegister, 
  showRegPass, 
  setShowRegPass, 
  loading,
  fieldErrors = {} // Añadido para manejar errores específicos
}) => {
  return (
    <form onSubmit={handleRegister} className="form-logic-gate">
      <div className="form-inline-row">
        <div className="input-field-group width-30">
          <label>Tipo</label>
          <select 
            className={fieldErrors.documentType ? "has-error" : ""}
            value={registerData.documentType} 
            onChange={(e) => setRegisterData({...registerData, documentType: e.target.value})}
          >
            <option>C.C</option>
            <option>C.E</option>
            <option>PEP</option>
            <option>PPT</option>
            <option>Pasaporte</option>
            <option>NIT</option>
          </select>
          {fieldErrors.documentType && <span className="field-error-text">{fieldErrors.documentType}</span>}
        </div>
        <div className="input-field-group width-70">
          <label>Número de documento</label>
          <input 
            className={fieldErrors.documentNumber ? "has-error" : ""}
            type="text" 
            placeholder="Ej: 12345..." 
            required 
            value={registerData.documentNumber} 
            onChange={(e) => setRegisterData({...registerData, documentNumber: e.target.value.replace(/[^0-9]/g, '')})} 
          />
          {fieldErrors.documentNumber && <span className="field-error-text">{fieldErrors.documentNumber}</span>}
        </div>
      </div>

      <div className="input-field-group">
        <label>Nombre completo</label>
        <input 
          className={fieldErrors.name ? "has-error" : ""}
          type="text" 
          placeholder="Ej: Juan Pérez" 
          required 
          value={registerData.name} 
          onChange={(e) => setRegisterData({...registerData, name: e.target.value})} 
        />
        {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
      </div>

      <div className="input-field-group">
        <label>Correo electrónico</label>
        <input 
          className={fieldErrors.email ? "has-error" : ""}
          type="email" 
          placeholder="nombre@correo.com" 
          required 
          value={registerData.email} 
          onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
        />
        {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
      </div>

      <div className="form-inline-row">
        <div className="input-field-group" style={{ flex: 1 }}>
          <label>Contraseña</label>
          <div className="input-decorated">
            <input 
              className={fieldErrors.password ? "has-error" : ""}
              type={showRegPass ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              value={registerData.password} 
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})} 
            />
            <button type="button" className="eye-action-btn" onClick={() => setShowRegPass(!showRegPass)}>
              {showRegPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
        </div>
        
        <div className="input-field-group" style={{ flex: 1 }}>
          <label>Confirmar</label>
          <input 
            className={fieldErrors.confirmPassword ? "has-error" : ""}
            type="password" 
            placeholder="••••••••" 
            required 
            value={registerData.confirmPassword} 
            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} 
          />
          {fieldErrors.confirmPassword && <span className="field-error-text">{fieldErrors.confirmPassword}</span>}
        </div>
      </div>

      <button type="submit" className="button-main-auth" disabled={loading}>
        {loading ? "Procesando..." : "Registrar"}
      </button>
    </form>
  );
};

export default RegisterForm;
