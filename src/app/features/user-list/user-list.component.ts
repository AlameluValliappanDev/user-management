import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule,
    MatTooltipModule, MatDialogModule, MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Users</h1>
        <p class="page-sub">{{ dataSource.filteredData.length }} user(s) found</p>
      </div>
      <button mat-raised-button color="primary" routerLink="/users/new" *ngIf="auth.isAdmin">
        <mat-icon>person_add</mat-icon> Add User
      </button>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Name or email..." />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Role</mat-label>
        <mat-select [formControl]="roleCtrl">
          <mat-option value="">All Roles</mat-option>
          <mat-option value="admin">Admin</mat-option>
          <mat-option value="user">User</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select [formControl]="statusCtrl">
          <mat-option value="">All Status</mat-option>
          <mat-option value="active">Active</mat-option>
          <mat-option value="inactive">Inactive</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-stroked-button (click)="clearFilters()" *ngIf="hasActiveFilters">
        <mat-icon>clear</mat-icon> Clear
      </button>
    </div>

    <!-- Table -->
    <div class="table-container mat-elevation-z2">
      <table mat-table [dataSource]="dataSource" matSort>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let user">
            <div class="user-cell">
              <div class="avatar" [class]="'avatar-' + user.role">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
          <td mat-cell *matCellDef="let user">
            <span [class]="'chip chip-' + user.role">{{ user.role | titlecase }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let user">
            <span [class]="'chip chip-' + user.status">{{ user.status | titlecase }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="createdAt">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
          <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <button mat-icon-button [routerLink]="['/users', user.id]" matTooltip="View">
              <mat-icon>visibility</mat-icon>
            </button>
            <button mat-icon-button [routerLink]="['/users', user.id, 'edit']"
                    matTooltip="Edit" *ngIf="auth.isAdmin">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="confirmDelete(user)"
                    matTooltip="Delete" *ngIf="auth.isAdmin && user.id !== auth.currentUser?.id">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>
        <tr class="mat-row no-data-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="columns.length">
            <mat-icon>search_off</mat-icon> No users match your filters.
          </td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 25]" pageSize="10" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 28px; font-weight: 600; margin: 0; }
    .page-sub { color: #666; margin: 4px 0 0; font-size: 14px; }
    .filter-bar { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; }
    .search-field { min-width: 250px; }
    .table-container { border-radius: 8px; overflow: hidden; }
    mat-paginator { display: flex; justify-content: center; }
    table { width: 100%; }
    .user-cell { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-weight: 700; font-size: 15px; color: white;
    }
    .avatar-admin { background: #3f51b5; }
    .avatar-user { background: #009688; }
    .user-name { font-weight: 500; }
    .user-email { font-size: 12px; color: #888; }
    .chip {
      padding: 4px 12px; border-radius: 12px; font-size: 12px;
      font-weight: 500; display: inline-block;
    }
    .chip-admin { background: #e8eaf6; color: #3f51b5; }
    .chip-user { background: #e0f2f1; color: #00796b; }
    .chip-active { background: #e8f5e9; color: #2e7d32; }
    .chip-inactive { background: #ffebee; color: #c62828; }
    .table-row:hover { background: #f5f5f5; }
    .no-data-row td { text-align: center; padding: 48px; color: #999; }
    .no-data-row mat-icon { vertical-align: middle; margin-right: 8px; }
  `]
})
export class UserListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<User>([]);
  columns = ['name', 'role', 'status', 'createdAt', 'actions'];

  searchCtrl = new FormControl('');
  roleCtrl = new FormControl('');
  statusCtrl = new FormControl('');

  get hasActiveFilters(): boolean {
    return !!(this.searchCtrl.value || this.roleCtrl.value || this.statusCtrl.value);
  }

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.dataSource.filterPredicate = (user: User, filter: string) => {
      const f = JSON.parse(filter);
      const matchSearch = !f.search ||
        user.name.toLowerCase().includes(f.search) ||
        user.email.toLowerCase().includes(f.search);
      const matchRole = !f.role || user.role === f.role;
      const matchStatus = !f.status || user.status === f.status;
      return matchSearch && matchRole && matchStatus;
    };

    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
    this.roleCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilters());
    this.statusCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilters());
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.dataSource.data = users;
      this.cdr.markForCheck();
    });
  }

  applyFilters() {
    this.dataSource.filter = JSON.stringify({
      search: (this.searchCtrl.value || '').toLowerCase(),
      role: this.roleCtrl.value || '',
      status: this.statusCtrl.value || ''
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.roleCtrl.setValue('');
    this.statusCtrl.setValue('');
    this.dataSource.filter = '';
  }

  confirmDelete(user: User) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Delete user "${user.name}"? This cannot be undone.` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteUser(user);
    });
  }

  deleteUser(user: User) {
    this.userService.deleteUser(user.id).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);
      this.cdr.markForCheck();
      this.snackBar.open(`${user.name} deleted`, 'Dismiss', { duration: 3000 });
    });
  }
}
