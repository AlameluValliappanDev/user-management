import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatDividerModule, MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detail-wrapper">
      <div *ngIf="loading" class="loading">
        <mat-spinner></mat-spinner>
      </div>

      <ng-container *ngIf="user && !loading">
        <div class="back-link">
          <button mat-stroked-button routerLink="/users">
            <mat-icon>arrow_back</mat-icon> Back to Users
          </button>
        </div>

        <mat-card>
          <mat-card-content>
            <div class="profile-header">
              <div class="big-avatar" [class]="'big-avatar-' + user.role">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="profile-info">
                <h2>{{ user.name }}</h2>
                <p class="email">{{ user.email }}</p>
                <div class="chips">
                  <span [class]="'chip chip-' + user.role">{{ user.role | titlecase }}</span>
                  <span [class]="'chip chip-' + user.status">{{ user.status | titlecase }}</span>
                </div>
              </div>
              <div class="profile-actions" *ngIf="auth.isAdmin">
                <button mat-raised-button color="primary" [routerLink]="['/users', user.id, 'edit']">
                  <mat-icon>edit</mat-icon> Edit
                </button>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">User ID</span>
                <span class="detail-value">#{{ user.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Full Name</span>
                <span class="detail-value">{{ user.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email</span>
                <span class="detail-value">{{ user.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Role</span>
                <span class="detail-value">{{ user.role | titlecase }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">{{ user.status | titlecase }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created At</span>
                <span class="detail-value">{{ user.createdAt | date:'long' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-wrapper { max-width: 700px; margin: 0 auto; }
    .back-link { margin-bottom: 20px; }
    .loading { display: flex; justify-content: center; padding: 80px; }
    .profile-header { display: flex; align-items: center; gap: 24px; padding: 24px 0; flex-wrap: wrap; }
    .big-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px; font-weight: 700; color: white;
    }
    .big-avatar-admin { background: #3f51b5; }
    .big-avatar-user { background: #009688; }
    .profile-info { flex: 1; }
    .profile-info h2 { margin: 0 0 4px; font-size: 24px; }
    .email { color: #666; margin: 0 0 12px; }
    .chips { display: flex; gap: 8px; }
    .profile-actions { margin-left: auto; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px 0; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 16px; font-weight: 500; }
    .chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .chip-admin { background: #e8eaf6; color: #3f51b5; }
    .chip-user { background: #e0f2f1; color: #00796b; }
    .chip-active { background: #e8f5e9; color: #2e7d32; }
    .chip-inactive { background: #ffebee; color: #c62828; }
  `]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.userService.getUserById(id).subscribe({
      next: user => { this.user = user; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
