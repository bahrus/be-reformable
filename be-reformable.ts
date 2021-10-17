import {BeDecoratedProps, define} from 'be-decorated/be-decorated.js';
import {BeReformableProps, BeReformableVirtualProps, BeReformableActions} from './types';

export class BeReformableController implements BeReformableActions{
    // intro(proxy: HTMLFormElement & BeReformableVirtualProps){

    // }
    onAutoSubmit({}: this){
        this.proxy.addEventListener('input', this.handleInput);
    }

    handleInput = (e: Event) => {
        console.log('iah');
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

