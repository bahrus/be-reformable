// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo, resolved } from 'be-enhanced/cc.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-reformable/types' */;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 * 
 * 
 */
class BeReformable extends BE {
    /**
     * @type {BEConfig<BAP, Actions & IEnhancement, any>}
     */
    static config = {
        propDefaults: {
            updateOn: 'input',
            updateCnt: 0,
        },
        propInfo:{
            baseLink: {},
            path: {},
            target: {},
        },
        compacts:{
            when_updateOn_changes_invoke_hydrate: 0,
        }
    }

    /**
     * 
     * 
     */
    handleEvent(){
        const self = /** @type {BAP} *//** @type {any} */(this);
        self.updateCnt++;
    }

    /**
     * @type {AbortController | undefined;}
     */
    #abortController;
    /**
     * 
     * @param {BAP} self 
     */
    async hydrate(self){
        this.#disconnect();
        this.#abortController = new AbortController();
        const {updateOn, enhancedElement} = self;
        enhancedElement.addEventListener(updateOn, this, {signal: this.#abortController.signal});
        this.handleEvent();
        return /** @type {PAP} */({
            resolved: true
        });
    }

    #disconnect(){
        if(this.#abortController !== undefined){
            this.#abortController.abort();
        }
    }
}

await BeReformable.bootUp();
export {BeReformable};