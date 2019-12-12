
import { Loadable, statusKey, asReady } from '../interfaces/Loadable.js';
import { LoadablePromise } from '../interfaces/Loader.js';


// Trivial loader: just resolve with the given constant
export default <T>(constant : T) => (current : Loadable<T>) => {
    return new LoadablePromise(
        resolve => {
            resolve(asReady(current, constant));
        },
        current
    );
};
