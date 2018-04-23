
import Loadable, { status } from '../loadable/Loadable.js';


// Create a loader for an item from local storage (stored under the given key).
// Returns a promise for a loadable item.
export default (storageKey, initial = '') => (current, dispatch) => {
    // Note: localStorage fetching is a synchronous operation, so our result will always
    // be either `ready` or `error` (never `loading`).
    
    let item;
    if (localStorage.hasOwnProperty(storageKey)) {
        try {
            const contents = JSON.parse(localStorage.getItem(storageKey));
            item = current[status].asReady(contents);
        } catch (e) {
            if (e instanceof SyntaxError) {
                item = current[status].withError(error);
            } else {
                throw e; // Unknown error
            }
        }
    } else {
        // Initialize
        item = current[status].asReady(initial);
    }
    
    // Update the store
    dispatch(item);
    
    return Promise.resolve(item);
};
