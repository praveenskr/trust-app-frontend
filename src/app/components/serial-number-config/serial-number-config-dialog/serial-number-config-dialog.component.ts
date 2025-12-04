import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SerialNumberConfigCreateDTO, SerialNumberConfigDTO, SerialNumberConfigUpdateDTO } from '../../../models/serial-number-config.model';

@Component({
  selector: 'app-serial-number-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './serial-number-config-dialog.component.html',
  styleUrls: ['./serial-number-config-dialog.component.css']
})
export class SerialNumberConfigDialogComponent implements OnInit {
  configForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  configId?: number;
  currentYear: number = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SerialNumberConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { config: SerialNumberConfigDTO }
  ) {
    this.isEditMode = !!data?.config;
    this.configId = data?.config?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
  }

  private initializeForm(): void {
    const config = this.data?.config;
    
    if (this.isEditMode && config) {
      // Edit mode: Only allow editing prefix, formatPattern, and sequenceLength
      this.configForm = this.fb.group({
        entityType: [{ value: config.entityType, disabled: true }],
        prefix: [config.prefix || '', [Validators.required, Validators.maxLength(50)]],
        formatPattern: [config.formatPattern || '', [Validators.maxLength(255)]],
        currentYear: [{ value: config.currentYear, disabled: true }],
        lastSequence: [{ value: config.lastSequence, disabled: true }],
        sequenceLength: [config.sequenceLength || null, [Validators.required, Validators.min(1)]]
      });
    } else {
      // Create mode: All fields editable
      this.configForm = this.fb.group({
        entityType: ['', [Validators.required, Validators.maxLength(100)]],
        prefix: ['', [Validators.required, Validators.maxLength(50)]],
        formatPattern: ['', [Validators.maxLength(255)]],
        currentYear: [this.currentYear, [Validators.required, Validators.min(2000), Validators.max(9999)]],
        lastSequence: [0, [Validators.required, Validators.min(0)]],
        sequenceLength: [null, [Validators.required, Validators.min(1)]]
      });
    }
  }

  onSubmit(): void {
    if (this.configForm.invalid) {
      this.markFormGroupTouched(this.configForm);
      return;
    }

    const formValue = this.configForm.getRawValue();
    
    if (this.isEditMode && this.configId) {
      const updateDTO: SerialNumberConfigUpdateDTO = {
        prefix: formValue.prefix.trim(),
        formatPattern: formValue.formatPattern?.trim() || undefined,
        sequenceLength: formValue.sequenceLength || undefined
      };
      this.dialogRef.close({ mode: 'edit', id: this.configId, data: updateDTO });
    } else {
      const createDTO: SerialNumberConfigCreateDTO = {
        entityType: formValue.entityType.trim(),
        prefix: formValue.prefix.trim(),
        formatPattern: formValue.formatPattern?.trim() || undefined,
        currentYear: formValue.currentYear,
        lastSequence: formValue.lastSequence,
        sequenceLength: formValue.sequenceLength
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
    const control = this.configForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }
    if (control?.hasError('min')) {
      const min = control.errors?.['min']?.min;
      return `${this.getFieldLabel(fieldName)} must be at least ${min}`;
    }
    if (control?.hasError('max')) {
      const max = control.errors?.['max']?.max;
      return `${this.getFieldLabel(fieldName)} must not exceed ${max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      entityType: 'Entity Type',
      prefix: 'Prefix',
      formatPattern: 'Format Pattern',
      currentYear: 'Current Year',
      lastSequence: 'Last Sequence',
      sequenceLength: 'Sequence Length'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.configForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

