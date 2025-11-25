import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpenseCategoryCreateDTO, ExpenseCategoryDTO, ExpenseCategoryUpdateDTO } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './expense-category-dialog.component.html',
  styleUrls: ['./expense-category-dialog.component.css']
})
export class ExpenseCategoryDialogComponent {
  expenseCategoryForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  expenseCategoryId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { expenseCategory: ExpenseCategoryDTO }
  ) {
    this.isEditMode = !!data?.expenseCategory;
    this.expenseCategoryId = data?.expenseCategory?.id;
    this.initializeForm();
  }

  private initializeForm(): void {
    const expenseCategory = this.data?.expenseCategory;
    
    this.expenseCategoryForm = this.fb.group({
      code: [{ value: expenseCategory?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [expenseCategory?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [expenseCategory?.description || ''],
      displayOrder: [expenseCategory?.displayOrder || null],
      isActive: [expenseCategory?.isActive !== undefined ? expenseCategory.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.expenseCategoryForm.invalid) {
      this.markFormGroupTouched(this.expenseCategoryForm);
      return;
    }

    const formValue = this.expenseCategoryForm.getRawValue();
    
    if (this.isEditMode && this.expenseCategoryId) {
      const updateDTO: ExpenseCategoryUpdateDTO = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.expenseCategoryId, data: updateDTO });
    } else {
      const createDTO: ExpenseCategoryCreateDTO = {
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
    const control = this.expenseCategoryForm.get(fieldName);
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
      code: 'Category Code',
      name: 'Category Name',
      description: 'Description',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.expenseCategoryForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

