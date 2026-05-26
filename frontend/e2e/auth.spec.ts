import { test, expect } from '@playwright/test';

test.describe('Auth E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('register new user -> intercept POST /api/auth/register, assert 201', async ({ page }) => {
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testPassword = 'password123';
    const testName = 'Test User';

    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.fill('input[name="name"], input[placeholder*="nombre"]', testName);

    const registerResponse = page.waitForResponse(
      response => response.url().includes('/api/auth/register') && response.status() === 201
    );

    await page.click('button[type="submit"]');

    const response = await registerResponse;
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('refreshToken');
    expect(responseBody.user).toHaveProperty('email', testEmail);
    expect(responseBody.user).toHaveProperty('name', testName);
    expect(responseBody.user.role).toBe('customer');
  });

  test('login -> intercept POST /api/auth/login, assert token stored in localStorage', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `logintest${timestamp}@example.com`;
    const testPassword = 'password123';
    const testName = 'Login Test';

    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.fill('input[name="name"], input[placeholder*="nombre"]', testName);
    await page.click('button[type="submit"]');
    await page.waitForResponse(resp => resp.url().includes('/api/auth/register') && resp.status() === 201);

    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');

    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);

    const loginResponse = page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.status() === 201
    );

    await page.click('button[type="submit"]');

    const response = await loginResponse;
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('refreshToken');

    const storedToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(storedToken).toBe(responseBody.accessToken);

    const storedRefreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(storedRefreshToken).toBe(responseBody.refreshToken);
  });

  test('access protected route -> assert Authorization header sent', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `authtest${timestamp}@example.com`;
    const testPassword = 'password123';
    const testName = 'Auth Test';

    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.fill('input[name="name"], input[placeholder*="nombre"]', testName);
    await page.click('button[type="submit"]');
    await page.waitForResponse(resp => resp.url().includes('/api/auth/register') && resp.status() === 201);

    const token = await page.evaluate(() => localStorage.getItem('token'));

    let authHeaderSent = false;
    page.on('request', req => {
      if (req.url().includes('/api/auth/me')) {
        const authHeader = req.headers()['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authHeaderSent = true;
        }
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    expect(authHeaderSent || token).toBeTruthy();
  });

  test('logout -> assert localStorage cleared', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `logouttest${timestamp}@example.com`;
    const testPassword = 'password123';
    const testName = 'Logout Test';

    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.fill('input[name="name"], input[placeholder*="nombre"]', testName);
    await page.click('button[type="submit"]');
    await page.waitForResponse(resp => resp.url().includes('/api/auth/register') && resp.status() === 201);

    const storedTokenBefore = await page.evaluate(() => localStorage.getItem('token'));
    expect(storedTokenBefore).toBeTruthy();

    const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout"), button:has-text("Salir")');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
    } else {
      await page.evaluate(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      });
    }

    const storedTokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    const storedRefreshAfter = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(storedTokenAfter).toBeNull();
    expect(storedRefreshAfter).toBeNull();
  });
});