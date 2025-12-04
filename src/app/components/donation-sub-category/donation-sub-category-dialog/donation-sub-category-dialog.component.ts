import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DonationSubCategoryCreateDTO, DonationSubCategoryDTO, DonationSubCategoryUpdateDTO } from '../../../models/donation-sub-category.model';
import { DonationPurposeDropdownDTO } from '../../../models/donation-purpose.model';

@Component({
  selector: 'app-donation-sub-category-dialog',
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
  templateUrl: './donation-sub-category-dialog.component.html',
  styleUrls: ['./donation-sub-category-dialog.component.css']
})
export class DonationSubCategoryDialogComponent implements OnInit {
  donationSubCategoryForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  donationSubCategoryId?: number;
  donationPurposes: DonationPurposeDropdownDTO[] = [];
  filteredPurposes: DonationPurposeDropdownDTO[] = [];
  purposeInputValue = '';
  selectedPurpose: DonationPurposeDropdownDTO | null = null;
  isSelectingPurpose = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DonationSubCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: {
      donationSubCategory?: DonationSubCategoryDTO;
      donationPurposes?: DonationPurposeDropdownDTO[];
    }
  ) {
    this.isEditMode = !!data?.donationSubCategory;
    this.donationSubCategoryId = data?.donationSubCategory?.id;
    this.donationPurposes = data?.donationPurposes || [];
    this.filteredPurposes = this.donationPurposes;
    this.initializeForm();
  }

  ngOnInit(): void {
    // Donation purposes are now loaded in parent and passed via data
    // Set initial purpose input value if editing
    if (this.isEditMode && this.data?.donationSubCategory?.purposeId) {
      const purpose = this.donationPurposes.find(p => p.id === this.data?.donationSubCategory?.purposeId);
      if (purpose) {
        this.selectedPurpose = purpose;
        this.purposeInputValue = `${purpose.name} (${purpose.code})`;
      }
    }
  }

  private initializeForm(): void {
    const donationSubCategory = this.data?.donationSubCategory;
    
    this.donationSubCategoryForm = this.fb.group({
      purposeId: [{ value: donationSubCategory?.purposeId || null, disabled: this.isEditMode }, [Validators.required]],
      code: [{ value: donationSubCategory?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [donationSubCategory?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [donationSubCategory?.description || ''],
      displayOrder: [donationSubCategory?.displayOrder || null],
      isActive: [donationSubCategory?.isActive !== undefined ? donationSubCategory.isActive : true]
    });

    // Set purpose input value if purpose is already selected (for edit mode)
    const purposeId = this.donationSubCategoryForm.get('purposeId')?.value;
    if (purposeId && this.donationPurposes.length > 0) {
      const purpose = this.donationPurposes.find(p => p.id === purposeId);
      if (purpose) {
        this.selectedPurpose = purpose;
        this.purposeInputValue = `${purpose.name} (${purpose.code})`;
      }
    }
  }

  filterPurposes(value: string): void {
    // Skip filtering if we're in the process of selecting an option
    if (this.isSelectingPurpose) {
      return;
    }
    this.purposeInputValue = value || '';
    this.selectedPurpose = null; // Clear selection when typing
    const filterValue = value?.toLowerCase() || '';
    this.filteredPurposes = this.donationPurposes.filter(purpose => 
      purpose.name.toLowerCase().includes(filterValue) || 
      purpose.code.toLowerCase().includes(filterValue)
    );
  }

  onPurposeSelected(purpose: DonationPurposeDropdownDTO | null): void {
    this.isSelectingPurpose = true;
    this.selectedPurpose = purpose;
    if (purpose) {
      this.donationSubCategoryForm.patchValue({ purposeId: purpose.id });
      this.purposeInputValue = `${purpose.name} (${purpose.code})`;
    } else {
      this.donationSubCategoryForm.patchValue({ purposeId: null });
      this.purposeInputValue = '';
    }
    // Reset filtered list to show all after selection
    this.filteredPurposes = this.donationPurposes;
    // Reset flag after a short delay to allow the selection to complete
    setTimeout(() => {
      this.isSelectingPurpose = false;
    }, 100);
  }

  displayPurposeName = (purpose: DonationPurposeDropdownDTO | null): string => {
    return purpose ? `${purpose.name} (${purpose.code})` : '';
  }

  onSubmit(): void {
    if (this.donationSubCategoryForm.invalid) {
      this.markFormGroupTouched(this.donationSubCategoryForm);
      return;
    }

    const formValue = this.donationSubCategoryForm.getRawValue();
    
    if (this.isEditMode && this.donationSubCategoryId) {
      const updateDTO: DonationSubCategoryUpdateDTO = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.donationSubCategoryId, data: updateDTO });
    } else {
      const createDTO: DonationSubCategoryCreateDTO = {
        purposeId: formValue.purposeId,
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
    const control = this.donationSubCategoryForm.get(fieldName);
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
      purposeId: 'Donation Purpose',
      code: 'Sub-Category Code',
      name: 'Sub-Category Name',
      description: 'Description',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.donationSubCategoryForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

