/*

TODO

import { statusKey, Status } from './interfaces/Status.js';
import { itemKey, Loadable } from './interfaces/Loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/Loader.js';
import LoadableSimple from './loadable/LoadableSimple.js';


// npm run build:cjs && node lib-cjs/test.js

/*
TODO:
  - fix StatusMethods implementation (some standardized way to update item value or status)
* /

type User = { readonly name : string };


const userInitial : Loadable<User> = LoadableSimple<User>(null)[statusKey].asLoading();

const loadUser : LoadablePromise<User> = new LoadablePromise(
    (resolve, reject) => {
        setTimeout(() => {
            const userLoaded : Loadable<User> = userInitial[statusKey].asReady({ name: 'John' });
            resolve(userLoaded);
        }, 1000);
    },
    userInitial,
);

const loadUserFail : LoadablePromise<User> = new LoadablePromise(
    (resolve, reject) => {
        setTimeout(() => {
            const userFailed : Loadable<User> = userInitial[statusKey].asFailed(new Error('failed'));
            reject(userFailed);
        }, 1000);
    },
    userInitial,
);

(async () => {
    loadUser.subscribe(user => {
        console.log('subscriber:', user);
    });
    
    console.info('Loading...');
    const user : Loadable<User> = await loadUser;
    
    console.log('result', user[itemKey]);
    
    
    
    console.info('Testing failed...');
    loadUserFail.subscribe(user => {
        console.log('subscriber:', user);
    });
    
    console.info('Loading...');
    try {
        await loadUserFail;
    } catch (reason) {
        console.log('error:', reason);
    }
})();
*/
