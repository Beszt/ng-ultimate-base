import { InjectionToken } from '@angular/core';

import type { AppConfig } from '../../../environments/environment.model';
import { environment } from '../../../environments/environment';

const normalizeNamespace = (namespace: string): string => {
  const trimmed = namespace.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
};

export const APP_CONFIG_VALUE: AppConfig = {
  ...environment.app,
  storageNamespace: normalizeNamespace(environment.app.storageNamespace),
};

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => APP_CONFIG_VALUE,
});

export const appStorageKey = (suffix: string): string =>
  APP_CONFIG_VALUE.storageNamespace ? `${APP_CONFIG_VALUE.storageNamespace}.${suffix}` : suffix;
