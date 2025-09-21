/* eslint-disable @typescript-eslint/member-ordering */
import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import type { OnDestroy } from '@angular/core';

import { appStorageKey } from '../config/app-config.token';
import type { ThemeName } from '../models/theme-name.model';
import { StorageService } from './storage.service';

const THEME_STORAGE_KEY = appStorageKey('theme');
const DARK_VARIANT_CLASS = 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly themeSignal = signal<ThemeName>('light');
  private readonly followSystem = signal(true);

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');
  readonly availableThemes: ReadonlyArray<ThemeName> = ['light', 'dark'];
  readonly isSystemPreferenceActive = this.followSystem.asReadonly();

  private readonly documentRef = inject(DOCUMENT);
  private readonly storage = inject(StorageService);
  private readonly prefersDarkQuery = this.resolvePrefersDarkQuery();

  private readonly cleanup: Array<() => void> = [];
  private registeredSystemListener = false;

  init(): void {
    const stored = this.restoreStoredTheme();

    if (stored) {
      this.followSystem.set(false);
      this.applyTheme(stored);
    } else {
      this.followSystem.set(true);
      this.applyTheme(this.prefersDarkQuery?.matches ? 'dark' : 'light');
    }

    this.registerSystemPreferenceListener();
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((dispose) => dispose());
    this.cleanup.length = 0;
    this.registeredSystemListener = false;
  }

  setTheme(theme: ThemeName): ThemeName {
    if (!this.isThemeName(theme)) {
      return this.themeSignal();
    }

    this.followSystem.set(false);
    this.storage.setLocal(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);

    return theme;
  }

  toggleTheme(): ThemeName {
    const nextTheme: ThemeName = this.themeSignal() === 'dark' ? 'light' : 'dark';
    return this.setTheme(nextTheme);
  }

  useSystemPreference(): ThemeName {
    this.followSystem.set(true);
    this.storage.removeLocal(THEME_STORAGE_KEY);

    const theme: ThemeName = this.prefersDarkQuery?.matches ? 'dark' : 'light';
    this.applyTheme(theme);

    return theme;
  }

  private applyTheme(theme: ThemeName): void {
    const documentElement = this.documentRef?.documentElement;
    if (!documentElement) {
      this.themeSignal.set(theme);
      return;
    }

    documentElement.dataset['theme'] = theme;
    documentElement.classList.toggle(DARK_VARIANT_CLASS, theme === 'dark');
    documentElement.style.setProperty('color-scheme', theme);

    const body = this.documentRef.body;
    if (body) {
      body.dataset['theme'] = theme;
      body.classList.toggle(DARK_VARIANT_CLASS, theme === 'dark');
    }

    this.themeSignal.set(theme);
  }

  private restoreStoredTheme(): ThemeName | null {
    const stored = this.storage.getLocal<ThemeName | null>(THEME_STORAGE_KEY);
    return this.isThemeName(stored) ? stored : null;
  }

  private registerSystemPreferenceListener(): void {
    const query = this.prefersDarkQuery;
    if (!query || this.registeredSystemListener) {
      return;
    }

    const handler = (event: MediaQueryListEvent | MediaQueryList): void => {
      if (!this.followSystem()) {
        return;
      }

      const matches = 'matches' in event ? event.matches : query.matches;
      this.applyTheme(matches ? 'dark' : 'light');
    };

    if (typeof query.addEventListener === 'function') {
      const listener = handler as EventListener;
      query.addEventListener('change', listener);
      this.cleanup.push(() => query.removeEventListener('change', listener));
    } else if ('addListener' in query && typeof query.addListener === 'function') {
      const legacyListener = handler as (event: MediaQueryListEvent) => void;
      query.addListener(legacyListener);
      this.cleanup.push(() => {
        if ('removeListener' in query && typeof query.removeListener === 'function') {
          query.removeListener(legacyListener);
        }
      });
    }

    this.registeredSystemListener = true;
  }

  private resolvePrefersDarkQuery(): MediaQueryList | undefined {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    try {
      return window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return undefined;
    }
  }

  private isThemeName(value: unknown): value is ThemeName {
    return value === 'light' || value === 'dark';
  }
}
