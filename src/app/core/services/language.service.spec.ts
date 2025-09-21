import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translate: jasmine.SpyObj<TranslateService>;
  let originalLang: string;

  beforeAll(() => {
    originalLang = document.documentElement.lang;
  });

  afterAll(() => {
    document.documentElement.lang = originalLang;
  });

  beforeEach(() => {
    translate = jasmine.createSpyObj<TranslateService>('TranslateService', [
      'getBrowserLang',
      'setDefaultLang',
      'use',
    ]);

    TestBed.configureTestingModule({
      providers: [LanguageService, { provide: TranslateService, useValue: translate }],
    });

    document.documentElement.lang = '';
    service = TestBed.inject(LanguageService);
  });

  it('initializes with the detected browser language', () => {
    translate.getBrowserLang.and.returnValue('pl');

    service.init();

    expect(translate.setDefaultLang.calls.mostRecent().args).toEqual(['pl']);
    expect(translate.use.calls.mostRecent().args).toEqual(['pl']);
    expect(document.documentElement.lang).toBe('pl');
  });

  it('falls back to English when no browser language is detected', () => {
    translate.getBrowserLang.and.returnValue(undefined);

    service.init();

    expect(translate.setDefaultLang.calls.mostRecent().args).toEqual(['en']);
    expect(translate.use.calls.mostRecent().args).toEqual(['en']);
    expect(document.documentElement.lang).toBe('en');
  });
});
