import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { AppConfig, RuntimeConfig } from '../config/config.model';

const SETTINGS_PATH = './assets/settings.json';

const DEFAULT_APP_CONFIG: AppConfig = {
  name: 'Demo Playground',
  storageNamespace: 'demo',
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private config: RuntimeConfig = { app: { ...DEFAULT_APP_CONFIG } };

  async load(): Promise<void> {
    try {
      const runtimeConfig = await firstValueFrom(
        this.http.get<Partial<RuntimeConfig>>(SETTINGS_PATH),
      );
      this.config = this.normalizeConfig(runtimeConfig);
    } catch (error) {
      console.warn('Failed to load runtime configuration, falling back to defaults.', error);
      this.config = this.normalizeConfig(undefined);
    }
  }

  get runtimeConfig(): RuntimeConfig {
    return this.config;
  }

  get appConfig(): AppConfig {
    return this.config.app;
  }

  storageKey(suffix: string): string {
    const namespace = this.appConfig.storageNamespace;
    return namespace ? `${namespace}.${suffix}` : suffix;
  }

  private normalizeConfig(raw?: Partial<RuntimeConfig>): RuntimeConfig {
    const appSection = raw?.app;

    const name =
      typeof appSection?.name === 'string' && appSection.name.trim().length > 0
        ? appSection.name.trim()
        : DEFAULT_APP_CONFIG.name;

    const storageNamespaceValue =
      typeof appSection?.storageNamespace === 'string'
        ? appSection.storageNamespace
        : DEFAULT_APP_CONFIG.storageNamespace;

    const sanitizedNamespace = this.normalizeNamespace(storageNamespaceValue);

    const rest = { ...(raw ?? {}) } as Record<string, unknown>;
    if ('app' in rest) {
      delete rest['app'];
    }

    return {
      ...rest,
      app: {
        name,
        storageNamespace: sanitizedNamespace,
      },
    };
  }

  private normalizeNamespace(namespace: string): string {
    const trimmed = namespace.trim();
    if (!trimmed) {
      return '';
    }

    return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  }
}
