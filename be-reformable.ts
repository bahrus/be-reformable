import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeReformableProps, BeReformableVirtualProps, BeReformableActions} from './types';

export class BeReformableController implements BeReformableActions{
    // target: HTMLFormElement | undefined;
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps, target: HTMLFormElement){
    //     this.target = target
    // }
    onAutoSubmit({}: this){
        this.proxy.addEventListener('input', this.handleInput);
    }

    handleInput = (e: Event) => {
        console.log('iah');
        console.log(this.proxy.elements);
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
            virtualProps: ['autoSubmit', 'baseLink', 'path']
        },
        actions:{
            onAutoSubmit:{
                ifAllOf: ['autoSubmit']
            }
        }
    },
    complexPropDefaults:{
        controller: BeReformableController
    }
});

document.head.appendChild(document.createElement(tagName));

