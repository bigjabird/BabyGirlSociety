import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token()) {
    void router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

/** Requires admin or staff role — used for /admin routes */
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token()) {
    void router.navigate(['/login'], { queryParams: { returnUrl: '/admin' } });
    return false;
  }
  if (!auth.isStaff()) {
    void router.navigateByUrl('/');
    return false;
  }
  return true;
};
