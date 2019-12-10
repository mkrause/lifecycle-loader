
import { statusKey, Status } from './interfaces/Status.js';
import { itemKey, Loadable } from './interfaces/Loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/Loader.js';

// Loadable implementations
import LoadableProxy from './loadable/LoadableProxy.js';
import LoadableSimple from './loadable/LoadableSimple.js';

// Loader implementations
// import aggregateLoader from './loaders/aggregate_loader.js';
// import constLoader from './loaders/const_loader.js';
// import asyncLoader from './loaders/async_loader.js';
// import webStorageLoader from './loaders/webstorage_loader.js';


export {
    statusKey as status,
    LoadableProxy as Loadable, // Export as just `Loadable`, because of its common use
    LoadableSimple,
    LoadError,
    LoadablePromise,
    
    // Loaders
    //aggregateLoader,
    //constLoader,
    //asyncLoader,
    //webStorageLoader,
};

export const loader = <T>(
        item : Loadable<T>,
        executor : (resolve : (item : Loadable<T>) => void, reject : (item : Loadable<T>) => void) => void,
    ) => new LoadablePromise(executor, item);

// Export some useful types
export { Status };
export type LoadableT<T> = Loadable<T>;
