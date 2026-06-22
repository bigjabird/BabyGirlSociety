import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import type { ValidatePromoResponse } from '../../../core/models/api.models';

@Component({
  selector: 'app-checkout-page',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    CurrencyPipe
  ],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  promoInput = '';
  readonly appliedPromo = signal<ValidatePromoResponse | null>(null);
  readonly promoLoading = signal(false);
  readonly promoError = signal<string | null>(null);

  readonly lines = this.cart.lines;
  readonly subtotal = this.cart.subtotal;

  readonly discount = computed(() => this.appliedPromo()?.discountAmount ?? 0);
  readonly total = computed(() => Math.max(0, this.subtotal() - this.discount()));

  applyPromo() {
    const code = this.promoInput.trim();
    if (!code) return;

    this.promoLoading.set(true);
    this.promoError.set(null);
    this.api.validatePromo(code, this.subtotal()).subscribe({
      next: (res) => {
        this.appliedPromo.set(res);
        this.promoInput = res.code;
        this.promoLoading.set(false);
      },
      error: (e: { error?: { error?: string } }) => {
        this.appliedPromo.set(null);
        this.promoLoading.set(false);
        this.promoError.set(e?.error?.error ?? 'Invalid promo code');
      }
    });
  }

  clearPromo() {
    this.appliedPromo.set(null);
    this.promoInput = '';
    this.promoError.set(null);
  }

  pay() {
    const items = this.cart.lines().map((l) => ({ productId: l.productId, quantity: l.quantity }));
    if (items.length === 0) {
      this.error.set('Cart is empty');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.createCheckoutSession(items, this.appliedPromo()?.code).subscribe({
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
