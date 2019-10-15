import { statusKey, Status } from './interfaces/Status.js';
import { Loadable } from './interfaces/Loadable.js';
import { LoadError, LoadablePromise } from './interfaces/Loader.js';
import LoadableProxy from './loadable/LoadableProxy.js';
import LoadableSimple from './loadable/LoadableSimple.js';
export { statusKey as status, LoadableProxy as Loadable, // Export as just `Loadable`, because of its common use
LoadableSimple, LoadError, LoadablePromise, };
export declare const loader: <T>(item: Loadable<T>, executor: (resolve: (item: Loadable<T>) => void, reject: (item: Loadable<T>) => void) => void) => LoadablePromise<T>;
export declare type Status = Status;
export declare type LoadableT<T> = Loadable<T>;
//# sourceMappingURL=index.d.ts.map