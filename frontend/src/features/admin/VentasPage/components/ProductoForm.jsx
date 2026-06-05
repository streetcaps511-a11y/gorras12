import React from 'react';
import { FaTrash, FaTimes } from "react-icons/fa";
import { SearchSelect } from '../../../shared/services';

const ProductoForm = React.memo(function ProductoForm({ 
  producto, 
  onChange, 
  onRemove, 
  index, 
  isViewMode = false, 
  availableProducts = [], 
  availableSizes = [],
  errors = {} 
}) {
  const qtyTotal = (producto.variantes || []).reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0);
  const subtotal = qtyTotal * (parseFloat(producto.precio) || 0);

  const calculateWholesalePrice = (prodData, cant) => {
    if (!prodData) return 0;
    const cantidad = parseInt(cant) || 1;
    if (cantidad >= 80 && parseFloat(prodData.precioMayorista80) > 0) return prodData.precioMayorista80;
    if (cantidad >= 6 && parseFloat(prodData.precioMayorista6) > 0) return prodData.precioMayorista6;
    return prodData.enOfertaVenta ? prodData.precioOferta : prodData.precioVenta;
  };

  const inputStyle = {
    backgroundColor: '#0c1220',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    padding: '0 10px',
    height: '34px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  };

  const gridCols = isViewMode 
    ? '40px 1fr 140px 140px'
    : '22px 1fr 110px 110px 40px';

  if (isViewMode) {
    return (
      <div className="product-form-row view-mode" style={{ gridTemplateColumns: gridCols, gap: '12px', alignItems: 'start', padding: '12px 0', borderBottom: '1px solid #ffffff08' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#F5C81B', height: '34px' }}>
          {index + 1}.
        </div>
        <div style={{ minWidth: 0, flex: 1, textAlign: 'left', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="product-input disabled" style={{ fontWeight: '700', textAlign: 'left', justifyContent: 'flex-start', padding: '0 14px', fontSize: '14px' }}>{producto.nombre || '-'}</div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(producto.variantes || []).map((v, vi) => (
              <div key={vi} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #334155',
                fontSize: '11px'
              }}>
                <span style={{ color: '#F5C81B', fontWeight: '800', textTransform: 'capitalize' }}>
                  {v.talla}
                </span>
                <span style={{ color: '#ffffff20' }}>|</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {v.cantidad} ud.
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="product-input disabled price" style={{ textAlign: 'center', border: '1px solid #334155', height: '34px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>${Number(producto.precio || 0).toLocaleString('es-CO')}</div>
        </div>
        <div>
          <div className="product-input disabled price" style={{ textAlign: 'center', color: '#00f2ff', fontWeight: '800', border: '1px solid #334155', height: '34px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,242,255,0.02)' }}>${subtotal.toLocaleString('es-CO')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-row" style={{ gridTemplateColumns: gridCols, gap: '12px', paddingBottom: '5px', alignItems: 'start', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#F5C81B', height: '34px', width: '22px' }}>
        {index + 1}.
      </div>
      
      <div style={{ position: 'relative', minWidth: 0 }}>
        <SearchSelect 
          options={availableProducts}
          selectedItem={availableProducts.find(p => String(p.id) === String(producto.id))}
          height="34px"
          noResultsText="Producto no encontrado"
          onFreeText={(text) => {
            onChange(index, 'id', '');
            onChange(index, 'nombre', text);
            onChange(index, 'precio', '');
            onChange(index, 'variantes', [{ talla: '', cantidad: 1, _tempKey: Date.now() }]);
          }}
          onSelect={(sel) => {
            if (!sel) {
              onChange(index, 'id', '');
              onChange(index, 'nombre', '');
              onChange(index, 'precio', '');
              onChange(index, 'variantes', [{ talla: '', cantidad: 1, _tempKey: Date.now() }]);
              return;
            }
            onChange(index, 'id', sel.id); 
            onChange(index, 'nombre', sel.nombre); 

            const selSizesToDisplay = (sel.tallasStock && sel.tallasStock.length > 0)
                ? sel.tallasStock.filter(ts => parseInt(ts.cantidad) > 0).map(ts => ts.talla)
                : (sel.tallas && sel.tallas.length > 0 ? sel.tallas : availableSizes);
            const defaultTalla = selSizesToDisplay.length === 1 ? selSizesToDisplay[0] : '';

            onChange(index, 'variantes', [{ talla: defaultTalla, cantidad: 1, _tempKey: Date.now() }]);
            const initialPrice = calculateWholesalePrice(sel, 1);
            onChange(index, 'precio', initialPrice?.toString() || '0');
          }}
          placeholder="Buscar o escribir producto..."
          error={errors[`producto_id_${index}`]}
          renderOption={(p, i) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
              <span style={{ color: '#F5C81B', fontWeight: '800', fontSize: '11px' }}>{i + 1}.</span>
              <img 
                src={p.imagen || (p.imagenes && p.imagenes[0]) || 'https://placehold.co/40'} 
                alt={p.nombre} 
                style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #ffffff10' }} 
              />
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>{p.nombre}</span>
            </div>
          )}
        />

        <div style={{ marginTop: '4px', paddingLeft: '4px', width: '100%', maxWidth: '100%', paddingBottom: '12px', display: 'block', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', boxSizing: 'border-box' }}>
            {(() => {
              const sel = producto.id ? availableProducts.find(p => String(p.id) === String(producto.id)) : null;
              const sizesToDisplay = (sel && sel.tallasStock && sel.tallasStock.length > 0)
                ? sel.tallasStock.filter(ts => parseInt(ts.cantidad) > 0).map(ts => ts.talla)
                : (sel && sel.tallas && sel.tallas.length > 0 ? sel.tallas : availableSizes);
              
              const currentVars = producto.variantes || [];
              const maxVariants = Math.min(4, sizesToDisplay.length);

              return (
                <>
                  {currentVars.map((v, vi) => {
                    const stockInfo = sel?.tallasStock?.find(ts => ts.talla === v.talla);
                    const stockDisponible = stockInfo ? parseInt(stockInfo.cantidad) : 0;
                    const hasStockError = v.cantidad > stockDisponible && producto.id && v.talla;

                    return (
                      <div key={v._tempKey || vi} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2px',
                        backgroundColor: 'transparent',
                        padding: '2px 4px',
                        borderRadius: '6px',
                        border: '1px solid #334155',
                        flexShrink: 0
                      }}>
                        {sizesToDisplay.length === 1 ? (
                          <div style={{
                            ...inputStyle, 
                            width: '85px', 
                            height: '28px', 
                            fontSize: '11px',
                            padding: '0 8px',
                            backgroundColor: 'transparent',
                            color: '#F5C81B',
                            fontWeight: '700',
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            border: errors[`producto_talla_${index}_${vi}`] ? '1px solid #ef4444' : 'none'
                          }}>
                            {sizesToDisplay[0]}
                          </div>
                        ) : (
                          <select
                            value={v.talla || ''}
                            onChange={(e) => {
                              const selectedTalla = e.target.value;
                              const newVars = [...producto.variantes];
                              
                              const stockInfo = sel?.tallasStock?.find(ts => ts.talla === selectedTalla);
                              let currentQty = parseInt(newVars[vi].cantidad) || 0;
                              
                              // Cap quantity if stock info is available and quantity exceeds it
                              if (stockInfo && currentQty > parseInt(stockInfo.cantidad)) {
                                currentQty = Math.max(1, parseInt(stockInfo.cantidad));
                              }
                              
                              newVars[vi] = { ...newVars[vi], talla: selectedTalla, cantidad: currentQty };
                              onChange(index, 'variantes', newVars);
                              
                              if (sel) {
                                const totalQ = newVars.reduce((sum, vv) => sum + (parseInt(vv.cantidad) || 0), 0);
                                onChange(index, 'precio', calculateWholesalePrice(sel, totalQ).toString());
                              }
                            }}
                            className="variant-select-mini"
                            style={{ 
                              ...inputStyle, 
                              width: '85px', 
                              height: '28px', 
                              fontSize: '11px',
                              padding: '0 2px',
                              backgroundColor: 'transparent',
                              color: '#F5C81B',
                              fontWeight: '700',
                              textTransform: 'capitalize',
                              border: errors[`producto_talla_${index}_${vi}`] ? '1px solid #ef4444' : 'none'
                            }}
                          >
                            <option value="" disabled hidden>Talla</option>
                            {sizesToDisplay.map(t => {
                              const isSelectedByOther = producto.variantes.some((otherV, otherI) => otherI !== vi && otherV.talla === t);
                              if (isSelectedByOther) return null;
                              return (
                                <option key={t} value={t} style={{ backgroundColor: '#0c1220', color: '#fff' }}>
                                  {(() => {
                                    const text = String(t).toLowerCase();
                                    return text.charAt(0).toUpperCase() + text.slice(1);
                                  })()}
                                </option>
                              );
                            })}
                          </select>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1px', 
                          backgroundColor: '#ffffff05', 
                          borderRadius: '4px', 
                          padding: '0 2px',
                          border: hasStockError ? '1px solid #ef4444' : 'none'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newVars = [...producto.variantes];
                              const newQty = Math.max(1, (parseInt(newVars[vi].cantidad) || 0) - 1);
                              newVars[vi] = { ...newVars[vi], cantidad: newQty };
                              onChange(index, 'variantes', newVars);
                              
                              if (sel) {
                                const totalQ = newVars.reduce((sum, vv) => sum + (parseInt(vv.cantidad) || 0), 0);
                                onChange(index, 'precio', calculateWholesalePrice(sel, totalQ).toString());
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#F5C81B', cursor: 'pointer', padding: '2px', fontSize: '12px', fontWeight: 'bold' }}
                          >-</button>
                          <input
                            type="number"
                            min="1"
                            value={v.cantidad || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const newVars = [...producto.variantes];
                              newVars[vi] = { ...newVars[vi], cantidad: val };
                              onChange(index, 'variantes', newVars);

                              if (sel) {
                                const totalQ = newVars.reduce((sum, vv) => sum + (parseInt(vv.cantidad) || 0), 0);
                                onChange(index, 'precio', calculateWholesalePrice(sel, totalQ).toString());
                              }
                            }}
                            style={{ 
                              ...inputStyle, 
                              width: '28px', 
                              height: '22px', 
                              fontSize: '10px', 
                              textAlign: 'center',
                              padding: '0',
                              backgroundColor: 'transparent',
                              border: 'none'
                            }}
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newVars = [...producto.variantes];
                              const newQty = (parseInt(newVars[vi].cantidad) || 0) + 1;
                              newVars[vi] = { ...newVars[vi], cantidad: newQty };
                              onChange(index, 'variantes', newVars);

                              if (sel) {
                                const totalQ = newVars.reduce((sum, vv) => sum + (parseInt(vv.cantidad) || 0), 0);
                                onChange(index, 'precio', calculateWholesalePrice(sel, totalQ).toString());
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#F5C81B', cursor: 'pointer', padding: '2px', fontSize: '12px', fontWeight: 'bold' }}
                          >+</button>
                        </div>

                        {hasStockError && (
                          <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: 'bold', marginLeft: '2px' }}>
                            (Max: {stockDisponible})
                          </span>
                        )}

                        {currentVars.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newVars = currentVars.filter((_, i) => i !== vi);
                              onChange(index, 'variantes', newVars);
                              if (sel) {
                                const totalQ = newVars.reduce((sum, vv) => sum + (parseInt(vv.cantidad) || 0), 0);
                                onChange(index, 'precio', calculateWholesalePrice(sel, totalQ).toString());
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center', opacity: 0.6 }}
                          >
                            <FaTimes size={9} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {producto.id && currentVars.length < maxVariants && (
                    <button
                      type="button"
                      onClick={() => {
                        const newVars = [...currentVars, { talla: '', cantidad: 1, _tempKey: Math.random() }];
                        onChange(index, 'variantes', newVars);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px dashed #F5C81B50',
                        borderRadius: '4px',
                        color: '#F5C81B',
                        fontSize: '10px',
                        padding: '2px 6px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600'
                      }}
                    >
                      + Talla
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
      
      <div>
        <input 
          value={producto.precio && !isNaN(parseFloat(producto.precio)) ? Number(producto.precio).toLocaleString('es-CO') : ''}
          className={`product-input price readonly ${errors[`producto_precio_${index}`] ? 'has-error' : ''}`} 
          placeholder="Precio"
          style={{ height: '34px', border: '1px solid #334155', textAlign: 'center', backgroundColor: 'transparent' }}
          readOnly
        />
      </div>

      <div>
        <input 
          value={subtotal > 0 && !isNaN(subtotal) ? subtotal.toLocaleString('es-CO') : ''}
          className="product-input price readonly"
          placeholder="Subtotal"
          style={{ height: '34px', border: '1px solid #334155', textAlign: 'center', backgroundColor: 'transparent', color: '#00f2ff', fontWeight: '800' }}
          readOnly
        />
      </div>

<div className="product-action">
         <button 
           onClick={() => onRemove(index)} 
           className="btn-delete-row"
           style={{ height: '34px' }}
           title="Eliminar producto"
         >
           <FaTrash size={14} />
         </button>
       </div>

      <style>{`
        select.variant-select-mini {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 4px center;
          background-size: 10px;
          padding-right: 18px !important;
        }
        select.variant-select-mini option {
          background-color: #0c1220;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
});

export default ProductoForm;
