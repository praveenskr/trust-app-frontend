import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SubscriptionPlanService } from '../../services/subscription-plan.service';
import { SubscriptionPlanCreateDTO, SubscriptionPlanDTO, SubscriptionPlanUpdateDTO, PLAN_TYPES } from '../../models/subscription-plan.model';
import { SubscriptionPlanDialogComponent } from './subscription-plan-dialog/subscription-plan-dialog.component';
import { SubscriptionPlanDeleteDialogComponent } from './subscription-plan-delete-dialog/subscription-plan-delete-dialog.component';

@Component({
  selector: 'app-subscription-plan',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.css']
})
export class SubscriptionPlanComponent implements OnInit {
  subscriptionPlans: SubscriptionPlanDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'planType', 'durationMonths', 'amount', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private subscriptionPlanService: SubscriptionPlanService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionPlans();
  }

  private loadSubscriptionPlans(): void {
    this.isLoading = true;
    this.subscriptionPlanService.getAllSubscriptionPlans(undefined, false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.subscriptionPlans = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.snackBar.open('Failed to load subscription plans', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SubscriptionPlanDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createSubscriptionPlan(result.data);
        } else if (result.mode === 'edit') {
          this.updateSubscriptionPlan(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(subscriptionPlan: SubscriptionPlanDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(SubscriptionPlanDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { subscriptionPlan }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateSubscriptionPlan(result.id, result.data);
      }
    });
  }

  openDeleteDialog(subscriptionPlan: SubscriptionPlanDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(SubscriptionPlanDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { subscriptionPlan }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteSubscriptionPlan(subscriptionPlan.id);
      }
    });
  }

  private createSubscriptionPlan(createDTO: SubscriptionPlanCreateDTO): void {
    this.isSubmitting = true;
    this.subscriptionPlanService.createSubscriptionPlan(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Subscription plan created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadSubscriptionPlans(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating subscription plan:', error);
        let errorMessage = 'Failed to create subscription plan. Please try again.';
        
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

  private updateSubscriptionPlan(id: number, updateDTO: SubscriptionPlanUpdateDTO): void {
    this.isSubmitting = true;
    this.subscriptionPlanService.updateSubscriptionPlan(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Subscription plan updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadSubscriptionPlans(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating subscription plan:', error);
        let errorMessage = 'Failed to update subscription plan. Please try again.';
        
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

  private deleteSubscriptionPlan(id: number): void {
    this.isSubmitting = true;
    this.subscriptionPlanService.deleteSubscriptionPlan(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Subscription plan deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadSubscriptionPlans(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting subscription plan:', error);
        let errorMessage = 'Failed to delete subscription plan. Please try again.';
        
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

  getPlanTypeLabel(planType: string): string {
    const planTypeObj = PLAN_TYPES.find(p => p.value === planType);
    return planTypeObj ? planTypeObj.label : planType;
  }
}

