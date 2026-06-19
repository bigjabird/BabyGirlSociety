import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/shop/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop-list/shop-list.component').then((m) => m.ShopListComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./features/shop/product-detail/product-detail.component').then((m) => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart-page/cart-page.component').then((m) => m.CartPageComponent)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout-page/checkout-page.component').then((m) => m.CheckoutPageComponent)
  },
  {
    path: 'checkout/success',
    loadComponent: () =>
      import('./features/checkout/checkout-success/checkout-success.component').then((m) => m.CheckoutSuccessComponent)
  },
  {
    path: 'checkout/cancel',
    loadComponent: () =>
      import('./features/checkout/checkout-cancel/checkout-cancel.component').then((m) => m.CheckoutCancelComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
