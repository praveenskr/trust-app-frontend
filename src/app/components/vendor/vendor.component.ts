import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VendorService } from '../../services/vendor.service';
import { VendorCreateDTO, VendorDTO, VendorUpdateDTO } from '../../models/vendor.model';
import { VendorDialogComponent } from './vendor-dialog/vendor-dialog.component';
import { VendorDeleteDialogComponent } from './vendor-delete-dialog/vendor-delete-dialog.component';

@Component({
  selector: 'app-vendor',
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
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent implements OnInit {
  vendors: VendorDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'contactPerson', 'phone', 'email', 'city', 'state', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private vendorService: VendorService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  private loadVendors(): void {
    this.isLoading = true;
    this.vendorService.getAllVendors(false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.vendors = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        this.snackBar.open('Failed to load vendors', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(VendorDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createVendor(result.data);
        } else if (result.mode === 'edit') {
          this.updateVendor(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(vendor: VendorDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(VendorDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { vendor }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateVendor(result.id, result.data);
      }
    });
  }

  openDeleteDialog(vendor: VendorDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(VendorDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { vendor }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteVendor(vendor.id);
      }
    });
  }

  private createVendor(createDTO: VendorCreateDTO): void {
    this.isSubmitting = true;
    this.vendorService.createVendor(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Vendor created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadVendors(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating vendor:', error);
        let errorMessage = 'Failed to create vendor. Please try again.';
        
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

  private updateVendor(id: number, updateDTO: VendorUpdateDTO): void {
    this.isSubmitting = true;
    this.vendorService.updateVendor(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Vendor updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadVendors(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating vendor:', error);
        let errorMessage = 'Failed to update vendor. Please try again.';
        
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

  private deleteVendor(id: number): void {
    this.isSubmitting = true;
    this.vendorService.deleteVendor(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Vendor deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadVendors(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting vendor:', error);
        let errorMessage = 'Failed to delete vendor. Please try again.';
        
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

