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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { InterBranchTransferCreateDTO, TRANSFER_STATUSES } from '../../../models/inter-branch-transfer.model';
import { BranchDropdownDTO } from '../../../models/branch.model';
import { PaymentModeDropdownDTO } from '../../../models/payment-mode.model';

@Component({
  selector: 'app-transfer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe, provideNativeDateAdapter()],
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.css']
})
export class TransferDialogComponent implements OnInit {
  transferForm!: FormGroup;
  isSubmitting = false;
  branches: BranchDropdownDTO[] = [];
  paymentModes: PaymentModeDropdownDTO[] = [];
  transferStatuses = TRANSFER_STATUSES;

  // Branch autocomplete for From Branch
  filteredFromBranches: BranchDropdownDTO[] = [];
  fromBranchInputValue = '';
  selectedFromBranch: BranchDropdownDTO | null = null;
  isSelectingFromBranch = false;

  // Branch autocomplete for To Branch
  filteredToBranches: BranchDropdownDTO[] = [];
  toBranchInputValue = '';
  selectedToBranch: BranchDropdownDTO | null = null;
  isSelectingToBranch = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransferDialogComponent>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data?: {
      branches?: BranchDropdownDTO[];
      paymentModes?: PaymentModeDropdownDTO[];
    }
  ) {
    this.branches = data?.branches || [];
    this.paymentModes = data?.paymentModes || [];
    this.filteredFromBranches = this.branches;
    this.filteredToBranches = this.branches;
    this.initializeForm();
  }

  ngOnInit(): void {
    // Set default transfer date to today
    this.transferForm.patchValue({
      transferDate: new Date()
    });
  }

  private initializeForm(): void {
    this.transferForm = this.fb.group({
      fromBranchId: [null, [Validators.required]],
      toBranchId: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      transferDate: [new Date(), [Validators.required]],
      paymentModeId: [null, [Validators.required]],
      referenceNumber: ['', [Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(5000)]],
      status: ['PENDING']
    });

    // Validate that from and to branches are different
    this.transferForm.valueChanges.subscribe(() => {
      const fromBranchId = this.transferForm.get('fromBranchId')?.value;
      const toBranchId = this.transferForm.get('toBranchId')?.value;
      
      if (fromBranchId && toBranchId && fromBranchId === toBranchId) {
        const toBranchControl = this.transferForm.get('toBranchId');
        const currentErrors = toBranchControl?.errors || {};
        toBranchControl?.setErrors({ ...currentErrors, sameBranch: true });
      } else {
        const toBranchControl = this.transferForm.get('toBranchId');
        if (toBranchControl?.hasError('sameBranch')) {
          const errors = { ...toBranchControl.errors };
          delete errors['sameBranch'];
          const hasOtherErrors = Object.keys(errors).length > 0;
          toBranchControl.setErrors(hasOtherErrors ? errors : null);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.markFormGroupTouched(this.transferForm);
      return;
    }

    const formValue = this.transferForm.getRawValue();
    
    // Format date to ISO string
    const transferDateStr = formValue.transferDate 
      ? this.datePipe.transform(formValue.transferDate, 'yyyy-MM-dd') 
      : null;

    if (!transferDateStr) {
      return;
    }

    const createDTO: InterBranchTransferCreateDTO = {
      fromBranchId: formValue.fromBranchId,
      toBranchId: formValue.toBranchId,
      amount: formValue.amount,
      transferDate: transferDateStr,
      paymentModeId: formValue.paymentModeId,
      referenceNumber: formValue.referenceNumber?.trim() || undefined,
      description: formValue.description?.trim() || undefined,
      status: formValue.status || 'PENDING'
    };

    this.dialogRef.close({ mode: 'create', data: createDTO });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Autocomplete helpers for From Branch
  filterFromBranches(value: string): void {
    if (this.isSelectingFromBranch) {
      return;
    }
    this.fromBranchInputValue = value || '';
    this.selectedFromBranch = null;
    const filterValue = value?.toLowerCase() || '';
    this.filteredFromBranches = this.branches.filter(branch =>
      branch.name.toLowerCase().includes(filterValue)
    );
    this.transferForm.patchValue({ fromBranchId: null });
  }

  onFromBranchSelected(branch: BranchDropdownDTO | null): void {
    this.isSelectingFromBranch = true;
    this.selectedFromBranch = branch;
    if (branch) {
      this.transferForm.patchValue({ fromBranchId: branch.id });
      this.fromBranchInputValue = branch.name;
    } else {
      this.transferForm.patchValue({ fromBranchId: null });
      this.fromBranchInputValue = '';
    }
    this.filteredFromBranches = this.branches;
    setTimeout(() => {
      this.isSelectingFromBranch = false;
    }, 100);
  }

  displayFromBranchName = (branch: BranchDropdownDTO | null): string => {
    return branch ? branch.name : '';
  }

  // Autocomplete helpers for To Branch
  filterToBranches(value: string): void {
    if (this.isSelectingToBranch) {
      return;
    }
    this.toBranchInputValue = value || '';
    this.selectedToBranch = null;
    const filterValue = value?.toLowerCase() || '';
    this.filteredToBranches = this.branches.filter(branch =>
      branch.name.toLowerCase().includes(filterValue)
    );
    this.transferForm.patchValue({ toBranchId: null });
  }

  onToBranchSelected(branch: BranchDropdownDTO | null): void {
    this.isSelectingToBranch = true;
    this.selectedToBranch = branch;
    if (branch) {
      this.transferForm.patchValue({ toBranchId: branch.id });
      this.toBranchInputValue = branch.name;
    } else {
      this.transferForm.patchValue({ toBranchId: null });
      this.toBranchInputValue = '';
    }
    this.filteredToBranches = this.branches;
    setTimeout(() => {
      this.isSelectingToBranch = false;
    }, 100);
  }

  displayToBranchName = (branch: BranchDropdownDTO | null): string => {
    return branch ? branch.name : '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.transferForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.transferForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('min')) {
      return 'Amount must be greater than 0';
    }
    if (control?.hasError('maxlength')) {
      const requiredLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${requiredLength} characters`;
    }
    if (control?.hasError('sameBranch')) {
      return 'From Branch and To Branch must be different';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fromBranchId: 'From Branch',
      toBranchId: 'To Branch',
      amount: 'Amount',
      transferDate: 'Transfer Date',
      paymentModeId: 'Payment Mode',
      referenceNumber: 'Reference Number',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }
}

