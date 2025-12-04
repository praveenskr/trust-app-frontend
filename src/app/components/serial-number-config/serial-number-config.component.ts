import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SerialNumberConfigService } from '../../services/serial-number-config.service';
import { SerialNumberConfigCreateDTO, SerialNumberConfigDTO, SerialNumberConfigUpdateDTO } from '../../models/serial-number-config.model';
import { SerialNumberConfigDialogComponent } from './serial-number-config-dialog/serial-number-config-dialog.component';

@Component({
  selector: 'app-serial-number-config',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './serial-number-config.component.html',
  styleUrls: ['./serial-number-config.component.css']
})
export class SerialNumberConfigComponent implements OnInit {
  configurations: SerialNumberConfigDTO[] = [];
  displayedColumns: string[] = ['entityType', 'prefix', 'formatPattern', 'currentYear', 'lastSequence', 'sequenceLength', 'actions'];
  isSubmitting = false;
  isLoading = false;

  constructor(
    private serialNumberConfigService: SerialNumberConfigService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadConfigurations();
  }

  private loadConfigurations(): void {
    this.isLoading = true;
    this.serialNumberConfigService.getAllConfigurations().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.configurations = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading serial number configurations:', error);
        this.snackBar.open('Failed to load serial number configurations', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(SerialNumberConfigDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.mode === 'create') {
          this.createConfiguration(result.data);
        } else if (result.mode === 'edit') {
          this.updateConfiguration(result.id, result.data);
        }
      }
    });
  }

  openEditDialog(config: SerialNumberConfigDTO, event?: Event): void {
    // Blur the button to remove focus state
    if (event) {
      const target = event.target as HTMLElement;
      const button = target.closest('button') || target;
      button.blur();
    }
    
    const dialogRef = this.dialog.open(SerialNumberConfigDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: { config }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Ensure button is blurred after dialog closes
      if (event) {
        const target = event.target as HTMLElement;
        const button = target.closest('button') || target;
        button.blur();
      }
      if (result && result.mode === 'edit') {
        this.updateConfiguration(result.id, result.data);
      }
    });
  }

  private createConfiguration(createDTO: SerialNumberConfigCreateDTO): void {
    this.isSubmitting = true;
    this.serialNumberConfigService.createConfiguration(createDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Serial number configuration created successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadConfigurations(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating serial number configuration:', error);
        let errorMessage = 'Failed to create serial number configuration. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  private updateConfiguration(id: number, updateDTO: SerialNumberConfigUpdateDTO): void {
    this.isSubmitting = true;
    this.serialNumberConfigService.updateConfiguration(id, updateDTO).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Serial number configuration updated successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadConfigurations(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating serial number configuration:', error);
        let errorMessage = 'Failed to update serial number configuration. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }
}

