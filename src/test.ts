
import { statusKey, Status } from './interfaces/status.js';
import { itemKey, Loadable } from './interfaces/loadable.js';
import { Loader, LoaderCreator, LoadError, LoadablePromise } from './interfaces/loader.js';


type User = { readonly name : string };
type UserOptional = { readonly name ?: string };

const Loadable = <T>(item : T) : Loadable<T> => ({
    [itemKey]: item,
    [statusKey]: {
        ready: false,
        loading: false,
        error: null,
        asReady: (itemReady : T) => Loadable(item), // TODO: update status
        asFailed: (reason : Error) => Loadable(item), // TODO: update status
        asLoading: () => Loadable(item), // TODO: update status
    },
});

const userInitial : Loadable<UserOptional> = Loadable<UserOptional>({ name: undefined });

/*
const loadUser : LoadablePromise<User> = new LoadablePromise(
    (resolve, reject) => {
        setTimeout(() => {
            const userLoaded : Loadable<User> = userInitial[status].asReady({ name: 'John' });
            resolve(userLoaded);
        }, 1000);
    },
    userInitial,
);

const user : Loadable<User> = await loadUser;

loadUser.subscribe(user => {});
*/
