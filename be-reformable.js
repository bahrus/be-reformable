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
        // ctx.emc is populated by the attribute (mount-observer) spawn path;
        // programmatic spawns (enh.get()/enh.set) only supply ctx.config
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc || ctx.config);
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
            },
            protocols: {
                globalThis: (key) => globalThis[key]
            }
        };
        await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
        self.initialized = true;
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
        const {enhancedElement} = self;
        const baseLink = /** @type {string | Element | WeakRef<Element> | undefined} */ (self.baseLink);
        /** @type {PAP} */
        const weakened = {};
        /** @type {Element | undefined} */
        let linkEl;
        if(baseLink instanceof Element){
            // An element passed by reference must only ever be held weakly --
            // including in the value stored on this enhancement.  roundabout's
            // getter derefs a stored WeakRef, so reading baseLink yields the
            // element again; #baseLinkRef remembers it was already weakened.
            linkEl = baseLink;
            if(this.#baseLinkRef?.deref() !== baseLink){
                this.#baseLinkRef = new WeakRef(baseLink);
                /** @type {any} */ (weakened).baseLink = this.#baseLinkRef;
            }
        }else if(baseLink instanceof WeakRef){
            linkEl = baseLink.deref();
        }else if(baseLink){
            const rn = /** @type {Document | ShadowRoot} */ (enhancedElement.getRootNode());
            linkEl = rn.getElementById(baseLink) ?? /** @type {any} */ (globalThis)[baseLink];
        }
        // a collected link element is a no-op, not an error
        if(linkEl === undefined || linkEl === null) return weakened;
        return /** @type {PAP} */({
            ...weakened,
            baseURL: /** @type {HTMLLinkElement} */ (linkEl).href,
            resolvedBaseURL: true,
        });
    }

    /**
     * The link element this enhancement has already replaced (in baseLink) with a WeakRef
     * @type {WeakRef<Element> | undefined}
     */
    #baseLinkRef;

    /**
     * headerFields entries may be elements (or WeakRefs to them) passed by
     * reference.  Store back a copy with each element replaced by a WeakRef,
     * never mutating the caller's array.  WeakRefs nested in an array are not
     * dereferenced by roundabout's getter, so there's nothing left to weaken
     * on the next pass.
     * @param {AP} self
     */
    weakenHeaderFields(self){
        const {headerFields} = self;
        if(!Array.isArray(headerFields) || !headerFields.some(f => f instanceof Element)) return;
        return /** @type {PAP} */ ({
            headerFields: headerFields.map(f => f instanceof Element ? new WeakRef(f) : f)
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
            // copy, rather than mutate the (possibly caller-supplied) headers object
            fetchOptions.headers = {...headers, ...hdrs};
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
        console.log({formEl});
        if(updateOn === 'submit'){
            const {submitOptions} = self;
            if(submitOptions !== undefined){
                const {nudges, disableIfNotAllConditionsAreMet, onlyAfter} = submitOptions;
                if(disableIfNotAllConditionsAreMet || onlyAfter) throw 'NI';
                if(nudges){
                    const submitButtons = Array.from(formEl.querySelectorAll('button[type="submit"]'));
                    for(const sb of submitButtons){
                        (await import('assign-gingerly/handlers/nudge.js')).nudge(sb);
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
