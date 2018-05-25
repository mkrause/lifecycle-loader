
import status from './status.js';
import LoadableProxy from './loadable/LoadableProxy.js';
import { LoadablePromise } from './loader.js';

// Loaders
import aggregateLoader from './loaders/aggregate_loader.js';
import constLoader from './loaders/const_loader.js';
import asyncLoader from './loaders/async_loader.js';
import localStorageLoader from './loaders/localstorage_loader.js';


export {
    status,
    LoadableProxy as Loadable, // Export as just `Loadable`, because of its common use
    LoadablePromise,
    
    // Loaders
    aggregateLoader,
    constLoader,
    asyncLoader,
    localStorageLoader,
};

export const loader = (item, resolver) => new LoadablePromise(resolver, item);
