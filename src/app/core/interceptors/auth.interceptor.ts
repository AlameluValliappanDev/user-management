import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'um_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const token = localStorage.getItem(TOKEN_KEY);
  const isLoginRequest = req.url.includes('/login');

  const authReq =
    token && !isLoginRequest
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isLoginRequest && error.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('um_current_user');
        router.navigate(['/login']);
        snackBar.open('Session expired. Please log in again.', 'Dismiss', { duration: 4000 });
      }
      return throwError(() => error);
    })
  );
};

