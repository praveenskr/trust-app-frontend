import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseSubCategoryCreateDTO, ExpenseSubCategoryDTO, ExpenseSubCategoryUpdateDTO } from '../../../models/expense-sub-category.model';
import { ExpenseCategoryService } from '../../../services/expense-category.service';
import { ExpenseCategoryDTO } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-sub-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './expense-sub-category-dialog.component.html',
  styleUrls: ['./expense-sub-category-dialog.component.css']
})
export class ExpenseSubCategoryDialogComponent implements OnInit {
  expenseSubCategoryForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  expenseSubCategoryId?: number;
  expenseCategories: ExpenseCategoryDTO[] = [];
  isLoadingCategories = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseSubCategoryDialogComponent>,
    private expenseCategoryService: ExpenseCategoryService,
    @Inject(MAT_DIALOG_DATA) public data?: { expenseSubCategory: ExpenseSubCategoryDTO }
  ) {
    this.isEditMode = !!data?.expenseSubCategory;
    this.expenseSubCategoryId = data?.expenseSubCategory?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadExpenseCategories();
  }

  private loadExpenseCategories(): void {
    this.isLoadingCategories = true;
    this.expenseCategoryService.getAllExpenseCategories(false).subscribe({
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

  private initializeForm(): void {
    const expenseSubCategory = this.data?.expenseSubCategory;
    
    this.expenseSubCategoryForm = this.fb.group({
      categoryId: [{ value: expenseSubCategory?.categoryId || null, disabled: this.isEditMode }, [Validators.required]],
      code: [{ value: expenseSubCategory?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [expenseSubCategory?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [expenseSubCategory?.description || ''],
      displayOrder: [expenseSubCategory?.displayOrder || null],
      isActive: [expenseSubCategory?.isActive !== undefined ? expenseSubCategory.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.expenseSubCategoryForm.invalid) {
      this.markFormGroupTouched(this.expenseSubCategoryForm);
      return;
    }

    const formValue = this.expenseSubCategoryForm.getRawValue();
    
    if (this.isEditMode && this.expenseSubCategoryId) {
      const updateDTO: ExpenseSubCategoryUpdateDTO = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.expenseSubCategoryId, data: updateDTO });
    } else {
      const createDTO: ExpenseSubCategoryCreateDTO = {
        categoryId: formValue.categoryId,
        code: formValue.code.trim(),
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'create', data: createDTO });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.expenseSubCategoryForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${requiredLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      categoryId: 'Expense Category',
      code: 'Sub-Category Code',
      name: 'Sub-Category Name',
      description: 'Description',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.expenseSubCategoryForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

