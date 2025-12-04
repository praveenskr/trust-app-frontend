import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-branch-access-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './delete-branch-access-dialog.component.html',
  styleUrls: ['./delete-branch-access-dialog.component.css']
})
export class DeleteBranchAccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteBranchAccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userName: string; branchCount: number }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

