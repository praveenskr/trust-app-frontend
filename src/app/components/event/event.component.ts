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
import { EventService } from '../../services/event.service';
import { BranchService } from '../../services/branch.service';
import { EventCreateDTO, EventDTO, EventUpdateDTO, EVENT_STATUSES } from '../../models/event.model';
import { BranchDropdownDTO } from '../../models/branch.model';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { EventDeleteDialogComponent } from './event-delete-dialog/event-delete-dialog.component';

@Component({
  selector: 'app-event',
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
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  events: EventDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'startDate', 'endDate', 'status', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;
  branches: BranchDropdownDTO[] = [];
  isLoadingBranches = false;
  EVENT_STATUSES = EVENT_STATUSES;

  // Branch autocomplete
  filteredBranches: BranchDropdownDTO[] = [];
  branchInputValue = '';
  selectedBranch: BranchDropdownDTO | null = null;
  isSelectingBranch = false;

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // Filters
  filterBranchId?: number;
  filterStatus?: string;
  filterFromDate?: Date;
  filterToDate?: Date;
  filterSearch?: string;
  includeInactive = false;

  constructor(
    private eventService: EventService,
    private branchService: BranchService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Set default dates to today
    const today = new Date();
    this.filterFromDate = today;
    this.filterToDate = today;
    
    this.loadBranches();
    this.loadEvents();
  }

  private loadBranches(): void {
    this.isLoadingBranches = true;
    this.branchService.getUserAccessibleBranchesForDropdown().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.branches = response.data;
          this.filteredBranches = this.branches;
        }
        this.isLoadingBranches = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoadingBranches = false;
      }
    });
  }

  private loadEvents(): void {
    this.isLoading = true;

    const fromDate = this.filterFromDate ? this.formatDate(this.filterFromDate) : undefined;
    const toDate = this.filterToDate ? this.formatDate(this.filterToDate) : undefined;

    this.eventService.getAllEvents(
      this.filterBranchId,
      this.filterStatus,
      this.includeInactive,
      fromDate,
      toDate,
      this.filterSearch,
      this.pageIndex,
      this.pageSize,
      'startDate',
      'DESC'
    ).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.events = response.data.content;
          this.totalElements = response.data.totalElements;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.snackBar.open('Failed to load events', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEvents();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadEvents();
  }

  clearFilters(): void {
    this.filterBranchId = undefined;
    this.selectedBranch = null;
    this.branchInputValue = '';
    this.filteredBranches = this.branches;
    this.filterStatus = undefined;
    this.filterFromDate = undefined;
    this.filterToDate = undefined;
    this.filterSearch = undefined;
    this.includeInactive = false;
    this.pageIndex = 0;
    this.loadEvents();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        event: undefined,
        branches: this.branches
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createEvent(result.data);
        } else if (result.mode === 'edit') {
          this.updateEvent(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(event: EventDTO, clickEvent?: Event): void {
    // Blur the button to remove focus state
    if (clickEvent) {
      const target = clickEvent.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        event,
        branches: this.branches
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (clickEvent) {
        const target = clickEvent.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateEvent(result.id, result.data);
      }
    });
  }

  openDeleteDialog(event: EventDTO, clickEvent?: Event): void {
    // Blur the button to remove focus state
    if (clickEvent) {
      const target = clickEvent.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(EventDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (clickEvent) {
        const target = clickEvent.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result === true) {
        this.deleteEvent(event.id);
      }
    });
  }

  private createEvent(createDTO: EventCreateDTO): void {
    this.isSubmitting = true;
    this.eventService.createEvent(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Event created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadEvents(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating event:', error);
        let errorMessage = 'Failed to create event. Please try again.';
        
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

  private updateEvent(id: number, updateDTO: EventUpdateDTO): void {
    this.isSubmitting = true;
    this.eventService.updateEvent(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Event updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadEvents(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating event:', error);
        let errorMessage = 'Failed to update event. Please try again.';
        
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

  private deleteEvent(id: number): void {
    this.isSubmitting = true;
    this.eventService.deleteEvent(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Event deleted successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadEvents(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        let errorMessage = 'Failed to delete event. Please try again.';
        
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

  getStatusLabel(status: string): string {
    const statusObj = EVENT_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PLANNED': 'status-planned',
      'ACTIVE': 'status-active-event',
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

  // Autocomplete helpers for branch filter
  filterBranches(value: string): void {
    // Skip filtering if we're in the process of selecting an option
    if (this.isSelectingBranch) {
      return;
    }
    this.branchInputValue = value || '';
    this.selectedBranch = null;
    const filterValue = value?.toLowerCase() || '';
    this.filteredBranches = this.branches.filter(branch =>
      branch.name.toLowerCase().includes(filterValue)
    );
    this.filterBranchId = undefined;
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
    this.filteredBranches = this.branches;
    setTimeout(() => {
      this.isSelectingBranch = false;
    }, 100);
  }
}

