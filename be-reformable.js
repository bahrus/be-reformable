import { define } from 'be-decorated/be-decorated.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
import { getElementToObserve, addListener } from 'be-observant/be-observant.js';
export class BeReformableController {
    // target: HTMLFormElement | undefined;
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement){
    //     this.target = target
    // }
    onAutoSubmit({ proxy }) {
        proxy.addEventListener('input', this.handleInput);
        this.handleInput();
    }
    onUrl({ url, proxy }) {
        if (typeof url === 'string') {
            this.urlVal = url;
        }
        else {
            //observing object
            const elementToObserve = getElementToObserve(proxy, url);
            if (elementToObserve === null) {
                console.warn({ msg: '404', url });
                return;
            }
            addListener(elementToObserve, url, 'urlVal', proxy);
        }
    }
    handleInput = () => {
        if (!this.proxy.checkValidity())
            return;
        let url = this.urlVal;
        if (this.baseLink !== undefined) {
            url = self[this.baseLink].href;
        }
        else if (url === undefined) {
            url = this.proxy.action;
            if (url === location.href) {
                //just default value -- assume not intentional
                return;
            }
        }
        if (this.path !== undefined) {
            let idx = 0;
            const elements = this.proxy.elements;
            for (const token of this.path) {
                if (idx % 2 === 0) {
                    url += token;
                }
                else {
                    url += encodeURIComponent(elements[token].value);
                }
                idx++;
            }
        }
        this.proxy.url = url;
        const method = this.proxy.method;
        if (method) {
            if (this.proxy.reqInit !== undefined) {
                this.proxy.reqInit.method = method;
            }
            else {
                this.proxy.reqInit = {
                    method
                };
            }
        }
    };
    async doFetch({ urlVal, reqInit, as, proxy }) {
        const resp = await fetch(urlVal, reqInit);
        let fetchResult;
        if (as === 'json') {
            fetchResult = await resp.json();
        }
        else {
            fetchResult = await resp.text();
        }
        return {
            fetchResult
        };
        //proxy.fetchResult = fetchResult;
    }
    sendFetchResultToTarget({ fetchResult, proxy }) {
        const target = proxy.target;
        if (target) {
            const targetElement = proxy.getRootNode().querySelector(target);
            if (targetElement === null)
                throw { target, msg: '404' };
            const lastPos = target.lastIndexOf('[');
            if (lastPos === -1)
                throw 'NI'; //Not implemented
            const rawPath = target.substring(lastPos + 2, target.length - 1);
            const propPath = lispToCamel(rawPath);
            targetElement[propPath] = fetchResult;
        }
        else {
            throw 'NI'; //Not implemented
        }
    }
    finale(proxy) {
        this.proxy.removeEventListener('input', this.handleInput);
    }
}
const tagName = 'be-reformable';
define({
    config: {
        tagName,
        propDefaults: {
            upgrade: 'form',
            ifWantsToBe: 'reformable',
            virtualProps: ['autoSubmit', 'baseLink', 'path', 'url', 'urlVal', 'reqInit', 'as', 'fetchResult'],
            finale: 'finale',
            proxyPropDefaults: {
                as: 'json'
            }
        },
        actions: {
            onAutoSubmit: {
                ifAllOf: ['autoSubmit']
            },
            doFetch: {
                ifAllOf: ['urlVal', 'reqInit', 'as'],
                async: true,
            },
            sendFetchResultToTarget: {
                ifAllOf: ['fetchResult']
            },
            onUrl: {
                ifAllOf: ['url']
            }
        }
    },
    complexPropDefaults: {
        controller: BeReformableController
    }
});
document.head.appendChild(document.createElement(tagName));
