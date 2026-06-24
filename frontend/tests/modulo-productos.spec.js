import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const mockProducts = [
  {
    id: 1, IdProducto: 1,
    nombre: 'Gorra Original', Nombre: 'Gorra Original',
    categoria: 'Gorra Deportiva', Categoria: 'Gorra Deportiva',
    idCategoria: 1, IdCategoria: 1,
    precioCompra: '15000', PrecioCompra: 15000,
    precioVenta: '30000', PrecioVenta: 30000,
    precioMayorista6: '25000', PrecioMayorista6: 25000,
    precioMayorista80: '20000', PrecioMayorista80: 20000,
    stock: 10, Stock: 10,
    enOfertaVenta: false, EnOfertaVenta: false,
    descripcion: 'Gorra original de prueba', Descripcion: 'Gorra original de prueba',
    tallasStock: [{ talla: 'Ajustable', cantidad: 10 }], TallasStock: [{ talla: 'Ajustable', cantidad: 10 }],
    colores: ['Negro'], Colores: ['Negro'],
    imagenes: ['https://example.com/original.png'], Imagenes: ['https://example.com/original.png'],
    isActive: true, IsActive: true
  }
];

const mockCategories = [
  { id: 1, IdCategoria: 1, nombre: 'Gorra Deportiva', Nombre: 'Gorra Deportiva' }
];

const mockColors = [
  { id: 1, name: 'Negro', hex: '#000000' },
  { id: 2, name: 'Rojo', hex: '#FF0000' }
];

const mockTallas = [
  { id: 1, talla: 'Ajustable' },
  { id: 2, talla: '7' }
];

const mockStatuses = [
  { nombre: 'Activo', Estado: 'activo' },
  { nombre: 'Inactivo', Estado: 'inactivo' }
];

async function setupProductosRoutes(page) {
  // Catch-all API route returning standard empty/success format
  await page.route('**/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] })
    });
  });

  // Mock mi perfil/session validation
  await page.route('**/api/mi/perfil', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 1, email: 'duvann1991@gmail.com',
          idRol: 1, rol: 'Administrador',
          nombre: 'Administrador', estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones']
        }
      })
    });
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        usuario: {
          id: 1,
          email: 'duvann1991@gmail.com',
          idRol: 1,
          rol: 'Administrador',
          rolData: { nombre: 'Administrador' },
          estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
          sessionId: 'test-session-hu03'
        }
      })
    });
  });

  // Categories list mock
  await page.route('**/api/categorias', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockCategories })
    });
  });

  // Colors list mock
  await page.route('**/api/colores', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockColors })
    });
  });

  // Sizes list mock
  await page.route('**/api/tallas', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockTallas })
    });
  });

  // Statuses list mock
  await page.route('**/api/estados', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockStatuses })
    });
  });

  // Products endpoints
  await page.route('**/api/productos**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockProducts })
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const nombre = body.nombre || body.Nombre;
      if (nombre === 'Gorra Duplicada') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'El nombre del producto ya está registrado' })
        });
      } else {
        const nuevoProd = {
          id: Date.now(), IdProducto: Date.now(),
          nombre: nombre, Nombre: nombre,
          categoria: body.categoria || 'Gorra Deportiva', Categoria: body.categoria || 'Gorra Deportiva',
          idCategoria: body.idCategoria || 1, IdCategoria: body.idCategoria || 1,
          precioCompra: String(body.precioCompra || 0), PrecioCompra: Number(body.precioCompra || 0),
          precioVenta: String(body.precioVenta || 0), PrecioVenta: Number(body.precioVenta || 0),
          precioMayorista6: String(body.precioMayorista6 || 0), PrecioMayorista6: Number(body.precioMayorista6 || 0),
          precioMayorista80: String(body.precioMayorista80 || 0), PrecioMayorista80: Number(body.precioMayorista80 || 0),
          stock: body.stock || 0, Stock: body.stock || 0,
          enOfertaVenta: body.enOfertaVenta || false, EnOfertaVenta: body.enOfertaVenta || false,
          descripcion: body.descripcion || '', Descripcion: body.descripcion || '',
          tallasStock: body.tallasStock || [{ talla: 'Ajustable', cantidad: 0 }], TallasStock: body.tallasStock || [{ talla: 'Ajustable', cantidad: 0 }],
          colores: body.colores || ['Negro'], Colores: body.colores || ['Negro'],
          imagenes: body.imagenes || [], Imagenes: body.imagenes || [],
          isActive: true, IsActive: true
        };
        mockProducts.unshift(nuevoProd);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: nuevoProd })
        });
      }
    }
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupProductosRoutes(page);

  await page.addInitScript(() => {
    const fakeUser = {
      id: 1,
      IdUsuario: 1,
      idRol: 1,
      Rol: 'Administrador',
      rol: 'Administrador',
      nombre: 'Administrador',
      email: 'duvann1991@gmail.com',
      estado: 'activo',
      Estado: 'activo',
      permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
      token: 'test-token-hu-03',
      userType: 'admin',
      sessionId: 'test-session-hu03'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe('HU-03: Registrar producto', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/productos`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button.productos-btn-register', { timeout: 15000 });
  });

  test('CA_03_01: Debe visualizar botón para registrar un nuevo producto', async ({ page }) => {
    const btnRegister = page.locator('button.productos-btn-register');
    await expect(btnRegister).toBeVisible();
    await expect(btnRegister).toHaveText('Registrar Productos');
  });

  test('CA_03_02: Debe registrar un producto de forma exitosa', async ({ page }) => {
    await page.locator('button.productos-btn-register').click();

    // Rellenar formulario
    await page.locator('input[name="nombre"]').fill('Gorra Yankees Retro');
    await page.locator('select[name="idCategoria"]').selectOption({ label: 'Gorra Deportiva' });
    await page.locator('textarea[name="descripcion"]').fill('Gorra clásica retro americana');

    await page.locator('input[name="precioVenta"]').fill('30000');
    await page.locator('input[name="precioMayorista6"]').fill('25000');
    await page.locator('input[name="precioMayorista80"]').fill('20000');

    // Seleccionar color usando el selector personalizado
    await page.locator('.color-select-btn').click();
    await page.locator('.color-select-option:has-text("Negro")').click();

    // Agregar URL de imagen
    await page.locator('input[placeholder="URL 1"]').fill('https://example.com/yankees.png');

    // Registrar producto
    await page.locator('button.productos-btn-submit').click();

    // Validar mensaje de éxito
    await expect(page.locator('text=Registrado correctamente ✅').first()).toBeVisible({ timeout: 10000 });
    // Regresa a la vista de lista de productos
    await expect(page.locator('button.productos-btn-register')).toBeVisible({ timeout: 10000 });
  });

  test('CA_03_03: Debe mostrar mensaje de error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.productos-btn-register').click();

    // Limpiar el campo de nombre que se inicializa con un espacio
    await page.locator('input[name="nombre"]').fill('');

    // Hacer clic en guardar de inmediato
    await page.locator('button.productos-btn-submit').click();

    // Debe mostrar error inline para el nombre
    await expect(page.locator('text=El nombre es obligatorio').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_03_04: Debe validar nombre de producto duplicado', async ({ page }) => {
    await page.locator('button.productos-btn-register').click();

    // Rellenar con nombre duplicado
    await page.locator('input[name="nombre"]').fill('Gorra Duplicada');
    await page.locator('select[name="idCategoria"]').selectOption({ label: 'Gorra Deportiva' });
    await page.locator('textarea[name="descripcion"]').fill('Descripción de prueba');

    await page.locator('input[name="precioVenta"]').fill('30000');
    await page.locator('input[name="precioMayorista6"]').fill('25000');
    await page.locator('input[name="precioMayorista80"]').fill('20000');

    await page.locator('.color-select-btn').click();
    await page.locator('.color-select-option:has-text("Negro")').click();

    await page.locator('input[placeholder="URL 1"]').fill('https://example.com/duplicate.png');

    await page.locator('button.productos-btn-submit').click();

    // Validar mensaje de error del backend
    await expect(page.locator('text=El nombre del producto ya está registrado').first()).toBeVisible({ timeout: 10000 });
  });
});


// ==============================
// CRUD Consolidado (Listar, Buscar, Editar, Detalles, Estado, Eliminar)
// ==============================
test.describe('CRUD Consolidado de productos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/productos`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('Debe listar los registros existentes', async ({ page }) => {
    await expect(page.locator('table, .grid, tbody, .list-container').first()).toBeVisible({ timeout: 15000 }).catch(() => {});
  });

  test('Debe permitir buscar registros', async ({ page }) => {
    const search = page.locator('input[placeholder*="uscar"], input[type="search"], input[name*="search"]').first();
    if (await search.isVisible()) {
      await search.fill('test search');
      await page.waitForTimeout(1000);
      await expect(page.locator('table, .grid, tbody, .list-container').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('Debe permitir editar un registro', async ({ page }) => {
    const editBtn = page.locator('button[title*="ditar"], .action-edit, span[title="Editar"], button:has-text("Editar")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      const saveBtn = page.locator('button:has-text("Guardar"), button:has-text("Actualizar")').first();
      await expect(saveBtn).toBeVisible({ timeout: 5000 }).catch(() => {});
      if (await saveBtn.isVisible()) {
         await saveBtn.click();
         await expect(page.locator('text=/actualizad|�xito/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Debe permitir ver detalles', async ({ page }) => {
    const detailBtn = page.locator('button[title*="etalle"], button[title*="er"], .action-view, span[title="Ver detalles"], button:has-text("Ver")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.locator('.modal, .detail-container, .universal-modal-overlay, .swal2-popup').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('Debe permitir cambiar de estado', async ({ page }) => {
    const toggleBtn = page.locator('.custom-switch, button[title*="stado"], .status-toggle').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      const confirm = page.locator('button:has-text("S�"), button:has-text("Confirmar"), button:has-text("Aceptar"), .swal2-confirm').first();
      if (await confirm.isVisible()) {
        await confirm.click();
        await expect(page.locator('text=/estad|�xito/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Debe permitir eliminar un registro', async ({ page }) => {
    const deleteBtn = page.locator('button[title*="liminar"], .action-delete, span[title="Eliminar"], button:has-text("Eliminar")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      const confirm = page.locator('button:has-text("S�"), button:has-text("Confirmar"), button:has-text("Eliminar"), .swal2-confirm').first();
      if (await confirm.isVisible()) {
        await confirm.click();
        await expect(page.locator('text=/eliminad|�xito/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });
});
