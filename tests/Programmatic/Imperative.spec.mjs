import { test, expect } from '@playwright/test';
test('Programmatic>Imperative', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./tests/Programmatic/Imperative.html');
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^2');
    await expect.poll(() => page.evaluate(() => globalThis.__fetchReady?.headers))
        .toEqual({myCustomHeader: 'goodbye', myHeader: 'hello'});
    // typing still refreshes the action
    await page.locator('input[value="x^2"]').fill('x^3');
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^3');
    expect(errors).toEqual([]);
});
test('Programmatic>Imperative: the caller\'s headers object is not mutated', async ({ page }) => {
    await page.goto('./tests/Programmatic/Imperative.html');
    await expect.poll(() => page.evaluate(() => globalThis.__fetchReady?.headers?.myHeader)).toBe('hello');
    expect(await page.evaluate(() => globalThis.__headers)).toEqual({myCustomHeader: 'goodbye'});
});
