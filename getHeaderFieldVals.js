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
    for(const headerField of headerFields){
        // headerField is a selector like "#myHeader" or "%part-name"
        let domEl;
        if(headerField.startsWith('%')){
            const partName = headerField.substring(1);
            domEl = /** @type {HTMLInputElement | null} */ (enhancedElement.querySelector(`[part~="${partName}"]`));
        }else{
            domEl = /** @type {HTMLInputElement | null} */ (enhancedElement.querySelector(headerField));
        }
        if(domEl === null) throw 404;
        const prop = domEl.dataset.id || domEl.id;
        headerFieldVals[prop] = domEl.value;
    }
    return headerFieldVals;
}
