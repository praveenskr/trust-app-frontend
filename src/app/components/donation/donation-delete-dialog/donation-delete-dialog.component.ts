import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DonationDTO } from '../../../models/donation.model';

@Component({
  selector: 'app-donation-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './donation-delete-dialog.component.html',
  styleUrls: ['./donation-delete-dialog.component.css']
})
export class DonationDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DonationDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { donation: DonationDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

