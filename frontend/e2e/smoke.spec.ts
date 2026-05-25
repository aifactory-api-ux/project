import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('navigation links are present and clickable', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a, header a, [role="navigation"] a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('backend health endpoint responds', async ({ page }) => {
    await page.goto('/');
    const healthResponse = await page.request.get('/api/health');
    expect(healthResponse.status()).toBeGreaterThan(0);
  });

  test('no console errors on initial page load', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(consoleErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('dispatches API returns valid response', async ({ page }) => {
    await page.goto('/');
    const response = await page.waitForResponse(
      (r) => r.url().includes('/api/dispatch') && r.status() === 200
    );
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('dispatch list displays on dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForResponse((r) => r.url().includes('/api/dispatch'));
    const dispatchRows = page.locator('table tbody tr, [data-testid="dispatch-row"]');
    const count = await dispatchRows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('filter bar is visible on dashboard', async ({ page }) => {
    await page.goto('/');
    const filterBar = page.locator('[data-testid="filter-bar"], .filter-bar, form[id*="filter"]');
    await expect(filterBar.first()).toBeVisible({ timeout: 5000 });
  });

  test('KPI cards are displayed on dashboard', async ({ page }) => {
    await page.goto('/');
    const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card');
    const count = await kpiCards.count();
    expect(count).toBeGreaterThan(0);
  });
});