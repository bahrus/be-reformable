    // @ts-check
    /** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-reformable/types' */;
    
    /**
     * 
     * @param {BAP} self 
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
        const {find} = await import('trans-render/dss/find.js');
        const {parse} = await import('trans-render/dss/parse.js');
        for(const headerField of headerFields){
            const specifier = await parse(headerField);
            const {prop} = specifier;
            if(prop == undefined) throw 400;
            const domEl = /** @type {HTMLInputElement} */ (await find(enhancedElement, specifier, enhancedElement));
            if(domEl === null) throw 404;
            //TODO:  use ASMR?
            headerFieldVals[prop] = domEl.value;
        }
        return headerFieldVals;
    }