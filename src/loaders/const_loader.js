
import status from '../interfaces/Status.js';
import { LoadablePromise } from '../interfaces/Loader.js';


// Trivial synchronous loader: just resolve with the given constant
export default constant => current => {
    // Ignore the current value and replace with the constant
    return new LoadablePromise(resolve => { resolve(constant); }, current);
};
