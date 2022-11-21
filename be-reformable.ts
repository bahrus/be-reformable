import {BeDecoratedProps, define} from 'be-decorated/DE.js';
import {PP, Proxy, VirtualProps, Actions, PA, PPE, ProxyProps} from './types';
import {DefineArgs} from 'trans-render/lib/types';
import {register} from 'be-hive/register.js';

export const virtualProps = [
    'autoSubmit', 'autoSubmitOn', 'baseLink', 'path', 'url', 'urlVal', 'init', 'as', 
    'fetchResult', 'propKey', 'fetchResultPath', 'initVal', 'headerFormSelector', 'headerFormSubmitOn',
    'transform', 'transformPlugins', 'fetchInProgressCssClass', 'fetchInProgress', 'dispatchFromTarget', 
    'filterOutDefaultValues', 'headers', 'bodyName', 'isVisible', 'debounceDuration', 'fetchCount', 'fetchCountEcho'
] as (keyof VirtualProps)[];
export class BeReformable extends EventTarget implements Actions{
    #fetchAbortController = new AbortController();
    #formAbortControllers: AbortController[] = [];
    onAutoSubmit(pp: PP): PA{
        const {proxy, autoSubmitOn, self} = pp;
        const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn!] : autoSubmitOn!;
        this.disconnect();
        this.#formAbortControllers = [];
        for(const key of on){
            const ac = new AbortController();
            this.#formAbortControllers.push(ac);
            self.addEventListener(key, e => {
                this.doFormAction(pp)
            }, {signal: ac.signal});
        }
        this.doFormAction(pp);
        return {
            resolved: true,
        };
    }

    onNotAutoSubmit(pp: PP): PPE {
        const {self} = pp;
        return [{resolved: true}, {
            handleSubmit: {on: 'submit', of: self}
        }] as PPE;
    }

    async onUrl({url, proxy}: PP){
        const {hookUp} = await import('be-observant/hookUp.js');
        await hookUp(url, proxy, 'urlVal');
    }

    async onInit({init, proxy}: PP){
        const {hookUp} = await import('be-observant/hookUp.js');
        await hookUp(init, proxy, 'initVal');
    }

    handleSubmit(pp: PP, e: SubmitEvent): void {
        e.preventDefault();
        return this.doFormAction(pp);
    }

    doFormAction({proxy, initVal, bodyName, headers, url, urlVal, baseLink, filterOutDefaultValues, path}: PP){
        if(!proxy.checkValidity()) return;
        console.log('1', {initVal});
        if(initVal === undefined){ 
            initVal = {};
            proxy.initVal = initVal; 
        }
        console.log('2', {initVal});
        initVal.signal = this.#fetchAbortController.signal;
        let headersVal: {[key: string]: string} = {};
        if(headers){
            initVal.headers = headersVal;
            //if(initVal.headers) headers = {...initVal.headers};
        }
        console.log('3', {initVal});        
        const method = proxy.method.toUpperCase();
        if(method){
            initVal.method = method;
        }
        console.log('3', {initVal});
        if(url && !urlVal) return;
        let liveUrl = proxy.action || urlVal;
        if(baseLink !== undefined){
            liveUrl = (<any>self)[baseLink].href;
        }else if(liveUrl === undefined){
            liveUrl = proxy.action;
            if(liveUrl === location.href){
                //just default value -- assume not intentional
                return;
            }
        }
        const queryObj: {[key: string]: string[]} = {};
        const elements = proxy.elements;
        for(const input of elements){
            const inputT = input as HTMLInputElement;
            const key = inputT.name;
            if(bodyName !== undefined && key === bodyName){
                proxy.initVal!.body = inputT.value;
                continue;
            }
            const val = inputT.value;
            if(filterOutDefaultValues){
                if(inputT.dataset.optional==='true' && val === inputT.defaultValue) continue;
            }
            if(headersVal){
                const headerKey = inputT.dataset.headerName;
                if(headerKey !== undefined){
                    headersVal[headerKey] = val;
                    continue;
                } 
            }
            if(key){
                if(queryObj[key] === undefined){
                    queryObj[key] = [val];
                }else{
                    queryObj[key].push(val);
                }
            }
        }
        console.log('4', {initVal});
        if(path !== undefined){
            let idx = 0;
            switch(typeof path){
                case 'boolean':
                    let pathElement = proxy.querySelector(`[data-path-idx="${idx}"]`) as HTMLInputElement | null;
                    while(pathElement !== null){
                        const lhs = pathElement.dataset.pathLhs;
                        if(lhs !== undefined){
                            liveUrl += lhs;
                        }
                        liveUrl += encodeURIComponent(pathElement.value); //TODO:  what about checkbox, etc
                        const rhs = pathElement.dataset.pathRhs;
                        if(rhs !== undefined){
                            liveUrl += rhs;
                        }
                        idx++;
                        pathElement = proxy.querySelector(`[data-path-idx="${idx}"]`) as HTMLInputElement | null;
                    }
                    break;
                case 'object':
                    for(const token of path){
                        if(idx % 2 === 0){
                            liveUrl += token;
                        }else{
                            liveUrl += encodeURIComponent((<any>elements[token as any as number]).value);
                            delete queryObj[token];
                        }
                        idx++;
                    }
                    break;
                default:
                    throw 'NI';//not implemented
            }
        }
        console.log('5', {initVal});
        const usp = new URLSearchParams();
        for(const key in queryObj){
            const vals = queryObj[key];
            for(const val of vals){
                usp.append(key, val);
            }
        }
        let qryString = usp.toString();
        if(qryString) qryString = '?' + qryString;
        proxy.urlVal = liveUrl + qryString;


    }


    #prevTimeout: any;
    doQueueFetch({fetchCount, proxy, fetchCountEcho, debounceDuration}: PP){
        const newFetchCount = fetchCount + 1;
        clearTimeout(this.#prevTimeout);
        this.#prevTimeout = setTimeout(() => {
            proxy.fetchCountEcho = newFetchCount;
        }, debounceDuration);
        return {
            fetchCount: newFetchCount
        }
    }

    async doFetch(pp: PP){
        const {urlVal, initVal, proxy, fetchResultPath, fetchInProgressCssClass} = pp;
        console.log('6', {initVal});
        if(!proxy.target){
            proxy.action = urlVal!;
            proxy.submit();
            return;
        }
        

        let targetElement: null | Element = null;
        if(fetchInProgressCssClass !== undefined){
            targetElement = this.getTargetElement(pp);
            if(targetElement !== null){
                targetElement.classList.add(fetchInProgressCssClass);
            }
        }

        if(proxy.fetchInProgress){
            this.disconnectFetch();
            initVal!.signal = this.#fetchAbortController.signal; 
            
        }
        proxy.fetchInProgress = true;
        let resp: Response;
        console.log('7', {initVal});
        try{
            resp = await fetch(urlVal!, initVal);
        }catch(e: any){
            console.warn(e);
            return;
        }
        
        let fetchResult: any;
        const contentTypeHeader = resp.headers.get('content-type');
        if(contentTypeHeader !== null &&  contentTypeHeader.indexOf('json') > -1){
            fetchResult = await resp.json();
        }else{
            fetchResult = await resp.text();
        }
        if(targetElement){
            targetElement.classList.remove(fetchInProgressCssClass!);
        }
        proxy.fetchInProgress = false;
        if(fetchResultPath !== undefined){
            const {getProp} = await import('trans-render/lib/getProp.js');
            fetchResult = getProp(fetchResult, fetchResultPath);
        }
        return {
            fetchResult
        };
    }

    getTargetElement({proxy}: PP){
        if(!proxy.target) return null;
        return (proxy.getRootNode() as DocumentFragment).querySelector(proxy.target);
    }

    async sendFetchResultToTarget(pp: PP){
        const {fetchResult, propKey, proxy, transform, transformPlugins, dispatchFromTarget} = pp;
        const target = proxy.target;
        if(target){
            const targetElement = this.getTargetElement(pp);
            if(targetElement === null) throw {target, msg: '404'};
            const lastPos = target.lastIndexOf('[');
            if(lastPos === -1) throw 'NI'; //Not implemented
            const rawPath =  target.substring(lastPos + 2, target.length - 1);
            const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
            const propPath = lispToCamel(rawPath);
            if(typeof fetchResult === 'string' && (propPath === undefined || propPath === 'innerHTML') ){
                const dp = new DOMParser() as any;
                const templ = dp.parseFromString(fetchResult, 'text/html', {includeShadowRoots: true}).querySelector('body')?.firstElementChild as HTMLElement;
                if(propPath && transform !== undefined){
                    const {DTR} = await import('trans-render/lib/DTR.js');
                    await DTR.transform(templ, {
                        match: transform,
                        host: proxy,
                        plugins: {...transformPlugins}
                    });
                    
                }
                targetElement.innerHTML = '';
                targetElement.appendChild(templ);
            }else if(propPath !== undefined){
                (<any>targetElement)[propPath] = fetchResult;
            }else{
                throw 'bR.NI';
            }
            
            if(dispatchFromTarget !== undefined){
                targetElement.dispatchEvent(new CustomEvent(dispatchFromTarget, {
                    detail:{
                        propPath,
                        fetchResult
                    }
                }));
            }
            
        }
        if(propKey !== undefined){
            let container = proxy.closest('[itemscope]') as any;
            if(container === null) container = (<any>proxy.getRootNode()).host;
            if(container === undefined) throw '404';
            container[propKey] = fetchResult;
        }

    }

    disconnectFetch(){
        this.#fetchAbortController.abort();
        this.#fetchAbortController = new AbortController();
    }

    disconnectForm(){
        for(const c of this.#formAbortControllers){
            c.abort();
        }
        this.#formAbortControllers = [];
    }

    disconnect(){
        this.disconnectFetch();
        this.disconnectForm();
    }

    async finale(proxy: HTMLFormElement & VirtualProps){
        const {autoSubmitOn, headerFormSubmitOn} = proxy;
        this.disconnect();
        const {unsubscribe} = await import('trans-render/lib/subscribe.js');
        unsubscribe(proxy);
    }

}


const tagName = 'be-reformable'; 

const ifWantsToBe = 'reformable';

export const upgrade = 'form';

export const controllerConfig: DefineArgs<Proxy & BeDecoratedProps<Proxy, Actions>, Actions> = {
    config:{
        tagName,
        propDefaults:{
            upgrade,
            ifWantsToBe,
            virtualProps,
            finale: 'finale',
            proxyPropDefaults:{
                autoSubmitOn: 'input',
                fetchInProgressCssClass: 'fetch-in-progress',
                beOosoom: 'isVisible',
                isVisible: true,
                fetchCount: 0,
                fetchCountEcho: -1,
                debounceDuration: 10,
                autoSubmit: false,
            },
            emitEvents: ['fetchInProgress']
        },
        actions:{
            onAutoSubmit:'autoSubmit',
            onNotAutoSubmit: {
              ifNoneOf: ['autoSubmit']  
            },
            doQueueFetch:{
                ifAllOf: ['urlVal', 'initVal'],
            },
            doFetch:{
                ifEquals: ['fetchCount', 'fetchCountEcho']
            },
            sendFetchResultToTarget: 'fetchResult',
            onUrl:'url',

        }
    },
    complexPropDefaults:{
        controller: BeReformable
    }
};

define<Proxy & BeDecoratedProps<Proxy, Actions>, Actions>(controllerConfig);

register(ifWantsToBe, upgrade, tagName);

