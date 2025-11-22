import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaymentModeService } from '../../services/payment-mode.service';
import { PaymentModeCreateDTO, PaymentModeDTO, PaymentModeUpdateDTO } from '../../models/payment-mode.model';
import { PaymentModeDialogComponent } from './payment-mode-dialog/payment-mode-dialog.component';
import { PaymentModeDeleteDialogComponent } from './payment-mode-delete-dialog/payment-mode-delete-dialog.component';

@Component({
  selector: 'app-payment-mode',
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
  templateUrl: './payment-mode.component.html',
  styleUrls: ['./payment-mode.component.css']
})
export class PaymentModeComponent implements OnInit {
  paymentModes: PaymentModeDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'description', 'requiresReceipt', 'displayOrder', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private paymentModeService: PaymentModeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPaymentModes();
  }

  private loadPaymentModes(): void {
    this.isLoading = true;
    this.paymentModeService.getAllPaymentModes(false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.paymentModes = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payment modes:', error);
        this.snackBar.open('Failed to load payment modes', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PaymentModeDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createPaymentMode(result.data);
        } else if (result.mode === 'edit') {
          this.updatePaymentMode(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(paymentMode: PaymentModeDTO): void {
    const dialogRef = this.dialog.open(PaymentModeDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { paymentMode }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.mode === 'edit') {
        this.updatePaymentMode(result.id, result.data);
      }
    });
  }

  openDeleteDialog(paymentMode: PaymentModeDTO): void {
    const dialogRef = this.dialog.open(PaymentModeDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { paymentMode }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deletePaymentMode(paymentMode.id);
      }
    });
  }

  private createPaymentMode(createDTO: PaymentModeCreateDTO): void {
    this.isSubmitting = true;
    this.paymentModeService.createPaymentMode(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Payment mode created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadPaymentModes(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating payment mode:', error);
        let errorMessage = 'Failed to create payment mode. Please try again.';
        
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

  private updatePaymentMode(id: number, updateDTO: PaymentModeUpdateDTO): void {
    this.isSubmitting = true;
    this.paymentModeService.updatePaymentMode(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Payment mode updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadPaymentModes(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating payment mode:', error);
        let errorMessage = 'Failed to update payment mode. Please try again.';
        
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

  private deletePaymentMode(id: number): void {
    this.isSubmitting = true;
    this.paymentModeService.deletePaymentMode(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Payment mode deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadPaymentModes(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting payment mode:', error);
        let errorMessage = 'Failed to delete payment mode. Please try again.';
        
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

