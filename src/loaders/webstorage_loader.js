
import status from '../status.js';

import { LoadablePromise } from '../loader.js';


// Create a loader for an item from local storage (stored under the given key).
// Returns a promise for a loadable item.
export default (storageKey, initial = '', { storageType = 'localStorage' } = {}) => current => {
    // Note: Web Storage fetching is a synchronous operation, so our result will always
    // be either `ready` or `error` (never `loading`).
    
    if (typeof window !== 'object' || !window[storageType]) {
        throw new Error(`Current environment does not support Web Storage`);
    }
    
    const storage = window[storageType];
    
    let item;
    if (storage.hasOwnProperty(storageKey)) {
        try {
            const contents = JSON.parse(storage.getItem(storageKey));
            item = current[status].asReady(contents);
        } catch (e) {
            if (e instanceof SyntaxError) {
                item = current[status].asFailed(error);
            } else {
                throw e; // Unknown error
            }
        }
    } else {
        // Initialize
        item = current[status].asReady(initial);
    }
    
    return new LoadablePromise(resolve => { resolve(item); }, current);
};
