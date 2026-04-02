import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { UserRole, UserStatus } from '../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-wrapper">
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar>{{ isEdit ? 'edit' : 'person_add' }}</mat-icon>
          <mat-card-title>{{ isEdit ? 'Edit User' : 'Create User' }}</mat-card-title>
          <mat-card-subtitle>{{ isEdit ? 'Update user information' : 'Add a new user to the system' }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading" class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!loading">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="John Smith" />
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
              <mat-error *ngIf="form.get('name')?.hasError('minlength')">Minimum 2 characters</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="john&#64;example.com" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
            </mat-form-field>

            <div class="row-fields">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="admin">Admin</mat-option>
                  <mat-option value="user">User</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="inactive">Inactive</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/users">
                <mat-icon>arrow_back</mat-icon> Cancel
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="form.invalid || saving">
                <mat-spinner diameter="18" *ngIf="saving"></mat-spinner>
                <mat-icon *ngIf="!saving">{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ isEdit ? 'Save Changes' : 'Create User' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-wrapper { max-width: 600px; margin: 0 auto; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .row-fields { display: flex; gap: 16px; }
    .half-width { flex: 1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    .loading-state { display: flex; justify-content: center; padding: 48px; }
    mat-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as UserRole, Validators.required],
    status: ['active' as UserStatus, Validators.required]
  });

  isEdit = false;
  userId = '';
  createdAt = '';
  loading = false;
  saving = false;

  ngOnInit() {
    this.userId = this.route.snapshot.params['id'];
    if (this.userId) {
      this.isEdit = true;
      this.loading = true;
      this.userService.getUserById(this.userId).subscribe(user => {
        this.createdAt = user.createdAt;
        this.form.patchValue(user);
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;
    const raw = this.form.getRawValue();
    const value = {
      name: raw.name ?? undefined,
      email: raw.email ?? undefined,
      role: raw.role ?? undefined,
      status: raw.status ?? undefined,
    };
    const request = this.isEdit
      ? this.userService.updateUser(this.userId, { ...value, createdAt: this.createdAt })
      : this.userService.createUser(value);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'User updated successfully' : 'User created successfully',
          'Dismiss', { duration: 3000 }
        );
        this.router.navigate(['/users']);
      },
      error: () => {
        this.snackBar.open('An error occurred', 'Dismiss', { duration: 3000 });
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
