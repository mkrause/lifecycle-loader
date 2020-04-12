
import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import * as Loadable from '../../lib-esm/interfaces/Loadable.js';
import * as Loader from '../../lib-esm/interfaces/Loader.js';


chai.use(chaiAsPromised);

describe('Loader', () => {
    describe('symbols', () => {
        it('should expose a unique `resourceKey` symbol', () => {
            expect(Loader.resourceKey).to.be.a('symbol');
        });
    });
    
    describe('fromPromise', () => {
        it('should resolve to resource with status ready, if promise resolves', async () => {
            const promise = new Promise((resolve, reject) => { resolve({ name: 'john' }); });
            
            const promiseWithResource = Loader.fromPromise(promise);
            
            expect(promiseWithResource).to.be.an.instanceOf(Promise);
            expect(promiseWithResource).to.have.property(Loader.resourceKey)
                .to.have.property(Loadable.itemKey).to.equal(undefined);
            expect(promiseWithResource).to.have.property(Loader.resourceKey)
                .to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: true,
                    error: null,
                });
            
            expect(promiseWithResource).to.eventually.deep.equal({ name: 'john' });
            
            const resourceReady = await promiseWithResource;
            
            expect(resourceReady).to.have.property(Loadable.itemKey).to.deep.equal({ name: 'john' });
            expect(resourceReady).to.have.property(Loadable.statusKey).to.deep.equal({
                ready: true,
                loading: false,
                error: null,
            });
        });
        
        it('should resolve to LoadError with failed resource, if promise rejects', async () => {
            const error = new Error('fail');
            const promise = new Promise((resolve, reject) => { reject(error); });
            
            const promiseWithResource = Loader.fromPromise(promise);
            
            expect(promiseWithResource).to.be.an.instanceOf(Promise);
            expect(promiseWithResource).to.have.property(Loader.resourceKey)
                .to.have.property(Loadable.itemKey).to.equal(undefined);
            expect(promiseWithResource).to.have.property(Loader.resourceKey)
                .to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: true,
                    error: null,
                });
            
            expect(promiseWithResource).to.be.rejectedWith(Loader.LoadError);
            
            try {
                await promiseWithResource;
                assert(false);
            } catch (reason) {
                expect(reason).to.be.an.instanceOf(Loader.LoadError);
                
                const resourceFailed = reason[Loader.resourceKey];
                
                expect(resourceFailed).to.have.property(Loadable.itemKey).to.equal(undefined);
                expect(resourceFailed).to.have.property(Loadable.statusKey).to.deep.equal({
                    ready: false,
                    loading: false,
                    error: error,
                });
            }
        });
        
        describe('subscribe()', () => {
            it('should call subscriber with loading, then ready', async () => {
                const promise = new Promise((resolve, reject) => { resolve({ name: 'john' }); });
                const subscriberMock = sinon.stub();
                
                const promiseWithResource = Loader.fromPromise(promise);
                
                const resourceLoading = promiseWithResource[Loader.resourceKey]
                
                promiseWithResource.subscribe(subscriberMock);
                
                const resourceReady = await promiseWithResource;
                
                sinon.assert.calledTwice(subscriberMock);
                sinon.assert.calledWith(subscriberMock.firstCall, resourceLoading);
                sinon.assert.calledWith(subscriberMock.secondCall, resourceReady);
            });
            
            it('should call subscriber with loading, then failed', async () => {
                const error = new Error('fail');
                const promise = new Promise((resolve, reject) => { reject(error); });
                const subscriberMock = sinon.stub();
                
                const promiseWithResource = Loader.fromPromise(promise);
                
                const resourceLoading = promiseWithResource[Loader.resourceKey]
                
                promiseWithResource.subscribe(subscriberMock);
                
                try {
                    await promiseWithResource;
                    assert(false);
                } catch (reason) {
                    const resourceFailed = reason[Loader.resourceKey];
                    
                    sinon.assert.calledTwice(subscriberMock);
                    sinon.assert.calledWith(subscriberMock.firstCall, resourceLoading);
                    sinon.assert.calledWith(subscriberMock.secondCall, resourceFailed);
                }
            });
        });
    });
});
