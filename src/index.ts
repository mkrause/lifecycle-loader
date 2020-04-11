
import type { Proxyable, ProxyableExternal } from 'proxy-extend';

import * as LoadableDefs from './interfaces/Loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/Loader.js';


export type Status = LoadableDefs.Status;
export type Loadable<T> = LoadableDefs.Loadable<T>;

// Wrap up the definitions in a single `Loadable` object, which can also be invocated as a function (uses Proxy)
export const Loadable = Object.assign(
    <T extends Proxyable>(item : undefined | T, status : Partial<LoadableDefs.Status> = {}) =>
        LoadableDefs.LoadableProxy(item, status),
    {
        item: LoadableDefs.itemKey,
        status: LoadableDefs.statusKey,
        construct: LoadableDefs.constructKey,
        
        Simple: LoadableDefs.LoadableSimple,
        Proxy: LoadableDefs.LoadableProxy,
        
        update: LoadableDefs.update,
        updateItem: LoadableDefs.updateItem,
        updateStatus: LoadableDefs.updateStatus,
        asPending: LoadableDefs.asPending,
        asLoading: LoadableDefs.asLoading,
        asReady: LoadableDefs.asReady,
        asFailed: LoadableDefs.asFailed,
    },
);

// Shorthand
export const status = LoadableDefs.statusKey;


export {
    LoadError,
    LoadablePromise,
};

export const loader = <T>(
        item : Loadable<T>,
        executor : (resolve : (item : Loadable<T>) => void, reject : (item : Loadable<T>) => void) => void,
    ) =>
        new LoadablePromise(executor, item);


export default Loadable;
