import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';
const ADMIN_EMAIL = 'duvann1991@gmail.com';
const ADMIN_PASSWORD = 'AdminGM2024!Secure';

const mockUsers = [
  {
    IdUsuario: 1, id: 1,
    nombre: 'Administrador', apellido: 'Sistema',
    email: 'duvann1991@gmail.com',
    Rol: 'Administrador', rol: 'Administrador',
    idRol: 1, IdRol: 1,
    estado: 'activo', Estado: 'activo', isActive: true,
    tipoDocumento: 'Cédula de Ciudadanía', TipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '1234567890', NumeroDocumento: '1234567890',
    telefono: '3001234567', Telefono: '3001234567', contacto: '3001234567',
    googleId: null, authProvider: null, proveedor: null, rolData: null
  },
  {
    IdUsuario: 2, id: 2,
    nombre: 'Juan', apellido: 'Pérez',
    email: 'juan@gorrascaps.com',
    Rol: 'Cliente', rol: 'Cliente',
    idRol: 2, IdRol: 2,
    estado: 'inactivo', Estado: 'inactivo', isActive: false,
    tipoDocumento: 'Cédula de Ciudadanía', TipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '9876543210', NumeroDocumento: '9876543210',
    telefono: '3009876543', Telefono: '3009876543', contacto: '3009876543',
    googleId: null, authProvider: null, proveedor: null, rolData: null
  }
];

const mockRoles = [
  { IdRol: 1, id: 1, Nombre: 'Administrador', name: 'Administrador', Descripcion: 'Acceso total', description: 'Acceso total', Estado: true, isActive: true, Permisos: [], permissions: [] },
  { IdRol: 2, id: 2, Nombre: 'Cliente', name: 'Cliente', Descripcion: 'Cliente', description: 'Cliente', Estado: true, isActive: true, Permisos: [], permissions: [] },
  { IdRol: 3, id: 3, Nombre: 'Empleado', name: 'Empleado', Descripcion: 'Empleado', description: 'Empleado', Estado: true, isActive: true, Permisos: [], permissions: [] }
];

const mockStatuses = [
  { nombre: 'Activo', Nombre: 'Activo', estado: 'activo', Estado: 'activo' },
  { nombre: 'Inactivo', Nombre: 'Inactivo', estado: 'inactivo', Estado: 'inactivo' }
];

async function setupAllRoutes(page) {
  // ⚠️ IMPORTANTE: Playwright usa LIFO (Last In, First Out) para rutas.
  // El catch-all se registra PRIMERO (menor prioridad) y los mocks específicos
  // se registran DESPUÉS (mayor prioridad), sobreescribiendo el catch-all.

  // Catch-all: cualquier /api/ no mockeada devuelve 200 vacío
  // Evita que el interceptor axios redirija a /login?expired=true por errores reales
  await page.route('**/api/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  // Mock para syncProfile / perfil (usado por AuthContext al montar)
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
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard']
        }
      })
    });
  });

  await page.route('**/api/auth/sync*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  // Mocks específicos (mayor prioridad por ser registrados después)
  await page.route('**/api/auth/login', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const correo = (body.correo || body.email || '').trim().toLowerCase();
    const clave = body.clave || body.password || '';
    if (correo === ADMIN_EMAIL && clave === ADMIN_PASSWORD) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            usuario: {
              id: 1, email: ADMIN_EMAIL,
              idRol: 1, rol: 'Administrador',
              rolData: { nombre: 'Administrador', id: 1 },
              estado: 'activo',
              permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
              sessionId: 'test-session-hu09'
            },
            token: 'test-token-hu-09-19',
            userType: 'admin'
          }
        })
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Credenciales inválidas' })
      });
    }
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        usuario: {
          id: 1, email: ADMIN_EMAIL,
          idRol: 1, rol: 'Administrador',
          rolData: { nombre: 'Administrador', id: 1 },
          estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
          sessionId: 'test-session-hu09'
        }
      })
    });
  });

  await page.route('**/api/usuarios*', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUsers }) });
      return;
    }

    if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      const nuevo = {
        IdUsuario: Date.now(), id: Date.now(),
        nombre: body.nombre || 'Nuevo', apellido: body.apellido || 'Usuario',
        email: body.email || `nuevo.${Date.now()}@gorrascaps.com`,
        Rol: body.rol || 'Cliente', rol: body.rol || 'Cliente',
        idRol: body.idRol || 2, IdRol: body.idRol || 2,
        estado: body.estado || 'activo', Estado: body.estado || 'activo',
        isActive: (body.estado || 'activo').toLowerCase() === 'activo',
        tipoDocumento: body.tipoDocumento || '', TipoDocumento: body.tipoDocumento || '',
        numeroDocumento: body.numeroDocumento || '', NumeroDocumento: body.numeroDocumento || '',
        telefono: body.telefono || body.contacto || '', Telefono: body.telefono || body.contacto || '', contacto: body.telefono || body.contacto || '',
        googleId: null, authProvider: null, proveedor: null, rolData: null
      };
      mockUsers.unshift(nuevo);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: nuevo }) });
      return;
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse(route.request().postData() || '{}');
      const match = url.pathname.match(/\/api\/usuarios\/(\d+)/);
      const id = match ? parseInt(match[1]) : null;
      const idx = mockUsers.findIndex(u => u.IdUsuario === id || u.id === id);
      if (idx !== -1) {
        const actualizado = { ...mockUsers[idx], ...body };
        if (body.isActive !== undefined) {
          actualizado.isActive = body.isActive;
          actualizado.estado = body.isActive ? 'activo' : 'inactivo';
          actualizado.Estado = body.isActive ? 'activo' : 'inactivo';
        }
        if (body.estado) {
          actualizado.estado = body.estado;
          actualizado.Estado = body.estado;
          actualizado.isActive = body.estado.toLowerCase() === 'activo';
        }
        mockUsers[idx] = actualizado;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: actualizado }) });
      } else {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Usuario no encontrado' }) });
      }
      return;
    }

    if (method === 'DELETE') {
      const match = url.pathname.match(/\/api\/usuarios\/(\d+)/);
      const id = match ? parseInt(match[1]) : null;
      const idx = mockUsers.findIndex(u => u.IdUsuario === id || u.id === id);
      if (idx !== -1) {
        mockUsers.splice(idx, 1);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      } else {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Usuario no encontrado' }) });
      }
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route('**/api/estados*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockStatuses }) });
  });

  await page.route('**/api/roles*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockRoles }) });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupAllRoutes(page);

  await page.addInitScript(() => {
    if (window.name === 'logged-out') {
      window.name = ''; // Resetear el flag para futuras navegaciones
      return;
    }
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
      token: 'test-token-hu-09-19',
      userType: 'admin',
      sessionId: 'test-session-hu09'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe.configure({ mode: 'serial' });

test.afterEach(async ({ page }) => {
  // Cerrar cualquier modal abierto para evitar efectos colaterales entre pruebas
  const closeBtn = page.locator('button.modal-close-btn');
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForSelector('.universal-modal-overlay', { state: 'detached', timeout: 5000 }).catch(() => {});
  }
});

// ─────────────────────────────────────────────
// HU_17: Iniciar sesión
// ─────────────────────────────────────────────
test.describe('HU_17: Iniciar sesión', () => {

  test.beforeEach(async ({ page }) => {
    await setupAllRoutes(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[placeholder*="correo"], input[type="email"]', { timeout: 10000 });
  });

  test('CA_17_01: Debe mostrar formulario con campos de usuario y contraseña', async ({ page }) => {
    await expect(page.getByPlaceholder('Ingresa tu correo...')).toBeVisible();
    await expect(page.getByPlaceholder('Escribe tu contraseña...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  test('CA_17_02: Debe mostrar error con credenciales incorrectas', async ({ page }) => {
    // Ingresar credenciales inválidas
    await page.getByPlaceholder('Ingresa tu correo...').fill('correo@invalido.com');
    await page.getByPlaceholder('Escribe tu contraseña...').fill('claveincorrecta');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    // Esperar breve tiempo para que la UI procese el error
    await page.waitForTimeout(500);
    // Mensaje de error puede contener "inválidas" o similares; se usa regex más amplio
    await expect(
      page.locator('text=/inválid[as]?|incorrect|no encontrado|error/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('CA_17_03: Debe mostrar opción de recuperación de contraseña', async ({ page }) => {
    await expect(page.locator('text=/olvidaste|recuperar|olvidé/i').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// HU_18: Cerrar sesión
// ─────────────────────────────────────────────
test.describe('HU_18: Cerrar sesión', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]', { timeout: 10000 });
  });

  test('CA_18_01: Debe mostrar botón de cerrar sesión visible', async ({ page }) => {
    const botonLogout = page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]').first();
    await expect(botonLogout).toBeVisible({ timeout: 5000 });
  });

  test('CA_18_02: Debe redirigir al login tras cerrar sesión', async ({ page }) => {
    // Click en el botón de cerrar sesión
    await page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]').first().click();
    
    // Hacer clic en el botón de confirmación del modal
    const confirmBtn = page.locator('.delete-modal-btn-confirm, button:has-text("Sí"), button:has-text("Aceptar"), button:has-text("Confirmar")').first();
    
    // Esperar que la petición de logout se encuentre en proceso al confirmar
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/logout') && resp.status() === 200, { timeout: 8000 }),
      confirmBtn.click()
    ]);

    // Verificar que el token haya sido removido del sessionStorage
    await page.waitForFunction(() => !sessionStorage.getItem('token'), { timeout: 5000 });
    // Esperar la navegación al login
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 12000 });
    await expect(page).toHaveURL(/login/);
  });

  test('CA_18_03: No debe permitir acceso sin sesión activa', async ({ page }) => {
    await page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]').first().click();
    
    // Confirmar en el modal
    const confirmBtn = page.locator('.delete-modal-btn-confirm, button:has-text("Sí"), button:has-text("Aceptar"), button:has-text("Confirmar")').first();
    await confirmBtn.click();

    await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000 });
    
    // Marcar la ventana como deslogueada para evitar que el init script restaure la sesión al recargar/navegar
    await page.evaluate(() => window.name = 'logged-out');

    await page.goto(`${BASE_URL}/admin/usuarios`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });
});

// ─────────────────────────────────────────────
// HU_19: Recuperar contraseña
// ─────────────────────────────────────────────
test.describe('HU_19: Recuperar contraseña', () => {

  test.beforeEach(async ({ page }) => {
    await setupAllRoutes(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[placeholder*="correo"]', { timeout: 10000 });
  });

  test('CA_19_01: Debe mostrar enlace de recuperación de contraseña', async ({ page }) => {
    const enlace = page.locator('text=/olvidaste|recuperar|olvidé/i').first();
    await expect(enlace).toBeVisible({ timeout: 5000 });
  });

  test('CA_19_02: Debe permitir ingresar correo para recuperar contraseña', async ({ page }) => {
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url();
      if (url.includes('forgot-password') || url.includes('recover-email')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Correo de recuperación enviado' })
        });
      } else {
        await route.continue();
      }
    });

    await page.locator('text=/olvidaste|recuperar|olvidé/i').first().click();
    const campoCorreo = page.locator('input[type="email"], input[placeholder*="correo"]').first();
    await expect(campoCorreo).toBeVisible({ timeout: 5000 });
    await campoCorreo.fill('duvann1991@gmail.com');
    await page.getByRole('button', { name: /enviar|recuperar|continuar/i }).first().click();
    await expect(
      page.locator('text=/enviado|revisa|correo|instrucciones/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CA_19_03: Debe validar criterios mínimos de seguridad en nueva contraseña', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password?token=mock-token`, { waitUntil: 'domcontentloaded' });
    const campoNuevaClave = page.locator('input[type="password"]').first();
    const campoConfirmarClave = page.locator('input[type="password"]').nth(1);
    await expect(campoNuevaClave).toBeVisible({ timeout: 5000 });
    await campoNuevaClave.fill('123');
    await campoConfirmarClave.fill('123');
    await page.getByRole('button', { name: /guardar|cambiar|actualizar/i }).first().click();
    await expect(
      page.locator('text=/mínimo|caracteres|seguridad|requisitos/i').first()
    ).toBeVisible({ timeout: 5000 });
  });
});
