import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseCategoryDTO } from '../../../models/expense-category.model';

@Component({
  selector: 'app-expense-category-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './expense-category-delete-dialog.component.html',
  styleUrls: ['./expense-category-delete-dialog.component.css']
})
export class ExpenseCategoryDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ExpenseCategoryDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expenseCategory: ExpenseCategoryDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

