import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BranchService } from '../../services/branch.service';
import { BranchCreateDTO, BranchDTO, BranchUpdateDTO } from '../../models/branch.model';
import { BranchDialogComponent } from './branch-dialog/branch-dialog.component';
import { BranchDeleteDialogComponent } from './branch-delete-dialog/branch-delete-dialog.component';

@Component({
  selector: 'app-branch',
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
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {
  branches: BranchDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'city', 'state', 'phone', 'email', 'contactPerson', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

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
    this.branchService.getAllBranches(false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.branches = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.snackBar.open('Failed to load branches', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
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

