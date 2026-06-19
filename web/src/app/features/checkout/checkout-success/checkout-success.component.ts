import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkout-success',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.scss'
})
export class CheckoutSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  readonly sessionId = this.route.snapshot.queryParamMap.get('session_id');
}
