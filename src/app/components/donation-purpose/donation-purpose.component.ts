import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DonationPurposeService } from '../../services/donation-purpose.service';
import { DonationPurposeCreateDTO, DonationPurposeDTO, DonationPurposeUpdateDTO } from '../../models/donation-purpose.model';
import { DonationPurposeDialogComponent } from './donation-purpose-dialog/donation-purpose-dialog.component';
import { DonationPurposeDeleteDialogComponent } from './donation-purpose-delete-dialog/donation-purpose-delete-dialog.component';

@Component({
  selector: 'app-donation-purpose',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './donation-purpose.component.html',
  styleUrls: ['./donation-purpose.component.css']
})
export class DonationPurposeComponent implements OnInit {
  donationPurposes: DonationPurposeDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'description', 'displayOrder', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private donationPurposeService: DonationPurposeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDonationPurposes();
  }

  private loadDonationPurposes(): void {
    this.isLoading = true;
    this.donationPurposeService.getAllDonationPurposes(false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.donationPurposes = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading donation purposes:', error);
        this.snackBar.open('Failed to load donation purposes', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(DonationPurposeDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createDonationPurpose(result.data);
        } else if (result.mode === 'edit') {
          this.updateDonationPurpose(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(donationPurpose: DonationPurposeDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(DonationPurposeDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { donationPurpose }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateDonationPurpose(result.id, result.data);
      }
    });
  }

  openDeleteDialog(donationPurpose: DonationPurposeDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(DonationPurposeDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { donationPurpose }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteDonationPurpose(donationPurpose.id);
      }
    });
  }

  private createDonationPurpose(createDTO: DonationPurposeCreateDTO): void {
    this.isSubmitting = true;
    this.donationPurposeService.createDonationPurpose(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation purpose created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonationPurposes(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating donation purpose:', error);
        let errorMessage = 'Failed to create donation purpose. Please try again.';
        
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

  private updateDonationPurpose(id: number, updateDTO: DonationPurposeUpdateDTO): void {
    this.isSubmitting = true;
    this.donationPurposeService.updateDonationPurpose(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation purpose updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonationPurposes(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating donation purpose:', error);
        let errorMessage = 'Failed to update donation purpose. Please try again.';
        
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

  private deleteDonationPurpose(id: number): void {
    this.isSubmitting = true;
    this.donationPurposeService.deleteDonationPurpose(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation purpose deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonationPurposes(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting donation purpose:', error);
        let errorMessage = 'Failed to delete donation purpose. Please try again.';
        
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

