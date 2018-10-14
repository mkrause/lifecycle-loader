// @flow

import statusKey, { type Status } from './interfaces/status.js';
import type { Loadable } from './interfaces/loadable.js';
import { type Loader, LoadError, LoadablePromise } from './interfaces/loader.js';

// Loadable utilities
import LoadableProxy from './loadable/LoadableProxy.js';
import loadableFromStatus from './loadable/fromStatus.js';

// Loaders
import aggregateLoader from './loaders/aggregate_loader.js';
import constLoader from './loaders/const_loader.js';
import asyncLoader from './loaders/async_loader.js';
import webStorageLoader from './loaders/webstorage_loader.js';


export {
    statusKey as status,
    LoadableProxy as Loadable, // Export as just `Loadable`, because of its common use
    LoadError,
    LoadablePromise,
    
    // Loaders
    aggregateLoader,
    constLoader,
    asyncLoader,
    webStorageLoader,
};

export const loader = (item, resolver) => new LoadablePromise(resolver, item);

export type { Status, Loadable as LoadableT };
