// @ts-nocheck

import { Loadable, statusKey, asReady, asFailed } from '../interfaces/Loadable.js';
import { LoadablePromise } from '../interfaces/Loader.js';


// Create a loader for an item from local storage (stored under the given key).
// Returns a promise for a loadable item.
export default <T>(storageKey : string, initial : T, { storageType = 'localStorage' } = {}) =>
    (current : Loadable<T>) => {
        // Note: Web Storage fetching is a synchronous operation, so our result will always
        // be either `ready` or `error` (never `loading`).
        
        if (typeof window !== 'object' || !window[storageType]) {
            throw new Error(`Current environment does not support Web Storage`);
        }
        
        const storage = window[storageType];
        
        let item : Loadable<T>;
        if (storage.hasOwnProperty(storageKey)) {
            try {
                const contents = JSON.parse(storage.getItem(storageKey));
                item = asReady(current, contents);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    item = asFailed(current, e);
                } else {
                    throw e; // Unknown error
                }
            }
        } else {
            // Initialize
            item = asReady(current, initial);
        }
        
        return new LoadablePromise(resolve => { resolve(item); }, current);
    };
