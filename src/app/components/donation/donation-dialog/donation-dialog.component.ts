import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { DonationDTO, DonationCreateDTO, DonationUpdateDTO } from '../../../models/donation.model';
import { DonationSubCategoryService } from '../../../services/donation-sub-category.service';
import { PaymentModeDTO } from '../../../models/payment-mode.model';
import { DonationPurposeDTO } from '../../../models/donation-purpose.model';
import { DonationSubCategoryDTO } from '../../../models/donation-sub-category.model';
import { EventDTO } from '../../../models/event.model';
import { BranchDTO } from '../../../models/branch.model';

@Component({
  selector: 'app-donation-dialog',
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
  providers: [provideNativeDateAdapter()],
  templateUrl: './donation-dialog.component.html',
  styleUrls: ['./donation-dialog.component.css']
})
export class DonationDialogComponent implements OnInit {
  donationForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  donationId?: number;

  // Master data for dropdowns
  paymentModes: PaymentModeDTO[] = [];
  purposes: DonationPurposeDTO[] = [];
  subCategories: DonationSubCategoryDTO[] = [];
  events: EventDTO[] = [];
  branches: BranchDTO[] = [];

  isLoadingMasterData = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DonationDialogComponent>,
    private subCategoryService: DonationSubCategoryService,
    @Inject(MAT_DIALOG_DATA) public data?: {
      donation?: DonationDTO;
      paymentModes?: PaymentModeDTO[];
      purposes?: DonationPurposeDTO[];
      events?: EventDTO[];
      branches?: BranchDTO[];
    }
  ) {
    this.isEditMode = !!data?.donation;
    this.donationId = data?.donation?.id;
  }

  ngOnInit(): void {
    this.loadMasterData();
    this.initializeForm();
    
    // Load subcategories if purpose is already selected (for edit mode)
    const purposeId = this.donationForm.get('purposeId')?.value;
    if (purposeId) {
      this.loadSubCategories(purposeId);
    }
  }

  private initializeForm(): void {
    const donation = this.data?.donation;
    
    this.donationForm = this.fb.group({
      donorName: [donation?.donorName || '', [Validators.required, Validators.maxLength(255)]],
      donorAddress: [donation?.donorAddress || ''],
      panNumber: [donation?.panNumber || '', [Validators.maxLength(10), Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      donorPhone: [donation?.donorPhone || '', [Validators.maxLength(20)]],
      donorEmail: [donation?.donorEmail || '', [Validators.email]],
      amount: [donation?.amount || null, [Validators.required, Validators.min(0.01)]],
      paymentModeId: [donation?.paymentMode?.id || null, [Validators.required]],
      purposeId: [donation?.purpose?.id || null, [Validators.required]],
      subCategoryId: [donation?.subCategory?.id || null],
      eventId: [donation?.event?.id || null],
      branchId: [donation?.branch?.id || null, [Validators.required]],
      donationDate: [donation?.donationDate ? new Date(donation.donationDate) : new Date(), [Validators.required]],
      notes: [donation?.notes || '']
    });

    // Watch purpose changes to load subcategories
    this.donationForm.get('purposeId')?.valueChanges.subscribe(purposeId => {
      if (purposeId) {
        this.loadSubCategories(purposeId);
      } else {
        this.subCategories = [];
        this.donationForm.patchValue({ subCategoryId: null });
      }
    });
  }

  private loadMasterData(): void {
    // Load master data from parent component
    this.paymentModes = this.data?.paymentModes || [];
    this.purposes = this.data?.purposes || [];
    this.events = this.data?.events || [];
    this.branches = this.data?.branches || [];
    this.isLoadingMasterData = false;
  }

  private loadSubCategories(purposeId: number): void {
    this.subCategoryService.getAllDonationSubCategories(purposeId).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.subCategories = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading sub categories:', error);
        this.subCategories = [];
      }
    });
  }

  onSubmit(): void {
    if (this.donationForm.invalid) {
      this.markFormGroupTouched(this.donationForm);
      return;
    }

    const formValue = this.donationForm.value;
    const donationDate = formValue.donationDate as Date;
    const formattedDate = this.formatDate(donationDate);
    
    if (this.isEditMode && this.donationId) {
      const updateDTO: DonationUpdateDTO = {
        donorName: formValue.donorName?.trim() || undefined,
        donorAddress: formValue.donorAddress?.trim() || undefined,
        panNumber: formValue.panNumber?.trim() || undefined,
        donorPhone: formValue.donorPhone?.trim() || undefined,
        donorEmail: formValue.donorEmail?.trim() || undefined,
        amount: formValue.amount || undefined,
        paymentModeId: formValue.paymentModeId || undefined,
        purposeId: formValue.purposeId || undefined,
        subCategoryId: formValue.subCategoryId || null,
        eventId: formValue.eventId || null,
        branchId: formValue.branchId || undefined,
        donationDate: formattedDate || undefined,
        notes: formValue.notes?.trim() || undefined
      };
      this.dialogRef.close({ mode: 'edit', id: this.donationId, data: updateDTO });
    } else {
      const createDTO: DonationCreateDTO = {
        donorName: formValue.donorName.trim(),
        donorAddress: formValue.donorAddress?.trim() || undefined,
        panNumber: formValue.panNumber?.trim() || undefined,
        donorPhone: formValue.donorPhone?.trim() || undefined,
        donorEmail: formValue.donorEmail?.trim() || undefined,
        amount: formValue.amount,
        paymentModeId: formValue.paymentModeId,
        purposeId: formValue.purposeId,
        subCategoryId: formValue.subCategoryId || undefined,
        eventId: formValue.eventId || undefined,
        branchId: formValue.branchId,
        donationDate: formattedDate,
        notes: formValue.notes?.trim() || undefined
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
    const control = this.donationForm.get(fieldName);
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
    if (control?.hasError('min')) {
      return 'Amount must be greater than 0';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      donorName: 'Donor Name',
      panNumber: 'PAN Number',
      donorPhone: 'Phone',
      donorEmail: 'Email',
      amount: 'Amount',
      paymentModeId: 'Payment Mode',
      purposeId: 'Purpose',
      branchId: 'Branch',
      donationDate: 'Donation Date'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.donationForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

