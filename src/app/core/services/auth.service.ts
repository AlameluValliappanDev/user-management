import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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
    return !!this.currentUser;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/users/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        localStorage.setItem(TOKEN_KEY, response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
