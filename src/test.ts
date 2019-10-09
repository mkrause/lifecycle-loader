
import { statusKey, Status } from './interfaces/status.js';
import { itemKey, Loadable } from './interfaces/loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/loader.js';


type User = { readonly name : string };
type UserOptional = { readonly name ?: string };

const LoadableSimple = <T>(item : T) : Loadable<T> => ({
    [itemKey]: item,
    [statusKey]: {
        ready: false,
        loading: false,
        error: null,
        asReady: function(this : Loadable<T>, itemReady : T) {
            // const itemCurrent = this;
            const itemCurrent = LoadableSimple(item);
            return {
                ...itemCurrent,
                [itemKey]: itemReady,
                [statusKey]: { ...itemCurrent[statusKey], ready: true },
            };
        },
        asFailed: function(this : Loadable<T>, reason : Error) {
            // const itemCurrent = this;
            const itemCurrent = LoadableSimple(item);
            return {
                ...itemCurrent,
                [statusKey]: { ...itemCurrent[statusKey], error: reason },
            };
        },
        asLoading: function(this : Loadable<T>) {
            // const itemCurrent = this;
            const itemCurrent = LoadableSimple(item);
            return {
                ...itemCurrent,
                [statusKey]: { ...itemCurrent[statusKey], loading: true },
            };
        },
    },
});

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

(async () => {
    loadUser.subscribe(user => {
        console.log('subscriber:', user);
    });
    
    console.info('Loading...');
    const user : Loadable<UserOptional> = await loadUser;
    
    console.log('result', user[itemKey]);
})();
