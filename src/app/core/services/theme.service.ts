import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import type { OnDestroy, Signal, WritableSignal } from '@angular/core';

import type { ThemeName } from '../models/theme-name.model';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';

const DARK_VARIANT_CLASS = 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  readonly theme: Signal<ThemeName>;
  readonly isDark: Signal<boolean>;
  readonly availableThemes: ReadonlyArray<ThemeName> = ['light', 'dark'];
  readonly isSystemPreferenceActive: Signal<boolean>;

  private readonly themeSignal: WritableSignal<ThemeName>;
  private readonly followSystem: WritableSignal<boolean>;
  private readonly documentRef = inject(DOCUMENT);
  private readonly storage = inject(StorageService);
  private readonly config = inject(ConfigService);
  private readonly themeStorageKey = this.config.storageKey('theme');
  private readonly prefersDarkQuery = this.resolvePrefersDarkQuery();

  private readonly cleanup: Array<() => void> = [];
  private registeredSystemListener = false;

  constructor() {
    this.themeSignal = signal<ThemeName>('light');
    this.followSystem = signal(true);

    this.theme = this.themeSignal.asReadonly();
    this.isDark = computed(() => this.themeSignal() === 'dark');
    this.isSystemPreferenceActive = this.followSystem.asReadonly();
  }

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
    this.storage.setLocal(this.themeStorageKey, theme);
    this.applyTheme(theme);

    return theme;
  }

  toggleTheme(): ThemeName {
    const nextTheme: ThemeName = this.themeSignal() === 'dark' ? 'light' : 'dark';
    return this.setTheme(nextTheme);
  }

  useSystemPreference(): ThemeName {
    this.followSystem.set(true);
    this.storage.removeLocal(this.themeStorageKey);

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
    const stored = this.storage.getLocal<ThemeName | null>(this.themeStorageKey);
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
