import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

import { finalize } from 'rxjs/operators';

import { SpinnerService } from '../services/spinner.service';

export const spinnerInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const spinnerService = inject(SpinnerService);
  const skipSpinner = req.headers.has('X-Skip-Spinner');

  if (!skipSpinner) {
    spinnerService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipSpinner) {
        spinnerService.hide();
      }
    }),
  );
};
