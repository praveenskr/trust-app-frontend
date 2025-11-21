import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DonationPurposeDTO } from '../../../models/donation-purpose.model';

@Component({
  selector: 'app-donation-purpose-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './donation-purpose-delete-dialog.component.html',
  styleUrls: ['./donation-purpose-delete-dialog.component.css']
})
export class DonationPurposeDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DonationPurposeDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { donationPurpose: DonationPurposeDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

