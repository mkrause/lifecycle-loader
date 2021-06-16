
import type { Proxyable, ProxyableExternal } from 'proxy-extend';
import { isProxyable } from 'proxy-extend';

import * as LoadableDefs from './interfaces/Loadable.js';
import * as LoaderDefs from './interfaces/Loader.js';


export type Status = LoadableDefs.Status;
export type Loadable<T> = LoadableDefs.Loadable<T>;
export type { Proxyable };
export type LoadableProxy<T extends Proxyable> = LoadableDefs.LoadableProxyT<T>;

// Wrap up the definitions in a single `Loadable` object, which can also be invocated as a function (uses Proxy)
export const Loadable = Object.assign(
    <T extends Proxyable>(item ?: undefined | T, status : Partial<LoadableDefs.Status> = {}) =>
        LoadableDefs.LoadableProxy(item, status),
    {
        // Keys
        item: LoadableDefs.itemKey as typeof LoadableDefs.itemKey,  // Prevent widening to `symbol`
        status: LoadableDefs.statusKey as typeof LoadableDefs.statusKey,  // Prevent widening to `symbol`
        construct: LoadableDefs.constructKey as typeof LoadableDefs.constructKey,  // Prevent widening to `symbol`
        
        isStatus: LoadableDefs.isStatus,
        isLoadable: LoadableDefs.isLoadable,
        
        // Constructors
        Record: LoadableDefs.LoadableRecord,
        Proxy: LoadableDefs.LoadableProxy,
        
        // Accessor functions
        getItem: <T>(resource : Loadable<T>) => resource[LoadableDefs.itemKey],
        getStatus: <T>(resource : Loadable<T>) => resource[LoadableDefs.statusKey],
        
        // Updater functions
        update: LoadableDefs.update,
        updateItem: LoadableDefs.updateItem,
        updateStatus: LoadableDefs.updateStatus,
        asPending: LoadableDefs.asPending,
        asLoading: LoadableDefs.asLoading,
        asReady: LoadableDefs.asReady,
        asFailed: LoadableDefs.asFailed,
    },
);

// Shorthand exports
export const status: typeof LoadableDefs.statusKey = LoadableDefs.statusKey; // Prevent widening to `symbol`
export const isStatus = LoadableDefs.isStatus;
export const isLoadable = LoadableDefs.isLoadable;

// Utilities
export { isProxyable };


/*
export {
    LoadError,
    LoadablePromise,
};

export const loader = <T>(
        item : Loadable<T>,
        executor : (resolve : (item : Loadable<T>) => void, reject : (item : Loadable<T>) => void) => void,
    ) =>
        new LoadablePromise(executor, item);
*/

export const Loader = {
    resource: LoaderDefs.resourceKey,
    fromPromise: LoaderDefs.fromPromise,
};

export type PromiseWithResource<T> = LoaderDefs.PromiseWithResource<T>;

export default Loadable;
