import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EventDTO } from '../../../models/event.model';

@Component({
  selector: 'app-event-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './event-delete-dialog.component.html',
  styleUrls: ['./event-delete-dialog.component.css']
})
export class EventDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EventDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: EventDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

