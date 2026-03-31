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
      const message = getErrorMessage(error);

      if (isLoginRequest) {
        // let the login component handle its own errors
      } else if (error.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('um_current_user');
        router.navigate(['/login']);
        snackBar.open('Session expired. Please log in again.', 'Dismiss', { duration: 4000 });
      } else {
        snackBar.open(message, 'Dismiss', { duration: 4000 });
      }

      return throwError(() => error);
    })
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return error.error.message;
  }
  switch (error.status) {
    case 400: return 'Bad request. Please check your input.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 500: return 'A server error occurred. Please try again later.';
    default:  return 'An unexpected error occurred.';
  }
}
