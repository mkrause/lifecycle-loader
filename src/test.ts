
import { statusKey, Status } from './interfaces/status.js';
import { itemKey, Loadable } from './interfaces/loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/loader.js';
import LoadableSimple from './loadable/LoadableSimple.js';


// npm run build:cjs && node lib-cjs/test.js

/*
TODO:
  - Allow param `T` to be optional if the status is not known to be ready
  - fix StatusMethods implementation
*/

type User = { readonly name : string };
type UserOptional = { readonly name ?: string };


const userInitial : Loadable<UserOptional> = LoadableSimple<UserOptional>({ name: undefined })[statusKey].asLoading();

const loadUser : LoadablePromise<UserOptional> = new LoadablePromise(
    (resolve, reject) => {
        setTimeout(() => {
            const userLoaded : Loadable<UserOptional> = userInitial[statusKey].asReady({ name: 'John' });
            resolve(userLoaded);
        }, 1000);
    },
    userInitial,
);

const loadUserFail : LoadablePromise<UserOptional> = new LoadablePromise(
    (resolve, reject) => {
        setTimeout(() => {
            const userFailed : Loadable<UserOptional> = userInitial[statusKey].asFailed(new Error('failed'));
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
    const user : Loadable<UserOptional> = await loadUser;
    
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
