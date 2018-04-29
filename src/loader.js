// @flow

import status from './status.js';


// A *loader* is a function that takes an item (the current state), and returns a promise
// for that item (re)loaded. To create a loader, a loader creator may be used to build a
// loader function from some specification.

export type Loader = Loadable => Promise<Loadable>;

type LoaderSpec = mixed;
export type LoaderCreator = (...args : Array<LoaderSpec>) => Loader;


// Extended version of `Promise` that works with loadable items.
// Note: although the ES6 spec allows extending Promise, babel by default does not support
// it. transform-builtin-extend must be configured to enable this.
// https://github.com/babel/babel/issues/1120
export class LoadablePromise extends Promise {
    item = null;
    
    // Create from existing promise
    static from(item, promise) {
        return new LoadablePromise((resolve, reject) => {
            promise.then(resolve, reject);
        }, item);
    }
    
    constructor(fulfill, item) {
        super((resolve, reject) => {
            fulfill(
                value => resolve(item[status].asReady(value)),
                reason => reject(item[status].asFailed(reason)),
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
    subscribe(subscriber) {
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
        
        if (!fulfilled) {
            subscriber(this.item[status].asLoading());
        }
        
        return this;
    }
}
