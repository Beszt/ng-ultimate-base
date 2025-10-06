import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SpinnerService } from './spinner.service';

describe('SpinnerService', () => {
  let service: SpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpinnerService);
  });

  it('shows and hides the spinner with optional message', () => {
    expect(service.isVisible()).toBeFalse();

    service.show('loading');

    expect(service.isVisible()).toBeTrue();
    expect(service.message()).toBe('loading');

    service.hide();

    expect(service.isVisible()).toBeFalse();
    expect(service.message()).toBeNull();
  });

  it('supports nested show/hide calls without dropping below zero', () => {
    service.show('first');
    service.show('second');

    expect(service.isVisible()).toBeTrue();
    expect(service.message()).toBe('second');

    service.hide();

    expect(service.isVisible()).toBeTrue();
    expect(service.message()).toBe('second');

    service.hide();

    expect(service.isVisible()).toBeFalse();
    expect(service.message()).toBeNull();
  });

  it('wraps observables and toggles the spinner around subscription lifecycle', () => {
    const subject = new Subject<string>();
    const received: string[] = [];

    const subscription = service
      .trackObservable(subject.asObservable(), 'DEMO.loading')
      .subscribe((value) => received.push(value));

    subject.next('payload');

    expect(service.isVisible()).toBeTrue();
    expect(service.message()).toBe('DEMO.loading');
    expect(received).toEqual(['payload']);

    subject.complete();

    expect(service.isVisible()).toBeFalse();
    expect(service.message()).toBeNull();

    subscription.unsubscribe();
  });

  it('wraps promises and hides the spinner after resolution', async () => {
    const promise = service.trackPromise(Promise.resolve('done'), 'loading message');

    expect(service.isVisible()).toBeTrue();
    expect(service.message()).toBe('loading message');

    const result = await promise;

    expect(result).toBe('done');
    expect(service.isVisible()).toBeFalse();
    expect(service.message()).toBeNull();
  });
});
