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
        },
        propInfo:{
            baseLink: {},
            baseURL: {},
            path: {},
            urlBuilder:{
                ro: true
            },
            resolvedBaseURL:  {ro: true},
            headers: {},
            headerFields: {},
            fetchOptions: {},
            isFetchReady: {ro: true},
        },
        compacts:{
            when_updateOn_changes_invoke_hydrate: 0,
            when_path_changes_invoke_parsePath: 0,
            when_baseLink_changes_invoke_resolveBaseLink: 0,
            when_fetchOptions_changes_invoke_suggestFetch: 0,
        },
        positractions: [resolved, rejected],
        actions:{
            specifyDefaultBaseURL:{
                ifNoneOf: ['baseLink', 'baseURL']
            },
            updateAction:{
                ifAllOf: ['updateCnt', 'urlBuilder'],
                ifAtLeastOneOf: ['baseURL', 'resolvedBaseURL']
            }
        }
    }

    de = de;

    /**
     * This makes a lot of sense to override in subclasses
     * @param {BAP} self 
     */
    specifyDefaultBaseURL(self){
        return /** @type {PAP} */({
            baseURL: '',
            resolvedBaseURL: true,
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    resolveBaseLink(self){
        const {baseLink} = self;
        return /** @type {PAP} */({
            baseURL: window[baseLink].href,
            resolvedBaseURL: true,
        });
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
        const {enhancedElement, urlBuilder, baseURL, headerFields, headers} = self;
        if(!enhancedElement.checkValidity()) return {};
        const pathBuilder = [baseURL];
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
        const formData = new FormData(enhancedElement);
        /**
         * @type {BodyInit | undefined}
         */
        let body;
        switch(method.toUpperCase()){
            case '':
            case 'GET':
            case 'DELETE':
                if(enhancedElement.method.toLowerCase() === 'get'){
                    
                    const queryString = new URLSearchParams(formData).toString();
                    url += '?' + queryString
                }
                break;
            case 'PUT':
            case 'POST':
                body = formData;
                break;
        }
        /**
         * @type {RequestInit}
         */
        const fetchOptions = {
            method,
            headers,
            body
        };
        console.log({fetchOptions});

        if(headerFields !== undefined){
            const {getHeaderFieldVals} = await import('./getHeaderFieldVals.js');
            const headers = await getHeaderFieldVals(self);
            console.log({headers});
            if(fetchOptions.headers === undefined) {
                fetchOptions.headers = headers;
            }else{
                Object.assign(fetchOptions.headers, headers);
            }
            
        }
        
        return /** @type {PAP} */({
            fetchOptions
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
            const {submitOptions} = self;
            if(submitOptions !== undefined){
                const {nudges, disableIfNotAllConditionsAreMet, onlyAfter} = submitOptions;
                if(disableIfNotAllConditionsAreMet || onlyAfter) throw 'NI';
                if(nudges){
                    const submitButtons = Array.from(enhancedElement.querySelectorAll('button[type="submit"]'));
                    for(const sb of submitButtons){
                        (await import('trans-render/lib/nudge.js')).nudge(sb);
                    }
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


    /**
     * 
     * @param {BAP} self 
     */
    suggestFetch(self){
        const {enhancedElement, fetchOptions} = self;
        const {action} = enhancedElement;
        enhancedElement.dispatchEvent(new BeFetchingEvent(action, fetchOptions));
        return /** @type {PAP} */({
            isFetchReady: true
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
    static eventName = 'fetch-ready';

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