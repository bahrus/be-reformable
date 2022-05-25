import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeReformableProps, BeReformableVirtualProps, BeReformableActions} from './types';
import {DefineArgs} from 'trans-render/lib/types';
import {register} from 'be-hive/register.js';

export const virtualProps = [
    'autoSubmit', 'autoSubmitOn', 'baseLink', 'path', 'url', 'urlVal', 'init', 'as', 
    'fetchResult', 'propKey', 'fetchResultPath', 'initVal', 'headerFormSelector',
] as (keyof BeReformableVirtualProps)[];
export class BeReformableController implements BeReformableActions{
    // target: HTMLFormElement | undefined;
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement){
    //     this.target = target
    // }
    onAutoSubmit({proxy, autoSubmitOn}: this){
        const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn!] : autoSubmitOn!;
        for(const key of on){
            proxy.addEventListener(key, this.handleInput);
        }
        this.handleInput();
    }

    async onUrl({url, proxy}: this){
        const {hookUp} = await import('be-observant/hookUp.js');
        hookUp(url, proxy, 'urlVal');
    }

    async onInit({init, proxy}: this){
        const {hookUp} = await import('be-observant/hookUp.js');
        hookUp(init, proxy, 'initVal');
    }

    handleInput = () => {
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
        const queryObj: any = {};
        const elements = this.proxy.elements;
        for(const input of elements){
            const inputT = input as HTMLInputElement;
            if(inputT.name){
                queryObj[inputT.name] = inputT.value;
            }
        }
        if(this.path !== undefined){
            let idx = 0;
            for(const token of this.path){
                if(idx % 2 === 0){
                    url += token;
                }else{
                    url += encodeURIComponent((<any>elements[token as any as number]).value);
                    delete queryObj[token];
                }
                idx++;
            }
        }
        this.proxy.urlVal = url + '?' + new URLSearchParams(queryObj).toString();


    }



    async doFetch({urlVal, initVal, as, proxy, fetchResultPath, headerFormSelector}: this){
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
                // const formData = new FormData(headerForm);
                // const search = new URLSearchParams(formData as any as string);
                // debugger;
                for(const input of elements){
                    const inputT = input as HTMLInputElement;
                    if(inputT.name){
                        headers[inputT.name] = inputT.value;
                    }
                }
                initVal.headers = headers;
            }
        }
        const resp = await fetch(urlVal!, initVal);
        let fetchResult: any;
        if(as === 'json'){
            fetchResult = await resp.json();
        }else{
            fetchResult = await resp.text();
        }
        if(fetchResultPath !== undefined){
            const {getProp} = await import('trans-render/lib/getProp.js');
            fetchResult = getProp(fetchResult, fetchResultPath);
        }
        return {
            fetchResult
        };
    }

    async sendFetchResultToTarget({fetchResult, propKey, proxy}: this){
        const target = proxy.target;
        if(target){
            const targetElement = (proxy.getRootNode() as DocumentFragment).querySelector(target);
            if(targetElement === null) throw {target, msg: '404'};
            const lastPos = target.lastIndexOf('[');
            if(lastPos === -1) throw 'NI'; //Not implemented
            const rawPath =  target.substring(lastPos + 2, target.length - 1);
            const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
            const propPath = lispToCamel(rawPath);
            (<any>targetElement)[propPath] = fetchResult;
        }
        if(propKey !== undefined){
            let container = proxy.closest('[itemscope]') as any;
            if(container === null) container = (<any>proxy.getRootNode()).host;
            if(container === undefined) throw '404';
            container[propKey] = fetchResult;
        }
    }

    async finale(proxy: HTMLFormElement & BeReformableVirtualProps){
        const {autoSubmitOn} = proxy;
        const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn!] : autoSubmitOn!;
        for(const key of on){
            proxy.removeEventListener(key, this.handleInput);
        }
        const {unsubscribe} = await import('trans-render/lib/subscribe.js');
        unsubscribe(proxy);
    }

    onHeaderFormSelector(self: this): void {
        
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
                as: 'json',
                autoSubmitOn: 'input',
            }
        },
        actions:{
            onAutoSubmit:'autoSubmit',
            doFetch:{
                ifAllOf: ['urlVal', 'initVal', 'as'],
            },
            sendFetchResultToTarget:'fetchResult',
            onUrl:'url',
            onHeaderFormSubmitOn: 'headerFormSubmitOn'
        }
    },
    complexPropDefaults:{
        controller: BeReformableController
    }
};

define<BeReformableProps & BeDecoratedProps<BeReformableProps, BeReformableActions>, BeReformableActions>(controllerConfig);

register(ifWantsToBe, upgrade, tagName);

