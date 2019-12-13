
import * as LoadableDefs from './interfaces/Loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/Loader.js';

// Loader implementations
import constLoader from './loaders/const_loader.js';
import aggregateLoader from './loaders/aggregate_loader.js';
import webStorageLoader from './loaders/webstorage_loader.js';


export type Status = LoadableDefs.Status;
export type Loadable<T> = LoadableDefs.Loadable<T>;

// Wrap up the definitions in a single `Loadable` object, which can also be invocated as a function (uses Proxy)
export const Loadable = Object.assign(
    <T extends LoadableDefs.Proxyable>(item : null | T, status : Partial<LoadableDefs.Status> = {}) =>
        LoadableDefs.LoadableProxy(item, status),
    {
        item: LoadableDefs.itemKey,
        status: LoadableDefs.statusKey,
        construct: LoadableDefs.constructKey,
        
        Simple: LoadableDefs.LoadableSimple,
        Proxy: LoadableDefs.LoadableProxy,
        
        update: LoadableDefs.update,
        updateValue: LoadableDefs.updateValue,
        updateStatus: LoadableDefs.updateStatus,
        asLoading: LoadableDefs.asLoading,
        asReady: LoadableDefs.asReady,
        asFailed: LoadableDefs.asFailed,
    },
);

// Export explicitly, for convenience
export const status = LoadableDefs.statusKey;


export {
    LoadError,
    LoadablePromise,
    
    // Loaders
    constLoader,
    aggregateLoader,
    webStorageLoader,
};

export const loader = <T>(
        item : Loadable<T>,
        executor : (resolve : (item : Loadable<T>) => void, reject : (item : Loadable<T>) => void) => void,
    ) =>
        new LoadablePromise(executor, item);


export default Loadable;
