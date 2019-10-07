
import chai, { assert, expect } from 'chai';

import statusKey from '../../lib-esm/interfaces/status.js';


describe('status', () => {
    it('should expose a unique status symbol', () => {
        expect(typeof statusKey).to.equal('symbol');
        expect(statusKey.description).to.equal('lifecycle.status');
    });
});
