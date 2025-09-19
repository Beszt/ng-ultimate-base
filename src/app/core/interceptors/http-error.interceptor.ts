import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  if (req.headers.has('x-skip-error-toast')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 0) {
          toast.showError('ERROR.network', { reason: 'Network error' });
        } else if (err.status >= 500) {
          toast.showError('ERROR.server', { code: err.status });
        } else if (err.status === 404) {
          toast.showError('ERROR.notFound');
        } else if (err.status === 401 || err.status === 403) {
          toast.showError('ERROR.unauthorized');
        } else {
          const reason =
            (err.error &&
              (typeof err.error === 'object' &&
              (err.error as { message?: string; error?: string }).message
                ? (err.error as { message?: string }).message
                : (err.error as { error?: string }).error)) ??
            err.message ??
            'Unknown error';

          toast.showError('ERROR.generic', { reason });
        }
      }

      throw err;
    }),
  );
};
