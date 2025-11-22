import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { ExpenseCategoryCreateDTO, ExpenseCategoryDTO, ExpenseCategoryUpdateDTO } from '../../models/expense-category.model';
import { ExpenseCategoryDialogComponent } from './expense-category-dialog/expense-category-dialog.component';
import { ExpenseCategoryDeleteDialogComponent } from './expense-category-delete-dialog/expense-category-delete-dialog.component';

@Component({
  selector: 'app-expense-category',
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
  templateUrl: './expense-category.component.html',
  styleUrls: ['./expense-category.component.css']
})
export class ExpenseCategoryComponent implements OnInit {
  expenseCategories: ExpenseCategoryDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'description', 'displayOrder', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private expenseCategoryService: ExpenseCategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadExpenseCategories();
  }

  private loadExpenseCategories(): void {
    this.isLoading = true;
    this.expenseCategoryService.getAllExpenseCategories(false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.expenseCategories = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expense categories:', error);
        this.snackBar.open('Failed to load expense categories', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ExpenseCategoryDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createExpenseCategory(result.data);
        } else if (result.mode === 'edit') {
          this.updateExpenseCategory(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(expenseCategory: ExpenseCategoryDTO): void {
    const dialogRef = this.dialog.open(ExpenseCategoryDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { expenseCategory }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.mode === 'edit') {
        this.updateExpenseCategory(result.id, result.data);
      }
    });
  }

  openDeleteDialog(expenseCategory: ExpenseCategoryDTO): void {
    const dialogRef = this.dialog.open(ExpenseCategoryDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { expenseCategory }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteExpenseCategory(expenseCategory.id);
      }
    });
  }

  private createExpenseCategory(createDTO: ExpenseCategoryCreateDTO): void {
    this.isSubmitting = true;
    this.expenseCategoryService.createExpenseCategory(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Expense category created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadExpenseCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating expense category:', error);
        let errorMessage = 'Failed to create expense category. Please try again.';
        
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

  private updateExpenseCategory(id: number, updateDTO: ExpenseCategoryUpdateDTO): void {
    this.isSubmitting = true;
    this.expenseCategoryService.updateExpenseCategory(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Expense category updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadExpenseCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating expense category:', error);
        let errorMessage = 'Failed to update expense category. Please try again.';
        
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

  private deleteExpenseCategory(id: number): void {
    this.isSubmitting = true;
    this.expenseCategoryService.deleteExpenseCategory(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Expense category deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadExpenseCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting expense category:', error);
        let errorMessage = 'Failed to delete expense category. Please try again.';
        
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

