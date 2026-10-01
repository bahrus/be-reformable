import 'assign-gingerly/object-extension.js';

/**
 * Registers be-reformable's config, so it can be attached programmatically
 * (via enh.set / enh.get()), without any attribute.
 * @param {Element | undefined} ref -- e.g. document.body, or a shadow root's host, for a scoped registry
 */
export async function defBeReformable(ref){
    const {default: emc} = await import('./emc.json', {with: {type: 'json'}});
    return await push(ref, emc);
}

/**
 * @param {Element | undefined} ref
 * @param {any} emc
 */
async function push(ref, emc){
    const {BeReformable} = await import('./be-reformable.js');
    const {enhConfig} = emc;
    enhConfig.spawn = BeReformable;
    // the registry only stores enhConfig, not the full emc -- see ctx.emc || ctx.config in be-reformable.js
    enhConfig.customData = emc.customData;
    const registry = /** @type {any} */ (ref)?.customElementRegistry ?? customElements;
    const {enhancementRegistry} = registry;
    enhancementRegistry.push(enhConfig);
    return enhConfig;
}
