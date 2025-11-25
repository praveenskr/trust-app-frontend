import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BranchDTO } from '../../../models/branch.model';

@Component({
  selector: 'app-branch-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './branch-delete-dialog.component.html',
  styleUrls: ['./branch-delete-dialog.component.css']
})
export class BranchDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BranchDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { branch: BranchDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

