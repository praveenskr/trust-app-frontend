import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { DonationPurposeComponent } from './components/donation-purpose/donation-purpose.component';
import { DonationSubCategoryComponent } from './components/donation-sub-category/donation-sub-category.component';
import { ExpenseCategoryComponent } from './components/expense-category/expense-category.component';
import { ExpenseSubCategoryComponent } from './components/expense-sub-category/expense-sub-category.component';
import { BranchComponent } from './components/branch/branch.component';
import { EventComponent } from './components/event/event.component';
import { SubscriptionPlanComponent } from './components/subscription-plan/subscription-plan.component';
import { SubscriptionDiscountComponent } from './components/subscription-discount/subscription-discount.component';
import { VendorComponent } from './components/vendor/vendor.component';
import { PaymentModeComponent } from './components/payment-mode/payment-mode.component';
import { SerialNumberConfigComponent } from './components/serial-number-config/serial-number-config.component';
import { DonationComponent } from './components/donation/donation.component';
import { UserBranchAccessComponent } from './components/user-branch-access/user-branch-access.component';
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
            component: DonationSubCategoryComponent
          },
          {
            path: 'expense-category',
            component: ExpenseCategoryComponent
          },
          {
            path: 'expense-sub-category',
            component: ExpenseSubCategoryComponent
          },
          {
            path: 'event',
            component: EventComponent
          },
          {
            path: 'serial-number-config',
            component: SerialNumberConfigComponent
          },
          {
            path: 'subscription-plan',
            component: SubscriptionPlanComponent
          },
          {
            path: 'subscription-discount',
            component: SubscriptionDiscountComponent
          },
          {
            path: 'vendor',
            component: VendorComponent
          },
          {
            path: 'payment-mode',
            component: PaymentModeComponent
          },
          {
            path: 'branch',
            component: BranchComponent
          },
          {
            path: 'user-branch-access',
            component: UserBranchAccessComponent
          }
        ]
      },
      {
        path: 'transactions',
        children: [
          {
            path: 'donation',
            component: DonationComponent
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

