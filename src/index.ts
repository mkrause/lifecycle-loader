
import * as LoadableDefs from './interfaces/Loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/Loader.js';

// Loader implementations
// import aggregateLoader from './loaders/aggregate_loader.js';
// import constLoader from './loaders/const_loader.js';
// import asyncLoader from './loaders/async_loader.js';
// import webStorageLoader from './loaders/webstorage_loader.js';


export type Status = LoadableDefs.Status;
export type Loadable<T> = LoadableDefs.Loadable<T>;
export const Loadable = Object.assign(
    <T extends LoadableDefs.Proxyable>(item : null | T, status : Partial<LoadableDefs.Status> = {}) =>
        LoadableDefs.LoadableProxy(item, status),
    {
        item: LoadableDefs.itemKey,
        status: LoadableDefs.statusKey,
        construct: LoadableDefs.constructKey,
        
        Simple: LoadableDefs.LoadableSimple,
        Proxy: LoadableDefs.LoadableProxy,
        
        asLoading: LoadableDefs.asLoading,
        asReady: LoadableDefs.asReady,
        asFailed: LoadableDefs.asFailed,
    },
);


export {
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
    ) =>
        new LoadablePromise(executor, item);


export default Loadable;
