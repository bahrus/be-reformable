// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/be-reformable/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'BeReformable',
        spawn: 'be-reformable/be-reformable.js',
        withAttrs: {
            base: 'be-reformable',
            baseLink: '${base}-base-link',
            path: '${base}-path',
            headers: '${base}-headers',
            _headers: {
                instanceOf: 'Object'
            },
            submitOptions: '${base}-submit-options',
            _submitOptions: {
                instanceOf: 'Object'
            },
            _base: {
                instanceOf: 'Object',
                mapsTo: '.'
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            specifyDefaultBaseURL: {
                ifNoneOf: ['baseLink', 'baseURL']
            },
            updateAction: {
                ifAllOf: ['updateCnt', 'urlBuilder', 'enhancedElement'],
                ifAtLeastOneOf: ['baseURL', 'resolvedBaseURL']
            }
        },
        compacts: {
            when_updateOn_changes_call_hydrate: 0,
            when_path_changes_call_parsePath: 0,
            when_baseLink_changes_call_resolveBaseLink: 0,
            when_fetchOptions_changes_call_suggestFetch: 0,
        },
        defaultPropVals: {
            updateCnt: 0,
            updateOn: 'input',
            
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
