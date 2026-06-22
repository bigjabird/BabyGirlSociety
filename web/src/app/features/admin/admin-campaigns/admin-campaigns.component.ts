import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import type { MarketingCampaign } from '../../../core/models/api.models';

const PAYLOAD_EXAMPLES: Record<string, string> = {
  banner: JSON.stringify(
    {
      headline: 'New arrivals — Babygirl Society',
      subcopy: 'Free shipping over $75',
      cta: '/shop',
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600',
      tagline: 'Walk like her. Own every room.',
      ctaLabel: 'Shop Now'
    },
    null,
    2
  ),
  featured_collection: JSON.stringify(
    {
      title: 'Spring Edit',
      subtitle: 'Hand-picked pieces for the season',
      productSlugs: ['velvet-mini-dress', 'satin-cami-set'],
      cta: '/shop',
      ctaLabel: 'Shop all'
    },
    null,
    2
  ),
  promo_code: JSON.stringify(
    {
      code: 'BGS15',
      discountType: 'percent',
      amount: 15,
      minSubtotal: 50
    },
    null,
    2
  )
};

@Component({
  selector: 'app-admin-campaigns',
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './admin-campaigns.component.html',
  styleUrl: './admin-campaigns.component.scss'
})
export class AdminCampaignsComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly campaigns = signal<MarketingCampaign[]>([]);
  readonly error = signal<string | null>(null);
  displayedColumns = ['name', 'type', 'active', 'starts', 'actions'];

  editingId: string | null = null;

  form = {
    name: '',
    type: 'banner',
    payloadJson: PAYLOAD_EXAMPLES['banner'],
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: '' as string | null,
    isActive: true
  };

  constructor() {
    this.reload();
  }

  onTypeChange(type: string) {
    if (this.editingId) return;
    this.form.payloadJson = PAYLOAD_EXAMPLES[type] ?? '{}';
  }

  reload() {
    const t = this.auth.token();
    if (!t) return;
    this.api.adminCampaigns(t).subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.error.set('Failed to load')
    });
  }

  private bodyFromForm() {
    return {
      name: this.form.name,
      type: this.form.type,
      payloadJson: this.form.payloadJson || '{}',
      startsAt: new Date(this.form.startsAt).toISOString(),
      endsAt: this.form.endsAt ? new Date(this.form.endsAt).toISOString() : null,
      isActive: this.form.isActive
    };
  }

  resetForm() {
    this.editingId = null;
    this.form = {
      name: '',
      type: 'banner',
      payloadJson: PAYLOAD_EXAMPLES['banner'],
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: null,
      isActive: true
    };
  }

  edit(c: MarketingCampaign) {
    this.editingId = c.id;
    this.form = {
      name: c.name,
      type: c.type,
      payloadJson: c.payloadJson,
      startsAt: c.startsAt.slice(0, 16),
      endsAt: c.endsAt ? c.endsAt.slice(0, 16) : null,
      isActive: c.isActive
    };
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  save() {
    const t = this.auth.token();
    if (!t) return;
    this.error.set(null);

    const body = this.bodyFromForm();
    this.api.upsertCampaign(t, body, this.editingId ?? undefined).subscribe({
      next: () => {
        this.resetForm();
        this.reload();
      },
      error: () => this.error.set(this.editingId ? 'Update failed' : 'Create failed')
    });
  }

  remove(c: MarketingCampaign) {
    const t = this.auth.token();
    if (!t || this.auth.role() !== 'admin') return;
    if (!confirm(`Delete ${c.name}?`)) return;
    this.api.deleteCampaign(t, c.id).subscribe({
      next: () => {
        if (this.editingId === c.id) this.resetForm();
        this.reload();
      },
      error: () => this.error.set('Delete failed')
    });
  }
}
