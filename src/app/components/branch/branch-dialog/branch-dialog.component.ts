import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BranchCreateDTO, BranchDTO, BranchUpdateDTO } from '../../../models/branch.model';

@Component({
  selector: 'app-branch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './branch-dialog.component.html',
  styleUrls: ['./branch-dialog.component.css']
})
export class BranchDialogComponent {
  branchForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  branchId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BranchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { branch: BranchDTO }
  ) {
    this.isEditMode = !!data?.branch;
    this.branchId = data?.branch?.id;
    this.initializeForm();
  }

  private initializeForm(): void {
    const branch = this.data?.branch;
    
    this.branchForm = this.fb.group({
      code: [{ value: branch?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [branch?.name || '', [Validators.required, Validators.maxLength(255)]],
      address: [branch?.address || ''],
      city: [branch?.city || ''],
      state: [branch?.state || ''],
      pincode: [branch?.pincode || ''],
      phone: [branch?.phone || ''],
      email: [branch?.email || '', [Validators.email]],
      contactPerson: [branch?.contactPerson || ''],
      isActive: [branch?.isActive !== undefined ? branch.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      this.markFormGroupTouched(this.branchForm);
      return;
    }

    const formValue = this.branchForm.getRawValue();
    
    if (this.isEditMode && this.branchId) {
      const updateDTO: BranchUpdateDTO = {
        name: formValue.name.trim(),
        address: formValue.address?.trim() || undefined,
        city: formValue.city?.trim() || undefined,
        state: formValue.state?.trim() || undefined,
        pincode: formValue.pincode?.trim() || undefined,
        phone: formValue.phone?.trim() || undefined,
        email: formValue.email?.trim() || undefined,
        contactPerson: formValue.contactPerson?.trim() || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.branchId, data: updateDTO });
    } else {
      const createDTO: BranchCreateDTO = {
        code: formValue.code.trim(),
        name: formValue.name.trim(),
        address: formValue.address?.trim() || undefined,
        city: formValue.city?.trim() || undefined,
        state: formValue.state?.trim() || undefined,
        pincode: formValue.pincode?.trim() || undefined,
        phone: formValue.phone?.trim() || undefined,
        email: formValue.email?.trim() || undefined,
        contactPerson: formValue.contactPerson?.trim() || undefined,
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
    const control = this.branchForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${requiredLength} characters`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Branch Code',
      name: 'Branch Name',
      address: 'Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      phone: 'Phone',
      email: 'Email',
      contactPerson: 'Contact Person'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.branchForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

