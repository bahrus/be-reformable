import { define } from 'be-decorated/be-decorated.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
import { hookUp } from 'be-observant/hookUp.js';
import { register } from 'be-hive/register.js';
export const virtualProps = ['autoSubmit', 'baseLink', 'path', 'url', 'urlVal', 'init', 'as', 'fetchResult'];
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
        hookUp(url, proxy, 'urlVal');
    }
    handleInput = () => {
        if (!this.proxy.checkValidity())
            return;
        const method = this.proxy.method;
        if (method) {
            if (this.proxy.init !== undefined) {
                this.proxy.init.method = method;
            }
            else {
                this.proxy.init = {
                    method
                };
            }
        }
        let url = this.proxy.action || this.urlVal;
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
        const queryObj = {};
        const elements = this.proxy.elements;
        for (const input of elements) {
            const inputT = input;
            if (inputT.name) {
                queryObj[inputT.name] = inputT.value;
            }
        }
        if (this.path !== undefined) {
            let idx = 0;
            for (const token of this.path) {
                if (idx % 2 === 0) {
                    url += token;
                }
                else {
                    url += encodeURIComponent(elements[token].value);
                    delete queryObj[token];
                }
                idx++;
            }
        }
        this.proxy.urlVal = url + '?' + new URLSearchParams(queryObj).toString();
    };
    async doFetch({ urlVal, init, as, proxy }) {
        const resp = await fetch(urlVal, init);
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
    }
    sendFetchResultToTarget({ fetchResult, propKey, proxy }) {
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
        if (propKey !== undefined) {
            let container = proxy.closest('[itemscope]');
            if (container === null)
                container = proxy.getRootNode().host;
            if (container === undefined)
                throw '404';
            container[propKey] = fetchResult;
        }
    }
    finale(proxy) {
        this.proxy.removeEventListener('input', this.handleInput);
    }
}
const tagName = 'be-reformable';
const ifWantsToBe = 'reformable';
export const upgrade = 'form';
export const controllerConfig = {
    config: {
        tagName,
        propDefaults: {
            upgrade,
            ifWantsToBe,
            virtualProps,
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
                ifAllOf: ['urlVal', 'init', 'as'],
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
};
define(controllerConfig);
register(ifWantsToBe, upgrade, tagName);
