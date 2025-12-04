import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  user: any = null;
  masterMenuItems: MenuItem[] = [
    { label: 'Donation Purpose', icon: 'category', route: '/home/master/donation-purpose' },
    { label: 'Donation Sub Category', icon: 'subdirectory_arrow_right', route: '/home/master/donation-sub-category' },
    { label: 'Expense Category', icon: 'account_balance_wallet', route: '/home/master/expense-category' },
    { label: 'Expense Sub Category', icon: 'subdirectory_arrow_right', route: '/home/master/expense-sub-category' },
    { label: 'Event', icon: 'event', route: '/home/master/event' },
    { label: 'Serial Number Config', icon: 'confirmation_number', route: '/home/master/serial-number-config' },
    { label: 'Subscription Plan', icon: 'subscriptions', route: '/home/master/subscription-plan' },
    { label: 'Subscription Discount', icon: 'local_offer', route: '/home/master/subscription-discount' },
    { label: 'Vendor', icon: 'store', route: '/home/master/vendor' },
    { label: 'Payment Mode', icon: 'payment', route: '/home/master/payment-mode' },
    { label: 'Branch', icon: 'business', route: '/home/master/branch' },
    { label: 'User Branch Access', icon: 'account_tree', route: '/home/master/user-branch-access' },
    { label: 'Inter Branch Transfer', icon: 'swap_horiz', route: '/home/master/inter-branch-transfer' }
  ];

  transactionMenuItems: MenuItem[] = [
    { label: 'Donation', icon: 'volunteer_activism', route: '/home/transactions/donation' }
  ];

  isMasterMenuOpen = false;
  isTransactionMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  toggleMasterMenu(): void {
    this.isMasterMenuOpen = !this.isMasterMenuOpen;
  }

  toggleTransactionMenu(): void {
    this.isTransactionMenuOpen = !this.isTransactionMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Logged out successfully',
            'Close',
            { duration: 2000 }
          );
        }
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
        // Even if API call fails, clear local storage and redirect
        this.snackBar.open('Logged out locally', 'Close', { duration: 2000 });
        this.router.navigate(['/login']);
      }
    });
  }
}

