
import status from '../interfaces/status.js';

import { LoadablePromise } from '../interfaces/loader.js';


// Trivial synchronous loader: just resolve with the given constant
export default constant => current => {
    // Ignore the current value and replace with the constant
    return new LoadablePromise(resolve => { resolve(constant); }, current);
};
