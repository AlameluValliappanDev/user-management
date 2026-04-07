import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'um_current_user';
const TOKEN_KEY = 'um_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get role(): string {
    return this.currentUser?.role || '';
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.currentUser && !!localStorage.getItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/users/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        localStorage.setItem(TOKEN_KEY, response.token);
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.status === 0) {
      message = 'Unable to reach the server. Check your network connection.';
    } else if (error.status === 400) {
      message = error.error?.message ?? 'Invalid login request.';
    } else if (error.status === 401) {
      message = error.error?.message ?? 'Invalid email or password.';
    } else if (error.status === 500) {
      message = 'Server error. Please try again later.';
    }

    return throwError(() => new Error(message));
  }
}
