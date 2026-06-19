import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import type { ProductListItem } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-products',
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    CurrencyPipe
  ],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly products = signal<ProductListItem[]>([]);
  readonly error = signal<string | null>(null);

  displayedColumns = ['name', 'slug', 'price', 'active', 'actions'];

  newProduct = {
    slug: '',
    name: '',
    description: '',
    basePrice: 0,
    currency: 'usd',
    imageUrls: '',
    isActive: true
  };

  constructor() {
    this.reload();
  }

  reload() {
    const t = this.auth.token();
    if (!t) return;
    this.api.adminProducts(t).subscribe({
      next: (p) => this.products.set(p),
      error: () => this.error.set('Failed to load')
    });
  }

  imageUrlsArray(): string[] {
    return this.newProduct.imageUrls
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  create() {
    const t = this.auth.token();
    if (!t) return;
    const body = {
      slug: this.newProduct.slug,
      name: this.newProduct.name,
      description: this.newProduct.description,
      basePrice: this.newProduct.basePrice,
      currency: this.newProduct.currency,
      imageUrls: this.imageUrlsArray(),
      isActive: this.newProduct.isActive
    };
    this.api.upsertProduct(t, body).subscribe({
      next: () => {
        this.newProduct = {
          slug: '',
          name: '',
          description: '',
          basePrice: 0,
          currency: 'usd',
          imageUrls: '',
          isActive: true
        };
        this.reload();
      },
      error: () => this.error.set('Create failed')
    });
  }

  remove(p: ProductListItem) {
    const t = this.auth.token();
    if (!t || this.auth.role() !== 'admin') return;
    if (!confirm(`Delete ${p.name}?`)) return;
    this.api.deleteProduct(t, p.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed (admin only)')
    });
  }
}
