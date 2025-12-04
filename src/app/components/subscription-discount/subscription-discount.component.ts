import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SubscriptionDiscountService } from '../../services/subscription-discount.service';
import { SubscriptionPlanService } from '../../services/subscription-plan.service';
import { SubscriptionDiscountCreateDTO, SubscriptionDiscountDTO, SubscriptionDiscountUpdateDTO } from '../../models/subscription-discount.model';
import { SubscriptionPlanDropdownDTO } from '../../models/subscription-plan.model';
import { SubscriptionDiscountDialogComponent } from './subscription-discount-dialog/subscription-discount-dialog.component';
import { SubscriptionDiscountDeleteDialogComponent } from './subscription-discount-delete-dialog/subscription-discount-delete-dialog.component';

@Component({
  selector: 'app-subscription-discount',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './subscription-discount.component.html',
  styleUrls: ['./subscription-discount.component.css']
})
export class SubscriptionDiscountComponent implements OnInit {
  subscriptionDiscounts: SubscriptionDiscountDTO[] = [];
  displayedColumns: string[] = ['planId', 'discountType', 'discountValue', 'minQuantity', 'maxQuantity', 'validFrom', 'validTo', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;
  subscriptionPlans: SubscriptionPlanDropdownDTO[] = [];
  isLoadingPlans = false;

  constructor(
    private subscriptionDiscountService: SubscriptionDiscountService,
    private subscriptionPlanService: SubscriptionPlanService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionPlans();
    this.loadSubscriptionDiscounts();
  }

  private loadSubscriptionPlans(): void {
    this.isLoadingPlans = true;
    this.subscriptionPlanService.getAllSubscriptionPlansForDropdown().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.subscriptionPlans = response.data;
        }
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.isLoadingPlans = false;
      }
    });
  }

  private loadSubscriptionDiscounts(): void {
    this.isLoading = true;
    this.subscriptionDiscountService.getAllSubscriptionDiscounts().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.subscriptionDiscounts = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subscription discounts:', error);
        this.snackBar.open('Failed to load subscription discounts', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SubscriptionDiscountDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        subscriptionDiscount: undefined,
        subscriptionPlans: this.subscriptionPlans
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createSubscriptionDiscount(result.data);
        } else if (result.mode === 'edit') {
          this.updateSubscriptionDiscount(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(subscriptionDiscount: SubscriptionDiscountDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(SubscriptionDiscountDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        subscriptionDiscount,
        subscriptionPlans: this.subscriptionPlans
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateSubscriptionDiscount(result.id, result.data);
      }
    });
  }

  openDeleteDialog(subscriptionDiscount: SubscriptionDiscountDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(SubscriptionDiscountDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { subscriptionDiscount }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteSubscriptionDiscount(subscriptionDiscount.id);
      }
    });
  }

  private createSubscriptionDiscount(createDTO: SubscriptionDiscountCreateDTO): void {
    this.isSubmitting = true;
    this.subscriptionDiscountService.createSubscriptionDiscount(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Subscription discount created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadSubscriptionDiscounts(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating subscription discount:', error);
        let errorMessage = 'Failed to create subscription discount. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  private updateSubscriptionDiscount(id: number, updateDTO: SubscriptionDiscountUpdateDTO): void {
    this.isSubmitting = true;
    this.subscriptionDiscountService.updateSubscriptionDiscount(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Subscription discount updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadSubscriptionDiscounts(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating subscription discount:', error);
        let errorMessage = 'Failed to update subscription discount. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  private deleteSubscriptionDiscount(id: number): void {
    this.isSubmitting = true;
    this.subscriptionDiscountService.deleteSubscriptionDiscount(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Subscription discount deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadSubscriptionDiscounts(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting subscription discount:', error);
        let errorMessage = 'Failed to delete subscription discount. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }
}

