import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">lock</mat-icon>
          <mat-card-title>User Management</mat-card-title>
          <mat-card-subtitle>Sign in to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="you&#64;example.com" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Invalid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="showPass ? 'text' : 'password'" />
              <button mat-icon-button matSuffix type="button" (click)="showPass = !showPass">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <p class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</p>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width" [disabled]="loginForm.invalid || loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <div class="credentials-hint">
            <p><strong>Admin:</strong> admin&#64;example.com / admin123</p>
            <p><strong>User:</strong> john&#64;example.com / user123</p>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex; justify-content: center; align-items: center;
      min-height: calc(100vh - 64px); background: #f5f5f5;
      margin: -24px;
    }
    .login-card { width: 420px; padding: 16px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .error-msg { color: #f44336; font-size: 14px; margin-bottom: 8px; }
    .credentials-hint {
      background: #e8f5e9; padding: 12px 16px;
      font-size: 13px; border-top: 1px solid #c8e6c9;
    }
    .credentials-hint p { margin: 4px 0; }
    mat-spinner { display: inline-block; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  showPass = false;
  loading = false;
  errorMsg = '';

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/users']);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.loginForm.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/users']),
      error: () => {
        this.errorMsg = 'Invalid email or password';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
