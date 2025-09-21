import { Injectable } from '@angular/core';
import type { StorageScope } from '../models/storage-scope.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly fallback = new Map<StorageScope, Map<string, string>>();
  private readonly trackedKeys = new Map<StorageScope, Set<string>>();
  private readonly storageCache = new Map<StorageScope, Storage | null>();

  set<T>(key: string, value: T, scope: StorageScope = 'local'): void {
    if (!key) {
      return;
    }

    const serialized = this.stringify(value);
    if (serialized === undefined) {
      this.remove(key, scope);
      return;
    }

    const persisted =
      this.withStorage(scope, (storage) => {
        storage.setItem(key, serialized);
        return true;
      }) ?? false;

    if (!persisted) {
      this.fallbackStore(scope).set(key, serialized);
    } else {
      this.fallbackStore(scope).delete(key);
    }

    this.trackKey(scope, key);
  }

  setLocal<T>(key: string, value: T): void {
    this.set(key, value, 'local');
  }

  setSession<T>(key: string, value: T): void {
    this.set(key, value, 'session');
  }

  get<T>(key: string, scope: StorageScope = 'local'): T | null {
    if (!key) {
      return null;
    }

    const raw = this.withStorage(scope, (storage) => storage.getItem(key));
    const resolved = raw ?? this.fallbackStore(scope).get(key);

    if (resolved === undefined || resolved === null) {
      return null;
    }

    return this.parse<T>(resolved);
  }

  getLocal<T>(key: string): T | null {
    return this.get<T>(key, 'local');
  }

  getSession<T>(key: string): T | null {
    return this.get<T>(key, 'session');
  }

  remove(key: string, scope: StorageScope = 'local'): void {
    if (!key) {
      return;
    }

    this.withStorage(scope, (storage) => {
      storage.removeItem(key);
    });

    this.fallbackStore(scope).delete(key);
    this.untrackKey(scope, key);
  }

  removeLocal(key: string): void {
    this.remove(key, 'local');
  }

  removeSession(key: string): void {
    this.remove(key, 'session');
  }

  clear(scope: StorageScope = 'local'): void {
    const keys = Array.from(this.trackedKeys.get(scope) ?? []);
    keys.forEach((trackedKey) => this.remove(trackedKey, scope));
  }

  clearLocal(): void {
    this.clear('local');
  }

  clearSession(): void {
    this.clear('session');
  }

  isAvailable(scope: StorageScope = 'local'): boolean {
    return this.ensureStorage(scope) !== null;
  }

  private ensureStorage(scope: StorageScope): Storage | null {
    if (this.storageCache.has(scope)) {
      return this.storageCache.get(scope)!;
    }

    const storage = this.resolveStorage(scope);
    this.storageCache.set(scope, storage);
    return storage;
  }

  private resolveStorage(scope: StorageScope): Storage | null {
    const globalRef =
      typeof globalThis !== 'undefined'
        ? (globalThis as typeof globalThis & {
            localStorage?: Storage;
            sessionStorage?: Storage;
          })
        : undefined;

    if (!globalRef) {
      return null;
    }

    const property = scope === 'local' ? 'localStorage' : 'sessionStorage';

    if (!(property in globalRef)) {
      return null;
    }

    const storage = globalRef[property];
    if (!storage) {
      return null;
    }

    try {
      const probeKey = '__ng_ultimate_storage_probe__';
      storage.setItem(probeKey, probeKey);
      storage.removeItem(probeKey);
      return storage;
    } catch {
      return null;
    }
  }

  private fallbackStore(scope: StorageScope): Map<string, string> {
    let store = this.fallback.get(scope);
    if (!store) {
      store = new Map<string, string>();
      this.fallback.set(scope, store);
    }
    return store;
  }

  private trackKey(scope: StorageScope, key: string): void {
    let registry = this.trackedKeys.get(scope);
    if (!registry) {
      registry = new Set<string>();
      this.trackedKeys.set(scope, registry);
    }
    registry.add(key);
  }

  private untrackKey(scope: StorageScope, key: string): void {
    const registry = this.trackedKeys.get(scope);
    if (!registry) {
      return;
    }

    registry.delete(key);

    if (registry.size === 0) {
      this.trackedKeys.delete(scope);
    }
  }

  private stringify(value: unknown): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return undefined;
    }
  }

  private parse<T>(raw: string): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  private withStorage<T>(scope: StorageScope, attempt: (storage: Storage) => T): T | undefined {
    const storage = this.ensureStorage(scope);
    if (!storage) {
      return undefined;
    }

    try {
      return attempt(storage);
    } catch {
      this.storageCache.set(scope, null);
      return undefined;
    }
  }
}
