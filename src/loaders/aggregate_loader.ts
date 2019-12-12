// @ts-nocheck

import $msg from 'message-tag';
import { Loadable, statusKey, asReady } from '../interfaces/Loadable.js';
import { LoadablePromise } from '../interfaces/Loader.js';


// Aggregated, cached loader. "Aggregated" in that this loader takes a set of loaders for multiple
// items and combines them into one. "Cached" in that we do not re-load unless necessary.

const loadItem = ([itemName, itemSpec]) => {
    const item = itemSpec.get();
    
    if (!(statusKey in item)) {
        throw new TypeError($msg`Given item is not loadable: ${item}`);
    }
    
    // TODO
    // if (item[statusKey].error) {
    //     // Retry mechanism?
    //     return Promise.reject(item.meta.error);
    // }
    
    if (item[statusKey].loading) {
        // Do not load again if already loading
        return Promise.resolve(item);
    }
    
    if (item[statusKey].ready) {
        return Promise.resolve(item);
    } else {
        return itemSpec.load();
    }
};


/*
type Loadable = { [statusKey] : any };
type ItemSpec = { get : () => Loadable, load : () => Promise<Loadable> } };
*/

// Aggregate multiple loadable items into one item
// `items : { [itemName] : ItemSpec }`
const loader = items => {
    // Create a load function that loads all items
    const load = () => Promise.all(Object.entries(items).map(loadItem));
    
    // Annotate the load function with a status that accumulates all the item statuses
    load.status = load[statusKey] = Object.entries(items).reduce(
        (statusAcc, [itemName, itemSpec]) => {
            const item = itemSpec.get();
            statusAcc.ready = statusAcc.ready && item[statusKey].ready;
            statusAcc.loading = statusAcc.loading || item[statusKey].loading;
            
            // TODO: consolidate these and just make `error` of type `null | Error | Array<Error>`
            statusAcc.error = statusAcc.error || item[statusKey].error !== null;
            statusAcc.errorMessages[itemName] = item[statusKey].error;
            return statusAcc;
        },
        { ready: true, loading: false, error: false, errorMessages: {} }
    );
    
    return load;
};

export default loader;
