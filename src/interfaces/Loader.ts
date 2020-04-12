
import $msg from 'message-tag';

import { Status, Loadable, itemKey, statusKey } from './Loadable.js';


// A *loader* is a function that takes a resource (the current state), and returns a promise for
// a new (loaded) resource (so always async, by definition).
export type Loader<T> = (resource : Loadable<T>) => Promise<Loadable<T>>;

// A *loader creator* is a function that returns a loader.
export type LoaderCreator<T> = (...args : Array<unknown>) => Loader<T>;


// Version of `Error` that keeps a reference to the resource
export class LoadError<T> extends Error {
    readonly resource : Loadable<T>;
    
    constructor(reason : unknown, resource : Loadable<T>) {
        let message = reason;
        if (reason instanceof Error) {
            message = reason.message;
        }
        
        super($msg`Loading failed: ${message}`);
        this.resource = resource;
    }
}

// type Fulfill = (resolve : (result : unknown) => void, reject : (reason : unknown) => void) => void;
type Resolver<T> = (value ?: T | PromiseLike<T>) => void;
type Rejecter = (reason ?: any) => void;
type PromiseExecutor<T> = (resolve : Resolver<T>, reject : Rejecter) => void;

// Extended version of `Promise` that works with loadable resources.
// Note: although the ES6 spec allows extending Promise, babel by default does not support it. Can
// use the `transform-builtin-extend` plugin.
// https://github.com/babel/babel/issues/1120
// 
// Note: should extending Promise become an issue, we could always fall back to just implementing
// the "thenable" interface (i.e. just a method named `then()`).
export class LoadablePromise<T> extends Promise<Loadable<T>> {
    // Set the species to regular `Promise`, so that `then()` chaining will not try to create
    // a new LoadablePromise (which fails due to lack of information given to the constructor).
    static [Symbol.species] = Promise;
    
    // Create from existing promise
    static from<T>(resource : Loadable<T>, promise : Promise<Loadable<T>>) : LoadablePromise<T> {
        return new LoadablePromise((resolve, reject) => {
            promise.then(resolve, reject);
        }, resource);
    }
    
    private fulfilled : boolean = false;
    public readonly resource : Loadable<T>;
    
    constructor(
        executor : (resolve : (resource : Loadable<T>) => void, reject : (resource : Loadable<T>) => void) => void,
        resource : Loadable<T>
    ) {
        super((resolve : Resolver<Loadable<T>>, reject : Rejecter) => {
            // Note: need to do this check here, because we cannot do it before `super()`, but we also want
            // it before the call to `executor()`.
            if (!resource[statusKey].loading) {
                throw new TypeError($msg`Expected resource with status loading, given ${resource[statusKey]}`);
            }
            
            executor(
                (resource : Loadable<T>) => {
                    if (!resource[statusKey].ready) {
                        throw new TypeError($msg`Expected resource with status ready, given ${resource[statusKey]}`);
                    }
                    
                    this.fulfilled = true;
                    resolve(resource);
                },
                (resource : Loadable<T>) => {
                    if (!resource[statusKey].error) {
                        throw new TypeError($msg`Expected resource with status failed, given ${resource[statusKey]}`);
                    }
                    
                    this.fulfilled = true;
                    reject(new LoadError(resource[statusKey].error, resource));
                },
            );
        });
        
        this.resource = resource;
    }
    
    // Similar to `then()`, but will be called:
    // - Once, synchronously, with the resource in loading state, *if* the resource is not already fulfilled
    //   (resolved or rejected) synchronously.
    // - Second, when the resource is fulfilled, with the resource in the corresponding state (ready/failed).
    // In addition, `subscribe` does not distinguish between resolved/rejected, it only takes
    // one function which is called regardless of the result (check the `status` instead).
    subscribe(this : LoadablePromise<T>, subscriber : (resource : Loadable<T>) => void) : typeof this {
        if (!this.fulfilled) {
            // Note: should be guaranteed to be in loading state (by the check in the constructor)
            subscriber(this.resource);
        }
        
        this.then(
            (resourceReady : Loadable<T>) => { subscriber(resourceReady); },
            (reason : LoadError<T>) => { subscriber(reason.resource); },
        );
        
        return this;
    }
}
