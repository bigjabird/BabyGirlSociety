import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import type { InventoryItemDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-inventory',
  imports: [FormsModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-inventory.component.html',
  styleUrl: './admin-inventory.component.scss'
})
export class AdminInventoryComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly items = signal<InventoryItemDto[]>([]);
  readonly error = signal<string | null>(null);
  displayedColumns = ['sku', 'product', 'qty', 'low', 'actions'];

  edit: Record<string, { sku: string; quantityOnHand: number; lowStockThreshold: number | null }> = {};

  newRow = { productId: '', sku: '', quantityOnHand: 0, lowStockThreshold: null as number | null };

  constructor() {
    this.reload();
  }

  reload() {
    const t = this.auth.token();
    if (!t) return;
    this.api.adminInventory(t).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.edit = {};
        for (const r of rows) {
          this.edit[r.id] = {
            sku: r.sku,
            quantityOnHand: r.quantityOnHand,
            lowStockThreshold: r.lowStockThreshold
          };
        }
      },
      error: () => this.error.set('Failed to load')
    });
  }

  save(id: string) {
    const t = this.auth.token();
    if (!t) return;
    const row = this.edit[id];
    if (!row) return;
    this.api.updateInventory(t, id, {
      sku: row.sku,
      quantityOnHand: row.quantityOnHand,
      lowStockThreshold: row.lowStockThreshold
    }).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Save failed')
    });
  }

  add() {
    const t = this.auth.token();
    if (!t) return;
    if (!this.newRow.productId || !this.newRow.sku) {
      this.error.set('Product ID and SKU required');
      return;
    }
    this.api
      .createInventory(t, this.newRow.productId.trim(), {
        sku: this.newRow.sku.trim(),
        quantityOnHand: this.newRow.quantityOnHand,
        lowStockThreshold: this.newRow.lowStockThreshold
      })
      .subscribe({
        next: () => {
          this.newRow = { productId: '', sku: '', quantityOnHand: 0, lowStockThreshold: null };
          this.reload();
        },
        error: () => this.error.set('Create failed')
      });
  }
}
