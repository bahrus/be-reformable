// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo, resolved, rejected } from 'be-enhanced/cc.js';
import {dispatchEvent as de} from 'trans-render/positractions/dispatchEvent.js';

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
            nudge: false,
        },
        propInfo:{
            baseLink: {},
            path: {},
            urlBuilder:{
                ro: true
            },
            url: {ro: true}
        },
        compacts:{
            when_updateOn_changes_invoke_hydrate: 0,
            when_path_changes_invoke_parsePath: 0,
        },
        positractions: [resolved, rejected],
        actions:{
            updateAction:{
                ifAllOf: ['updateCnt', 'urlBuilder'],
                ifKeyIn: ['baseLink']
            }
        }
    }

    de = de;

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
        if(!enhancedElement.checkValidity()) return {};
        const pathBuilder = [baseLink !== undefined ? window[baseLink].href : ''];
        const {tokens} = urlBuilder;

        for(const token of tokens){
            const [lhs, rhs] = token;
            pathBuilder.push(lhs);
            const inp = /** @type {HTMLInputElement | null} */ (enhancedElement.querySelector(`[\\:${rhs}]`));
            if(inp === null) throw 404;
            pathBuilder.push(inp.value);
        }
        let url = pathBuilder.join('');
        enhancedElement.action = url;
        const {method} = enhancedElement;
        switch(method.toLowerCase()){
            case '':
            case 'get':
                if(enhancedElement.method.toLowerCase() === 'get'){
                    const formData = new FormData(enhancedElement);
                    const queryString = new URLSearchParams(formData).toString();
                    url += '?' + queryString
                }
                break;
        }
        
        
        enhancedElement.dispatchEvent(new BeFetchingEvent(url))
        return /** @type {PAP} */({
            url
        });
    }

    /**
     * 
     * @param {Event=} e
     */
    handleEvent(e){
        const self = /** @type {BAP} *//** @type {any} */(this);
        if(e?.type === 'submit'){
            e.preventDefault();
        }
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
        if(updateOn === 'submit'){
            const {nudge} = self;
            if(nudge){
                const submitButtons = Array.from(enhancedElement.querySelectorAll('button[type="submit"]'));
                for(const sb of submitButtons){
                    (await import('trans-render/lib/nudge.js')).nudge(sb);
                }
                
            }
        }else{
            this.handleEvent();
        }
        enhancedElement.addEventListener(updateOn, this, {signal: this.#abortController.signal});
        
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

export class BeFetchingEvent extends Event {
    static eventName = 'be-fetching';

    /**
     * @type {string}
     */
    url;

    /**
     * @type {RequestInit}
     */
    options;

    constructor(url, options){
        super(BeFetchingEvent.eventName);
        this.url = url;
        this.options = options;
    }
} 