/* eslint-disable @typescript-eslint/unbound-method */
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { httpErrorInterceptor } from './http-error.interceptor';
import { ToastService } from '../services/toast.service';

describe('httpErrorInterceptor', () => {
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['showError']);

    TestBed.configureTestingModule({
      providers: [{ provide: ToastService, useValue: toast }],
    });
  });

  function invokeInterceptor(error: HttpErrorResponse, request?: HttpRequest<unknown>): void {
    const req = request ?? new HttpRequest('GET', '/test');

    const handled$ = TestBed.runInInjectionContext(() =>
      httpErrorInterceptor(req, () => throwError(() => error)),
    );

    handled$.subscribe({
      next: () => fail('Expected an error to be rethrown'),
      error: () => {
        /* swallow */
      },
    });
  }

  it('does not show a toast when skip header is present', () => {
    const req = new HttpRequest('GET', '/test').clone({
      setHeaders: { 'x-skip-error-toast': '1' },
    });

    const result$ = TestBed.runInInjectionContext(() =>
      httpErrorInterceptor(req, () => of(new HttpResponse({ status: 200 }))),
    );

    result$.subscribe();

    expect(toast.showError).not.toHaveBeenCalled();
  });

  it('notifies about network errors (status 0)', () => {
    invokeInterceptor(new HttpErrorResponse({ status: 0 }));

    expect(toast.showError).toHaveBeenCalledWith('ERROR.network', { reason: 'Network error' });
  });

  it('notifies about server errors (>= 500)', () => {
    invokeInterceptor(new HttpErrorResponse({ status: 503 }));

    expect(toast.showError).toHaveBeenCalledWith('ERROR.server', { code: 503 });
  });

  it('notifies about missing resources (404)', () => {
    invokeInterceptor(new HttpErrorResponse({ status: 404 }));

    expect(toast.showError).toHaveBeenCalledWith('ERROR.notFound');
  });

  it('notifies about unauthorized errors (401/403)', () => {
    invokeInterceptor(new HttpErrorResponse({ status: 401 }));

    expect(toast.showError).toHaveBeenCalledWith('ERROR.unauthorized');
  });

  it('extracts reason from the error payload for generic errors', () => {
    invokeInterceptor(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Invalid payload' },
        statusText: 'Bad Request',
      }),
    );

    expect(toast.showError).toHaveBeenCalledWith('ERROR.generic', { reason: 'Invalid payload' });
  });

  it('falls back to the error message when payload reason is missing', () => {
    invokeInterceptor(
      new HttpErrorResponse({
        status: 418,
        error: 'No payload',
        statusText: 'Teapot',
        url: '/tea',
      }),
    );

    const [, payload] = toast.showError.calls.mostRecent().args;
    expect(payload).toEqual({ reason: jasmine.stringMatching(/Teapot/) });
  });
});
