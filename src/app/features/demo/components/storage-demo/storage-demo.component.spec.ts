import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import type { StorageScope } from '../../../../core/services/storage.service';
import { StorageStore } from '../../../../core/store/storage.store';
import { StorageDemoComponent } from './storage-demo.component';

class StorageStoreStub {
  readonly localValue: Signal<string | null>;

  readonly sessionValue: Signal<string | null>;

  readonly availability: Signal<Record<StorageScope, boolean>>;

  readonly lastUpdatedScope: Signal<StorageScope | null>;

  readonly lastUpdatedAt: Signal<number | null>;

  readonly hydrate = jasmine.createSpy('hydrate');

  readonly saveLocal = jasmine.createSpy('saveLocal').and.callFake((value: string) => {
    this.localSignal.set(value);
    this.setAvailability('local', true);
    this.setLastUpdated('local', Date.now());
  });

  readonly saveSession = jasmine.createSpy('saveSession').and.callFake((value: string) => {
    this.sessionSignal.set(value);
    this.setAvailability('session', true);
    this.setLastUpdated('session', Date.now());
  });

  readonly clearLocal = jasmine.createSpy('clearLocal').and.callFake(() => {
    this.localSignal.set(null);
    this.setLastUpdated('local', Date.now());
  });

  readonly clearSession = jasmine.createSpy('clearSession').and.callFake(() => {
    this.sessionSignal.set(null);
    this.setLastUpdated('session', Date.now());
  });

  private readonly localSignal = signal<string | null>(null);

  private readonly sessionSignal = signal<string | null>(null);

  private readonly availabilitySignal = signal<Record<StorageScope, boolean>>({
    local: true,
    session: true,
  });

  private readonly lastScopeSignal = signal<StorageScope | null>(null);

  private readonly lastAtSignal = signal<number | null>(null);

  constructor() {
    this.localValue = this.localSignal.asReadonly();
    this.sessionValue = this.sessionSignal.asReadonly();
    this.availability = this.availabilitySignal.asReadonly();
    this.lastUpdatedScope = this.lastScopeSignal.asReadonly();
    this.lastUpdatedAt = this.lastAtSignal.asReadonly();
  }

  setLocalValue(value: string | null): void {
    this.localSignal.set(value);
  }

  setSessionValue(value: string | null): void {
    this.sessionSignal.set(value);
  }

  setAvailability(scope: StorageScope, isAvailable: boolean): void {
    this.availabilitySignal.update((current) => ({ ...current, [scope]: isAvailable }));
  }

  setLastUpdated(scope: StorageScope | null, timestamp: number | null): void {
    this.lastScopeSignal.set(scope);
    this.lastAtSignal.set(timestamp);
  }
}

describe('StorageDemoComponent', () => {
  let fixture: ComponentFixture<StorageDemoComponent>;
  let store: StorageStoreStub;

  beforeEach(async () => {
    store = new StorageStoreStub();

    await TestBed.configureTestingModule({
      imports: [
        StorageDemoComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [{ provide: StorageStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(StorageDemoComponent);

    const translate = TestBed.inject(TranslateService);
    translate.use('en');

    fixture.detectChanges();
  });

  it('calls hydrate on init', () => {
    expect(store.hydrate).toHaveBeenCalled();
  });

  it('mirrors values coming from the store in the template', () => {
    store.setLocalValue('Local note');
    store.setSessionValue('Session note');
    fixture.detectChanges();

    const [localSection, sessionSection] = getSections(fixture);

    const localValue = getText(localSection.querySelector('.break-words'));
    const sessionValue = getText(sessionSection.querySelector('.break-words'));

    expect(localValue).toContain('Local note');
    expect(sessionValue).toContain('Session note');
  });

  it('delegates saving actions to the store', () => {
    const [localSection] = getSections(fixture);
    const input = localSection.querySelector('input');
    const buttons = localSection.querySelectorAll<HTMLButtonElement>('button');
    const saveButton = buttons.item(0);

    expect(input).not.toBeNull();
    const typedInput = input as HTMLInputElement;
    typedInput.value = 'Draft value';
    typedInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    saveButton.click();

    expect(store.saveLocal).toHaveBeenCalledWith('Draft value');
  });

  it('delegates clearing actions to the store', () => {
    store.setSessionValue('Session note');
    fixture.detectChanges();

    const [, sessionSection] = getSections(fixture);
    const buttons = sessionSection.querySelectorAll<HTMLButtonElement>('button');
    const clearButton = buttons.item(1);

    expect(clearButton.disabled).toBeFalse();

    clearButton.click();

    expect(store.clearSession).toHaveBeenCalled();
  });
});

function getSections(fixture: ComponentFixture<StorageDemoComponent>): [HTMLElement, HTMLElement] {
  const host = fixture.nativeElement as HTMLElement;
  const sections = host.querySelectorAll<HTMLElement>('section');

  expect(sections.length).toBeGreaterThanOrEqual(2);
  return [sections.item(0), sections.item(1)];
}

function getText(element: Element | null): string {
  expect(element).not.toBeNull();
  return (element as HTMLElement).textContent?.trim() ?? '';
}
