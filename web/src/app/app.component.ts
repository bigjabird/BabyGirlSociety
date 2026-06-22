import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { CampaignService } from './core/services/campaign.service';
import { LiveDesignPanelComponent } from './shared/live-design/live-design-panel.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatMenuModule, MatButtonModule, LiveDesignPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  readonly campaigns = inject(CampaignService);

  readonly cartCount = this.cart.totalItems;
  readonly hideStoreChrome = signal(false);
  readonly announcementText = this.campaigns.announcementText;
  readonly announcementLink = this.campaigns.announcementLink;

  readonly showDesignPanel = computed(() => {
    if (typeof location === 'undefined') return false;
    if (!environment.production) return true;
    return new URLSearchParams(location.search).has('design');
  });

  constructor() {
    this.updateChrome(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.updateChrome(this.router.url);
    });
  }

  private updateChrome(url: string): void {
    this.hideStoreChrome.set(url.startsWith('/admin'));
  }
}
