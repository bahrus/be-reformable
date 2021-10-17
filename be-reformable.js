import { define } from 'be-decorated/be-decorated.js';
export class BeReformableController {
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps){
    // }
    onAutoSubmit({}) {
        this.proxy.addEventListener('input', this.handleInput);
    }
    handleInput = (e) => {
        console.log('iah');
    };
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
