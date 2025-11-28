import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DonationSubCategoryCreateDTO, DonationSubCategoryDTO, DonationSubCategoryUpdateDTO } from '../../../models/donation-sub-category.model';
import { DonationPurposeService } from '../../../services/donation-purpose.service';
import { DonationPurposeDTO } from '../../../models/donation-purpose.model';

@Component({
  selector: 'app-donation-sub-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './donation-sub-category-dialog.component.html',
  styleUrls: ['./donation-sub-category-dialog.component.css']
})
export class DonationSubCategoryDialogComponent implements OnInit {
  donationSubCategoryForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  donationSubCategoryId?: number;
  donationPurposes: DonationPurposeDTO[] = [];
  isLoadingPurposes = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DonationSubCategoryDialogComponent>,
    private donationPurposeService: DonationPurposeService,
    @Inject(MAT_DIALOG_DATA) public data?: { donationSubCategory: DonationSubCategoryDTO }
  ) {
    this.isEditMode = !!data?.donationSubCategory;
    this.donationSubCategoryId = data?.donationSubCategory?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadDonationPurposes();
  }

  private loadDonationPurposes(): void {
    this.isLoadingPurposes = true;
    this.donationPurposeService.getAllDonationPurposes(false).subscribe({
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

