import { DecimalPipe, DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

const STORAGE_PRESETS = 'bgs-design-presets';
const STORAGE_ACTIVE = 'bgs-design-active';

interface DesignState {
  accent: string;
  bg: string;
  radius: number;
  spacing: number;
  heroSize: number;
}

const defaults: DesignState = {
  accent: '#c2185b',
  bg: '#faf7f9',
  radius: 12,
  spacing: 16,
  heroSize: 40
};

@Component({
  selector: 'app-live-design-panel',
  imports: [
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './live-design-panel.component.html',
  styleUrl: './live-design-panel.component.scss'
})
export class LiveDesignPanelComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly snack = inject(MatSnackBar);

  readonly open = signal(false);
  accent = defaults.accent;
  bg = defaults.bg;
  radius = defaults.radius;
  spacing = defaults.spacing;
  heroRem = 2.5;
  presetName = '';

  readonly presets = signal<{ name: string; state: DesignState }[]>([]);

  constructor() {
    this.loadPresetsFromStorage();
    const saved = localStorage.getItem(STORAGE_ACTIVE);
    if (saved) {
      try {
        const s = JSON.parse(saved) as DesignState;
        this.applyState(s);
        this.accent = s.accent;
        this.bg = s.bg;
        this.radius = s.radius;
        this.spacing = s.spacing;
        this.heroRem = s.heroSize / 16;
      } catch {
        /* ignore */
      }
    }

  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open()) this.onChange();
  }

  private loadPresetsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_PRESETS);
      if (!raw) return;
      const list = JSON.parse(raw) as { name: string; state: DesignState }[];
      this.presets.set(list);
    } catch {
      this.presets.set([]);
    }
  }

  private savePresetsToStorage() {
    localStorage.setItem(STORAGE_PRESETS, JSON.stringify(this.presets()));
  }

  private flushToDom() {
    this.applyState({
      accent: this.accent,
      bg: this.bg,
      radius: this.radius,
      spacing: this.spacing,
      heroSize: this.heroRem * 16
    });
  }

  onChange() {
    this.flushToDom();
    localStorage.setItem(
      STORAGE_ACTIVE,
      JSON.stringify({
        accent: this.accent,
        bg: this.bg,
        radius: this.radius,
        spacing: this.spacing,
        heroSize: this.heroRem * 16
      })
    );
  }

  private applyState(s: DesignState) {
    const root = this.doc.documentElement;
    root.style.setProperty('--bgs-accent', s.accent);
    root.style.setProperty('--bgs-bg', s.bg);
    root.style.setProperty('--bgs-radius', `${s.radius}px`);
    root.style.setProperty('--bgs-spacing', `${s.spacing}px`);
    root.style.setProperty('--bgs-hero-size', `${s.heroSize / 16}rem`);
  }

  resetDefaults() {
    this.accent = defaults.accent;
    this.bg = defaults.bg;
    this.radius = defaults.radius;
    this.spacing = defaults.spacing;
    this.heroRem = defaults.heroSize / 16;
    this.onChange();
  }

  savePreset() {
    const name = this.presetName.trim() || `Preset ${this.presets().length + 1}`;
    const state: DesignState = {
      accent: this.accent,
      bg: this.bg,
      radius: this.radius,
      spacing: this.spacing,
      heroSize: this.heroRem * 16
    };
    const next = [...this.presets(), { name, state }];
    this.presets.set(next);
    this.savePresetsToStorage();
    this.presetName = '';
    this.snack.open(`Saved “${name}”`, 'OK', { duration: 2000 });
  }

  loadPreset(p: { name: string; state: DesignState }) {
    const s = p.state;
    this.accent = s.accent;
    this.bg = s.bg;
    this.radius = s.radius;
    this.spacing = s.spacing;
    this.heroRem = s.heroSize / 16;
    this.onChange();
  }

  copyJson() {
    const payload = {
      accent: this.accent,
      bg: this.bg,
      radius: this.radius,
      spacing: this.spacing,
      heroSizeRem: this.heroRem
    };
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    this.snack.open('Copied JSON to clipboard', 'OK', { duration: 2000 });
  }
}
