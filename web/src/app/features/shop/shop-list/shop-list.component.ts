import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import type { ProductListItem } from '../../../core/models/api.models';

@Component({
  selector: 'app-shop-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.scss'
})
export class ShopListComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<ProductListItem[]>([]);
  readonly error = signal<string | null>(null);
  readonly title = signal('Shop');
  readonly subtitle = signal<string | null>(null);

  constructor() {
    const data = this.route.snapshot.data as { title?: string; subtitle?: string };
    if (data.title) this.title.set(data.title);
    if (data.subtitle) this.subtitle.set(data.subtitle);

    this.api.getProducts().subscribe({
      next: (p) => this.products.set(p),
      error: () => this.error.set('Could not load products.')
    });
  }

  thumb(p: ProductListItem): string {
    return p.imageUrls?.[0] ?? '/favicon.ico';
  }
}
