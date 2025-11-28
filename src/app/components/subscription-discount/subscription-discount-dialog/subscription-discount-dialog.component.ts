import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { SubscriptionDiscountCreateDTO, SubscriptionDiscountDTO, SubscriptionDiscountUpdateDTO, DISCOUNT_TYPES } from '../../../models/subscription-discount.model';
import { SubscriptionPlanService } from '../../../services/subscription-plan.service';
import { SubscriptionPlanDTO } from '../../../models/subscription-plan.model';

@Component({
  selector: 'app-subscription-discount-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe, provideNativeDateAdapter()],
  templateUrl: './subscription-discount-dialog.component.html',
  styleUrls: ['./subscription-discount-dialog.component.css']
})
export class SubscriptionDiscountDialogComponent implements OnInit {
  subscriptionDiscountForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  subscriptionDiscountId?: number;
  subscriptionPlans: SubscriptionPlanDTO[] = [];
  isLoadingPlans = false;
  discountTypes = DISCOUNT_TYPES;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubscriptionDiscountDialogComponent>,
    private subscriptionPlanService: SubscriptionPlanService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data?: { subscriptionDiscount: SubscriptionDiscountDTO }
  ) {
    this.isEditMode = !!data?.subscriptionDiscount;
    this.subscriptionDiscountId = data?.subscriptionDiscount?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSubscriptionPlans();
  }

  private loadSubscriptionPlans(): void {
    this.isLoadingPlans = true;
    this.subscriptionPlanService.getAllSubscriptionPlans(undefined, false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.subscriptionPlans = response.data;
        }
        this.isLoadingPlans = false;
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.isLoadingPlans = false;
      }
    });
  }

  private initializeForm(): void {
    const subscriptionDiscount = this.data?.subscriptionDiscount;
    
    // Parse dates from strings
    const validFrom = subscriptionDiscount?.validFrom ? new Date(subscriptionDiscount.validFrom) : null;
    const validTo = subscriptionDiscount?.validTo ? new Date(subscriptionDiscount.validTo) : null;
    
    this.subscriptionDiscountForm = this.fb.group({
      planId: [subscriptionDiscount?.planId || null, [Validators.required]],
      discountType: [subscriptionDiscount?.discountType || '', [Validators.required]],
      discountValue: [subscriptionDiscount?.discountValue || null, [Validators.required, Validators.min(0.01)]],
      minQuantity: [subscriptionDiscount?.minQuantity || null],
      maxQuantity: [subscriptionDiscount?.maxQuantity || null],
      validFrom: [validFrom, [Validators.required]],
      validTo: [validTo],
      isActive: [subscriptionDiscount?.isActive !== undefined ? subscriptionDiscount.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.subscriptionDiscountForm.invalid) {
      this.markFormGroupTouched(this.subscriptionDiscountForm);
      return;
    }

    const formValue = this.subscriptionDiscountForm.getRawValue();
    
    // Format dates to ISO strings
    const validFromStr = formValue.validFrom ? this.datePipe.transform(formValue.validFrom, 'yyyy-MM-dd') : null;
    const validToStr = formValue.validTo ? this.datePipe.transform(formValue.validTo, 'yyyy-MM-dd') : null;
    
    if (this.isEditMode && this.subscriptionDiscountId) {
      const updateDTO: SubscriptionDiscountUpdateDTO = {
        planId: formValue.planId,
        discountType: formValue.discountType,
        discountValue: formValue.discountValue,
        minQuantity: formValue.minQuantity || undefined,
        maxQuantity: formValue.maxQuantity || undefined,
        validFrom: validFromStr!,
        validTo: validToStr || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.subscriptionDiscountId, data: updateDTO });
    } else {
      const createDTO: SubscriptionDiscountCreateDTO = {
        planId: formValue.planId,
        discountType: formValue.discountType,
        discountValue: formValue.discountValue,
        minQuantity: formValue.minQuantity || undefined,
        maxQuantity: formValue.maxQuantity || undefined,
        validFrom: validFromStr!,
        validTo: validToStr || undefined,
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
    const control = this.subscriptionDiscountForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      planId: 'Subscription Plan',
      discountType: 'Discount Type',
      discountValue: 'Discount Value',
      minQuantity: 'Min Quantity',
      maxQuantity: 'Max Quantity',
      validFrom: 'Valid From',
      validTo: 'Valid To'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.subscriptionDiscountForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

