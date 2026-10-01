import { test, expect } from '@playwright/test';
test('Programmatic>DeclarativeOutOfSequence', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./tests/Programmatic/DeclarativeOutOfSequence.html');
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^2');
    await expect.poll(() => page.evaluate(() => globalThis.__fetchReady?.headers))
        .toEqual({myCustomHeader: 'goodbye', myHeader: 'hello'});
    // typing still refreshes the action
    await page.locator('input[value="x^2"]').fill('x^3');
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^3');
    expect(errors).toEqual([]);
});
