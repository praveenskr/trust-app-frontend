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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DonationService } from '../../services/donation.service';
import { DonationDTO, DonationCreateDTO, DonationUpdateDTO, PageResponse } from '../../models/donation.model';
import { DonationDialogComponent } from './donation-dialog/donation-dialog.component';
import { DonationDeleteDialogComponent } from './donation-delete-dialog/donation-delete-dialog.component';
import { PaymentModeService } from '../../services/payment-mode.service';
import { DonationPurposeService } from '../../services/donation-purpose.service';
import { BranchService } from '../../services/branch.service';
import { PaymentModeDropdownDTO } from '../../models/payment-mode.model';
import { DonationPurposeDropdownDTO } from '../../models/donation-purpose.model';
import { BranchDropdownDTO } from '../../models/branch.model';
import { DonorDropdownDTO } from '../../models/donor.model';

@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.css']
})
export class DonationComponent implements OnInit {
  donations: DonationDTO[] = [];
  displayedColumns: string[] = [
    'receiptNumber', 'donorName', 'amount', 'paymentMode', 
    'purpose', 'branch', 'donationDate', 'receiptGenerated', 'actions'
  ];
  isSubmitting = false;
  isLoading = false;

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // Filters
  filterBranchId?: number;
  filterPurposeId?: number;
  filterEventId?: number;
  filterPaymentModeId?: number;
  filterFromDate?: Date;
  filterToDate?: Date;
  filterDonorName?: string;
  filterPanNumber = '';
  filterReceiptNumber = '';
  includeInactive = false;

  // Autocomplete filtered options and display values
  filteredDonors: DonorDropdownDTO[] = [];
  filteredBranches: BranchDropdownDTO[] = [];
  donorInputValue = '';
  branchInputValue = '';
  selectedDonor: DonorDropdownDTO | null = null;
  selectedBranch: BranchDropdownDTO | null = null;
  isSelectingDonor = false;
  isSelectingBranch = false;

  // Master data for dialog
  paymentModes: PaymentModeDropdownDTO[] = [];
  purposes: DonationPurposeDropdownDTO[] = [];
  branches: BranchDropdownDTO[] = [];
  donors: DonorDropdownDTO[] = [];
  isLoadingMasterData = false;

  constructor(
    private donationService: DonationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private paymentModeService: PaymentModeService,
    private purposeService: DonationPurposeService,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    // Set default dates to today
    const today = new Date();
    this.filterFromDate = today;
    this.filterToDate = today;
    
    this.loadMasterData();
    this.loadDonations();
  }

  private loadMasterData(): void {
    this.isLoadingMasterData = true;

    Promise.all([
      this.paymentModeService.getAllPaymentModesForDropdown().toPromise(),
      this.purposeService.getAllDonationPurposesForDropdown().toPromise(),
      this.branchService.getAllBranchesForDropdown().toPromise(),
      this.donationService.getAllActiveDonorNames().toPromise()
    ]).then(([paymentModesRes, purposesRes, branchesRes, donorsRes]) => {
      if (paymentModesRes?.status === 'success' && paymentModesRes.data) {
        this.paymentModes = paymentModesRes.data;
      }
      if (purposesRes?.status === 'success' && purposesRes.data) {
        this.purposes = purposesRes.data;
      }
      if (donorsRes?.status === 'success' && donorsRes.data) {
        this.donors = donorsRes.data;
        this.filteredDonors = this.donors;
      }
      if (branchesRes?.status === 'success' && branchesRes.data) {
        this.branches = branchesRes.data;
        this.filteredBranches = this.branches;
      }
      this.isLoadingMasterData = false;
    }).catch(error => {
      console.error('Error loading master data:', error);
      this.isLoadingMasterData = false;
    });
  }

  filterDonors(value: string): void {
    // Skip filtering if we're in the process of selecting an option
    if (this.isSelectingDonor) {
      return;
    }
    this.donorInputValue = value || '';
    this.selectedDonor = null; // Clear selection when typing
    const filterValue = value?.toLowerCase() || '';
    this.filteredDonors = this.donors.filter(donor => 
      donor.name.toLowerCase().includes(filterValue)
    );
  }

  filterBranches(value: string): void {
    // Skip filtering if we're in the process of selecting an option
    if (this.isSelectingBranch) {
      return;
    }
    this.branchInputValue = value || '';
    this.selectedBranch = null; // Clear selection when typing
    const filterValue = value?.toLowerCase() || '';
    this.filteredBranches = this.branches.filter(branch => 
      branch.name.toLowerCase().includes(filterValue)
    );
  }

  onDonorSelected(donor: DonorDropdownDTO | null): void {
    this.isSelectingDonor = true;
    this.selectedDonor = donor;
    if (donor) {
      this.filterDonorName = donor.name;
      this.donorInputValue = donor.name;
    } else {
      this.filterDonorName = undefined;
      this.donorInputValue = '';
    }
    // Reset filtered list to show all after selection
    this.filteredDonors = this.donors;
    // Reset flag after a short delay to allow the selection to complete
    setTimeout(() => {
      this.isSelectingDonor = false;
    }, 100);
  }

  onBranchSelected(branch: BranchDropdownDTO | null): void {
    this.isSelectingBranch = true;
    this.selectedBranch = branch;
    if (branch) {
      this.filterBranchId = branch.id;
      this.branchInputValue = branch.name;
    } else {
      this.filterBranchId = undefined;
      this.branchInputValue = '';
    }
    // Reset filtered list to show all after selection
    this.filteredBranches = this.branches;
    // Reset flag after a short delay to allow the selection to complete
    setTimeout(() => {
      this.isSelectingBranch = false;
    }, 100);
  }

  displayDonorName = (donor: DonorDropdownDTO | null): string => {
    return donor ? donor.name : '';
  }

  displayBranchName = (branch: BranchDropdownDTO | null): string => {
    return branch ? branch.name : '';
  }

  private loadDonations(): void {
    this.isLoading = true;
    
    const fromDate = this.filterFromDate ? this.formatDate(this.filterFromDate) : undefined;
    const toDate = this.filterToDate ? this.formatDate(this.filterToDate) : undefined;

    this.donationService.getAllDonations(
      this.filterBranchId,
      this.filterPurposeId,
      this.filterEventId,
      this.filterPaymentModeId,
      fromDate,
      toDate,
      this.filterDonorName,
      this.filterPanNumber || undefined,
      this.filterReceiptNumber || undefined,
      this.includeInactive,
      this.pageIndex,
      this.pageSize,
      'donationDate',
      'DESC'
    ).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.donations = response.data.content;
          this.totalElements = response.data.totalElements;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading donations:', error);
        this.snackBar.open('Failed to load donations', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDonations();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadDonations();
  }

  clearFilters(): void {
    this.filterBranchId = undefined;
    this.filterPurposeId = undefined;
    this.filterEventId = undefined;
    this.filterPaymentModeId = undefined;
    this.filterFromDate = undefined;
    this.filterToDate = undefined;
    this.filterDonorName = undefined;
    this.filterPanNumber = '';
    this.filterReceiptNumber = '';
    this.includeInactive = false;
    this.donorInputValue = '';
    this.branchInputValue = '';
    this.selectedDonor = null;
    this.selectedBranch = null;
    this.filteredDonors = this.donors;
    this.filteredBranches = this.branches;
    this.pageIndex = 0;
    this.loadDonations();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(DonationDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: true,
      data: {
        donation: undefined,
        paymentModes: this.paymentModes,
        purposes: this.purposes,
        branches: this.branches
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createDonation(result.data);
        } else if (result.mode === 'edit') {
          this.updateDonation(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(donation: DonationDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(DonationDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: true,
      data: {
        donation,
        paymentModes: this.paymentModes,
        purposes: this.purposes,
        branches: this.branches
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateDonation(result.id, result.data);
      }
    });
  }

  openDeleteDialog(donation: DonationDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(DonationDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { donation }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteDonation(donation.id);
      }
    });
  }

  private createDonation(createDTO: DonationCreateDTO): void {
    this.isSubmitting = true;
    this.donationService.createDonation(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation transaction created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonations();
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating donation:', error);
        let errorMessage = 'Failed to create donation. Please try again.';
        
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

  private updateDonation(id: number, updateDTO: DonationUpdateDTO): void {
    this.isSubmitting = true;
    this.donationService.updateDonation(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation transaction updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonations();
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating donation:', error);
        let errorMessage = 'Failed to update donation. Please try again.';
        
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

  private deleteDonation(id: number): void {
    this.isSubmitting = true;
    this.donationService.deleteDonation(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Donation transaction deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadDonations();
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting donation:', error);
        let errorMessage = 'Failed to delete donation. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

