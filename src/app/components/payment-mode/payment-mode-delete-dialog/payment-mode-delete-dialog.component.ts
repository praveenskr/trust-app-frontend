import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PaymentModeDTO } from '../../../models/payment-mode.model';

@Component({
  selector: 'app-payment-mode-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './payment-mode-delete-dialog.component.html',
  styleUrls: ['./payment-mode-delete-dialog.component.css']
})
export class PaymentModeDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PaymentModeDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { paymentMode: PaymentModeDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

