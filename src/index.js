// @flow

import status from './status.js';
import type { Status } from './status.js';
import type { Loadable } from './loadable/Loadable.js';
import LoadableProxy from './loadable/LoadableProxy.js';
import { LoadError, LoadablePromise } from './loader.js';

// Loaders
import aggregateLoader from './loaders/aggregate_loader.js';
import constLoader from './loaders/const_loader.js';
import asyncLoader from './loaders/async_loader.js';
import webStorageLoader from './loaders/webstorage_loader.js';


export {
    status,
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
