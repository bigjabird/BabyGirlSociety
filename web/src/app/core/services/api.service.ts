import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import type {
  CheckoutSessionResponse,
  InventoryItemDto,
  LoginResponse,
  MarketingCampaign,
  OrderSummary,
  ProductDetail,
  ProductListItem,
  ValidatePromoResponse
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api`;

  getProducts() {
    return this.http.get<ProductListItem[]>(`${this.base}/products`);
  }

  getProduct(slug: string) {
    return this.http.get<ProductDetail>(`${this.base}/products/${encodeURIComponent(slug)}`);
  }

  getActiveCampaigns() {
    return this.http.get<MarketingCampaign[]>(`${this.base}/campaigns/active`);
  }

  validatePromo(code: string, subtotal?: number) {
    return this.http.post<ValidatePromoResponse>(`${this.base}/campaigns/validate-promo`, {
      code,
      subtotal: subtotal ?? null
    });
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, { email, password });
  }

  createCheckoutSession(items: { productId: string; quantity: number }[], promoCode?: string | null) {
    return this.http.post<CheckoutSessionResponse>(`${this.base}/checkout/session`, {
      items,
      promoCode: promoCode ?? null
    });
  }

  authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  adminProducts(token: string) {
    return this.http.get<ProductListItem[]>(`${this.base}/admin/products`, {
      headers: this.authHeaders(token)
    });
  }

  upsertProduct(token: string, body: Record<string, unknown>, id?: string) {
    const url = id ? `${this.base}/admin/products/${id}` : `${this.base}/admin/products`;
    return id
      ? this.http.put(url, body, { headers: this.authHeaders(token) })
      : this.http.post<ProductListItem>(url, body, { headers: this.authHeaders(token) });
  }

  deleteProduct(token: string, id: string) {
    return this.http.delete(`${this.base}/admin/products/${id}`, { headers: this.authHeaders(token) });
  }

  adminInventory(token: string) {
    return this.http.get<InventoryItemDto[]>(`${this.base}/admin/inventory`, {
      headers: this.authHeaders(token)
    });
  }

  createInventory(token: string, productId: string, body: { sku: string; quantityOnHand: number; lowStockThreshold: number | null }) {
    return this.http.post(`${this.base}/admin/inventory/${productId}`, body, {
      headers: this.authHeaders(token)
    });
  }

  updateInventory(token: string, id: string, body: { sku: string; quantityOnHand: number; lowStockThreshold: number | null }) {
    return this.http.put(`${this.base}/admin/inventory/${id}`, body, { headers: this.authHeaders(token) });
  }

  adminCampaigns(token: string) {
    return this.http.get<MarketingCampaign[]>(`${this.base}/admin/campaigns`, {
      headers: this.authHeaders(token)
    });
  }

  upsertCampaign(token: string, body: Record<string, unknown>, id?: string) {
    const url = id ? `${this.base}/admin/campaigns/${id}` : `${this.base}/admin/campaigns`;
    return id
      ? this.http.put(url, body, { headers: this.authHeaders(token) })
      : this.http.post<MarketingCampaign>(url, body, { headers: this.authHeaders(token) });
  }

  deleteCampaign(token: string, id: string) {
    return this.http.delete(`${this.base}/admin/campaigns/${id}`, { headers: this.authHeaders(token) });
  }

  adminOrders(token: string) {
    return this.http.get<OrderSummary[]>(`${this.base}/admin/orders`, { headers: this.authHeaders(token) });
  }
}
