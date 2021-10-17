import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeReformableProps, BeReformableVirtualProps, BeReformableActions} from './types';
import {lispToCamel} from 'trans-render/lib/lispToCamel.js'

export class BeReformableController implements BeReformableActions{
    // target: HTMLFormElement | undefined;
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement){
    //     this.target = target
    // }
    onAutoSubmit({proxy}: this){
        proxy.addEventListener('input', this.handleInput);
        this.handleInput();
    }

    handleInput = () => {
        if(!this.proxy.checkValidity()) return;
        let url = this.proxy.action;
        if(this.baseLink !== undefined){
            url = (<any>self)[this.baseLink].href;
        }
        if(this.path !== undefined){
            let idx = 0;
            const elements = this.proxy.elements;
            for(const token of this.path){
                if(idx % 2 === 0){
                    url += token;
                }else{
                    url += encodeURIComponent((<any>elements[token as any as number]).value);
                }
                idx++;
            }
        }
        this.proxy.url = url;
        const method = this.proxy.method;
        if(method){
            if(this.proxy.reqInit !== undefined){
                this.proxy.reqInit.method = method;
            }else{
                this.proxy.reqInit = {
                    method
                };
            }
        }

    }



    async doFetch({url, reqInit, as, proxy}: this){
        const resp = await fetch(url, reqInit);
        let fetchResult: any;
        if(as === 'json'){
            fetchResult = await resp.json();
        }else{
            fetchResult = await resp.text();
        }
        return {
            fetchResult
        }
        //proxy.fetchResult = fetchResult;
    }

    sendFetchResultToTarget({fetchResult, proxy}: this){
        const target = proxy.target;
        if(target){
            const targetElement = (proxy.getRootNode() as DocumentFragment).querySelector(target);
            if(targetElement === null) throw {target, msg: '404'};
            const lastPos = target.lastIndexOf('[');
            if(lastPos === -1) throw 'NI'; //Not implemented
            const rawPath =  target.substring(lastPos + 2, target.length - 1);
            const propPath = lispToCamel(rawPath);
            (<any>targetElement)[propPath] = fetchResult;
        }else{
            throw 'NI'; //Not implemented
        }
    }

    finale(proxy: HTMLFormElement & BeReformableVirtualProps){
        this.proxy.removeEventListener('input', this.handleInput);
    }
}

export interface BeReformableController extends BeReformableProps{}

const tagName = 'be-reformable'; 

define<BeReformableProps & BeDecoratedProps<BeReformableProps, BeReformableActions>, BeReformableActions>({
    config:{
        tagName,
        propDefaults:{
            upgrade: 'form',
            ifWantsToBe: 'reformable',
            virtualProps: ['autoSubmit', 'baseLink', 'path', 'url', 'reqInit', 'as', 'fetchResult'],
            finale: 'finale',
            proxyPropDefaults:{
                as: 'json'
            }
        },
        actions:{
            onAutoSubmit:{
                ifAllOf: ['autoSubmit']
            },
            doFetch:{
                ifAllOf: ['url', 'reqInit', 'as'],

                async: true,
            },
            sendFetchResultToTarget: {
                ifAllOf: ['fetchResult']
            }
        }
    },
    complexPropDefaults:{
        controller: BeReformableController
    }
});

document.head.appendChild(document.createElement(tagName));

