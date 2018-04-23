
import $msg from 'message-tag';
import { status } from '../loadable/Loadable.js';


// Aggregated, cached loader. "Aggregated" in that this loader takes a set of loaders for multiple
// items and combines them into one. "Cached" in that we do not re-load unless necessary.

const loadItem = ([itemName, itemSpec]) => {
    const item = itemSpec.get();
    
    if (!(status in item)) {
        throw new TypeError($msg`Given item is not loadable: ${item}`);
    }
    
    // TODO
    // if (item[status].error) {
    //     // Retry mechanism?
    //     return Promise.reject(item.meta.error);
    // }
    
    if (item[status].loading) {
        // Do not load again if already loading
        return Promise.resolve(item);
    }
    
    if (item[status].ready) {
        return Promise.resolve(item);
    } else {
        return itemSpec.load();
    }
};


/*
type Loadable = { [status] : any };
type ItemSpec = { get : () => Loadable, load : () => Promise<Loadable> } };
*/

// Aggregate multiple loadable items into one item
// `items : { [itemName] : ItemSpec }`
const loader = items => {
    // Create a load function that loads all items
    const load = () => Promise.all(Object.entries(items).map(loadItem));
    
    // Annotate the load function with a status that accumulates all the item statuses
    load.status = load[status] = Object.entries(items).reduce(
        (statusAcc, [itemName, itemSpec]) => {
            const item = itemSpec.get();
            statusAcc.ready = statusAcc.ready && item[status].ready;
            statusAcc.loading = statusAcc.loading || item[status].loading;
            
            // TODO: consolidate these and just make `error` of type `null | Error | Array<Error>`
            statusAcc.error = statusAcc.error || item[status].error !== null;
            statusAcc.errorMessages[itemName] = item[status].error;
            return statusAcc;
        },
        { ready: true, loading: false, error: false, errorMessages: {} }
    );
    
    return load;
};

export default loader;
