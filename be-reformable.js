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
            urlBuilder:{
                ro: true
            }
        },
        compacts:{
            when_updateOn_changes_invoke_hydrate: 0,
            when_path_changes_invoke_parsePath: 0,
        },
        actions:{
            updateAction:{
                ifAllOf: ['updateCnt', 'urlBuilder'],
                ifKeyIn: ['baseLink']
            }
        }
    }

    /**
     * 
     * @param {BAP} self 
     */
    async parsePath(self){
        const {URLBuilder} = await import('./URLBuilder.js');
        const {path} = self;
        const urlBuilder = new URLBuilder(path);
        return /** @type {PAP} */({
            urlBuilder
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    async updateAction(self){
        const {enhancedElement, urlBuilder, baseLink} = self;
        const pathBuilder = [baseLink !== undefined ? window[baseLink].href : ''];
        console.log({pathBuilder});
        console.log({urlBuilder});
        const {tokens} = urlBuilder;

        for(const token of tokens){
            const [lhs, rhs] = token;
            pathBuilder.push(lhs);
            const inp = enhancedElement.querySelector(`[\\:${rhs}]`);
            if(inp === null) throw 404;
            pathBuilder.push(inp.value);
        }
        enhancedElement.target = pathBuilder.join('');
        return /** @type {PAP} */({
        });
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