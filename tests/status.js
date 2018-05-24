// @flow
declare var describe : Function;
declare var it : Function;

import chai, { assert, expect } from 'chai';

import statusKey from '../src/status.js';


describe('status', () => {
    it('should expose a unique status symbol', () => {
        expect(statusKey.toString()).to.equal('Symbol(status)');
    });
});
