import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { VendorCreateDTO, VendorDTO, VendorUpdateDTO } from '../../../models/vendor.model';

@Component({
  selector: 'app-vendor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './vendor-dialog.component.html',
  styleUrls: ['./vendor-dialog.component.css']
})
export class VendorDialogComponent implements OnInit {
  vendorForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  vendorId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VendorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { vendor: VendorDTO }
  ) {
    this.isEditMode = !!data?.vendor;
    this.vendorId = data?.vendor?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
  }

  private initializeForm(): void {
    const vendor = this.data?.vendor;
    
    this.vendorForm = this.fb.group({
      code: [vendor?.code || '', [Validators.required, Validators.maxLength(50)]],
      name: [vendor?.name || '', [Validators.required, Validators.maxLength(255)]],
      contactPerson: [vendor?.contactPerson || ''],
      phone: [vendor?.phone || ''],
      email: [vendor?.email || '', [Validators.email]],
      address: [vendor?.address || ''],
      city: [vendor?.city || ''],
      state: [vendor?.state || ''],
      pincode: [vendor?.pincode || ''],
      gstNumber: [vendor?.gstNumber || ''],
      panNumber: [vendor?.panNumber || ''],
      isActive: [vendor?.isActive !== undefined ? vendor.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.vendorForm.invalid) {
      this.markFormGroupTouched(this.vendorForm);
      return;
    }

    const formValue = this.vendorForm.getRawValue();
    
    if (this.isEditMode && this.vendorId) {
      const updateDTO: VendorUpdateDTO = {
        code: formValue.code,
        name: formValue.name,
        contactPerson: formValue.contactPerson || undefined,
        phone: formValue.phone || undefined,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        pincode: formValue.pincode || undefined,
        gstNumber: formValue.gstNumber || undefined,
        panNumber: formValue.panNumber || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.vendorId, data: updateDTO });
    } else {
      const createDTO: VendorCreateDTO = {
        code: formValue.code,
        name: formValue.name,
        contactPerson: formValue.contactPerson || undefined,
        phone: formValue.phone || undefined,
        email: formValue.email || undefined,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        pincode: formValue.pincode || undefined,
        gstNumber: formValue.gstNumber || undefined,
        panNumber: formValue.panNumber || undefined,
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
    const control = this.vendorForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Vendor Code',
      name: 'Vendor Name',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      gstNumber: 'GST Number',
      panNumber: 'PAN Number'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.vendorForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

