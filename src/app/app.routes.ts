import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { DonationPurposeComponent } from './components/donation-purpose/donation-purpose.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent
  },
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'master',
        children: [
          {
            path: 'donation-purpose',
            component: DonationPurposeComponent
          },
          {
            path: 'donation-sub-category',
            component: HomeComponent
          },
          {
            path: 'expense-category',
            component: HomeComponent
          },
          {
            path: 'expense-sub-category',
            component: HomeComponent
          },
          {
            path: 'event',
            component: HomeComponent
          },
          {
            path: 'serial-number-config',
            component: HomeComponent
          },
          {
            path: 'subscription-plan',
            component: HomeComponent
          },
          {
            path: 'subscription-discount',
            component: HomeComponent
          },
          {
            path: 'vendor',
            component: HomeComponent
          },
          {
            path: 'payment-mode',
            component: HomeComponent
          },
          {
            path: 'branch',
            component: HomeComponent
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

