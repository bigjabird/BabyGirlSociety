import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import type { MarketingCampaign } from '../../../core/models/api.models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  readonly campaigns = signal<MarketingCampaign[]>([]);

  constructor() {
    this.api.getActiveCampaigns().subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.campaigns.set([])
    });
  }

  bannerPayload(c: MarketingCampaign): { headline?: string; subcopy?: string; cta?: string } {
    try {
      return JSON.parse(c.payloadJson) as { headline?: string; subcopy?: string; cta?: string };
    } catch {
      return {};
    }
  }
}
