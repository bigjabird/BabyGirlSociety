import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { LiveDesignPanelComponent } from './shared/live-design/live-design-panel.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    LiveDesignPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);

  readonly title = 'Babygirl Society';
  readonly cartCount = this.cart.totalItems;
  readonly showDesignPanel = computed(() => {
    if (typeof location === 'undefined') return false;
    if (!environment.production) return true;
    return new URLSearchParams(location.search).has('design');
  });
}
