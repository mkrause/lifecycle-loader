
import chai, { assert, expect } from 'chai';

import status from '../../lib-esm/interfaces/status.js';
import Loadable from '../../lib-esm/loadable/LoadableProxy.js';
import asyncLoader from '../../lib-esm/loaders/async_loader.js';


describe('asyncLoader', () => {
    /*
    it('should be subscribable', done => {
        const load = asyncLoader(42);
        const itemInitial = Loadable(0);
        
        let resolved = false;
        load(itemInitial)
            .subscribe(item => {
                if (!resolved) {
                    expect(Number(item)).to.equal(0);
                    expect(item[status]).to.have.property('ready', false);
                    expect(item[status]).to.have.property('loading', true);
                    expect(item[status]).to.have.property('error', null);
                } else {
                    expect(Number(item)).to.equal(42);
                    expect(item[status]).to.have.property('ready', true);
                    expect(item[status]).to.have.property('loading', false);
                    expect(item[status]).to.have.property('error', null);
                }
                resolved = true;
            })
            .then(itemReady => {
                expect(Number(itemReady)).to.equal(42);
                expect(itemReady[status]).to.have.property('ready', true);
                expect(itemReady[status]).to.have.property('loading', false);
                expect(itemReady[status]).to.have.property('error', null);
                
                done();
            });
    });
    
    it('should be awaitable', async () => {
        const load = asyncLoader(42);
        const itemInitial = Loadable(0);
        
        const itemReady = await load(itemInitial);
        expect(Number(itemReady)).to.equal(42);
        expect(itemReady[status]).to.have.property('ready', true);
        expect(itemReady[status]).to.have.property('loading', false);
        expect(itemReady[status]).to.have.property('error', null);
    });
    */
});
