import { Component, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import type { OrderSummary } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-orders',
  imports: [MatTableModule, DatePipe, CurrencyPipe],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly orders = signal<OrderSummary[]>([]);
  readonly error = signal<string | null>(null);
  displayedColumns = ['created', 'status', 'total', 'email', 'session'];

  constructor() {
    const t = this.auth.token();
    if (!t) return;
    this.api.adminOrders(t).subscribe({
      next: (o) => this.orders.set(o),
      error: () => this.error.set('Failed to load orders')
    });
  }
}
