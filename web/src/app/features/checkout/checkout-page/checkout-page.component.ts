import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, CurrencyPipe],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly lines = this.cart.lines;
  readonly subtotal = this.cart.subtotal;

  pay() {
    const items = this.cart.lines().map((l) => ({ productId: l.productId, quantity: l.quantity }));
    if (items.length === 0) {
      this.error.set('Cart is empty');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.createCheckoutSession(items).subscribe({
      next: (res) => {
        this.loading.set(false);
        window.location.href = res.sessionUrl;
      },
      error: (e: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(e?.error?.error ?? 'Checkout unavailable. Is Stripe configured on the API?');
      }
    });
  }
}
