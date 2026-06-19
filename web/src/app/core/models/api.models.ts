export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  currency: string;
  imageUrls: string[];
  isActive: boolean;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  totalStock: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  payloadJson: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

export interface CheckoutSessionResponse {
  sessionUrl: string;
  orderId: string;
}

export interface InventoryItemDto {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityOnHand: number;
  lowStockThreshold: number | null;
}

export interface OrderSummary {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerEmail: string | null;
  stripeSessionId: string | null;
  createdAt: string;
  lineCount: number;
}
