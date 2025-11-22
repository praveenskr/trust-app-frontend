import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { EventCreateDTO, EventDTO, EventUpdateDTO, EVENT_STATUSES } from '../../../models/event.model';
import { BranchService } from '../../../services/branch.service';
import { BranchDTO } from '../../../models/branch.model';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe, provideNativeDateAdapter()],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css']
})
export class EventDialogComponent implements OnInit {
  eventForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  eventId?: number;
  branches: BranchDTO[] = [];
  isLoadingBranches = false;
  eventStatuses = EVENT_STATUSES;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EventDialogComponent>,
    private branchService: BranchService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data?: { event: EventDTO }
  ) {
    this.isEditMode = !!data?.event;
    this.eventId = data?.event?.id;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBranches();
  }

  private loadBranches(): void {
    this.isLoadingBranches = true;
    this.branchService.getAllBranches(false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.branches = response.data;
        }
        this.isLoadingBranches = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoadingBranches = false;
      }
    });
  }

  private initializeForm(): void {
    const event = this.data?.event;
    
    // Parse dates from strings
    const startDate = event?.startDate ? new Date(event.startDate) : null;
    const endDate = event?.endDate ? new Date(event.endDate) : null;
    
    this.eventForm = this.fb.group({
      code: [{ value: event?.code || '', disabled: this.isEditMode }, [Validators.required, Validators.maxLength(50)]],
      name: [event?.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [event?.description || ''],
      startDate: [startDate, [Validators.required]],
      endDate: [endDate],
      status: [event?.status || 'PLANNED'],
      branchId: [event?.branchId || null],
      isActive: [event?.isActive !== undefined ? event.isActive : true]
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }

    const formValue = this.eventForm.getRawValue();
    
    // Format dates to ISO strings
    const startDateStr = formValue.startDate ? this.datePipe.transform(formValue.startDate, 'yyyy-MM-dd') : null;
    const endDateStr = formValue.endDate ? this.datePipe.transform(formValue.endDate, 'yyyy-MM-dd') : null;
    
    if (this.isEditMode && this.eventId) {
      const updateDTO: EventUpdateDTO = {
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        startDate: startDateStr!,
        endDate: endDateStr || undefined,
        status: formValue.status || undefined,
        branchId: formValue.branchId || undefined,
        isActive: formValue.isActive !== undefined ? formValue.isActive : true
      };
      this.dialogRef.close({ mode: 'edit', id: this.eventId, data: updateDTO });
    } else {
      const createDTO: EventCreateDTO = {
        code: formValue.code.trim(),
        name: formValue.name.trim(),
        description: formValue.description?.trim() || undefined,
        startDate: startDateStr!,
        endDate: endDateStr || undefined,
        status: formValue.status || undefined,
        branchId: formValue.branchId || undefined,
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
    const control = this.eventForm.get(fieldName);
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
      code: 'Event Code',
      name: 'Event Name',
      description: 'Description',
      startDate: 'Start Date',
      endDate: 'End Date'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.eventForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

