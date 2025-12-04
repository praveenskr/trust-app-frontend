import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { InterBranchTransferService } from '../../services/inter-branch-transfer.service';
import { BranchService } from '../../services/branch.service';
import { PaymentModeService } from '../../services/payment-mode.service';
import { InterBranchTransferDTO, InterBranchTransferCreateDTO, TRANSFER_STATUSES } from '../../models/inter-branch-transfer.model';
import { BranchDropdownDTO } from '../../models/branch.model';
import { PaymentModeDropdownDTO } from '../../models/payment-mode.model';
import { TransferDialogComponent } from './transfer-dialog/transfer-dialog.component';

@Component({
  selector: 'app-inter-branch-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './inter-branch-transfer.component.html',
  styleUrls: ['./inter-branch-transfer.component.css']
})
export class InterBranchTransferComponent implements OnInit {
  transfers: InterBranchTransferDTO[] = [];
  displayedColumns: string[] = ['transferNumber', 'fromBranch', 'toBranch', 'amount', 'transferDate', 'paymentMode', 'status', 'referenceNumber'];
  isLoading = false;
  isSubmitting = false;
  branches: BranchDropdownDTO[] = [];
  paymentModes: PaymentModeDropdownDTO[] = [];
  isLoadingBranches = false;
  TRANSFER_STATUSES = TRANSFER_STATUSES;

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

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // Filters
  filterFromBranchId?: number;
  filterToBranchId?: number;
  filterStatus?: string;
  filterFromDate?: Date;
  filterToDate?: Date;

  constructor(
    private interBranchTransferService: InterBranchTransferService,
    private branchService: BranchService,
    private paymentModeService: PaymentModeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Set default dates to today
    const today = new Date();
    this.filterFromDate = today;
    this.filterToDate = today;
    
    this.loadBranches();
    this.loadPaymentModes();
    this.loadTransfers();
  }

  private loadBranches(): void {
    this.isLoadingBranches = true;
    this.branchService.getUserAccessibleBranchesForDropdown().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.branches = response.data;
          this.filteredFromBranches = this.branches;
          this.filteredToBranches = this.branches;
        }
        this.isLoadingBranches = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoadingBranches = false;
      }
    });
  }

  private loadPaymentModes(): void {
    this.paymentModeService.getAllPaymentModesForDropdown().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.paymentModes = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading payment modes:', error);
      }
    });
  }

  private loadTransfers(): void {
    this.isLoading = true;

    const fromDate = this.filterFromDate ? this.formatDate(this.filterFromDate) : undefined;
    const toDate = this.filterToDate ? this.formatDate(this.filterToDate) : undefined;

    this.interBranchTransferService.getAllTransfers(
      this.filterFromBranchId,
      this.filterToBranchId,
      this.filterStatus,
      fromDate,
      toDate,
      this.pageIndex,
      this.pageSize,
      'transferDate',
      'DESC'
    ).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.transfers = response.data.content;
          this.totalElements = response.data.totalElements;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transfers:', error);
        this.snackBar.open('Failed to load inter branch transfers', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransfers();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadTransfers();
  }

  clearFilters(): void {
    this.filterFromBranchId = undefined;
    this.selectedFromBranch = null;
    this.fromBranchInputValue = '';
    this.filteredFromBranches = this.branches;
    
    this.filterToBranchId = undefined;
    this.selectedToBranch = null;
    this.toBranchInputValue = '';
    this.filteredToBranches = this.branches;
    
    this.filterStatus = undefined;
    this.filterFromDate = undefined;
    this.filterToDate = undefined;
    this.pageIndex = 0;
    this.loadTransfers();
  }

  getStatusLabel(status: string): string {
    const statusObj = TRANSFER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Autocomplete helpers for From Branch filter
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
    this.filterFromBranchId = undefined;
  }

  onFromBranchSelected(branch: BranchDropdownDTO | null): void {
    this.isSelectingFromBranch = true;
    this.selectedFromBranch = branch;
    if (branch) {
      this.filterFromBranchId = branch.id;
      this.fromBranchInputValue = branch.name;
    } else {
      this.filterFromBranchId = undefined;
      this.fromBranchInputValue = '';
    }
    this.filteredFromBranches = this.branches;
    setTimeout(() => {
      this.isSelectingFromBranch = false;
    }, 100);
  }

  // Autocomplete helpers for To Branch filter
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
    this.filterToBranchId = undefined;
  }

  onToBranchSelected(branch: BranchDropdownDTO | null): void {
    this.isSelectingToBranch = true;
    this.selectedToBranch = branch;
    if (branch) {
      this.filterToBranchId = branch.id;
      this.toBranchInputValue = branch.name;
    } else {
      this.filterToBranchId = undefined;
      this.toBranchInputValue = '';
    }
    this.filteredToBranches = this.branches;
    setTimeout(() => {
      this.isSelectingToBranch = false;
    }, 100);
  }

  openTransferDialog(): void {
    const dialogRef = this.dialog.open(TransferDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        branches: this.branches,
        paymentModes: this.paymentModes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.mode === 'create') {
        this.createTransfer(result.data);
      }
    });
  }

  private createTransfer(createDTO: InterBranchTransferCreateDTO): void {
    this.isSubmitting = true;
    this.interBranchTransferService.createTransfer(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Inter-branch transfer created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadTransfers(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating transfer:', error);
        let errorMessage = 'Failed to create transfer. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }
}

