import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import type { ProductDetail } from '../../../core/models/api.models';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, MatButtonModule, MatSnackBarModule, CurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  private readonly snack = inject(MatSnackBar);

  readonly product = signal<ProductDetail | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      this.error.set('Missing product');
      return;
    }
    this.api.getProduct(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Product not found');
      }
    });
  }

  addToCart(p: ProductDetail) {
    if (p.totalStock < 1) {
      this.snack.open('Out of stock', 'OK', { duration: 3000 });
      return;
    }
    this.cart.add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      unitPrice: p.basePrice,
      currency: p.currency,
      maxStock: p.totalStock,
      quantity: 1
    });
    this.snack.open('Added to cart', 'View cart', { duration: 4000 }).onAction().subscribe(() => {
      void this.router.navigateByUrl('/cart');
    });
  }

  heroImage(p: ProductDetail): string {
    return p.imageUrls?.[0] ?? '/favicon.ico';
  }
}
