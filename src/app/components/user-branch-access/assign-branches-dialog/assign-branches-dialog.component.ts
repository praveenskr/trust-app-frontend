import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserDropdownDTO } from '../../../services/user.service';
import { BranchDropdownDTO } from '../../../models/branch.model';
import { UserBranchAccessService } from '../../../services/user-branch-access.service';

@Component({
  selector: 'app-assign-branches-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './assign-branches-dialog.component.html',
  styleUrls: ['./assign-branches-dialog.component.css']
})
export class AssignBranchesDialogComponent {
  assignForm!: FormGroup;
  isSubmitting = false;
  users: UserDropdownDTO[] = [];
  branches: BranchDropdownDTO[] = [];
  
  // User autocomplete properties
  filteredUsers: UserDropdownDTO[] = [];
  userInputValue = '';
  selectedUser: UserDropdownDTO | null = null;
  isSelectingUser = false;
  
  // Branch autocomplete properties
  filteredBranches: BranchDropdownDTO[] = [];
  branchInputValue = '';
  selectedBranches: BranchDropdownDTO[] = [];
  isSelectingBranch = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AssignBranchesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: UserDropdownDTO[]; branches: BranchDropdownDTO[] },
    private userBranchAccessService: UserBranchAccessService,
    private snackBar: MatSnackBar
  ) {
    this.users = data?.users || [];
    this.branches = data?.branches || [];
    this.filteredUsers = this.users;
    this.filteredBranches = this.branches;
    this.initializeForm();
  }

  private initializeForm(): void {
    this.assignForm = this.fb.group({
      userId: ['', [Validators.required]],
      branchIds: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  filterUsers(value: string): void {
    if (this.isSelectingUser) {
      return;
    }
    this.userInputValue = value || '';
    this.selectedUser = null;
    const filterValue = value?.toLowerCase() || '';
    this.filteredUsers = this.users.filter(user => 
      (user.fullName || user.username).toLowerCase().includes(filterValue) || 
      user.email.toLowerCase().includes(filterValue) ||
      user.username.toLowerCase().includes(filterValue)
    );
  }

  onUserSelected(user: UserDropdownDTO | null): void {
    this.isSelectingUser = true;
    this.selectedUser = user;
    if (user) {
      this.assignForm.patchValue({ userId: user.id });
      this.userInputValue = `${user.fullName || user.username} (${user.email})`;
    } else {
      this.assignForm.patchValue({ userId: null });
      this.userInputValue = '';
    }
    this.filteredUsers = this.users;
    setTimeout(() => {
      this.isSelectingUser = false;
    }, 100);
  }

  displayUserName = (user: UserDropdownDTO | null): string => {
    return user ? `${user.fullName || user.username} (${user.email})` : '';
  }

  filterBranches(value: string): void {
    if (this.isSelectingBranch) {
      return;
    }
    this.branchInputValue = value || '';
    const filterValue = value?.toLowerCase() || '';
    this.filteredBranches = this.branches.filter(branch => 
      branch.name.toLowerCase().includes(filterValue) || 
      branch.code.toLowerCase().includes(filterValue)
    );
  }

  onBranchSelected(branch: BranchDropdownDTO | null): void {
    if (!branch) return;
    
    this.isSelectingBranch = true;
    
    // Check if branch is already selected
    const isAlreadySelected = this.selectedBranches.some(b => b.id === branch.id);
    
    if (!isAlreadySelected) {
      this.selectedBranches.push(branch);
      const branchIds = this.selectedBranches.map(b => b.id);
      this.assignForm.patchValue({ branchIds });
      this.assignForm.get('branchIds')?.updateValueAndValidity();
    }
    
    this.branchInputValue = '';
    this.filteredBranches = this.branches;
    
    setTimeout(() => {
      this.isSelectingBranch = false;
    }, 100);
  }

  removeBranch(branch: BranchDropdownDTO): void {
    const index = this.selectedBranches.findIndex(b => b.id === branch.id);
    if (index >= 0) {
      this.selectedBranches.splice(index, 1);
      const branchIds = this.selectedBranches.map(b => b.id);
      this.assignForm.patchValue({ branchIds });
      this.assignForm.get('branchIds')?.updateValueAndValidity();
    }
  }

  displayBranchName = (branch: BranchDropdownDTO | null): string => {
    return branch ? `${branch.code} - ${branch.name}` : '';
  }

  isBranchSelected(branch: BranchDropdownDTO): boolean {
    return this.selectedBranches.some(b => b.id === branch.id);
  }


  onSubmit(): void {
    if (this.assignForm.invalid) {
      this.markFormGroupTouched(this.assignForm);
      return;
    }

    const userId = this.assignForm.get('userId')?.value;
    const branchIds = this.selectedBranches.map(b => b.id);

    if (!userId) {
      this.snackBar.open('Please select a user', 'Close', {
        duration: 3000
      });
      return;
    }

    if (!branchIds || branchIds.length === 0) {
      this.snackBar.open('Please select at least one branch', 'Close', {
        duration: 3000
      });
      return;
    }

    this.isSubmitting = true;
    this.userBranchAccessService.assignBranches(userId, branchIds).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Branches assigned successfully',
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error assigning branches:', error);
        let errorMessage = 'Failed to assign branches. Please try again.';
        
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

  onCancel(): void {
    this.dialogRef.close(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.assignForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `Please select at least one ${this.getFieldLabel(fieldName).toLowerCase()}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      userId: 'User',
      branchIds: 'Branches'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.assignForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

