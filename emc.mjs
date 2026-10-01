// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/be-reformable/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        // the legacy enhPropKey -- what consumers use, e.g. el.enh.set.beReformable
        enhKey: 'beReformable',
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
        // Each action that reacts to an end-user prop also lists 'initialized'
        // (set at the end of init, once roundabout has finished):  a prop
        // assigned programmatically right after enh.get(), before roundabout
        // has made it reactive, raises no change event of its own -- see
        // "Blocking an Action Until All Attributes Are Read" in the guide.
        actions: {
            specifyDefaultBaseURL: {
                ifAllOf: ['initialized'],
                ifNoneOf: ['baseLink', 'baseURL']
            },
            hydrate: {
                ifKeyIn: ['updateOn', 'initialized'],
                ifAllOf: ['updateOn', 'enhancedElement', 'initialized']
            },
            parsePath: {
                ifKeyIn: ['path', 'initialized'],
                ifAllOf: ['path', 'initialized']
            },
            resolveBaseLink: {
                ifKeyIn: ['baseLink', 'initialized'],
                ifAllOf: ['baseLink', 'initialized']
            },
            updateAction: {
                // updateCnt is bumped by hydrate before parsePath (async) has
                // produced urlBuilder, so urlBuilder and baseURL arriving must
                // also be able to trigger updateAction
                // headers and headerFields are listed so that roundabout monitors
                // them -- reassigning either (programmatically) refreshes the fetch options
                ifKeyIn: ['updateCnt', 'urlBuilder', 'baseURL', 'headers', 'headerFields'],
                ifAllOf: ['updateCnt', 'urlBuilder', 'enhancedElement'],
                ifAtLeastOneOf: ['baseURL', 'resolvedBaseURL']
            },
            weakenHeaderFields: {
                ifAllOf: ['headerFields']
            }
        },
        compacts: {
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
