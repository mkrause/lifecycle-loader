import { Loadable } from './Loadable.js';
export declare type Loader<T> = (item: Loadable<T>) => Promise<Loadable<T>>;
declare type LoaderSpec = unknown;
export declare type LoaderCreator<T> = (...args: Array<LoaderSpec>) => Loader<T>;
export declare class LoadError<T> extends Error {
    readonly item: Loadable<T>;
    constructor(reason: unknown, item: Loadable<T>);
}
export declare class LoadablePromise<T> extends Promise<Loadable<T>> {
    static [Symbol.species]: PromiseConstructor;
    static from<T>(item: Loadable<T>, promise: Promise<Loadable<T>>): LoadablePromise<T>;
    private fulfilled;
    readonly item: Loadable<T>;
    constructor(executor: (resolve: (item: Loadable<T>) => void, reject: (item: Loadable<T>) => void) => void, item: Loadable<T>);
    subscribe(this: LoadablePromise<T>, subscriber: (item: Loadable<T>) => void): typeof this;
}
export {};
//# sourceMappingURL=Loader.d.ts.map