import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BranchService } from '../../services/branch.service';
import { BranchCreateDTO, BranchDTO, BranchUpdateDTO } from '../../models/branch.model';
import { BranchDialogComponent } from './branch-dialog/branch-dialog.component';
import { BranchDeleteDialogComponent } from './branch-delete-dialog/branch-delete-dialog.component';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {
  branches: BranchDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'city', 'state', 'phone', 'email', 'contactPerson', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;
  
  // Pagination properties
  totalElements = 0;
  totalPages = 0;
  pageSize = 20;
  currentPage = 0;
  pageSizeOptions = [10, 20, 50, 100];
  
  // Filter properties
  includeInactive = false;
  cityFilter = '';
  stateFilter = '';
  searchFilter = '';
  
  // Sort properties
  sortBy = 'name';
  sortDir: 'ASC' | 'DESC' = 'ASC';

  constructor(
    private branchService: BranchService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.isLoading = true;
    this.branchService.getAllBranches(
      this.includeInactive,
      this.cityFilter || undefined,
      this.stateFilter || undefined,
      this.searchFilter || undefined,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.branches = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        let errorMessage = 'Failed to load branches';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBranches();
  }
  
  applyFilters(): void {
    this.currentPage = 0; // Reset to first page when filtering
    this.loadBranches();
  }
  
  clearFilters(): void {
    this.includeInactive = false;
    this.cityFilter = '';
    this.stateFilter = '';
    this.searchFilter = '';
    this.currentPage = 0;
    this.sortBy = 'name';
    this.sortDir = 'ASC';
    this.loadBranches();
  }
  
  onSortChange(sortField: string): void {
    if (this.sortBy === sortField) {
      // Toggle sort direction
      this.sortDir = this.sortDir === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = sortField;
      this.sortDir = 'ASC';
    }
    this.currentPage = 0; // Reset to first page when sorting
    this.loadBranches();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(BranchDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createBranch(result.data);
        } else if (result.mode === 'edit') {
          this.updateBranch(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(branch: BranchDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(BranchDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { branch }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateBranch(result.id, result.data);
      }
    });
  }

  openDeleteDialog(branch: BranchDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(BranchDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { branch }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteBranch(branch.id);
      }
    });
  }

  private createBranch(createDTO: BranchCreateDTO): void {
    this.isSubmitting = true;
    this.branchService.createBranch(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Branch created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadBranches(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating branch:', error);
        let errorMessage = 'Failed to create branch. Please try again.';
        
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

  private updateBranch(id: number, updateDTO: BranchUpdateDTO): void {
    this.isSubmitting = true;
    this.branchService.updateBranch(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Branch updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadBranches(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating branch:', error);
        let errorMessage = 'Failed to update branch. Please try again.';
        
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

  private deleteBranch(id: number): void {
    this.isSubmitting = true;
    this.branchService.deleteBranch(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Branch deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadBranches(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting branch:', error);
        let errorMessage = 'Failed to delete branch. Please try again.';
        
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

