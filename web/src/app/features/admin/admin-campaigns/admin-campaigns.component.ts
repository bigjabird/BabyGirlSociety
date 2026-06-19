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

  form = {
    name: '',
    type: 'banner',
    payloadJson: '{}',
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: '' as string | null,
    isActive: true
  };

  constructor() {
    this.reload();
  }

  reload() {
    const t = this.auth.token();
    if (!t) return;
    this.api.adminCampaigns(t).subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.error.set('Failed to load')
    });
  }

  create() {
    const t = this.auth.token();
    if (!t) return;
    const body = {
      name: this.form.name,
      type: this.form.type,
      payloadJson: this.form.payloadJson || '{}',
      startsAt: new Date(this.form.startsAt).toISOString(),
      endsAt: this.form.endsAt ? new Date(this.form.endsAt).toISOString() : null,
      isActive: this.form.isActive
    };
    this.api.upsertCampaign(t, body).subscribe({
      next: () => {
        this.form = {
          name: '',
          type: 'banner',
          payloadJson: '{}',
          startsAt: new Date().toISOString().slice(0, 16),
          endsAt: null,
          isActive: true
        };
        this.reload();
      },
      error: () => this.error.set('Create failed')
    });
  }

  remove(c: MarketingCampaign) {
    const t = this.auth.token();
    if (!t || this.auth.role() !== 'admin') return;
    if (!confirm(`Delete ${c.name}?`)) return;
    this.api.deleteCampaign(t, c.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed')
    });
  }
}
