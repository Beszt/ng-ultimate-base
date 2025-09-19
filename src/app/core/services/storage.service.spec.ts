import { TestBed } from '@angular/core/testing';

import { StorageService, type StorageScope } from './storage.service';

type StorageServicePrivateApi = {
  ensureStorage(scope: StorageScope): Storage | null;
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService],
    });

    service = TestBed.inject(StorageService);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      } catch {
        // ignore cleanup failures in restricted environments
      }
    }
  });

  it('stores and retrieves JSON data in local storage', () => {
    const payload = { hello: 'world', count: 2 };

    service.setLocal('demo.local', payload);

    expect(service.getLocal<typeof payload>('demo.local')).toEqual(payload);
  });

  it('stores and retrieves primitives from session storage', () => {
    service.set('demo.session', 42, 'session');

    expect(service.get<number>('demo.session', 'session')).toBe(42);
  });

  it('removes entries from storage', () => {
    service.setLocal('demo.clear', 'value');
    expect(service.getLocal('demo.clear')).toBe('value');

    service.removeLocal('demo.clear');

    expect(service.getLocal('demo.clear')).toBeNull();
  });

  it('falls back to in-memory storage when the target storage is unavailable', () => {
    spyOn(service as unknown as StorageServicePrivateApi, 'ensureStorage').and.returnValue(null);

    service.setLocal('demo.memory', { value: 1 });

    expect(service.getLocal<{ value: number }>('demo.memory')).toEqual({ value: 1 });

    service.clearLocal();

    expect(service.getLocal('demo.memory')).toBeNull();
  });
});
