import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DonationPurposeCreateDTO, DonationPurposeDTO, DonationPurposeUpdateDTO } from '../../../models/donation-purpose.model';

@Component({
  selector: 'app-donation-purpose-dialog',
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
  templateUrl: './donation-purpose-dialog.component.html',
  styleUrls: ['./donation-purpose-dialog.component.css']
})
export class DonationPurposeDialogComponent {
  donationPurposeForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  donationPurposeId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DonationPurposeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { donationPurpose: DonationPurposeDTO }
  ) {
    this.isEditMode = !!data?.donationPurpose;
    this.donationPurposeId = data?.donationPurpose?.id;
    this.initializeForm();
  }

  private initializeForm(): void {
    const donationPurpose = this.data?.donationPurpose;
    
    this.donationPurposeForm = this.fb.group({
      code: [{ value: donationPurpose?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [donationPurpose?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [donationPurpose?.description || ''],
      displayOrder: [donationPurpose?.displayOrder || null],
      isActive: [donationPurpose?.isActive !== undefined ? donationPurpose.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.donationPurposeForm.invalid) {
      this.markFormGroupTouched(this.donationPurposeForm);
      return;
    }

    const formValue = this.donationPurposeForm.getRawValue();
    
    if (this.isEditMode && this.donationPurposeId) {
      const updateDTO: DonationPurposeUpdateDTO = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        displayOrder: formValue.displayOrder || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.donationPurposeId, data: updateDTO });
    } else {
      const createDTO: DonationPurposeCreateDTO = {
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
    const control = this.donationPurposeForm.get(fieldName);
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
      code: 'Purpose Code',
      name: 'Purpose Name',
      description: 'Description',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.donationPurposeForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

