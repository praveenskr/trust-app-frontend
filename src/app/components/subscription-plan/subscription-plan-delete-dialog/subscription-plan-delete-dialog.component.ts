import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubscriptionPlanDTO } from '../../../models/subscription-plan.model';

@Component({
  selector: 'app-subscription-plan-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './subscription-plan-delete-dialog.component.html',
  styleUrls: ['./subscription-plan-delete-dialog.component.css']
})
export class SubscriptionPlanDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SubscriptionPlanDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { subscriptionPlan: SubscriptionPlanDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

