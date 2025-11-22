import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DonationSubCategoryDTO } from '../../../models/donation-sub-category.model';

@Component({
  selector: 'app-donation-sub-category-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './donation-sub-category-delete-dialog.component.html',
  styleUrls: ['./donation-sub-category-delete-dialog.component.css']
})
export class DonationSubCategoryDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DonationSubCategoryDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { donationSubCategory: DonationSubCategoryDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

