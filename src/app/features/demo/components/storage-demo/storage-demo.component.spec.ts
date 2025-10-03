import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import type { AppConfig } from '../../../../core/config/config.model';
import type { StorageScope } from '../../../../core/models/storage-scope.model';
import { ConfigService } from '../../../../core/services/config.service';
import { StorageService } from '../../../../core/services/storage.service';
import { StorageDemoComponent } from './storage-demo.component';

class ConfigServiceStub {
  private readonly app: AppConfig = {
    name: 'Demo Playground',
    storageNamespace: 'demo.test',
  };

  get runtimeConfig(): { app: AppConfig } {
    return { app: this.app };
  }

  get appConfig(): AppConfig {
    return this.app;
  }

  storageKey(suffix: string): string {
    return `${this.app.storageNamespace}.${suffix}`;
  }
}

describe('StorageDemoComponent', () => {
  let fixture: ComponentFixture<StorageDemoComponent>;
  let storage: jasmine.SpyObj<StorageService>;
  let config: ConfigServiceStub;

  beforeEach(async () => {
    storage = jasmine.createSpyObj<StorageService>('StorageService', [
      'isAvailable',
      'getLocal',
      'getSession',
      'setLocal',
      'setSession',
      'removeLocal',
      'removeSession',
    ]);

    storage.isAvailable.and.callFake((scope: StorageScope = 'local') => scope !== undefined);
    storage.getLocal.and.returnValue(null);
    storage.getSession.and.returnValue(null);
    storage.setLocal.and.stub();
    storage.setSession.and.stub();
    storage.removeLocal.and.stub();
    storage.removeSession.and.stub();

    await TestBed.configureTestingModule({
      imports: [
        StorageDemoComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: StorageService, useValue: storage },
        { provide: ConfigService, useClass: ConfigServiceStub },
      ],
    }).compileComponents();

    config = TestBed.inject(ConfigService) as unknown as ConfigServiceStub;

    fixture = TestBed.createComponent(StorageDemoComponent);

    const translate = TestBed.inject(TranslateService);
    translate.use('en');
  });

  it('hydrates values on init', () => {
    const localKey = config.storageKey('localNote');

    storage.isAvailable.and.callFake((scope: StorageScope = 'local') => scope === 'local');
    storage.getLocal.and.returnValue('Local note');
    storage.getSession.and.returnValue('Session note');

    fixture.detectChanges();

    expect(storage.isAvailable.calls.allArgs()).toEqual([['local'], ['session']]);
    expect(storage.getLocal.calls.argsFor(0)).toEqual([localKey]);
    expect(storage.getSession.calls.count()).toBe(0);

    const [localSection, sessionSection] = getSections(fixture);

    const localValue = getText(localSection.querySelector('.break-words'));
    const sessionStatus = getText(sessionSection.querySelector('span.text-xs'));

    expect(localValue).toContain('Local note');
    expect(sessionStatus).toContain('unavailable');
  });

  it('saves local drafts via the storage service', () => {
    const localKey = config.storageKey('localNote');

    fixture.detectChanges();

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
    fixture.detectChanges();

    expect(storage.setLocal.calls.argsFor(0)).toEqual([localKey, 'Draft value']);

    const localValue = getText(localSection.querySelector('.break-words'));
    expect(localValue).toContain('Draft value');
  });

  it('clears session drafts via the storage service', () => {
    const sessionKey = config.storageKey('sessionNote');

    fixture.detectChanges();

    const [, sessionSection] = getSections(fixture);
    const input = sessionSection.querySelector('input');
    const buttons = sessionSection.querySelectorAll<HTMLButtonElement>('button');
    const saveButton = buttons.item(0);
    const clearButton = buttons.item(1);

    expect(input).not.toBeNull();
    const typedInput = input as HTMLInputElement;
    typedInput.value = 'Session note';
    typedInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    saveButton.click();
    fixture.detectChanges();

    expect(clearButton.disabled).toBeFalse();

    clearButton.click();
    fixture.detectChanges();

    expect(storage.removeSession.calls.argsFor(0)).toEqual([sessionKey]);
    expect(clearButton.disabled).toBeTrue();
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
