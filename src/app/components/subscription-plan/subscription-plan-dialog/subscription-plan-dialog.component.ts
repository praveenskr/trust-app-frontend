import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SubscriptionPlanCreateDTO, SubscriptionPlanDTO, SubscriptionPlanUpdateDTO, PLAN_TYPES } from '../../../models/subscription-plan.model';

@Component({
  selector: 'app-subscription-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './subscription-plan-dialog.component.html',
  styleUrls: ['./subscription-plan-dialog.component.css']
})
export class SubscriptionPlanDialogComponent {
  subscriptionPlanForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  subscriptionPlanId?: number;
  planTypes = PLAN_TYPES;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubscriptionPlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { subscriptionPlan: SubscriptionPlanDTO }
  ) {
    this.isEditMode = !!data?.subscriptionPlan;
    this.subscriptionPlanId = data?.subscriptionPlan?.id;
    this.initializeForm();
  }

  private initializeForm(): void {
    const subscriptionPlan = this.data?.subscriptionPlan;
    
    this.subscriptionPlanForm = this.fb.group({
      code: [{ value: subscriptionPlan?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [subscriptionPlan?.name || '', [Validators.required, Validators.maxLength(255)]],
      planType: [subscriptionPlan?.planType || '', [Validators.required]],
      durationMonths: [subscriptionPlan?.durationMonths || null],
      amount: [subscriptionPlan?.amount || null, [Validators.required, Validators.min(0.01)]],
      description: [subscriptionPlan?.description || ''],
      isActive: [subscriptionPlan?.isActive !== undefined ? subscriptionPlan.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.subscriptionPlanForm.invalid) {
      this.markFormGroupTouched(this.subscriptionPlanForm);
      return;
    }

    const formValue = this.subscriptionPlanForm.getRawValue();
    
    if (this.isEditMode && this.subscriptionPlanId) {
      const updateDTO: SubscriptionPlanUpdateDTO = {
        code: formValue.code.trim(),
        name: formValue.name.trim(),
        planType: formValue.planType,
        durationMonths: formValue.durationMonths || undefined,
        amount: formValue.amount,
        description: formValue.description?.trim() || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.subscriptionPlanId, data: updateDTO });
    } else {
      const createDTO: SubscriptionPlanCreateDTO = {
        code: formValue.code.trim(),
        name: formValue.name.trim(),
        planType: formValue.planType,
        durationMonths: formValue.durationMonths || undefined,
        amount: formValue.amount,
        description: formValue.description?.trim() || undefined,
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
    const control = this.subscriptionPlanForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Plan Code',
      name: 'Plan Name',
      planType: 'Plan Type',
      durationMonths: 'Duration (Months)',
      amount: 'Amount',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.subscriptionPlanForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

