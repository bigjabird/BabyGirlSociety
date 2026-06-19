import { Injectable, signal, computed } from '@angular/core';

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  maxStock: number;
}

const STORAGE_KEY = 'bgs-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly lines = signal<CartLine[]>(this.load());

  readonly totalItems = computed(() => this.lines().reduce((n, l) => n + l.quantity, 0));

  readonly subtotal = computed(() =>
    this.lines().reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  );

  private load(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartLine[];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines()));
  }

  add(line: Omit<CartLine, 'quantity'> & { quantity?: number }) {
    const qty = Math.max(1, line.quantity ?? 1);
    const next = [...this.lines()];
    const i = next.findIndex((l) => l.productId === line.productId);
    if (i >= 0) {
      const merged = Math.min(next[i].quantity + qty, line.maxStock);
      next[i] = { ...next[i], quantity: merged };
    } else {
      next.push({
        productId: line.productId,
        slug: line.slug,
        name: line.name,
        unitPrice: line.unitPrice,
        currency: line.currency,
        quantity: Math.min(qty, line.maxStock),
        maxStock: line.maxStock
      });
    }
    this.lines.set(next);
    this.persist();
  }

  setQuantity(productId: string, quantity: number) {
    const next = this.lines().map((l) => {
      if (l.productId !== productId) return l;
      const q = Math.max(0, Math.min(quantity, l.maxStock));
      return { ...l, quantity: q };
    }).filter((l) => l.quantity > 0);
    this.lines.set(next);
    this.persist();
  }

  remove(productId: string) {
    this.lines.set(this.lines().filter((l) => l.productId !== productId));
    this.persist();
  }

  clear() {
    this.lines.set([]);
    this.persist();
  }
}
