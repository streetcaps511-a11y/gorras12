/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState, useEffect } from 'react';
import { FaIdCard, FaUserCog, FaTimes } from "react-icons/fa";
import '../styles/PersonalInfo.css';

// 🔹 API EXTERNA PARA COLOMBIA
const COLOMBIA_API = 'https://api-colombia.com/api/v1';

const getFormattedPhone = (phone) => {
  if (!phone) return "—";
  const cleanPhone = String(phone).replace(/\D/g, '');
  return cleanPhone;
};

const cleanPhoneForInput = (value) => {
  if (!value) return '';
  const clean = String(value).replace(/\D/g, '');
  if (clean.startsWith('57') && clean.length > 10) {
    return clean.substring(2);
  }
  return clean;
};

const PersonalInfo = ({ isEditing, handleEditClick, handleSaveClick, handleChange, formData, errors = {}, setIsEditing }) => {
  const formatDocTypeLabel = (val) => {
    const map = {
      'Cédula de Ciudadanía': 'CC',
      'Cédula de Extranjería': 'CE',
      'Permiso Especial (PEP)': 'PEP',
      'Permiso Temporal (PPT)': 'PPT',
      'Pasaporte': 'Pasaporte',
      'NIT': 'NIT',
      'Tarjeta de Identidad': 'TI'
    };
    return map[val] || val;
  };

  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocs, setLoadingLocs] = useState(false);

  // 1. Cargar Departamentos al montar
  useEffect(() => {
    if (!isEditing) return; // Solo cargar si estamos editando
    const fetchDepts = async () => {
      try {
        const res = await fetch(`${COLOMBIA_API}/Department`);
        const data = await res.json();
        setDepartments(data.sort((a,b) => a.name.localeCompare(b.name)));
      } catch (err) { console.error("Error depts:", err); }
    };
    fetchDepts();
  }, [isEditing]);

  // 2. Cargar Ciudades cuando cambia el departamento
  useEffect(() => {
    if (!isEditing || !formData.department) return;
    
    const fetchCities = async () => {
      setLoadingLocs(true);
      try {
        // Encontrar ID del departamento por nombre
        const deptObj = departments.find(d => d.name === formData.department);
        if (deptObj) {
          const res = await fetch(`${COLOMBIA_API}/Department/${deptObj.id}/cities`);
          const data = await res.json();
          setCities(data.sort((a,b) => a.name.localeCompare(b.name)));
        }
      } catch (err) { console.error("Error cities:", err); }
      finally { setLoadingLocs(false); }
    };
    fetchCities();
  }, [formData.department, isEditing, departments]);

  const fields = [
    { label: "Tipo de Documento", name: "documentType", value: formData.documentType, isSelect: true, options: ["Cédula de Ciudadanía", "Tarjeta de Identidad", "Cédula de Extranjería", "NIT", "Pasaporte", "Permiso Especial (PEP)"] },
    { label: "Número de Documento", name: "documentNumber", value: formData.documentNumber, isNumber: true },
    { label: "Nombre", name: "name", value: formData.name },
    { label: "Email (Cuenta)", name: "email", value: formData.email, placeholder: "ejemplo@gmail.com" },
    { label: "Teléfono", name: "phone", value: formData.phone, isNumber: true, maxLength: 10 },
    { label: "Dirección", name: "address", value: formData.address },
    { label: "Departamento", name: "department", value: formData.department, isSelect: true, options: departments.map(d => d.name) },
    { label: "Ciudad", name: "city", value: formData.city, isSelect: true, options: cities.map(c => c.name), loading: loadingLocs }
  ];

  return (
    <div className="gm-personal-info-card">
      <div className="gm-section-header">
        <div className="gm-section-title-wrapper">
          <FaIdCard color="#FFC107" size={20} />
          <h3 className="gm-section-title">Información Personal</h3>
        </div>
        {!isEditing && (
          <button 
            onClick={handleEditClick} 
            className="gm-edit-btn"
          >
            Editar datos
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="gm-form-container">
          <div className="gm-form-grid">
            {fields.map((field, i) => {
              const error = errors[field.name]; // 🟢 Error desde el estado global

              return (
                <div key={i} className="gm-form-group">
                  <label className="gm-form-label">{field.label}</label>
                  {field.isSelect ? (
                    <select 
                      name={field.name} 
                      value={field.value} 
                      onChange={handleChange} 
                      className={`gm-form-select ${error ? 'error' : ''}`}
                      disabled={field.disabled}
                    >
                      <option value="">{field.loading ? 'Cargando...' : 'Seleccione...'}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>
                          {field.name === 'documentType' ? formatDocTypeLabel(opt) : opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={field.isNumber ? "number" : "text"}
                        inputMode={field.isNumber ? "numeric" : undefined}
                        name={field.name} 
                        value={field.name === 'phone' ? cleanPhoneForInput(field.value) : field.value} 
                        onChange={(e) => {
                          if (field.isNumber && field.maxLength && e.target.value.length > field.maxLength) return;
                          handleChange(e);
                        }}
                        className={`gm-form-input ${error ? 'error' : ''}`}
                        disabled={field.disabled}
                        placeholder={field.label}
                        maxLength={field.maxLength}
                      />
                      {!field.disabled && field.value && (
                        <button
                          type="button"
                          className="gm-clear-input-btn"
                          onClick={() => handleChange({ target: { name: field.name, value: '' } })}
                          tabIndex={-1}
                        >
                          <FaTimes />
                        </button>
                      )}
                      {error && (
                        <span className="gm-field-error" style={{position: 'absolute', bottom: '-20px'}}>{error}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="gm-form-actions">
            <button onClick={handleSaveClick} className="gm-save-btn">Guardar Cambios</button>
            <button onClick={() => setIsEditing(false)} className="gm-cancel-btn">Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div className="gm-info-grid">
            {[
              { label: "Tipo de Documento", value: formatDocTypeLabel(formData.documentType) },
              { label: "Número de Documento", value: formData.documentNumber },
              { label: "Nombre completo", value: formData.name },
              { label: "Correo Electrónico", value: formData.email },
              { label: "Teléfono", value: getFormattedPhone(formData.phone) },
              { label: "Departamento", value: formData.department },
              { label: "Ciudad", value: formData.city },
              { label: "Dirección completa", value: formData.address }
            ].map((field, i) => (
              <div key={i} className="gm-info-item">
                <label className="gm-info-label">{field.label}</label>
                <div className="gm-info-value">{field.value || "—"}</div>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};

export default PersonalInfo;
