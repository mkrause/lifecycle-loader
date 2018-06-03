// @flow

import status from './status.js';
import type { Status } from './status.js';
import type { Loadable } from './loadable/Loadable.js';


// A *loader* is a function that takes an item (the current state), and returns a promise
// for that item (re)loaded. To create a loader, a loader creator may be used to build a
// loader function from some specification.

export type Loader = Loadable => Promise<Loadable>;

type LoaderSpec = mixed;
export type LoaderCreator = (...args : Array<LoaderSpec>) => Loader;


export class LoadError extends Error {
    constructor(reason : mixed, item : Loadable) {
        let message = '';
        if (reason instanceof Error) {
            message = reason.message;
        } else {
            message = String(message);
        }
        
        super('Loading failed: ' + reason);
        this.item = item;
    }
}

type Fulfill = (mixed => void, mixed => void) => void;

// Extended version of `Promise` that works with loadable items.
// Note: although the ES6 spec allows extending Promise, babel by default does not support
// it. transform-builtin-extend must be configured to enable this.
// https://github.com/babel/babel/issues/1120
// 
// Note: should extending Promise become an issue, we could always fall back to just implementing
// "thenable".
export class LoadablePromise extends Promise {
    // Set the species to regular `Promise`, so that `then()` chaining will not try to create
    // a new ApiPromise (which fails due to lack of information given to the constructor).
    static [Symbol.species] = Promise;
    
    // Create from existing promise
    static from(item : Loadable, promise : typeof Promise) : LoadablePromise {
        return new LoadablePromise((resolve, reject) => {
            promise.then(resolve, reject);
        }, item);
    }
    
    item = null;
    
    constructor(fulfill : Fulfill, item : Loadable) {
        super((resolve, reject) => {
            fulfill(
                value => { resolve(item[status].asReady(value)); },
                reason => { reject(new LoadError(reason, item[status].asFailed(reason))); },
            );
        });
        
        this.item = item;
    }
    
    // Similar to `then()`, but will be called:
    // - Once, synchronously, with the item in loading state, *if* the item is not already
    //   fulfilled synchronously.
    // - Second, when the item is fulfilled (resolved or rejected), with the item in the
    //   corresponding state (ready/failed).
    // In addition, `subscribe` does not distinguish between resolved/reject, it only takes
    // one function which is called regardless of the result (check the `status` instead).
    subscribe(subscriber : Loadable => void) : LoadablePromise {
        let fulfilled = false;
        
        const promise = this.then(
            itemReady => {
                fulfilled = true;
                subscriber(itemReady);
            },
            itemFailed => {
                fulfilled = true;
                subscriber(itemFailed);
            },
        );
        
        // FIXME: likely doesn't work as expected. `fulfilled` should never be true here, because `.then()`
        // is always schedules async. Possible solution: run the `fulfill` function ourselves and extract the
        // value synchronously.
        if (!fulfilled) {
            subscriber(this.item[status].asLoading());
        }
        
        return this;
    }
}
