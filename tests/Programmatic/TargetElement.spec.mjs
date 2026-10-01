import { test, expect } from '@playwright/test';
test('Programmatic>TargetElement: baseLink and headerFields accept elements, or WeakRefs to them', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('./tests/Programmatic/TargetElement.html');
    // baseLink as an element (with no id)
    await expect(page.locator('#form')).toHaveAttribute('action', 'https://newton.now.sh/api/v2/integrate/x^2');
    // headerFields as an element and a WeakRef, named by their name / data-id
    await expect.poll(() => page.evaluate(() => globalThis.__fetchReady?.headers))
        .toEqual({kitchenHeader: 'hello', porchHeader: 'world'});
    // the stored headerFields hold WeakRefs, and the caller's array is untouched
    expect(await page.evaluate(() => {
        const stored = document.querySelector('#form').enh.beReformable.headerFields;
        const callers = globalThis.__headerFields;
        return {
            storedWeak: stored.every(f => f instanceof WeakRef),
            callersUntouched: callers[0] instanceof Element && callers[1] instanceof WeakRef && stored !== callers,
        };
    })).toEqual({storedWeak: true, callersUntouched: true});
    expect(errors).toEqual([]);
});
