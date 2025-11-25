import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionDiscountDTO } from '../../../models/subscription-discount.model';

@Component({
  selector: 'app-subscription-discount-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './subscription-discount-delete-dialog.component.html',
  styleUrls: ['./subscription-discount-delete-dialog.component.css']
})
export class SubscriptionDiscountDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SubscriptionDiscountDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subscriptionDiscount: SubscriptionDiscountDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

