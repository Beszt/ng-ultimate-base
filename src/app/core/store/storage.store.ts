import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import type { StorageScope } from '../services/storage.service';
import { StorageService } from '../services/storage.service';
import { appStorageKey } from '../config/app-config.token';

type StorageState = {
  localKey: string;
  sessionKey: string;
  localValue: string | null;
  sessionValue: string | null;
  lastUpdatedScope: StorageScope | null;
  lastUpdatedAt: number | null;
  availability: Record<StorageScope, boolean>;
};

const LOCAL_NOTE_KEY = appStorageKey('localNote');
const SESSION_NOTE_KEY = appStorageKey('sessionNote');

export const StorageStore = signalStore(
  { providedIn: 'root' },

  withState<StorageState>({
    localKey: LOCAL_NOTE_KEY,
    sessionKey: SESSION_NOTE_KEY,
    localValue: null,
    sessionValue: null,
    lastUpdatedScope: null,
    lastUpdatedAt: null,
    availability: { local: false, session: false },
  }),

  withMethods((store) => {
    const storage = inject(StorageService);

    const updateAvailability = (scope: StorageScope): void => {
      const availability = store.availability();
      const nextAvailability = { ...availability, [scope]: storage.isAvailable(scope) };
      patchState(store, { availability: nextAvailability });
    };

    const stamp = (scope: StorageScope): void => {
      patchState(store, {
        lastUpdatedScope: scope,
        lastUpdatedAt: Date.now(),
      });
    };

    const hydrate = (): void => {
      const localAvailable = storage.isAvailable('local');
      const sessionAvailable = storage.isAvailable('session');

      patchState(store, {
        availability: { local: localAvailable, session: sessionAvailable },
        localValue: localAvailable ? storage.get<string>(store.localKey()) : null,
        sessionValue: sessionAvailable ? storage.get<string>(store.sessionKey(), 'session') : null,
      });
    };

    const saveLocal = (value: string): void => {
      storage.setLocal(store.localKey(), value);
      patchState(store, { localValue: value });
      updateAvailability('local');
      stamp('local');
    };

    const saveSession = (value: string): void => {
      storage.setSession(store.sessionKey(), value);
      patchState(store, { sessionValue: value });
      updateAvailability('session');
      stamp('session');
    };

    const clearLocal = (): void => {
      storage.removeLocal(store.localKey());
      patchState(store, { localValue: null });
      updateAvailability('local');
      stamp('local');
    };

    const clearSession = (): void => {
      storage.removeSession(store.sessionKey());
      patchState(store, { sessionValue: null });
      updateAvailability('session');
      stamp('session');
    };

    return {
      hydrate,
      saveLocal,
      saveSession,
      clearLocal,
      clearSession,
    };
  }),
);
