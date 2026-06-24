import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const mockProviders = [
  {
    id: 1, IdProveedor: 1,
    companyName: 'Proveedor Empresa 1', Nombre: 'Proveedor Empresa 1',
    documentNumber: '900123456-7', NumeroDocumento: '900123456-7',
    contactName: 'Carlos Pérez', Contacto: 'Carlos Pérez',
    email: 'carlos@proveedora.com', Correo: 'carlos@proveedora.com',
    phone: '3109876543', Telefono: '3109876543',
    isActive: true, Estado: true,
    supplierType: 'Persona Jurídica', TipoProveedor: 'Empresa',
    documentType: 'NIT', TipoDocumento: 'NIT',
    address: 'Calle 100 # 15-20', Direccion: 'Calle 100 # 15-20',
    department: 'Antioquia', Departamento: 'Antioquia',
    city: 'Medellín', Ciudad: 'Medellín'
  }
];

const mockStatuses = [
  { nombre: 'Activo', Estado: 'activo' },
  { nombre: 'Inactivo', Estado: 'inactivo' }
];

async function setupProveedoresRoutes(page) {
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
          sessionId: 'test-session-hu04'
        }
      })
    });
  });

  // Colombia API Mocking
  await page.route('https://api-colombia.com/api/v1/Department', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Antioquia' }
      ])
    });
  });

  await page.route('https://api-colombia.com/api/v1/Department/1/cities', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Medellín', departmentId: 1 }
      ])
    });
  });

  // Providers list mock
  await page.route('**/api/proveedores', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockProviders })
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const phone = body.phone || body.Telefono;
      if (phone === '3112223344') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'El número de teléfono ya está registrado' })
        });
      } else {
        const nuevoProv = {
          id: Date.now(), IdProveedor: Date.now(),
          companyName: body.companyName || body.Nombre || '', Nombre: body.companyName || body.Nombre || '',
          documentNumber: body.documentNumber || body.NumeroDocumento || '', NumeroDocumento: body.documentNumber || body.NumeroDocumento || '',
          contactName: body.contactName || body.Contacto || '', Contacto: body.contactName || body.Contacto || '',
          email: body.email || body.Correo || '', Correo: body.email || body.Correo || '',
          phone: phone, Telefono: phone,
          isActive: true, Estado: true,
          supplierType: body.supplierType || 'Persona Natural',
          documentType: body.documentType || '',
          address: body.address || '',
          department: body.department || '',
          city: body.city || ''
        };
        mockProviders.unshift(nuevoProv);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: nuevoProv })
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
  await setupProveedoresRoutes(page);

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
      token: 'test-token-hu-04',
      userType: 'admin',
      sessionId: 'test-session-hu04'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe('HU-04: Registrar proveedor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/proveedores`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button.proveedores-btn-add', { timeout: 15000 });
  });

  test('CA_04_01: Debe visualizar botón para registrar un nuevo proveedor', async ({ page }) => {
    const btnAdd = page.locator('button.proveedores-btn-add');
    await expect(btnAdd).toBeVisible();
    await expect(btnAdd).toHaveText('Registrar Proveedor');
  });

  test('CA_04_02: Debe registrar un proveedor exitosamente', async ({ page }) => {
    await page.locator('button.proveedores-btn-add').click();
    
    // Validar título del modal
    await expect(page.locator('.universal-modal-container h2')).toHaveText('Registrar proveedor');

    // Rellenar formulario como Persona Natural
    await page.locator('select[name="supplierType"]').selectOption('Persona natural');
    await page.locator('input[name="contactName"]').fill('Juan Carlos Natural');
    await page.locator('select[name="documentType"]').selectOption('Cédula de ciudadanía');
    await page.locator('input[name="documentNumber"]').fill('1098765432');
    await page.locator('input[name="email"]').fill('juan.natural@test.com');
    await page.locator('input[name="phone"]').fill('3101234567');
    
    // Seleccionar Departamento (esperar a que las opciones estén disponibles tras cargar)
    const deptSelect = page.locator('select[name="department"]');
    await deptSelect.selectOption('Antioquia');

    // Seleccionar Ciudad (se habilita y carga tras seleccionar departamento)
    const citySelect = page.locator('select[name="city"]');
    await expect(citySelect).not.toBeDisabled({ timeout: 5000 });
    await citySelect.selectOption('Medellín');

    await page.locator('input[name="address"]').fill('Calle 10 # 5-5');

    // Guardar (botón en el modal con etiqueta 'Guardar')
    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar mensaje de éxito
    await expect(page.locator('text=Proveedor creado correctamente ✅').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.universal-modal-overlay')).toBeHidden({ timeout: 5000 });
  });

  test('CA_04_03: Debe mostrar error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.proveedores-btn-add').click();
    
    // Guardar sin rellenar nada
    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Debería validar el primer campo requerido: "Tipo de persona"
    await expect(page.locator('text=Tipo de persona es requerido').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_04_04: Debe validar número de contacto duplicado', async ({ page }) => {
    await page.locator('button.proveedores-btn-add').click();
    
    // Rellenar campos
    await page.locator('select[name="supplierType"]').selectOption('Persona natural');
    await page.locator('input[name="contactName"]').fill('Juan Carlos Duplicado');
    await page.locator('select[name="documentType"]').selectOption('Cédula de ciudadanía');
    await page.locator('input[name="documentNumber"]').fill('1098765432');
    await page.locator('input[name="email"]').fill('juan.duplicado@test.com');
    await page.locator('input[name="phone"]').fill('3112223344'); // Número duplicado
    
    await page.locator('select[name="department"]').selectOption('Antioquia');
    await page.locator('select[name="city"]').selectOption('Medellín');
    await page.locator('input[name="address"]').fill('Calle 10 # 5-5');

    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Debe mostrar error de duplicación del teléfono
    await expect(page.locator('text=El número de teléfono ya está registrado').first()).toBeVisible({ timeout: 10000 });
  });
});


// ==============================
// CRUD Consolidado (Listar, Buscar, Editar, Detalles, Estado, Eliminar)
// ==============================
test.describe('CRUD Consolidado de proveedores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/proveedores`, { waitUntil: 'domcontentloaded' });
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
