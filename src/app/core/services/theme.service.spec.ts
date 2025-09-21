/* eslint-disable @typescript-eslint/unbound-method */
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';

class MockMediaQueryList implements MediaQueryList {
  matches: boolean;
  media = '(prefers-color-scheme: dark)';
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null = null;

  private readonly listeners = new Set<(event: MediaQueryListEvent) => void>();

  constructor(initialMatch: boolean) {
    this.matches = initialMatch;
  }

  addEventListener(_type: string, listener: EventListenerOrEventListenerObject): void {
    if (typeof listener === 'function') {
      this.listeners.add(listener as (event: MediaQueryListEvent) => void);
    }
  }

  removeEventListener(_type: string, listener: EventListenerOrEventListenerObject): void {
    if (typeof listener === 'function') {
      this.listeners.delete(listener as (event: MediaQueryListEvent) => void);
    }
  }

  addListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void): void {
    this.listeners.delete(listener);
  }

  dispatch(matches: boolean): void {
    this.matches = matches;
    const event = { matches } as MediaQueryListEvent;
    this.listeners.forEach((listener) => listener.call(this, event));
    this.onchange?.call(this, event);
  }

  dispatchEvent(event: Event): boolean {
    void event;
    return true;
  }
}

describe('ThemeService', () => {
  let service: ThemeService;
  let storage: jasmine.SpyObj<StorageService>;
  let mediaQuery: MockMediaQueryList;
  let originalMatchMedia: ((query: string) => MediaQueryList) | undefined;
  let documentElement: HTMLElement;

  beforeEach(() => {
    storage = jasmine.createSpyObj<StorageService>('StorageService', [
      'getLocal',
      'setLocal',
      'removeLocal',
    ]);
    storage.getLocal.and.returnValue(null);

    mediaQuery = new MockMediaQueryList(false);
    originalMatchMedia = window.matchMedia;
    (window as typeof window & { matchMedia?: (query: string) => MediaQueryList }).matchMedia =
      jasmine.createSpy('matchMedia').and.returnValue(mediaQuery as unknown as MediaQueryList);

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: StorageService, useValue: storage }],
    });

    documentElement = TestBed.inject(DOCUMENT).documentElement;
    documentElement.removeAttribute('data-theme');
    documentElement.classList.remove('dark');
    documentElement.style.removeProperty('color-scheme');
    TestBed.inject(DOCUMENT).body?.classList.remove('dark');
    TestBed.inject(DOCUMENT).body?.removeAttribute('data-theme');

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    documentElement.removeAttribute('data-theme');
    documentElement.classList.remove('dark');
    documentElement.style.removeProperty('color-scheme');
    TestBed.inject(DOCUMENT).body?.classList.remove('dark');
    TestBed.inject(DOCUMENT).body?.removeAttribute('data-theme');
    storage.getLocal.calls.reset();
    storage.setLocal.calls.reset();
    storage.removeLocal.calls.reset();
  });

  afterAll(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('initializes with the stored theme when available', () => {
    storage.getLocal.and.returnValue('dark');

    service.init();

    expect(documentElement.dataset['theme']).toBe('dark');
    expect(documentElement.classList.contains('dark')).toBeTrue();
    expect(service.theme()).toBe('dark');
    expect(service.isSystemPreferenceActive()).toBeFalse();
    expect(storage.setLocal).not.toHaveBeenCalled();
  });

  it('falls back to the system theme when no stored preference exists', () => {
    mediaQuery.dispatch(true);

    service.init();

    expect(documentElement.dataset['theme']).toBe('dark');
    expect(service.theme()).toBe('dark');
    expect(service.isSystemPreferenceActive()).toBeTrue();
  });

  it('persists manual theme changes and toggles Tailwind classes', () => {
    mediaQuery.dispatch(true);
    service.init();
    storage.setLocal.calls.reset();

    const next = service.toggleTheme();

    expect(next).toBe('light');
    expect(storage.setLocal).toHaveBeenCalledWith('demo.theme', 'light');
    expect(service.isSystemPreferenceActive()).toBeFalse();
    expect(documentElement.dataset['theme']).toBe('light');
    expect(documentElement.classList.contains('dark')).toBeFalse();
    expect(document.body?.classList.contains('dark')).toBeFalse();
  });

  it('ignores subsequent system changes after an explicit selection', () => {
    service.init();
    service.setTheme('dark');

    mediaQuery.dispatch(false);

    expect(service.isSystemPreferenceActive()).toBeFalse();
    expect(documentElement.dataset['theme']).toBe('dark');
  });

  it('returns to following the system preference when requested', () => {
    storage.getLocal.and.returnValue('dark');
    mediaQuery.dispatch(false);
    service.init();
    storage.getLocal.and.returnValue(null);

    const theme = service.useSystemPreference();

    expect(theme).toBe('light');
    expect(storage.removeLocal).toHaveBeenCalledWith('demo.theme');
    expect(service.isSystemPreferenceActive()).toBeTrue();
    expect(documentElement.dataset['theme']).toBe('light');

    mediaQuery.dispatch(true);

    expect(documentElement.dataset['theme']).toBe('dark');
  });
});
