import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, STATUS } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const users = [
      {
        id: '1',
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        token: 'mock-token-admin-001'
      },
      {
        id: '2',
        name: 'John Smith',
        email: 'john@example.com',
        password: 'user123',
        role: 'user',
        status: 'active',
        createdAt: '2024-02-10T00:00:00.000Z',
        token: 'mock-token-user-002'
      },
      {
        id: '3',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'user123',
        role: 'user',
        status: 'active',
        createdAt: '2024-03-15T00:00:00.000Z',
        token: 'mock-token-user-003'
      },
      {
        id: '4',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'user123',
        role: 'user',
        status: 'inactive',
        createdAt: '2024-04-20T00:00:00.000Z',
        token: 'mock-token-user-004'
      },
      {
        id: '5',
        name: 'Alice Brown',
        email: 'alice@example.com',
        password: 'user123',
        role: 'user',
        status: 'active',
        createdAt: '2024-05-25T00:00:00.000Z',
        token: 'mock-token-user-005'
      }
    ];
    return { users };
  }

  // Custom POST handler for login
  post(reqInfo: RequestInfo): Observable<any> | undefined {
    if (reqInfo.collectionName === 'users' && reqInfo.url.includes('/login')) {
      return this.handleLogin(reqInfo);
    }
    return undefined;
  }

  private handleLogin(reqInfo: RequestInfo): Observable<any> {
    const body = reqInfo.utils.getJsonBody(reqInfo.req) as { email: string; password: string };
    const db = reqInfo.utils.getDb() as { users: any[] };
    const user = db.users.find(
      (u: any) => u.email === body.email && u.password === body.password
    );
    const { createResponse$ } = reqInfo.utils;
    if (user) {
      const { password, ...safeUser } = user;
      return createResponse$(() => ({
        status: STATUS.OK,
        body: { user: safeUser, token: user.token }
      }));
    }
    return createResponse$(() => ({
      status: STATUS.UNAUTHORIZED,
      body: { message: 'Invalid email or password' }
    }));
  }
}
