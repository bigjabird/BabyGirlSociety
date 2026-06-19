import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkout-cancel',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './checkout-cancel.component.html'
})
export class CheckoutCancelComponent {}
