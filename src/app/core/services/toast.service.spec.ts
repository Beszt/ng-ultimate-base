import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import type { IndividualConfig } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let translate: jasmine.SpyObj<TranslateService>;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    translate = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    toastr = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
      'info',
      'warning',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: TranslateService, useValue: translate },
        { provide: ToastrService, useValue: toastr },
      ],
    });

    service = TestBed.inject(ToastService);
  });

  it('shows a translated success toast with params and options', () => {
    const params = { count: 3 };
    const options: Partial<IndividualConfig> = { timeOut: 1000 };

    translate.instant.and.callFake((key: string) => {
      if (key === 'TOAST.success') {
        return 'Success';
      }
      if (key === 'demo.message') {
        return 'Loaded 3 posts';
      }
      return key;
    });

    service.showSuccess('demo.message', params, options);

    expect(translate.instant.calls.allArgs()).toEqual(
      jasmine.arrayContaining([['demo.message', params]]),
    );
    expect(toastr.success.calls.mostRecent().args).toEqual(['Loaded 3 posts', 'Success', options]);
  });

  it('falls back to the message key when translation is missing', () => {
    translate.instant.and.callFake((key: string) => {
      if (key.startsWith('TOAST.')) {
        return 'Alert';
      }
      return '';
    });

    service.showError('demo.missing');

    expect(toastr.error.calls.mostRecent().args).toEqual(['demo.missing', 'Alert', undefined]);
  });

  it('uses the original message key when translation resolves to undefined', () => {
    translate.instant.and.callFake((key: string) => {
      if (key === 'TOAST.info') {
        return 'Info';
      }
      return undefined;
    });

    service.showInfo('demo.untranslated');

    expect(toastr.info.calls.mostRecent().args).toEqual(['demo.untranslated', 'Info', undefined]);
  });

  it('uses raw message when it is not a translation key', () => {
    translate.instant.and.callFake((key: string) => {
      if (key === 'TOAST.success') return 'Success';
      return undefined;
    });

    service.showSuccess('Hello world');

    expect(toastr.success.calls.mostRecent().args).toEqual(['Hello world', 'Success', undefined]);
  });

  it('delegates warning notifications to the ToastrService', () => {
    translate.instant.and.callFake((key: string) =>
      key.startsWith('TOAST.') ? 'Warning' : 'Check this',
    );

    service.showWarn('demo.warning');

    expect(toastr.warning.calls.mostRecent().args).toEqual(['Check this', 'Warning', undefined]);
  });
});
