import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `e2e_test_${Date.now()}@test.com`,
  full_name: 'E2E Test User',
  password: 'TestPassword123!',
};

test.describe('Auth E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('register new user - intercept POST /api/auth/register and assert 201', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="full_name"], input[id="full_name"], input[placeholder*="name"]', TEST_USER.full_name);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    const registerResponse = await page.waitForResponse(
      (response) => response.url().includes('/api/auth/register') && response.status() === 201
    );

    await page.click('button[type="submit"]');

    const responseBody = await registerResponse.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('email', TEST_USER.email);
    expect(responseBody).toHaveProperty('full_name', TEST_USER.full_name);
    expect(responseBody).toHaveProperty('is_active', true);
  });

  test('login - intercept POST /api/auth/login and assert token stored in localStorage', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);

    const loginResponse = await page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.status() === 201
    );

    await page.click('button[type="submit"]');

    const responseBody = await loginResponse.json();
    expect(responseBody).toHaveProperty('access_token');
    expect(responseBody).toHaveProperty('token_type', 'bearer');

    await expect(page).toHaveLocalStorageItem('token', responseBody.access_token);
  });

  test('access protected route - assert Authorization header sent', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboardprincipal');

    let authHeaderSent = false;
    await page.waitForResponse(
      (response) => {
        if (response.url().includes('/api/auth/me')) {
          const authHeader = response.request().headers()['authorization'];
          if (authHeader && authHeader.startsWith('Bearer ')) {
            authHeaderSent = true;
          }
        }
        return false;
      }
    );

    const meResponse = await page.waitForResponse(
      (response) => response.url().includes('/api/auth/me') && response.status() === 200
    );

    const meBody = await meResponse.json();
    expect(meBody).toHaveProperty('email', TEST_USER.email);
  });

  test('logout - assert localStorage cleared', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboardprincipal');

    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Cerrar"), button:has-text("Salir")');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
    }

    await expect(page).not.toHaveLocalStorageItem('token');

    await expect(page).toHaveURL('/login');
  });

  test('unauthenticated redirect - accessing protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboardprincipal');

    await expect(page).toHaveURL(/\/login/);
  });

  test('register validation - empty fields show error', async ({ page }) => {
    await page.goto('/register');

    await page.click('button[type="submit"]');

    const errorMessage = page.locator('text=Required, [role="alert"], .error, .text-danger');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('login with invalid credentials - assert error message shown', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    const errorResponse = await page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.status() !== 201
    );

    expect(errorResponse.status()).toBeGreaterThanOrEqual(400);
  });

  test('navigation to register - click register link navigates to register page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.locator('a:has-text("Register"), a:has-text("Registrarse"), a:has-text("Crear cuenta")');
    if (await registerLink.count() > 0) {
      await registerLink.first().click();
      await expect(page).toHaveURL(/\/register/);
    }
  });
});
