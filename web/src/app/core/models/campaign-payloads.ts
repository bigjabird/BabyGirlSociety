/** Active campaign payload for type `banner`. */
export interface BannerCampaignPayload {
  headline: string;
  subcopy?: string;
  cta?: string;
  ctaLabel?: string;
  /** Optional hero image URL when used as home hero override. */
  image?: string;
  tagline?: string;
}

/** Active campaign payload for type `featured_collection`. */
export interface FeaturedCollectionPayload {
  title: string;
  subtitle?: string;
  productSlugs: string[];
  cta?: string;
  ctaLabel?: string;
}

/** Active campaign payload for type `promo_code`. */
export interface PromoCodePayload {
  code: string;
  discountType: 'percent' | 'fixed';
  amount: number;
  minSubtotal?: number;
}

export type CampaignPayload = BannerCampaignPayload | FeaturedCollectionPayload | PromoCodePayload;

export interface ParsedCampaign<T extends CampaignPayload = CampaignPayload> {
  id: string;
  name: string;
  type: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  payload: T;
}
