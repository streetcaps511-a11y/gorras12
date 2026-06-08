/* === COMPONENTE REUTILIZABLE === 
    Inputs con selects para día y mes + input para año */

import '../../styles/DateInputWithCalendar.css';
import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const DateInputWithCalendar = ({ value, onChange, error, className = "" }) => {
  // Parsear el valor actual "DD/MM/YYYY" en partes
  const parts = (value || '').split('/');
  const dd = parts[0] || '';
  const mm = parts[1] || '';
  const yyyy = parts[2] || '';

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthOptions = [
    { value: '01', label: 'Ene' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Abr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Ago' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dic' }
  ];

  const emit = (newDd, newMm, newYyyy) => {
    if (!newDd && !newMm && !newYyyy) { onChange(''); return; }
    onChange(`${newDd || ''}/${newMm || ''}/${newYyyy || ''}`);
  };

  const baseStyle = {
    background: '#000',
    border: '1px solid transparent',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    textAlign: 'center',
    padding: '2px 4px',
    height: '24px',
    outline: 'none',
  };

  return (
    <div className={`date-input-container ${className}`}>
      <div
        className={`date-input-visual ${error ? 'has-error' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        {/* Select día */}
        <select
          value={dd}
          onChange={(e) => emit(e.target.value.padStart(2, '0'), mm, yyyy)}
          style={{ ...baseStyle, width: '40px', cursor: 'pointer' }}
        >
          <option value="">Día</option>
          {dayOptions.map(d => (
            <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
          ))}
        </select>

        <span style={{ color: '#64748b', fontSize: '10px', userSelect: 'none' }}>/</span>

        {/* Select mes */}
        <select
          value={mm}
          onChange={(e) => emit(dd, e.target.value, yyyy)}
          style={{ ...baseStyle, width: '48px', cursor: 'pointer' }}
        >
          <option value="">Mes</option>
          {monthOptions.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <span style={{ color: '#64748b', fontSize: '10px', userSelect: 'none' }}>/</span>

        {/* Input año */}
        <input
          type="text"
          value={yyyy}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
            emit(dd, mm, raw);
          }}
          placeholder="aaaa"
          maxLength="4"
          style={{ ...baseStyle, width: '52px' }}
        />

        {/* Icono calendario — inhabilitado según petición */}
        <FaCalendarAlt
          className="date-input-icon"
          style={{ marginLeft: '2px', flexShrink: 0, fontSize: '11px', color: '#64748b' }}
        />
      </div>
    </div>
  );
};

export default DateInputWithCalendar;
