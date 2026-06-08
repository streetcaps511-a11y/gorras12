/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';
import { 
  FaTimes, FaCheckCircle, FaExclamationTriangle, FaExchangeAlt 
} from "react-icons/fa";
import '../styles/ProfileModals.css';

export const ImageModal = ({ src, onClose }) => {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoomed(!zoomed);
  };

  return (
    <div className="gm-zoom-overlay" onClick={onClose}>
      <div className="gm-zoom-container" onClick={e => e.stopPropagation()} style={{ overflow: 'hidden', borderRadius: '12px' }}>
        <button className="gm-zoom-close" onClick={onClose}><FaTimes size={24} /></button>
        <div
          onMouseMove={handleMouseMove}
          onClick={toggleZoom}
          style={{
            overflow: 'hidden',
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px'
          }}
        >
          <img
            src={src}
            className="gm-zoom-img"
            alt="zoom"
            style={{
              transition: zoomed ? 'none' : 'transform 0.2s ease',
              transformOrigin: `${position.x}% ${position.y}%`,
              transform: zoomed ? 'scale(2.5)' : 'scale(1)',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const SuccessModal = ({ onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-success-modal">
      <div style={{ width: "80px", height: "80px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 25px", border: "1px solid #10b981" }}>
        <FaCheckCircle color="#10b981" size={40} />
      </div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "15px", color: "#fff" }}>¡Solicitud enviada con éxito!</h3>
      <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "0.95rem", marginBottom: "30px" }}>
        Su solicitud de cambio ha sido registrada. Nuestro equipo de administración revisará la información proporcionada a la brevedad. 
        <br /><br />
        Podrá realizar el seguimiento de su caso y ver la respuesta definitiva directamente en la pestaña <strong>&quot;Devoluciones&quot;</strong> de su perfil.
      </p>
      <button 
        onClick={onClose} 
        style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#FFC107", color: "#000", border: "none", fontWeight: 800, cursor: "pointer", fontSize: "1rem" }}
      >
        ENTENDIDO
      </button>
    </div>
  </div>
);

export const ConfirmModal = ({ modal, onClose }) => (
  <div className="gm-modal-overlay-p gm-confirm-overlay">
    <div className={`gm-confirm-modal ${modal.isDanger ? 'danger' : ''}`}>
      <p className="gm-modal-msg-center-p">{modal.message}</p>
      <div className="gm-modal-actions-center-p">
        <button onClick={onClose} className="gm-btn-cancel-p" disabled={modal.loading}>CANCELAR</button>
        <button 
          onClick={modal.onConfirm} 
          className={`gm-btn-confirm-p ${modal.isDanger ? 'danger' : ''}`}
          disabled={modal.loading}
        >
          {modal.loading ? "PROCESANDO..." : modal.confirmText}
        </button>
      </div>
    </div>
  </div>
);

export const PolicyModal = ({ onClose, onContinue }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="gm-modal-overlay-p">
      <div className="gm-policy-modal" style={{ maxWidth: '480px', padding: '30px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: 0 }}>Políticas de Cambios y Devoluciones</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '10px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: "#cbd5e1", lineHeight: "1.4", fontSize: "0.88rem", marginBottom: "12px", fontWeight: 600 }}>
              En <span style={{ color: '#FFC107' }}>Gorras Medellín Caps</span> queremos que tu experiencia sea excelente. Para garantizar un proceso de cambio exitoso, ten en cuenta:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={13} />
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: "1.35", margin: 0 }}>
                    Tienes un plazo máximo de <strong>48 horas</strong> tras recibir el pedido.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={13} />
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: "1.35", margin: 0 }}>
                    La gorra debe estar <strong>totalmente nueva</strong>, sin rastro de uso.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={13} />
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: "1.35", margin: 0 }}>
                    No realizamos devoluciones de dinero (reembolsos).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={13} />
                  <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: "1.35", margin: 0 }}>
                    El costo de los envíos corre por cuenta del cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '14px 18px', borderRadius: '10px' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExclamationTriangle size={12} /> PRODUCTOS CON DEFECTO DE FÁBRICA
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
              <FaCheckCircle style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} size={13} />
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: 1.35 }}>
                Si el producto llegó defectuoso, repórtalo en las primeras <strong>48 horas</strong> post-entrega. En este caso, nosotros asumiremos el costo del envío.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', display: 'flex', flexDirection: 'column' }}>
          <label className="gm-checkbox-row" style={{ marginBottom: '14px', gap: '10px', display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              className="gm-checkbox-custom" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ width: '16px', height: '16px', flexShrink: 0 }}
            />
            <span className="gm-checkbox-label" style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.3' }}>Acepto las políticas de cambios de productos de Gorras Medellín Caps.</span>
          </label>

          <div style={{ display: "flex", gap: "10px", width: '100%' }}>
            <button onClick={onClose} className="gm-btn-cancel-p" style={{ flex: 1, fontSize: '0.88rem', height: '38px', fontWeight: 'bold' }}>CANCELAR</button>
            <button 
              onClick={onContinue} 
              className="gm-btn-confirm-p" 
              style={{ flex: 1, fontSize: '0.88rem', height: '38px', fontWeight: 'bold' }}
              disabled={!accepted}
            >
              CONTINUAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExpiredReturnModal = ({ onClose, periodDays, expiredDate, orderDate }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-policy-modal" style={{ textAlign: 'center', padding: '30px 24px', maxWidth: '480px' }}>
      <div style={{ width: "60px", height: "60px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: "1px solid #f59e0b" }}>
        <FaExclamationTriangle color="#f59e0b" size={28} style={{ margin: "auto" }} />
      </div>
      
      <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "10px", color: "#fff" }}>El período de cambio terminó</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: "1.45", marginBottom: "18px" }}>
        ¡Lo sentimos! La ventana de cambios de <strong>{periodDays} horas</strong> ha pasado. 
        <span style={{ display: 'block', color: '#f59e0b', marginTop: '6px', fontWeight: '600' }}>Ya no puedes solicitar un nuevo cambio o devolución.</span>
      </p>

      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>El período de cambio terminó el</div>
        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '800', marginBottom: '2px' }}>{expiredDate}</div>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pedido el {orderDate}</div>
      </div>

      <button 
        onClick={onClose} 
        style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#FFC107", color: "#000", border: "none", fontWeight: 800, cursor: "pointer", fontSize: "0.95rem", boxShadow: '0 4px 10px rgba(255, 193, 7, 0.2)' }}
      >
        ENTENDIDO
      </button>
      
      <div style={{ marginTop: '14px' }}>
        <a href="/politicas-cambios" style={{ color: '#FFC107', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '600' }}>Ver Política de Cambios y Reembolsos ›</a>
      </div>
    </div>
  </div>
);

export const RejectionReasonModal = ({ reason, onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-rejection-modal">
      <div className="gm-rejection-modal-header">
        <h3 className="gm-rejection-modal-title">Motivo del Rechazo</h3>
        <button className="gm-rejection-modal-close" onClick={onClose}>
          <FaTimes size={18} />
        </button>
      </div>
      <div className="gm-rejection-modal-content">
        <p className="gm-rejection-text">{reason}</p>
      </div>
    </div>
  </div>
);

export const WebcamModal = ({ onClose, onCapture }) => {
  const videoRef = React.useRef(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        setError(null);
        setLoading(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        activeStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("No se pudo acceder a la cámara. Asegúrate de dar los permisos correspondientes.");
      } finally {
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Mantener proporción cuadrada para el avatar
      const size = Math.min(video.videoWidth, video.videoHeight) || 480;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      // Dibujar centrado y recortado como cuadrado
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onCapture(dataUrl);
      onClose();
    }
  };

  return (
    <div className="gm-modal-overlay-p" style={{ zIndex: 11000 }}>
      <div className="gm-policy-modal" style={{ maxWidth: '450px', textAlign: 'center', padding: '25px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '15px' }}>Tomar Foto</h3>
        
        <div style={{ 
          width: '100%', 
          aspectRatio: '1', 
          backgroundColor: '#030712', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          position: 'relative', 
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {loading && <div style={{ color: '#FFC107', fontSize: '0.9rem' }}>Iniciando cámara...</div>}
          {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', padding: '20px', lineHeight: '1.4' }}>{error}</div>}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Efecto espejo para selfie
              display: (loading || error) ? 'none' : 'block' 
            }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="gm-btn-cancel-p" 
            style={{ flex: 1, height: '40px', fontSize: '0.9rem' }}
          >
            CANCELAR
          </button>
          <button 
            type="button" 
            onClick={handleCapture} 
            className="gm-btn-confirm-p" 
            style={{ flex: 1, height: '40px', fontSize: '0.9rem' }}
            disabled={loading || error}
          >
            CAPTURAR
          </button>
        </div>
      </div>
    </div>
  );
};


