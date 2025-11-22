import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ExpenseSubCategoryDTO } from '../../../models/expense-sub-category.model';

@Component({
  selector: 'app-expense-sub-category-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './expense-sub-category-delete-dialog.component.html',
  styleUrls: ['./expense-sub-category-delete-dialog.component.css']
})
export class ExpenseSubCategoryDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ExpenseSubCategoryDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expenseSubCategory: ExpenseSubCategoryDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

