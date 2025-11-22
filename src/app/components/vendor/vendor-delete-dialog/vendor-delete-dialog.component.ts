import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { VendorDTO } from '../../../models/vendor.model';

@Component({
  selector: 'app-vendor-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './vendor-delete-dialog.component.html',
  styleUrls: ['./vendor-delete-dialog.component.css']
})
export class VendorDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VendorDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { vendor: VendorDTO }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

