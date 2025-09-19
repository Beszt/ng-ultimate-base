import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { StorageScope } from '../services/storage.service';
import { StorageService } from '../services/storage.service';
import { StorageStore } from './storage.store';

type StorageStoreContract = {
  localValue: () => string | null;
  sessionValue: () => string | null;
  availability: () => Record<StorageScope, boolean>;
  lastUpdatedScope: () => StorageScope | null;
  lastUpdatedAt: () => number | null;
  hydrate: () => void;
  saveLocal: (value: string) => void;
  saveSession: (value: string) => void;
  clearLocal: () => void;
  clearSession: () => void;
};

describe('StorageStore', () => {
  let store: StorageStoreContract;
  let storage: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storage = jasmine.createSpyObj<StorageService>('StorageService', [
      'isAvailable',
      'get',
      'setLocal',
      'setSession',
      'removeLocal',
      'removeSession',
    ]);

    storage.isAvailable.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [StorageStore, { provide: StorageService, useValue: storage }],
    });

    store = TestBed.runInInjectionContext(() => inject(StorageStore));
  });

  it('hydrates the state with persisted values', () => {
    storage.isAvailable.and.callFake((scope?: StorageScope) => scope !== 'session');
    storage.get.and.callFake(<T>(key: string): T | null => {
      expect(key).toBe('demo.localNote');
      return 'local-value' as unknown as T;
    });

    store.hydrate();

    expect(storage.get.calls.count()).toBe(1);
    expect(storage.get.calls.first().args).toEqual(['demo.localNote']);
    expect(store.localValue()).toBe('local-value');
    expect(store.sessionValue()).toBeNull();
    expect(store.availability()).toEqual({ local: true, session: false });
  });

  it('hydrates both scopes when storage is available', () => {
    storage.isAvailable.and.returnValue(true);
    storage.get.and.callFake(
      <T>(key: string, scope?: StorageScope): T | null =>
        (scope === 'session' ? 'session-value' : 'local-value') as unknown as T,
    );

    store.hydrate();

    const allArgs = storage.get.calls.allArgs();
    expect(allArgs).toEqual(
      jasmine.arrayContaining([['demo.localNote'], ['demo.sessionNote', 'session']]),
    );
    expect(store.localValue()).toBe('local-value');
    expect(store.sessionValue()).toBe('session-value');
    expect(store.availability()).toEqual({ local: true, session: true });
  });

  it('delegates saving to the storage service and updates the local state', () => {
    storage.setLocal.and.stub();

    store.saveLocal('hello');

    expect(storage.setLocal.calls.mostRecent().args).toEqual(['demo.localNote', 'hello']);
    expect(store.localValue()).toBe('hello');
    expect(store.lastUpdatedScope()).toBe('local');
    expect(store.lastUpdatedAt()).toEqual(jasmine.any(Number));
  });

  it('clears the session scope via the storage service', () => {
    storage.setSession.and.stub();
    storage.removeSession.and.stub();

    store.saveSession('world');
    store.clearSession();

    expect(storage.removeSession.calls.mostRecent().args).toEqual(['demo.sessionNote']);
    expect(store.sessionValue()).toBeNull();
    expect(store.lastUpdatedScope()).toBe('session');
  });
});
