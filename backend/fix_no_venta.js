import db from './src/models/index.js';

async function fixNumeros() {
  try {
    const { Venta, Devolucion } = db;

    console.log('--- ACTUALIZANDO VENTAS ---');
    const ventas = await Venta.findAll();
    for (const v of ventas) {
      const nuevoNo = String(1000 + v.id);
      if (v.noVenta !== nuevoNo) {
        await v.update({ noVenta: nuevoNo });
        console.log(`Venta ${v.id}: ${v.noVenta} -> ${nuevoNo}`);
      }
    }
    
    console.log('--- ACTUALIZANDO DEVOLUCIONES ---');
    const devoluciones = await Devolucion.findAll();
    for (const d of devoluciones) {
      const nuevoNo = String(1000 + d.id);
      if (d.noDevolucion !== nuevoNo) {
        await d.update({ noDevolucion: nuevoNo });
        console.log(`Devolucion ${d.id}: ${d.noDevolucion} -> ${nuevoNo}`);
      }
    }

    console.log('✅ TODO ACTUALIZADO CON ÉXITO');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixNumeros();
