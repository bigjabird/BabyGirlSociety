import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin-products/admin-products.component').then((m) => m.AdminProductsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./admin-inventory/admin-inventory.component').then((m) => m.AdminInventoryComponent)
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./admin-campaigns/admin-campaigns.component').then((m) => m.AdminCampaignsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin-orders/admin-orders.component').then((m) => m.AdminOrdersComponent)
      }
    ]
  }
];
