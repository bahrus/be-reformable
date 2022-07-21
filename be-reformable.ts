import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeReformableProps, BeReformableVirtualProps, BeReformableActions} from './types';
import {DefineArgs} from 'trans-render/lib/types';
import {register} from 'be-hive/register.js';

export const virtualProps = [
    'autoSubmit', 'autoSubmitOn', 'baseLink', 'path', 'url', 'urlVal', 'init', 'as', 
    'fetchResult', 'propKey', 'fetchResultPath', 'initVal', 'headerFormSelector', 'headerFormSubmitOn',
    'transform', 'transformPlugins', 'fetchInProgressCssClass', 'fetchInProgress', 'dispatchFromTarget'
] as (keyof BeReformableVirtualProps)[];
export class BeReformableController implements BeReformableActions{

    onAutoSubmit({proxy, autoSubmitOn}: this){
        const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn!] : autoSubmitOn!;
        for(const key of on){
            proxy.addEventListener(key, this.doFormAction);
        }
        this.doFormAction();
    }

    onNotAutoSubmit({proxy, autoSubmit}: this): void {
        if(autoSubmit) return;
        proxy.addEventListener('submit', e => {
            e.preventDefault();
            this.doFormAction();
        });
    }

    async onUrl({url, proxy}: this){
        const {hookUp} = await import('be-observant/hookUp.js');
        hookUp(url, proxy, 'urlVal');
    }

    async onInit({init, proxy}: this){
        const {hookUp} = await import('be-observant/hookUp.js');
        hookUp(init, proxy, 'initVal');
    }

    doFormAction = () => {
        if(!this.proxy.checkValidity()) return;
        const method = this.proxy.method;
        if(method){
            if(this.proxy.initVal !== undefined){
                this.proxy.initVal.method = method;
            }else{
                this.proxy.initVal = {
                    method
                };
            }
        }
        if(this.url && !this.urlVal) return;
        let url = this.proxy.action || this.urlVal;
        if(this.baseLink !== undefined){
            url = (<any>self)[this.baseLink].href;
        }else if(url === undefined){
            url = this.proxy.action;
            if(url === location.href){
                //just default value -- assume not intentional
                return;
            }
        }
        const queryObj: {[key: string]: string[]} = {};
        const elements = this.proxy.elements;
        for(const input of elements){
            const inputT = input as HTMLInputElement;
            const key = inputT.name;
            const val = inputT.value;
            if(key){
                if(queryObj[key] === undefined){
                    queryObj[key] = [val];
                }else{
                    queryObj[key].push(val);
                }
            }
        }
        if(this.path !== undefined){
            let idx = 0;
            switch(typeof this.path){
                case 'boolean':
                    let pathElement = this.proxy.querySelector(`[data-path-idx="${idx}"]`) as HTMLInputElement | null;
                    while(pathElement !== null){
                        const lhs = pathElement.dataset.pathLhs;
                        if(lhs !== undefined){
                            url += lhs;
                        }
                        url += encodeURIComponent(pathElement.value); //TODO:  what about checkbox, etc
                        const rhs = pathElement.dataset.pathRhs;
                        if(rhs !== undefined){
                            url += rhs;
                        }
                        idx++;
                        pathElement = this.proxy.querySelector(`[data-path-idx="${idx}"]`) as HTMLInputElement | null;
                    }
                    break;
                case 'object':
                    for(const token of this.path){
                        if(idx % 2 === 0){
                            url += token;
                        }else{
                            url += encodeURIComponent((<any>elements[token as any as number]).value);
                            delete queryObj[token];
                        }
                        idx++;
                    }
                    break;
                default:
                    throw 'NI';//not implemented
            }
        }
        const usp = new URLSearchParams();
        for(const key in queryObj){
            const vals = queryObj[key];
            for(const val of vals){
                usp.append(key, val);
            }
        }
        this.proxy.urlVal = url + '?' + usp.toString();


    }



    async doFetch({urlVal, initVal, proxy, fetchResultPath, headerFormSelector, getTargetElement, fetchInProgressCssClass}: this){
        if(!proxy.target){
            proxy.action = urlVal!;
            proxy.submit();
            return;
        }
        

        if(headerFormSelector){
            const headerForm = (proxy.getRootNode() as DocumentFragment).querySelector(headerFormSelector) as HTMLFormElement;
            if(headerForm === null) throw '404';
            if(!headerForm.checkValidity()) return;
            if(headerForm !== null){
                const elements = headerForm.elements;
                if(initVal === undefined){ initVal = {}; }
                const headers = {...initVal.headers} as any;
                for(const input of elements){
                    const inputT = input as HTMLInputElement;
                    if(inputT.name){
                        headers[inputT.name] = inputT.value;
                    }
                }
                initVal.headers = headers;
                console.log({initVal});
            }
        }
        let targetElement: null | Element = null;
        if(fetchInProgressCssClass !== undefined){
            targetElement = getTargetElement(this);
            if(targetElement !== null){
                targetElement.classList.add(fetchInProgressCssClass);
            }
        }
        proxy.fetchInProgress = true;

        const resp = await fetch(urlVal!, initVal);
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

    getTargetElement({proxy}: this){
        if(!proxy.target) return null;
        return (proxy.getRootNode() as DocumentFragment).querySelector(proxy.target);
    }

    async sendFetchResultToTarget({fetchResult, propKey, proxy, transform, transformPlugins, getTargetElement, dispatchFromTarget}: this){
        const target = proxy.target;
        if(target){
            const targetElement = getTargetElement(this);
            if(targetElement === null) throw {target, msg: '404'};
            const lastPos = target.lastIndexOf('[');
            if(lastPos === -1) throw 'NI'; //Not implemented
            const rawPath =  target.substring(lastPos + 2, target.length - 1);
            const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
            const propPath = lispToCamel(rawPath);
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

    async finale(proxy: HTMLFormElement & BeReformableVirtualProps){
        const {autoSubmitOn, headerFormSubmitOn} = proxy;
        if(autoSubmitOn !== undefined){
            const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn!] : autoSubmitOn!;
            for(const key of on){
                proxy.removeEventListener(key, this.doFormAction);
            }
        }
        if(headerFormSubmitOn !== undefined){
            const on = typeof headerFormSubmitOn === 'string' ? [headerFormSubmitOn!] : headerFormSubmitOn!;
            for(const key of on){
                proxy.removeEventListener(key, this.doFormAction);
            }
        }

        const {unsubscribe} = await import('trans-render/lib/subscribe.js');
        unsubscribe(proxy);
    }

    async onHeaderFormSubmitOn({headerFormSubmitOn, proxy, headerFormSelector}: this) {
        const on = typeof headerFormSubmitOn === 'string' ? [headerFormSubmitOn!] : headerFormSubmitOn!;
        const headerForm = (proxy.getRootNode() as DocumentFragment).querySelector(headerFormSelector!) as HTMLFormElement;
        if(headerForm === null) throw '404';
        for(const key of on){
            headerForm.addEventListener(key, this.doFormAction);
        }
        this.doFormAction();
    }
}

export interface BeReformableController extends BeReformableProps{}

const tagName = 'be-reformable'; 

const ifWantsToBe = 'reformable';

export const upgrade = 'form';

export const controllerConfig: DefineArgs<BeReformableProps & BeDecoratedProps<BeReformableProps, BeReformableActions>, BeReformableActions> = {
    config:{
        tagName,
        propDefaults:{
            upgrade,
            ifWantsToBe,
            virtualProps,
            finale: 'finale',
            proxyPropDefaults:{
                autoSubmitOn: 'input',
            },
            emitEvents: ['fetchInProgress']
        },
        actions:{
            onAutoSubmit:'autoSubmit',
            onNotAutoSubmit: {
              ifKeyIn: ['autoSubmit']  
            },
            doFetch:{
                ifAllOf: ['urlVal', 'initVal'],
            },
            sendFetchResultToTarget:'fetchResult',
            onUrl:'url',
            onHeaderFormSubmitOn: {
                ifAllOf: ['headerFormSubmitOn', 'headerFormSelector'],
            }
        }
    },
    complexPropDefaults:{
        controller: BeReformableController
    }
};

define<BeReformableProps & BeDecoratedProps<BeReformableProps, BeReformableActions>, BeReformableActions>(controllerConfig);

register(ifWantsToBe, upgrade, tagName);

