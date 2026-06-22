import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import type { MarketingCampaign } from '../models/api.models';
import type {
  BannerCampaignPayload,
  FeaturedCollectionPayload,
  ParsedCampaign,
  PromoCodePayload
} from '../models/campaign-payloads';

const DEFAULT_ANNOUNCEMENT =
  'FAITH OVER EVERYTHING ♥ WEAR YOUR FAITH. INSPIRE THE WORLD.';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly api = inject(ApiService);

  private readonly campaigns = signal<ParsedCampaign[]>([]);
  private readonly loaded = signal(false);

  readonly banners = computed(() =>
    this.campaigns().filter((c): c is ParsedCampaign<BannerCampaignPayload> => c.type === 'banner')
  );

  readonly featuredCollections = computed(() =>
    this.campaigns().filter(
      (c): c is ParsedCampaign<FeaturedCollectionPayload> => c.type === 'featured_collection'
    )
  );

  readonly primaryBanner = computed(() => this.banners()[0] ?? null);

  readonly announcementText = computed(() => {
    const banner = this.primaryBanner();
    if (!banner) return DEFAULT_ANNOUNCEMENT;
    const parts = [banner.payload.headline, banner.payload.subcopy].filter(Boolean);
    return parts.join(' · ') || DEFAULT_ANNOUNCEMENT;
  });

  readonly announcementLink = computed(() => this.primaryBanner()?.payload.cta ?? null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.api.getActiveCampaigns().subscribe({
      next: (raw) => {
        this.campaigns.set(raw.map((c) => this.parseCampaign(c)).filter((c): c is ParsedCampaign => c != null));
        this.loaded.set(true);
      },
      error: () => {
        this.campaigns.set([]);
        this.loaded.set(true);
      }
    });
  }

  findPromo(code: string): ParsedCampaign<PromoCodePayload> | null {
    const normalized = code.trim().toUpperCase();
    for (const campaign of this.campaigns()) {
      if (campaign.type !== 'promo_code') continue;
      const payload = campaign.payload as PromoCodePayload;
      if (payload.code?.toUpperCase() === normalized) {
        return campaign as ParsedCampaign<PromoCodePayload>;
      }
    }
    return null;
  }

  private parseCampaign(raw: MarketingCampaign): ParsedCampaign | null {
    try {
      const payload = JSON.parse(raw.payloadJson) as Record<string, unknown>;
      if (!payload || typeof payload !== 'object') return null;

      if (raw.type === 'banner') {
        const headline = payload['headline'];
        if (typeof headline !== 'string' || !headline.trim()) return null;
        return {
          id: raw.id,
          name: raw.name,
          type: raw.type,
          startsAt: raw.startsAt,
          endsAt: raw.endsAt,
          isActive: raw.isActive,
          payload: payload as unknown as BannerCampaignPayload
        };
      }

      if (raw.type === 'featured_collection') {
        const title = payload['title'];
        const slugs = payload['productSlugs'];
        if (typeof title !== 'string' || !Array.isArray(slugs)) return null;
        return {
          id: raw.id,
          name: raw.name,
          type: raw.type,
          startsAt: raw.startsAt,
          endsAt: raw.endsAt,
          isActive: raw.isActive,
          payload: payload as unknown as FeaturedCollectionPayload
        };
      }

      if (raw.type === 'promo_code') {
        const code = payload['code'];
        const discountType = payload['discountType'];
        const amount = payload['amount'];
        if (typeof code !== 'string' || (discountType !== 'percent' && discountType !== 'fixed'))
          return null;
        if (typeof amount !== 'number' || amount <= 0) return null;
        return {
          id: raw.id,
          name: raw.name,
          type: raw.type,
          startsAt: raw.startsAt,
          endsAt: raw.endsAt,
          isActive: raw.isActive,
          payload: payload as unknown as PromoCodePayload
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}

export { DEFAULT_ANNOUNCEMENT };
