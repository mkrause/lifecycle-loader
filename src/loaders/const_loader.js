
import status from '../status.js';

import { LoadablePromise } from '../loader.js';


// Trivial synchronous loader: just resolve with the given constant
export default constant => current => {
    // Ignore the current value and replace with the constant
    return new LoadablePromise(resolve => { resolve(constant); }, current);
};
