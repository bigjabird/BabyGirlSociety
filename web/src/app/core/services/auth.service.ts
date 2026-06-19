import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'bgs-token';
const EMAIL_KEY = 'bgs-email';
const ROLE_KEY = 'bgs-role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
  readonly email = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem(EMAIL_KEY) : null);
  readonly role = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem(ROLE_KEY) : null);

  /** Staff (admin or staff role) — can access /admin */
  readonly isStaff = computed(() => {
    const r = this.role();
    return r === 'admin' || r === 'staff';
  });

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(EMAIL_KEY, res.email);
        localStorage.setItem(ROLE_KEY, res.role);
        this.token.set(res.token);
        this.email.set(res.email);
        this.role.set(res.role);
      })
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.token.set(null);
    this.email.set(null);
    this.role.set(null);
    void this.router.navigateByUrl('/');
  }
}
