import { test, expect } from '@playwright/test';

// Needs gc() exposed, which forces its own worker -- hence a separate file.
test.use({ launchOptions: { args: ['--js-flags=--expose-gc'] } });

test('Programmatic>TargetElementGC: a removed header field and link are not kept alive', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./tests/Programmatic/TargetElementGC.html');
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^2');
    await expect.poll(() => page.evaluate(() => globalThis.__fetchReady?.headers))
        .toEqual({kitchen: 'hello', porch: 'world'});
    // The test's own WeakRefs let it observe collection without keeping the elements alive.
    await page.evaluate(() => {
        const kitchen = document.querySelector('#kitchen');
        const link = document.querySelector('#newton');
        globalThis.__removedRefs = [new WeakRef(kitchen), new WeakRef(link)];
        kitchen.closest('label').remove();
        link.remove();
    });
    // WeakRef targets survive until the current job ends, so collect across several turns.
    const collected = await page.evaluate(async () => {
        const refs = globalThis.__removedRefs;
        for(let i = 0; i < 20 && refs.some(r => r.deref() !== undefined); i++){
            await new Promise(r => setTimeout(r, 50));
            globalThis.gc();
        }
        return refs.map(r => r.deref() === undefined);
    });
    expect(collected, 'the removed #kitchen and #newton were garbage collected, so the enhancement held no strong reference to them').toEqual([true, true]);
    // Afterwards, the enhancement keeps working:  the collected header field contributes no header.
    await page.locator('#expression').fill('x^3');
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^3');
    await expect.poll(() => page.evaluate(() => globalThis.__fetchReady?.headers)).toEqual({porch: 'world'});
    expect(errors).toEqual([]);
});
