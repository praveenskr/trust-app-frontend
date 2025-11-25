import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { EventCreateDTO, EventDTO, EventUpdateDTO, EVENT_STATUSES } from '../../models/event.model';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { EventDeleteDialogComponent } from './event-delete-dialog/event-delete-dialog.component';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  events: EventDTO[] = [];
  displayedColumns: string[] = ['code', 'name', 'startDate', 'endDate', 'status', 'isActive', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents(undefined, undefined, false).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.events = response.data;
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

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
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

  openEditDialog(event: EventDTO): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.mode === 'edit') {
        this.updateEvent(result.id, result.data);
      }
    });
  }

  openDeleteDialog(event: EventDTO): void {
    const dialogRef = this.dialog.open(EventDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
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
}

