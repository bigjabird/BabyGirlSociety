import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import type { ProductListItem } from '../../../core/models/api.models';

@Component({
  selector: 'app-shop-list',
  imports: [RouterLink, MatCardModule, MatButtonModule, CurrencyPipe],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.scss'
})
export class ShopListComponent {
  private readonly api = inject(ApiService);
  readonly products = signal<ProductListItem[]>([]);
  readonly error = signal<string | null>(null);

  constructor() {
    this.api.getProducts().subscribe({
      next: (p) => this.products.set(p),
      error: () => this.error.set('Could not load products.')
    });
  }

  thumb(p: ProductListItem): string {
    return p.imageUrls?.[0] ?? '/favicon.ico';
  }
}
