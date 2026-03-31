import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="auth.currentUser$ | async as user">
      <mat-toolbar color="primary">
        <mat-icon>manage_accounts</mat-icon>
        <span style="margin-left:8px; font-weight:600;">User Management</span>
        <span class="spacer"></span>
        <span style="font-size:14px; margin-right:16px;">
          {{ user.name }} ({{ user.role | titlecase }})
        </span>
        <button mat-icon-button (click)="auth.logout()" title="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
    </ng-container>
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .app-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
