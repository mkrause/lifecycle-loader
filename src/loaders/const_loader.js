
import { status } from '../loadable/Loadable.js';


// Trivial loader: just return an empty
export default constant => current => {
    // Ignore the current value and replace with the constant
    return Promise.resolve(current[status].asReady(constant));
};
