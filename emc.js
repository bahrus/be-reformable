// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';

/** @import {EMC} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-reformable/types' */;

/**
 * @type {Partial<EMC<any, AP>>}
 */
export const emc = {
    hostInstanceOf: [HTMLFormElement],
    base: 'be-reformable',
    enhPropKey: 'beReformable',
    map: {
        '0.0': {
            instanceOf: 'Object',
            mapsTo: '.',
        },
    },
    importEnh:  async () => {
        const { BeReformable } = 
        /** @type {{new(): IEnhancement<Element>}} */ 
        /** @type {any} */
        (await import('./be-reformable.js'));
        return BeReformable;
    },
};

const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);