import { define } from 'be-decorated/be-decorated.js';
export class BeReformableController {
    // target: HTMLFormElement | undefined;
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement){
    //     this.target = target
    // }
    onAutoSubmit({}) {
        this.proxy.addEventListener('input', this.handleInput);
    }
    handleInput = (e) => {
        console.log('iah');
        console.log(this.proxy.elements);
    };
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
            virtualProps: ['autoSubmit', 'baseLink', 'path']
        },
        actions: {
            onAutoSubmit: {
                ifAllOf: ['autoSubmit']
            }
        }
    },
    complexPropDefaults: {
        controller: BeReformableController
    }
});
document.head.appendChild(document.createElement(tagName));
