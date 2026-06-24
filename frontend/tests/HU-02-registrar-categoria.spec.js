import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const mockCategories = [
  {
    id: '1', IdCategoria: 1,
    nombre: 'Gorra Deportiva', Nombre: 'Gorra Deportiva',
    descripcion: 'Categoría para gorras deportivas', Descripcion: 'Categoría para gorras deportivas',
    imagenUrl: 'https://example.com/sports.png', ImagenUrl: 'https://example.com/sports.png',
    isActive: true, Estado: true
  }
];

const mockStatuses = [
  { nombre: 'Activo', Estado: 'activo' },
  { nombre: 'Inactivo', Estado: 'inactivo' }
];

async function setupCategoriasRoutes(page) {
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
          sessionId: 'test-session-hu02'
        }
      })
    });
  });

  // Categories endpoints
  await page.route('**/api/categorias', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockCategories })
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const nombre = body.nombre || body.Nombre;
      if (nombre === 'Gorra Duplicada') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'La categoría ya está registrada' })
        });
      } else {
        const nuevaCat = {
          id: String(Date.now()), IdCategoria: Date.now(),
          nombre: nombre, Nombre: nombre,
          descripcion: body.descripcion || body.Descripcion || '', Descripcion: body.descripcion || body.Descripcion || '',
          imagenUrl: body.imagenUrl || body.ImagenUrl || '', ImagenUrl: body.imagenUrl || body.ImagenUrl || '',
          isActive: true, Estado: true
        };
        mockCategories.unshift(nuevaCat);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: nuevaCat })
        });
      }
    }
  });

  // Provider statuses mock
  await page.route('**/api/estados', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockStatuses })
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupCategoriasRoutes(page);

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
      token: 'test-token-hu-02',
      userType: 'admin',
      sessionId: 'test-session-hu02'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe('HU-02: Registrar categoría', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/categorias`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button.btn-primary:has-text("Registrar Categoría")', { timeout: 15000 });
  });

  test('CA_02_01: Debe visualizar botón para registrar una nueva categoría', async ({ page }) => {
    const btnAdd = page.locator('button.btn-primary:has-text("Registrar Categoría")');
    await expect(btnAdd).toBeVisible();
  });

  test('CA_02_02: Debe registrar una categoría de forma exitosa', async ({ page }) => {
    await page.locator('button.btn-primary:has-text("Registrar Categoría")').click();

    // Validar título del modal
    await expect(page.locator('.universal-modal-container h2')).toHaveText('Registrar categoría');

    // Rellenar formulario
    await page.locator('input[name="nombre"]').fill('Gorra Urbana');
    await page.locator('textarea[name="descripcion"]').fill('Gorrras para uso casual y urbano en la ciudad');
    await page.locator('input[name="imagenUrl"]').fill('https://example.com/urbana.png');

    // Guardar usando el botón de confirmación en el modal
    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar mensaje de éxito
    await expect(page.locator('text=Cambios guardados ✅').first()).toBeVisible({ timeout: 10000 });
    // El modal debe ocultarse
    await expect(page.locator('.universal-modal-overlay')).toBeHidden({ timeout: 5000 });
  });

  test('CA_02_03: Debe mostrar mensaje de error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.btn-primary:has-text("Registrar Categoría")').click();

    // Guardar de inmediato sin ingresar nada
    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar alerta general de error
    await expect(page.locator('text=Complete los campos obligatorios').first()).toBeVisible({ timeout: 5000 });

    // Validar error inline para el nombre
    await expect(page.locator('text=El nombre es obligatorio').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_02_04: Debe validar nombre de categoría duplicado', async ({ page }) => {
    await page.locator('button.btn-primary:has-text("Registrar Categoría")').click();

    // Llenar con nombre duplicado
    await page.locator('input[name="nombre"]').fill('Gorra Duplicada');
    await page.locator('textarea[name="descripcion"]').fill('Descripción cualquiera');
    await page.locator('input[name="imagenUrl"]').fill('https://example.com/duplicate.png');

    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar alerta con el mensaje de error del backend
    await expect(page.locator('text=La categoría ya está registrada').first()).toBeVisible({ timeout: 10000 });
  });
});
