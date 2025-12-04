import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ExpenseSubCategoryCreateDTO, ExpenseSubCategoryDTO, ExpenseSubCategoryUpdateDTO } from '../../../models/expense-sub-category.model';
import { ExpenseCategoryDropdownDTO } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-sub-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  templateUrl: './expense-sub-category-dialog.component.html',
  styleUrls: ['./expense-sub-category-dialog.component.css']
})
export class ExpenseSubCategoryDialogComponent implements OnInit {
  expenseSubCategoryForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  expenseSubCategoryId?: number;
  expenseCategories: ExpenseCategoryDropdownDTO[] = [];
  filteredCategories: ExpenseCategoryDropdownDTO[] = [];
  categoryInputValue = '';
  selectedCategory: ExpenseCategoryDropdownDTO | null = null;
  isSelectingCategory = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseSubCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: {
      expenseSubCategory?: ExpenseSubCategoryDTO;
      expenseCategories?: ExpenseCategoryDropdownDTO[];
    }
  ) {
    this.isEditMode = !!data?.expenseSubCategory;
    this.expenseSubCategoryId = data?.expenseSubCategory?.id;
    this.expenseCategories = data?.expenseCategories || [];
    this.filteredCategories = this.expenseCategories;
    this.initializeForm();
  }

  ngOnInit(): void {
    // Expense categories are now loaded in parent and passed via data
    // Set initial category input value if editing
    if (this.isEditMode && this.data?.expenseSubCategory?.categoryId) {
      const category = this.expenseCategories.find(c => c.id === this.data?.expenseSubCategory?.categoryId);
      if (category) {
        this.selectedCategory = category;
        this.categoryInputValue = `${category.name} (${category.code})`;
      }
    }
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

    // Set category input value if category is already selected (for edit mode)
    const categoryId = this.expenseSubCategoryForm.get('categoryId')?.value;
    if (categoryId && this.expenseCategories.length > 0) {
      const category = this.expenseCategories.find(c => c.id === categoryId);
      if (category) {
        this.selectedCategory = category;
        this.categoryInputValue = `${category.name} (${category.code})`;
      }
    }
  }

  filterCategories(value: string): void {
    // Skip filtering if we're in the process of selecting an option
    if (this.isSelectingCategory) {
      return;
    }
    this.categoryInputValue = value || '';
    this.selectedCategory = null; // Clear selection when typing
    const filterValue = value?.toLowerCase() || '';
    this.filteredCategories = this.expenseCategories.filter(category => 
      category.name.toLowerCase().includes(filterValue) || 
      category.code.toLowerCase().includes(filterValue)
    );
  }

  onCategorySelected(category: ExpenseCategoryDropdownDTO | null): void {
    this.isSelectingCategory = true;
    this.selectedCategory = category;
    if (category) {
      this.expenseSubCategoryForm.patchValue({ categoryId: category.id });
      this.categoryInputValue = `${category.name} (${category.code})`;
    } else {
      this.expenseSubCategoryForm.patchValue({ categoryId: null });
      this.categoryInputValue = '';
    }
    // Reset filtered list to show all after selection
    this.filteredCategories = this.expenseCategories;
    // Reset flag after a short delay to allow the selection to complete
    setTimeout(() => {
      this.isSelectingCategory = false;
    }, 100);
  }

  displayCategoryName = (category: ExpenseCategoryDropdownDTO | null): string => {
    return category ? `${category.name} (${category.code})` : '';
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

