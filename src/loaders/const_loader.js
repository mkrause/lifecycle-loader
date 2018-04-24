
import { status } from '../loadable/Loadable.js';


// Trivial synchronous loader: just resolve with the given constant
export default constant => current => {
    // Ignore the current value and replace with the constant
    return Promise.resolve(current[status].asReady(constant));
};
