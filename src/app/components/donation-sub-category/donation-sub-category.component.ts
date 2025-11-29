import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DonationSubCategoryService } from '../../services/donation-sub-category.service';
import { DonationPurposeService } from '../../services/donation-purpose.service';
import { DonationSubCategoryCreateDTO, DonationSubCategoryDTO, DonationSubCategoryUpdateDTO } from '../../models/donation-sub-category.model';
import { DonationPurposeDropdownDTO } from '../../models/donation-purpose.model';
import { DonationSubCategoryDialogComponent } from './donation-sub-category-dialog/donation-sub-category-dialog.component';
import { DonationSubCategoryDeleteDialogComponent } from './donation-sub-category-delete-dialog/donation-sub-category-delete-dialog.component';

@Component({
  selector: 'app-donation-sub-category',
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
  templateUrl: './donation-sub-category.component.html',
  styleUrls: ['./donation-sub-category.component.css']
})
export class DonationSubCategoryComponent implements OnInit {
  donationSubCategories: DonationSubCategoryDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'description', 'displayOrder', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;
  donationPurposes: DonationPurposeDropdownDTO[] = [];
  isLoadingPurposes = false;

  constructor(
    private donationSubCategoryService: DonationSubCategoryService,
    private donationPurposeService: DonationPurposeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDonationPurposes();
    this.loadDonationSubCategories();
  }

  private loadDonationPurposes(): void {
    this.isLoadingPurposes = true;
    this.donationPurposeService.getAllDonationPurposesForDropdown().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.donationPurposes = response.data;
        }
        this.isLoadingPurposes = false;
      },
      error: (error) => {
        console.error('Error loading donation purposes:', error);
        this.isLoadingPurposes = false;
      }
    });
  }

  private loadDonationSubCategories(): void {
    this.isLoading = true;
    this.donationSubCategoryService.getAllDonationSubCategories(undefined, false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.donationSubCategories = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading donation sub-categories:', error);
        this.snackBar.open('Failed to load donation sub-categories', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(DonationSubCategoryDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        donationSubCategory: undefined,
        donationPurposes: this.donationPurposes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createDonationSubCategory(result.data);
        } else if (result.mode === 'edit') {
          this.updateDonationSubCategory(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(donationSubCategory: DonationSubCategoryDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(DonationSubCategoryDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        donationSubCategory,
        donationPurposes: this.donationPurposes
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
        this.updateDonationSubCategory(result.id, result.data);
      }
    });
  }

  openDeleteDialog(donationSubCategory: DonationSubCategoryDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(DonationSubCategoryDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { donationSubCategory }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteDonationSubCategory(donationSubCategory.id);
      }
    });
  }

  private createDonationSubCategory(createDTO: DonationSubCategoryCreateDTO): void {
    this.isSubmitting = true;
    this.donationSubCategoryService.createDonationSubCategory(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation sub-category created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonationSubCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating donation sub-category:', error);
        let errorMessage = 'Failed to create donation sub-category. Please try again.';
        
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

  private updateDonationSubCategory(id: number, updateDTO: DonationSubCategoryUpdateDTO): void {
    this.isSubmitting = true;
    this.donationSubCategoryService.updateDonationSubCategory(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation sub-category updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonationSubCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating donation sub-category:', error);
        let errorMessage = 'Failed to update donation sub-category. Please try again.';
        
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

  private deleteDonationSubCategory(id: number): void {
    this.isSubmitting = true;
    this.donationSubCategoryService.deleteDonationSubCategory(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation sub-category deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonationSubCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting donation sub-category:', error);
        let errorMessage = 'Failed to delete donation sub-category. Please try again.';
        
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

