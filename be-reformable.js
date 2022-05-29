import { define } from 'be-decorated/be-decorated.js';
import { register } from 'be-hive/register.js';
export const virtualProps = [
    'autoSubmit', 'autoSubmitOn', 'baseLink', 'path', 'url', 'urlVal', 'init', 'as',
    'fetchResult', 'propKey', 'fetchResultPath', 'initVal', 'headerFormSelector', 'headerFormSubmitOn'
];
export class BeReformableController {
    // target: HTMLFormElement | undefined;
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement){
    //     this.target = target
    // }
    onAutoSubmit({ proxy, autoSubmitOn }) {
        const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn] : autoSubmitOn;
        for (const key of on) {
            proxy.addEventListener(key, this.handleInput);
        }
        this.handleInput();
    }
    async onUrl({ url, proxy }) {
        const { hookUp } = await import('be-observant/hookUp.js');
        hookUp(url, proxy, 'urlVal');
    }
    async onInit({ init, proxy }) {
        const { hookUp } = await import('be-observant/hookUp.js');
        hookUp(init, proxy, 'initVal');
    }
    handleInput = () => {
        if (!this.proxy.checkValidity())
            return;
        const method = this.proxy.method;
        if (method) {
            if (this.proxy.initVal !== undefined) {
                this.proxy.initVal.method = method;
            }
            else {
                this.proxy.initVal = {
                    method
                };
            }
        }
        if (this.url && !this.urlVal)
            return;
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
    async doFetch({ urlVal, initVal, as, proxy, fetchResultPath, headerFormSelector }) {
        if (!proxy.target) {
            proxy.action = urlVal;
            proxy.submit();
            return;
        }
        if (headerFormSelector) {
            const headerForm = proxy.getRootNode().querySelector(headerFormSelector);
            if (headerForm === null)
                throw '404';
            if (!headerForm.checkValidity())
                return;
            if (headerForm !== null) {
                const elements = headerForm.elements;
                if (initVal === undefined) {
                    initVal = {};
                }
                const headers = { ...initVal.headers };
                for (const input of elements) {
                    const inputT = input;
                    if (inputT.name) {
                        headers[inputT.name] = inputT.value;
                    }
                }
                initVal.headers = headers;
                console.log({ initVal });
            }
        }
        const resp = await fetch(urlVal, initVal);
        let fetchResult;
        const contentTypeHeader = resp.headers.get('content-type');
        if (contentTypeHeader !== null && contentTypeHeader.indexOf('json') > -1) {
            fetchResult = await resp.json();
        }
        else {
            fetchResult = await resp.text();
        }
        if (fetchResultPath !== undefined) {
            const { getProp } = await import('trans-render/lib/getProp.js');
            fetchResult = getProp(fetchResult, fetchResultPath);
        }
        return {
            fetchResult
        };
    }
    async sendFetchResultToTarget({ fetchResult, propKey, proxy }) {
        const target = proxy.target;
        if (target) {
            const targetElement = proxy.getRootNode().querySelector(target);
            if (targetElement === null)
                throw { target, msg: '404' };
            const lastPos = target.lastIndexOf('[');
            if (lastPos === -1)
                throw 'NI'; //Not implemented
            const rawPath = target.substring(lastPos + 2, target.length - 1);
            const { lispToCamel } = await import('trans-render/lib/lispToCamel.js');
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
    async finale(proxy) {
        const { autoSubmitOn, headerFormSubmitOn } = proxy;
        if (autoSubmitOn !== undefined) {
            const on = typeof autoSubmitOn === 'string' ? [autoSubmitOn] : autoSubmitOn;
            for (const key of on) {
                proxy.removeEventListener(key, this.handleInput);
            }
        }
        if (headerFormSubmitOn !== undefined) {
            const on = typeof headerFormSubmitOn === 'string' ? [headerFormSubmitOn] : headerFormSubmitOn;
            for (const key of on) {
                proxy.removeEventListener(key, this.handleInput);
            }
        }
        const { unsubscribe } = await import('trans-render/lib/subscribe.js');
        unsubscribe(proxy);
    }
    async onHeaderFormSubmitOn({ headerFormSubmitOn, proxy, headerFormSelector }) {
        const on = typeof headerFormSubmitOn === 'string' ? [headerFormSubmitOn] : headerFormSubmitOn;
        const headerForm = proxy.getRootNode().querySelector(headerFormSelector);
        if (headerForm === null)
            throw '404';
        for (const key of on) {
            headerForm.addEventListener(key, this.handleInput);
        }
        this.handleInput();
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
                autoSubmitOn: 'input',
            }
        },
        actions: {
            onAutoSubmit: 'autoSubmit',
            doFetch: {
                ifAllOf: ['urlVal', 'initVal'],
            },
            sendFetchResultToTarget: 'fetchResult',
            onUrl: 'url',
            onHeaderFormSubmitOn: {
                ifAllOf: ['headerFormSubmitOn', 'headerFormSelector'],
            }
        }
    },
    complexPropDefaults: {
        controller: BeReformableController
    }
};
define(controllerConfig);
register(ifWantsToBe, upgrade, tagName);
