// @ts-check
/** @import {AllProps, AP} from './types/be-reformable/types' */;

/**
 * @param {AP} self 
 */
export async function getHeaderFieldVals(self){
    /**
     * @type {HeadersInit}
     */
    const headerFieldVals = {};
    const {headerFields, enhancedElement} = self;
    if(headerFields === undefined){
        return headerFieldVals;
    }
    for(const [idx, headerField] of headerFields.entries()){
        // headerField is a selector like "#myHeader" or "%part-name",
        // or (programmatically) the element itself, or a WeakRef to it
        let domEl;
        if(headerField instanceof WeakRef){
            domEl = /** @type {HTMLInputElement | undefined} */ (headerField.deref());
            // a collected element contributes no header -- never an error
            if(domEl === undefined) continue;
        }else if(headerField instanceof Element){
            domEl = /** @type {HTMLInputElement} */ (headerField);
        }else if(headerField.startsWith('%')){
            const partName = headerField.substring(1);
            domEl = /** @type {HTMLInputElement | null} */ (enhancedElement.querySelector(`[part~="${partName}"]`));
        }else{
            domEl = /** @type {HTMLInputElement | null} */ (enhancedElement.querySelector(headerField));
        }
        if(domEl === null) throw 404;
        // an element passed by reference may have no id -- fall back to its name, then its position
        const prop = domEl.dataset.id || domEl.id || domEl.getAttribute('name') || String(idx);
        headerFieldVals[prop] = domEl.value;
    }
    return headerFieldVals;
}
