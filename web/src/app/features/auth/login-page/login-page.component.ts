import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          if (returnUrl.startsWith('/admin') && !this.auth.isStaff()) {
            this.error.set('You do not have permission to access that area.');
            void this.router.navigateByUrl('/');
            return;
          }
          void this.router.navigateByUrl(returnUrl);
          return;
        }
        void this.router.navigateByUrl('/');
      },
      error: () => this.error.set('Invalid email or password.')
    });
  }
}
