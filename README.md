# User Management App

An Angular 18 single-page application for managing users with role-based access control, built as an interview showcase project.

## Features

- **Authentication** — Login/logout with session persistence via localStorage
- **Role-based access control** — Admin and User roles with route guards
- **User CRUD** — Create, view, edit, and delete users (admin only)
- **Data table** — Sortable columns, pagination, and multi-field filtering (search, role, status)
- **HTTP Interceptor** — Attaches Bearer token to requests, handles session expiry globally
- **Reactive Forms** — Real-time validation for login and user forms
- **OnPush change detection** — Applied across all components for performance
- **Environment config** — Separate dev and production environment files

## Tech Stack

| | |
|---|---|
| Framework | Angular 18 |
| UI Library | Angular Material 18 |
| Language | TypeScript 5.5 (strict mode) |
| Styling | SCSS |
| Reactive | RxJS 7 |
| Mock API | angular-in-memory-web-api |

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 18

### Install dependencies
```bash
npm install
```

### Run development server
```bash
ng serve
```

Navigate to `http://localhost:4200`

### Build for production
```bash
ng build
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| User | john@example.com | user123 |

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/        # authGuard, adminGuard
│   │   ├── interceptors/  # HTTP auth interceptor
│   │   ├── models/        # User interfaces and types
│   │   ├── mock/          # In-memory mock API
│   │   └── services/      # AuthService, UserService
│   ├── features/
│   │   ├── login/
│   │   ├── user-list/
│   │   ├── user-detail/
│   │   └── user-form/
│   └── shared/
│       └── confirm-dialog/
└── environments/
    ├── environment.ts       # Development
    └── environment.prod.ts  # Production
```

## Key Angular Patterns Demonstrated

- **Standalone components** — No NgModules throughout
- **Functional route guards** — `CanActivateFn` with `inject()`
- **Lazy-loaded routes** — All feature components loaded on demand
- **Functional HTTP interceptor** — `HttpInterceptorFn` for auth headers and error handling
- **OnPush change detection** — With `ChangeDetectorRef.markForCheck()` and `takeUntilDestroyed` for subscription cleanup
- **Reactive Forms** — `FormBuilder`, validators, and typed form values
- **Environment configuration** — File replacement via `angular.json` for dev/prod builds
