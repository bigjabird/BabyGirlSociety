import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, MatButtonModule, MatCardModule, CurrencyPipe, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent {
  readonly cart = inject(CartService);

  updateQty(productId: string, value: string) {
    const q = Number.parseInt(value, 10);
    if (Number.isNaN(q)) return;
    this.cart.setQuantity(productId, q);
  }
}
