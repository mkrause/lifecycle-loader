
import status from '../status.js';

import { LoadablePromise } from '../loader.js';


// Create a loader for an item from local storage (stored under the given key).
// Returns a promise for a loadable item.
export default (storageKey, initial = '') => current => {
    // Note: localStorage fetching is a synchronous operation, so our result will always
    // be either `ready` or `error` (never `loading`).
    
    if (typeof window !== 'object' || !window.localStorage) {
        throw new Error(`Current environment does not support localStorage`);
    }
    
    let item;
    if (localStorage.hasOwnProperty(storageKey)) {
        try {
            const contents = JSON.parse(localStorage.getItem(storageKey));
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
