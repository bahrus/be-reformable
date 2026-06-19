// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/be-reformable/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 */
class BeReformable {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, ctx, initVals){
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /**
     * This makes a lot of sense to override in subclasses
     * @param {AP} self 
     */
    specifyDefaultBaseURL(self){
        return /** @type {PAP} */({
            baseURL: '',
            resolvedBaseURL: true,
        });
    }

    /**
     * @param {AP} self 
     */
    resolveBaseLink(self){
        const {baseLink} = self;
        return /** @type {PAP} */({
            baseURL: window[baseLink].href,
            resolvedBaseURL: true,
        });
    }

    /**
     * @param {AP} self 
     */
    async parsePath(self){
        const {URLBuilder} = await import('be-reformable/URLBuilder.js');
        const {path} = self;
        const urlBuilder = new URLBuilder(path);
        return /** @type {PAP} */({
            urlBuilder
        });
    }

    /**
     * @param {AP} self 
     */
    async updateAction(self){
        const {enhancedElement, urlBuilder, baseURL, headerFields, headers} = self;
        const formEl = /** @type {HTMLFormElement} */ (enhancedElement);
        if(!formEl.checkValidity()){
            return {
                fetchOptions: undefined,
            };
        } 
        const pathBuilder = [baseURL];
        const {tokens} = urlBuilder;

        for(const token of tokens){
            const [lhs, rhs] = token;
            pathBuilder.push(lhs);
            const inp = /** @type {HTMLInputElement | null} */ (formEl.querySelector(`[\\:${rhs}]`));
            if(inp === null) throw 404;
            pathBuilder.push(inp.value);
        }
        let url = pathBuilder.join('');
        formEl.action = url;
        const {method} = formEl;
        const formData = new FormData(formEl);
        /**
         * @type {BodyInit | undefined}
         */
        let body;
        switch(method.toUpperCase()){
            case '':
            case 'GET':
            case 'DELETE':
                if(formEl.method.toLowerCase() === 'get'){
                    const queryString = new URLSearchParams(formData).toString();
                    url += '?' + queryString;
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

        if(headerFields !== undefined){
            const {getHeaderFieldVals} = await import('be-reformable/getHeaderFieldVals.js');
            const hdrs = await getHeaderFieldVals(self);
            if(fetchOptions.headers === undefined) {
                fetchOptions.headers = hdrs;
            }else{
                Object.assign(fetchOptions.headers, hdrs);
            }
        }
        
        return /** @type {PAP} */({
            fetchOptions
        });
    }

    /**
     * @param {Event=} e
     */
    handleEvent(e){
        const self = /** @type {AP} *//** @type {any} */(this);
        if(e?.type === 'submit'){
            e.preventDefault();
        }
        self.updateCnt++;
    }

    /**
     * @type {AbortController | undefined}
     */
    #abortController;

    /**
     * @param {AP} self 
     */
    async hydrate(self){
        this.#disconnect();
        this.#abortController = new AbortController();
        const {updateOn, enhancedElement} = self;
        const formEl = /** @type {HTMLFormElement} */ (enhancedElement);

        if(updateOn === 'submit'){
            const {submitOptions} = self;
            if(submitOptions !== undefined){
                const {nudges, disableIfNotAllConditionsAreMet, onlyAfter} = submitOptions;
                if(disableIfNotAllConditionsAreMet || onlyAfter) throw 'NI';
                if(nudges){
                    const submitButtons = Array.from(formEl.querySelectorAll('button[type="submit"]'));
                    for(const sb of submitButtons){
                        (await import('mount-observer/nudge.js')).nudge(sb);
                    }
                }
            }
        }else{
            this.handleEvent();
        }
        formEl.addEventListener(updateOn, this, {signal: this.#abortController.signal});
        
        return /** @type {PAP} */({
            resolved: true
        });
    }

    /**
     * @param {AP} self 
     */
    async suggestFetch(self){
        const {enhancedElement, fetchOptions} = self;
        const formEl = /** @type {HTMLFormElement} */ (enhancedElement);
        if(!formEl.checkValidity()){
            return /** @type {PAP} */({
                isFetchReady: false
            });
        }
        const {action} = formEl;
        const {FetchReadyEvent} = await import('fetch-ready/FetchReadyEvent.js');
        formEl.dispatchEvent(new FetchReadyEvent(action, fetchOptions));
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

export {BeReformable};
