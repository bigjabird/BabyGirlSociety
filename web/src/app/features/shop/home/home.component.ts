import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CampaignService } from '../../../core/services/campaign.service';
import type { ProductListItem } from '../../../core/models/api.models';
import type { FeaturedCollectionPayload, ParsedCampaign } from '../../../core/models/campaign-payloads';

interface HeroSlide {
  image: string;
  tagline?: string;
  cta?: string;
  ctaLabel?: string;
}

interface FeaturedSection {
  campaign: ParsedCampaign<FeaturedCollectionPayload>;
  products: ProductListItem[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIconModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  readonly campaigns = inject(CampaignService);

  readonly products = signal<ProductListItem[]>([]);
  readonly productsError = signal<string | null>(null);
  readonly activeSlide = signal(0);

  private readonly defaultSlides: HeroSlide[] = [
    {
      image:
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&q=80&auto=format&fit=crop'
    },
    {
      image:
        'https://images.unsplash.com/photo-1599643478518-a784e3796f7a?w=1600&q=80&auto=format&fit=crop'
    },
    {
      image:
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1600&q=80&auto=format&fit=crop'
    }
  ];

  readonly slides = computed(() => {
    const banner = this.campaigns.primaryBanner();
    if (banner?.payload.image) {
      return [
        {
          image: banner.payload.image,
          tagline: banner.payload.tagline ?? banner.payload.headline,
          cta: banner.payload.cta ?? '/new-arrivals',
          ctaLabel: banner.payload.ctaLabel ?? 'Shop Now'
        },
        ...this.defaultSlides.slice(1)
      ];
    }
    return this.defaultSlides;
  });

  readonly heroTagline = computed(() => {
    const slide = this.slides()[this.activeSlide()];
    return slide?.tagline ?? 'Walk like her. Own every room.';
  });

  readonly heroCta = computed(() => this.slides()[this.activeSlide()]?.cta ?? '/new-arrivals');

  readonly heroCtaLabel = computed(() => this.slides()[this.activeSlide()]?.ctaLabel ?? 'Shop New Arrivals');

  readonly featuredSections = computed((): FeaturedSection[] => {
    const allProducts = this.products();
    return this.campaigns.featuredCollections().map((campaign) => ({
      campaign,
      products: campaign.payload.productSlugs
        .map((slug) => allProducts.find((p) => p.slug === slug))
        .filter((p): p is ProductListItem => p != null)
    }));
  });

  constructor() {
    this.api.getProducts().subscribe({
      next: (p) => this.products.set(p),
      error: () => this.productsError.set('Could not load products.')
    });
  }

  prevSlide(): void {
    const next = (this.activeSlide() - 1 + this.slides().length) % this.slides().length;
    this.activeSlide.set(next);
  }

  nextSlide(): void {
    const next = (this.activeSlide() + 1) % this.slides().length;
    this.activeSlide.set(next);
  }

  goToSlide(index: number): void {
    this.activeSlide.set(index);
  }

  thumb(p: ProductListItem): string {
    return p.imageUrls?.[0] ?? '/favicon.ico';
  }

  subtitle(p: ProductListItem): string {
    const parts = p.name.split('—').map((s) => s.trim());
    if (parts.length > 1) return parts.slice(1).join(' — ');
    return '';
  }
}
