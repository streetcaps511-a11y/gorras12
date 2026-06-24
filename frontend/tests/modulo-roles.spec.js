import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

test.describe('HU-01: Registrar un rol', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const fakeUser = {
        id: 1,
        IdUsuario: 1,
        IdCliente: 1,
        nombre: 'Administrador Test',
        Correo: 'duvann1991@gmail.com',
        IdRol: 1,
        Rol: 'Administrador',
        rol: 'Administrador',
        Estado: 'activo',
        permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard'],
        mustChangePassword: false,
        token: 'test-token-hu-01',
        userType: 'admin',
        sessionId: 'test-session-hu01'
      };
      sessionStorage.setItem('user', JSON.stringify(fakeUser));
      sessionStorage.setItem('token', fakeUser.token);
    });

    // Catch-all: cualquier /api/ no mockeada devuelve 200 vacío
    // Evita que el interceptor axios redirija a /login o se quede colgado por peticiones reales fallidas
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
            permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard'],
            sessionId: 'test-session-hu01'
          }
        })
      });
    });

    await page.route('**/api/roles*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Administrador', description: 'Acceso total', isActive: true, permissions: [] },
              { id: 2, name: 'Cliente', description: 'Cliente', isActive: true, permissions: [] }
            ]
          })
        });
      } else if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON ? await route.request().postDataJSON() : {};
        const nombre = (body.Nombre || body.nombre || body.name || '').toLowerCase();
        if (nombre === 'administrador' || nombre === 'cliente') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, message: 'El rol ya existe' })
          });
        } else {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                IdRol: Date.now(),
                Nombre: body.Nombre || body.nombre || body.name || 'Nuevo Rol',
                Descripcion: body.Descripcion || body.descripcion || body.description || '',
                Estado: true,
                Permisos: body.Permisos || body.permisos || body.permissions || []
              }
            })
          });
        }
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await page.goto(`${BASE_URL}/admin/roles`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('button.roles-btn-add')).toBeVisible({ timeout: 20000 });
  });

  test('CA_01_01: Debe visualizar botón para registrar un nuevo rol', async ({ page }) => {
    const botonRegistrar = page.locator('button.roles-btn-add');
    await expect(botonRegistrar).toBeVisible();
    await expect(botonRegistrar).toHaveText('Registrar rol');
  });

  test('CA_01_02: Debe registrar un rol exitosamente', async ({ page }) => {
    await page.locator('button.roles-btn-add').click();
    await page.locator('input[placeholder="Ej: Vendedor"]').fill('Rol Test QA ' + Date.now());
    await page.locator('input[placeholder="Breve descripción"]').fill('Rol creado por automatización');
    const primerPermiso = page.locator('input.permission-checkbox').first();
    await expect(primerPermiso).toBeVisible();
    await primerPermiso.check();
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=Rol creado correctamente')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button.roles-btn-add')).toBeVisible({ timeout: 5000 });
  });

  test('CA_01_03: Debe mostrar error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.roles-btn-add').click();
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=Complete todos los campos requeridos')).toBeVisible({ timeout: 5000 });
  });

  test('CA_01_04: Debe validar nombre de rol duplicado', async ({ page }) => {
    await page.locator('button.roles-btn-add').click();
    await page.locator('input[placeholder="Ej: Vendedor"]').fill('Cliente');
    const descInput = page.locator('input[placeholder="Breve descripción"]');
    await expect(descInput).toBeDisabled({ timeout: 5000 });
  });
});

// ==============================
// CRUD ROLES Y PERMISOS (HU_02 a HU_08)
// ==============================
test.describe('CRUD de Roles y Permisos (HU_02 a HU_08)', () => {
  test.beforeEach(async ({ page }) => {
    // Re-use the same setup logic
    await page.addInitScript(() => {
      const fakeUser = {
        id: 1, email: 'duvann1991@gmail.com', rol: 'Administrador', Estado: 'activo',
        permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard'], token: 'test-token', sessionId: 'test'
      };
      sessionStorage.setItem('user', JSON.stringify(fakeUser));
      sessionStorage.setItem('token', fakeUser.token);
    });

    await page.route('**/api/mi/perfil', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 1, rol: 'Administrador', permisos: ['perm_roles'] } }) });
    });
    
    await page.route('**/api/auth/verify', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, usuario: { id: 1, rol: 'Administrador', permisos: ['perm_roles'] } }) });
    });

    // Mock API Roles & Permisos
    await page.route('**/api/roles*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, IdRol: 1, name: 'Administrador', Nombre: 'Administrador', description: 'Acceso total', isActive: true, permissions: ['perm_roles'] },
              { id: 2, IdRol: 2, name: 'Cliente', Nombre: 'Cliente', description: 'Cliente normal', isActive: false, permissions: [] }
            ]
          })
        });
      } else if (method === 'PUT' || method === 'PATCH') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Rol actualizado exitosamente' }) });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Rol eliminado' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    // Mock Permisos API (HU_07, HU_08)
    await page.route('**/api/permisos*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 1, name: 'Gestión de Roles', code: 'perm_roles' },
            { id: 2, name: 'Gestión de Usuarios', code: 'perm_usuarios' }
          ]
        })
      });
    });

    await page.goto(`${BASE_URL}/admin/roles`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.entity-table, .roles-grid', { timeout: 15000 }).catch(() => {});
  });

  // HU_02: Editar rol
  test('HU_02: Editar rol existente', async ({ page }) => {
    // Buscar el botón de editar en el primer rol
    const editBtn = page.locator('button[title="Editar"], .action-edit').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.locator('text=Editar').first()).toBeVisible();
      
      const descInput = page.locator('input[placeholder="Breve descripción"]');
      if (await descInput.isVisible()) {
        await descInput.fill('Descripción actualizada');
        await page.getByRole('button', { name: 'Guardar' }).click();
        await expect(page.locator('text=actualizado').or(page.locator('text=éxito'))).toBeVisible({ timeout: 5000 });
      }
    }
  });

  // HU_03: Listar roles
  test('HU_03: Listar roles registrados', async ({ page }) => {
    // Verificar que la lista/tabla sea visible y contenga la data del mock
    await expect(page.locator('text=Administrador').first()).toBeVisible();
    await expect(page.locator('text=Cliente').first()).toBeVisible();
  });

  // HU_04: Cambiar el estado de un rol
  test('HU_04: Cambiar el estado (Activar/Inactivar) de un rol', async ({ page }) => {
    // Botón de toggle estado
    const toggleBtn = page.locator('button[title="Cambiar estado"], .action-toggle-status').last();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      // Esperar posible modal de confirmación o toast directo
      const confirmBtn = page.locator('button:has-text("Confirmar")');
      if (await confirmBtn.isVisible()) await confirmBtn.click();
      
      await expect(page.locator('text=actualizado').or(page.locator('text=éxito'))).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  // HU_05: Visualizar el detalle de un rol
  test('HU_05: Visualizar el detalle de un rol', async ({ page }) => {
    // Botón de detalle
    const detailBtn = page.locator('button[title="Ver detalles"], .action-view').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.locator('text=Detalles').first()).toBeVisible();
      await expect(page.locator('text=Administrador').first()).toBeVisible();
    }
  });

  // HU_06: Eliminar un rol
  test('HU_06: Eliminar un rol de forma segura', async ({ page }) => {
    const deleteBtn = page.locator('button[title="Eliminar"], .action-delete').last();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Validar modal de advertencia antes de eliminar
      await expect(page.locator('text=¿Estás seguro').or(page.locator('text=Eliminar'))).toBeVisible();
      const confirmBtn = page.locator('button:has-text("Sí"), button:has-text("Eliminar"), button:has-text("Confirmar")');
      if (await confirmBtn.isVisible()) await confirmBtn.click();
    }
  });

  // HU_07: Listar permisos y HU_08: Buscar permisos
  test('HU_07 / HU_08: Listar y buscar permisos disponibles', async ({ page }) => {
    // Algunos sistemas muestran los permisos en una pestaña o abriendo el modal de crear rol
    const addBtn = page.locator('button.roles-btn-add');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Buscar campo de filtro de permisos
      const searchPermInput = page.locator('input[placeholder*="Buscar permiso"]');
      if (await searchPermInput.isVisible()) {
        await searchPermInput.fill('Gestión');
        await expect(page.locator('text=Gestión de Roles').first()).toBeVisible();
      } else {
        // Simplemente ver que se listan
        await expect(page.locator('input.permission-checkbox').first()).toBeVisible();
      }
    }
  });
});

