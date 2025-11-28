import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PaymentModeCreateDTO, PaymentModeDTO, PaymentModeUpdateDTO } from '../../../models/payment-mode.model';

@Component({
  selector: 'app-payment-mode-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './payment-mode-dialog.component.html',
  styleUrls: ['./payment-mode-dialog.component.css']
})
export class PaymentModeDialogComponent implements OnInit {
  paymentModeForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  paymentModeId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaymentModeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { paymentMode: PaymentModeDTO }
  ) {
    this.isEditMode = !!data?.paymentMode;
    this.paymentModeId = data?.paymentMode?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
  }

  private initializeForm(): void {
    const paymentMode = this.data?.paymentMode;
    
    this.paymentModeForm = this.fb.group({
      code: [paymentMode?.code || '', [Validators.required, Validators.maxLength(50)]],
      name: [paymentMode?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [paymentMode?.description || ''],
      requiresReceipt: [paymentMode?.requiresReceipt !== undefined ? paymentMode.requiresReceipt : false],
      displayOrder: [paymentMode?.displayOrder || null],
      isActive: [paymentMode?.isActive !== undefined ? paymentMode.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.paymentModeForm.invalid) {
      this.markFormGroupTouched(this.paymentModeForm);
      return;
    }

    const formValue = this.paymentModeForm.getRawValue();
    
    if (this.isEditMode && this.paymentModeId) {
      const updateDTO: PaymentModeUpdateDTO = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description || undefined,
        requiresReceipt: formValue.requiresReceipt !== undefined ? formValue.requiresReceipt : false,
        displayOrder: formValue.displayOrder || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.paymentModeId, data: updateDTO });
    } else {
      const createDTO: PaymentModeCreateDTO = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description || undefined,
        requiresReceipt: formValue.requiresReceipt !== undefined ? formValue.requiresReceipt : false,
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
    const control = this.paymentModeForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Payment Mode Code',
      name: 'Payment Mode Name',
      description: 'Description',
      displayOrder: 'Display Order'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.paymentModeForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

