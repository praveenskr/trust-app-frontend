import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseSubCategoryService } from '../../services/expense-sub-category.service';
import { ExpenseCategoryService } from '../../services/expense-category.service';
import { ExpenseSubCategoryCreateDTO, ExpenseSubCategoryDTO, ExpenseSubCategoryUpdateDTO } from '../../models/expense-sub-category.model';
import { ExpenseCategoryDropdownDTO } from '../../models/expense-category.model';
import { ExpenseSubCategoryDialogComponent } from './expense-sub-category-dialog/expense-sub-category-dialog.component';
import { ExpenseSubCategoryDeleteDialogComponent } from './expense-sub-category-delete-dialog/expense-sub-category-delete-dialog.component';

@Component({
  selector: 'app-expense-sub-category',
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
  templateUrl: './expense-sub-category.component.html',
  styleUrls: ['./expense-sub-category.component.css']
})
export class ExpenseSubCategoryComponent implements OnInit {
  expenseSubCategories: ExpenseSubCategoryDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'description', 'displayOrder', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;
  expenseCategories: ExpenseCategoryDropdownDTO[] = [];
  isLoadingCategories = false;

  constructor(
    private expenseSubCategoryService: ExpenseSubCategoryService,
    private expenseCategoryService: ExpenseCategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadExpenseCategories();
    this.loadExpenseSubCategories();
  }

  private loadExpenseCategories(): void {
    this.isLoadingCategories = true;
    this.expenseCategoryService.getAllExpenseCategoriesForDropdown().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.expenseCategories = response.data;
        }
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading expense categories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  private loadExpenseSubCategories(): void {
    this.isLoading = true;
    this.expenseSubCategoryService.getAllExpenseSubCategories(undefined, false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.expenseSubCategories = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expense sub-categories:', error);
        this.snackBar.open('Failed to load expense sub-categories', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ExpenseSubCategoryDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        expenseSubCategory: undefined,
        expenseCategories: this.expenseCategories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createExpenseSubCategory(result.data);
        } else if (result.mode === 'edit') {
          this.updateExpenseSubCategory(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(expenseSubCategory: ExpenseSubCategoryDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(ExpenseSubCategoryDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        expenseSubCategory,
        expenseCategories: this.expenseCategories
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
        this.updateExpenseSubCategory(result.id, result.data);
      }
    });
  }

  openDeleteDialog(expenseSubCategory: ExpenseSubCategoryDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(ExpenseSubCategoryDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { expenseSubCategory }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteExpenseSubCategory(expenseSubCategory.id);
      }
    });
  }

  private createExpenseSubCategory(createDTO: ExpenseSubCategoryCreateDTO): void {
    this.isSubmitting = true;
    this.expenseSubCategoryService.createExpenseSubCategory(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Expense sub-category created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadExpenseSubCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating expense sub-category:', error);
        let errorMessage = 'Failed to create expense sub-category. Please try again.';
        
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

  private updateExpenseSubCategory(id: number, updateDTO: ExpenseSubCategoryUpdateDTO): void {
    this.isSubmitting = true;
    this.expenseSubCategoryService.updateExpenseSubCategory(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Expense sub-category updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadExpenseSubCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating expense sub-category:', error);
        let errorMessage = 'Failed to update expense sub-category. Please try again.';
        
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

  private deleteExpenseSubCategory(id: number): void {
    this.isSubmitting = true;
    this.expenseSubCategoryService.deleteExpenseSubCategory(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Expense sub-category deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadExpenseSubCategories(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting expense sub-category:', error);
        let errorMessage = 'Failed to delete expense sub-category. Please try again.';
        
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

