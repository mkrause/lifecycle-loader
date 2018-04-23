// @flow
declare var describe : Function;
declare var it : Function;

import chai, { assert, expect } from 'chai';

import Loadable, { status } from '../../src/loadable/Loadable.js';
import constLoader from '../../src/loaders/const_loader.js';


describe('constLoader', () => {
    it('should load constant', async () => {
        const load = constLoader(42);
        const itemInitial = Loadable(0);
        
        const itemReady = await load(itemInitial);
        
        expect(Number(itemReady)).to.equal(42);
        expect(itemReady[status]).to.have.property('ready', true);
        expect(itemReady[status]).to.have.property('loading', false);
        expect(itemReady[status]).to.have.property('error', null);
    });
});
