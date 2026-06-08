/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';

// ✨ FACTURA MODAL MEJORADA — ESTRECHA, CON LOGO, IVA Y SCROLL
const InvoiceModal = ({ isOpen, onClose, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;
  
  const {
    invoiceNumber = '',
    date = '',
    customerName = 'Consumidor Final',
    customerEmail = '',
    customerAddress = '',
    customerPhone = '',
    items = [],
    total = 0,
    shipping = ''
  } = invoiceData;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Standard white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header - Left Name, Right Number
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Gorras medellín", 20, 25);
    
    doc.setFontSize(14);
    doc.text(`NUMERO PED: ${invoiceNumber || ''}`, 190, 25, { align: 'right' });

    // Client Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Datos del cliente:", 20, 50);
    
    const phoneValue = customerPhone && customerPhone !== 'No especificado' ? customerPhone : 'No especificado';
    const customerDocument = invoiceData.customerDocument || invoiceData.documento || invoiceData.numeroDocumento || 'N/A';
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    
    const drawLine = (label, value, x, y) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), x + labelWidth, y);
    };

    drawLine("Fecha: ", date || '', 20, 57);
    drawLine("Nombre: ", customerName, 20, 62);
    if (customerDocument && customerDocument !== 'N/A') {
      drawLine("Documento: ", customerDocument, 20, 67);
      drawLine("Email: ", customerEmail, 20, 72);
      drawLine("Teléfono: ", phoneValue, 20, 77);
      drawLine("Dirección: ", customerAddress, 20, 82);
      drawLine("Método de Pago: ", invoiceData.paymentMethod || 'N/A', 20, 87);
      drawLine("Envío: ", 'Consultar con el vendedor', 20, 92);
    } else {
      drawLine("Email: ", customerEmail, 20, 67);
      drawLine("Teléfono: ", phoneValue, 20, 72);
      drawLine("Dirección: ", customerAddress, 20, 77);
      drawLine("Método de Pago: ", invoiceData.paymentMethod || 'N/A', 20, 82);
      drawLine("Envío: ", 'Consultar con el vendedor', 20, 87);
    }
    
    // TOTAL FRONT OF CLIENT DATA - Raised slightly to match OrdersSection.jsx
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Total del pedido:", 190, 52, { align: 'right' });
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Negro solicitado
    doc.text(`$${total.toLocaleString()}`, 190, 63, { align: 'right' });

    // Table Header - Black background
    const tableTop = 105;
    doc.setFillColor(0, 0, 0); 
    doc.rect(15, tableTop, 180, 8, 'F');

    doc.setTextColor(255, 255, 255); 
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Item", 20, tableTop + 5.5);
    doc.text("Producto", 32, tableTop + 5.5);
    doc.text("Talla", 95, tableTop + 5.5);
    doc.text("Cantidad", 120, tableTop + 5.5);
    doc.text("Precio", 145, tableTop + 5.5);
    doc.text("Total", 175, tableTop + 5.5);
    
    let yPosItems = tableTop + 14;
    doc.setTextColor(0, 0, 0);
    const cols = [15, 28, 90, 115, 140, 168, 195];
    let currentPageTableTop = tableTop;

    (items || []).forEach((item, idx) => {
      if (yPosItems > 260) {
        // Draw the bottom line and vertical lines of the table for the current page before adding a new page
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        const pageTableBottom = yPosItems - 8 + 2.5;
        doc.line(15, pageTableBottom, 195, pageTableBottom);

        cols.forEach(colX => {
          if (colX === 15 || colX === 195) {
            doc.line(colX, currentPageTableTop, colX, pageTableBottom);
          } else {
            doc.line(colX, currentPageTableTop + 8, colX, pageTableBottom);
          }
        });

        doc.addPage();
        currentPageTableTop = 10;
        
        // Draw header on new page
        doc.setFillColor(0, 0, 0); 
        doc.rect(15, 10, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Item", 20, 10 + 5.5);
        doc.text("Producto", 32, 10 + 5.5);
        doc.text("Talla", 95, 10 + 5.5);
        doc.text("Cantidad", 120, 10 + 5.5);
        doc.text("Precio", 145, 10 + 5.5);
        doc.text("Total", 175, 10 + 5.5);
        
        doc.setTextColor(0, 0, 0);
        yPosItems = 10 + 14;
      }
      
      const price = typeof item.price === 'string' ? parseInt(item.price.replace(/[^0-9]/g, '')) : item.price;
      const qty = parseInt(item.quantity || item.qty || 0);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(String(idx + 1), 20, yPosItems);
      const itemName = item.name || '';
      doc.text(itemName.length > 30 ? itemName.substring(0, 30) + "..." : itemName, 32, yPosItems);
      doc.text(item.size || item.talla || 'N/A', 95, yPosItems);
      doc.text(String(qty), 120, yPosItems);
      doc.text(`$${price.toLocaleString()}`, 145, yPosItems);
      doc.text(`$${(price * qty).toLocaleString()}`, 175, yPosItems);
      
      // Draw thin gray horizontal line under each row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(15, yPosItems + 2.5, 195, yPosItems + 2.5);
      
      yPosItems += 8;
    });

    const tableBottom = yPosItems - 8 + 2.5;

    // Draw final page vertical lines
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    cols.forEach(colX => {
      if (colX === 15 || colX === 195) {
        doc.line(colX, currentPageTableTop, colX, tableBottom);
      } else {
        doc.line(colX, currentPageTableTop + 8, colX, tableBottom);
      }
    });

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("GORRAS MEDELLÍN - Tu estilo, nuestra pasión", 105, pageHeight - 18, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("Alfonzo López - Medellin | WhatsApp: +57 300 6158180", 105, pageHeight - 13, { align: 'center' });
    doc.text("Email: duvann1991@gmail.com | Instagram: @gorrasmedellin", 105, pageHeight - 8, { align: 'center' });

    doc.save(`Comprobante_GMCAPS_${invoiceNumber}.pdf`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '15px'
    }}>
      <div style={{
        background: '#0f172a',
        color: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        border: '1px solid #FFC107',
        padding: '20px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '10px', marginTop: '-5px' }}>
          <img
            src="/logo.png"
            alt="Logo GM CAPS"
            style={{
              width: '45px',
              height: '45px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/1E293B/FFC107?text=GM';
            }}
          />
          <h3 style={{
            color: '#FFC107',
            margin: '2px 0 0 0',
            fontSize: '15px',
            fontWeight: 'bold'
          }}>
            ¡Compra Exitosa!
          </h3>
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#FFC107',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaTimes />
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
          fontSize: '11px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#FFC107', marginBottom: '4px', fontSize: '12px' }}>DATOS DEL CLIENTE</div>
            <div><strong>Nombre:</strong> {customerName}</div>
            <div><strong>Dirección:</strong> {customerAddress}</div>
            <div><strong>Teléfono:</strong> {customerPhone}</div>
            <div><strong>Email:</strong> {customerEmail}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#FFC107', fontSize: '12px' }}>COMPROBANTE</div>
            <div>No. INV-{invoiceNumber}</div>
            <div>{date}</div>
          </div>
        </div>

        <div style={{
          marginBottom: '15px',
          padding: '4px 0',
          fontSize: '13px',
          textAlign: 'center',
          color: '#FFC107',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          GORRAS MEDELLÍN
        </div>

        {/* CUADRO SOLO PARA PRODUCTOS */}
        <div style={{
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          marginBottom: '10px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ color: '#FFC107' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 'bold' }}>Producto</th>
                <th style={{ textAlign: 'center', padding: '6px 0', fontWeight: 'bold' }}>Cant.</th>
                <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 'bold' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 193, 7, 0.1)' }}>
                  <td style={{ padding: '7px 0' }}>{item.name}</td>
                  <td style={{ textAlign: 'center', padding: '7px 0' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '7px 0' }}>
                    ${(item.price * item.quantity).toLocaleString()}
                    {item.quantity > 1 && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                        c/u ${item.price.toLocaleString()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALES FUERA DEL CUADRO */}
        <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '13px', padding: '0 5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', color: 'rgba(255,255,255,0.7)' }}>
            <span>Envío:</span>
            <strong style={{ fontStyle: 'italic' }}>{shipping || 'N/A'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '16px', color: '#FFC107', fontWeight: 'bold', borderTop: '1px solid rgba(255,193,7,0.2)', paddingTop: '10px' }}>
            <span>TOTAL:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '22px' }}>
          <button
            onClick={handleDownloadPDF}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📥 Descargar PDF
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '9px',
              backgroundColor: '#FFC107',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Mensaje de envío */}
        <div style={{ margin: '16px 0 0 0', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#10B981', fontSize: '12px', fontWeight: '600', margin: '0', lineHeight: '1.5' }}>
            🚚 El costo del envío será asumido por el cliente y deberá pagarse directamente a la agencia de envío encargada del domicilio (Inter Rapidísimo, Envía, COONORTE o ZExpress).
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
