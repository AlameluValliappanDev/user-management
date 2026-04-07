import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.getUsers().pipe(
      switchMap(users => {
        const maxId = users.reduce((max, u) => Math.max(max, parseInt(u.id, 10) || 0), 0);
        return this.http.post<User>(this.apiUrl, {
          ...user,
          id: (maxId + 1).toString(),
          createdAt: new Date().toISOString()
        });
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, { id, ...user }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.status === 0) {
      message = 'Unable to reach the server. Check your network connection.';
    } else if (error.status === 400) {
      message = error.error?.message ?? 'Invalid request data.';
    } else if (error.status === 404) {
      message = error.error?.message ?? 'User not found.';
    } else if (error.status === 409) {
      message = error.error?.message ?? 'A user with this email already exists.';
    } else if (error.status === 500) {
      message = 'Server error. Please try again later.';
    }

    return throwError(() => new Error(message));
  }
}
