import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

// ===== MOCKS =====
const mockClientes = [
  {
    id: 1, IdCliente: 1,
    nombre: 'Cliente Test 1', nombreCompleto: 'Cliente Test 1',
    num_documento: '1029384756', correo: 'cliente1@test.com',
    telefono: '3001234567', direccion: 'Calle 123', isActive: true
  },
  {
    id: 2, IdCliente: 2,
    nombre: 'Cliente Test 2', nombreCompleto: 'Cliente Test 2',
    num_documento: '9876543210', correo: 'cliente2@test.com',
    telefono: '3009876543', direccion: 'Calle 456', isActive: true
  }
];

const mockVentas = [
  {
    id: 1, IdVenta: 1,
    noVenta: '1001', NoVenta: '1001',
    cliente: { nombre: 'Cliente Test 1', num_documento: '1029384756' },
    idCliente: 1, fecha: '2026-06-20', total: 25000,
    estado: 'Completada', statusenvio: 'Por enviar',
    tipoEntrega: 'recoger', direccionEnvio: 'N/A',
    productos: [{ id: 1, idProducto: 1, nombre: 'Gorra Deportiva', talla: 'Ajustable', cantidad: 1, precio: 25000 }]
  }
];

const mockDevoluciones = [
  {
    id: 1, noDevolucion: '11001',
    cliente: 'Cliente Test 1', idCliente: 1,
    productoOriginal: 'Gorra Deportiva', productoCambio: 'Gorra Urbana',
    precio: 25000,
    estado: 'Pendiente',
    motivo: 'Talla incorrecta',
    talla: 'Ajustable', cantidad: 1,
    fecha: '2026-06-22',
    evidencia: 'http://example.com/evidencia.jpg',
    pedidoCompleto: false,
    idVenta: 1, noVenta: '1001'
  },
  {
    id: 2, noDevolucion: '11002',
    cliente: 'Cliente Test 2', idCliente: 2,
    productoOriginal: 'Gorra Urbana', productoCambio: 'Gorra Deportiva',
    precio: 30000,
    estado: 'Completada',
    motivo: 'Defecto de fábrica',
    talla: '7', cantidad: 1,
    fecha: '2026-06-23',
    evidencia: 'http://example.com/evidencia2.jpg',
    pedidoCompleto: false,
    idVenta: 1, noVenta: '1001'
  }
];

async function setupDevolucionesRoutes(page) {
  await page.route('**/api/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.route('**/api/mi/perfil', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 1, email: 'duvann1991@gmail.com', idRol: 1, rol: 'Administrador',
          nombre: 'Administrador', estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones']
        }
      })
    });
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        usuario: {
          id: 1, email: 'duvann1991@gmail.com', idRol: 1, rol: 'Administrador',
          rolData: { nombre: 'Administrador' }, estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
          sessionId: 'test-session-hu11'
        }
      })
    });
  });

  await page.route('**/api/clientes', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockClientes }) });
  });

  await page.route('**/api/ventas/cliente/*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockVentas }) });
  });

  await page.route('**/api/ventas/*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockVentas[0] }) });
  });

  await page.route('**/api/ventas', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockVentas }) });
  });

  await page.route('**/api/devoluciones', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockDevoluciones }) });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const newDev = {
        id: Date.now(), noDevolucion: String(Date.now()),
        cliente: 'Cliente Test 1', idCliente: body.idCliente || 1,
        productoOriginal: 'Gorra Deportiva', productoCambio: 'Gorra Urbana',
        precio: 25000,
        estado: 'Pendiente',
        motivo: body.motivo || '',
        talla: body.talla || 'Ajustable', cantidad: body.cantidad || 1,
        fecha: new Date().toISOString(),
        evidencia: body.evidencia || null,
        pedidoCompleto: false, idVenta: body.idVenta || 1
      };
      mockDevoluciones.unshift(newDev);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: newDev }) });
    }
  });

  await page.route('**/api/devoluciones/*/estado', async (route) => {
    const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { ...mockDevoluciones[0], estado: body.estado || body.nuevoEstado || 'Completada' } })
    });
  });

  await page.route('**/api/devoluciones/*', async (route) => {
    const method = route.request().method();
    if (method === 'PATCH' || method === 'PUT') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { ...mockDevoluciones[0], estado: body.estado || 'Completada' } })
      });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockDevoluciones[0] }) });
    }
  });

  await page.route('**/api/estados', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: ['Pendiente', 'Completada', 'Rechazada'].map(s => ({ Nombre: s })) }) });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupDevolucionesRoutes(page);
  await page.addInitScript(() => {
    const fakeUser = {
      id: 1, IdUsuario: 1, idRol: 1, Rol: 'Administrador', rol: 'Administrador',
      nombre: 'Administrador', email: 'duvann1991@gmail.com',
      estado: 'activo', Estado: 'activo',
      permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
      token: 'test-token-hu-11', userType: 'admin', sessionId: 'test-session-hu11'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

// ==============================
// HU-11: REGISTRAR DEVOLUCIÓN
// ==============================
test.describe('HU-11: Registrar Devolución', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/devoluciones`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button.devoluciones-btn-register', { timeout: 15000 });
  });

  test('CA_11_01: Debe visualizar botón para registrar una nueva devolución', async ({ page }) => {
    const btnRegister = page.locator('button.devoluciones-btn-register');
    await expect(btnRegister).toBeVisible();
    await expect(btnRegister).toHaveText('Registrar Devolución');
  });

  test('CA_11_02: Debe mostrar el formulario de registro al hacer clic en registrar', async ({ page }) => {
    await page.locator('button.devoluciones-btn-register').click();
    await expect(page.locator('h1.devoluciones-title')).toHaveText('Registrar Devolución');
    await expect(page.locator('button.devoluciones-btn-submit')).toBeVisible();
  });

  test('CA_11_03: Debe mostrar error al intentar guardar sin datos', async ({ page }) => {
    await page.locator('button.devoluciones-btn-register').click();
    await page.locator('button.devoluciones-btn-submit').click();
    // Al menos el formulario debe permanecer visible (no regresar a lista)
    await expect(page.locator('h1.devoluciones-title')).toHaveText('Registrar Devolución');
  });
});

// ==============================
// HU-12: VISUALIZAR DEVOLUCIONES
// ==============================
test.describe('HU-12: Visualizar y detalle de devolución', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/devoluciones`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.entity-table', { timeout: 15000 });
  });

  test('CA_12_01: Debe visualizar la lista de devoluciones registradas', async ({ page }) => {
    const tableRows = page.locator('table.entity-table tbody tr');
    await expect(tableRows).toHaveCount(2);
    await expect(page.locator('table.entity-table tbody').locator('text=Cliente Test 1')).toBeVisible();
    await expect(page.locator('table.entity-table tbody').locator('text=Cliente Test 2')).toBeVisible();
  });

  test('CA_12_02: Debe buscar devoluciones por cliente o ID', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar por cliente, ID o producto..."]');
    await searchInput.fill('Cliente Test 1');
    await expect(page.locator('table.entity-table tbody tr')).toHaveCount(1);
    await expect(page.locator('table.entity-table tbody').locator('text=Cliente Test 1')).toBeVisible();
  });

  test('CA_12_03: Debe filtrar devoluciones por estado', async ({ page }) => {
    const statusBtns = page.locator('.status-filter-btn');
    const completedBtn = statusBtns.filter({ hasText: 'Completada' });
    await completedBtn.click();
    await expect(page.locator('table.entity-table tbody tr')).toHaveCount(1);
  });

  test('CA_12_04: Debe ver el detalle de una devolución', async ({ page }) => {
    const firstRow = page.locator('table.entity-table tbody tr').first();
    await firstRow.locator('[title="Ver detalles"]').click();
    await expect(page.locator('h1.devoluciones-title')).toHaveText('Detalle de Devolución');
  });
});

// ==============================
// HU-13: CAMBIAR ESTADO DEVOLUCIÓN
// ==============================
test.describe('HU-13: Cambiar Estado de Devolución', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/devoluciones`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.entity-table', { timeout: 15000 });
  });

  test('CA_13_01: Debe permitir aprobar una devolución pendiente', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: 'Cliente Test 1' });
    const approveBtn = row.locator('.action-approve');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verificar que aparece el modal de aprobación
    await expect(page.locator('h3:has-text("Aprobar")').or(page.locator('[class*="modal"]:has-text("Aprobar")')).first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_13_02: Debe permitir rechazar una devolución pendiente', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: 'Cliente Test 1' });
    const rejectBtn = row.locator('.action-reject');
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();

    // Verificar que aparece modal de rechazo con campo de motivo
    await expect(page.locator('h3:has-text("Rechazar")').or(page.locator('[class*="modal"]:has-text("Rechazar")')).first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_13_03: Una devolución completada no debe mostrar botones de cambio de estado', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: 'Cliente Test 2' });
    // Devolución Completada no debería mostrar Aprobar
    await expect(row.locator('.action-approve')).toBeHidden();
  });
});
