// @flow
declare var describe : Function;
declare var it : Function;

import chai, { assert, expect } from 'chai';

import statusKey from '../../src/interfaces/status.js';
import loadableFromStatus from '../../src/loadable/fromStatus.js';


describe('fromStatus', () => {
    it('should create an object with item and its status', () => {
        const item = 42;
        
        const status = {
            ready: true,
            loading: false,
            error: null,
        };
        
        expect(loadableFromStatus(status, item)).to.have.property(statusKey, status);
        expect(loadableFromStatus(status, item)).to.have.property('item', item);
    });
});
