import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserBranchAccessService } from '../../services/user-branch-access.service';
import { BranchAccessDTO, UserBranchAccessTableRow } from '../../models/branch-access.model';
import { AssignBranchesDialogComponent } from './assign-branches-dialog/assign-branches-dialog.component';
import { DeleteBranchAccessDialogComponent } from './delete-branch-access-dialog/delete-branch-access-dialog.component';
import { UserService, UserDropdownDTO } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import { BranchDropdownDTO } from '../../models/branch.model';
import { ApiResponse } from '../../models/api-response.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-branch-access',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './user-branch-access.component.html',
  styleUrls: ['./user-branch-access.component.css']
})
export class UserBranchAccessComponent implements OnInit {
  branchAccessData: UserBranchAccessTableRow[] = [];
  displayedColumns: string[] = ['userName', 'userEmail', 'branchCode', 'branchName', 'grantedAt'];
  isSubmitting = false;
  isLoading = false;
  users: UserDropdownDTO[] = [];
  branches: BranchDropdownDTO[] = [];

  constructor(
    private userBranchAccessService: UserBranchAccessService,
    private userService: UserService,
    private branchService: BranchService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserBranchAccess();
    this.loadUsers();
    this.loadBranches();
  }

  private loadUserBranchAccess(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser || !currentUser.id) {
      this.snackBar.open('User not found. Please login again.', 'Close', {
        duration: 5000
      });
      return;
    }

    this.isLoading = true;
    this.userBranchAccessService.getUserBranchAccess(currentUser.id).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Map BranchAccessDTO[] to UserBranchAccessTableRow[] using userInfo from DTO
          this.branchAccessData = response.data.map(access => ({
            id: access.id,
            userId: access.user?.id || currentUser.id,
            userName: access.user?.fullName || access.user?.username || '',
            userEmail: access.user?.email || '',
            branchId: access.branchId,
            branchName: access.branchName,
            branchCode: access.branchCode,
            grantedAt: access.grantedAt
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user branch access:', error);
        this.snackBar.open('Failed to load user branch access data', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  private loadUsers(): void {
    this.userService.getAllActiveUsersForDropdown().subscribe({
      next: (response: ApiResponse<UserDropdownDTO[]>) => {
        if (response.status === 'success' && response.data) {
          this.users = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 5000
        });
      }
    });
  }

  private loadBranches(): void {
    this.branchService.getAllBranchesForDropdown().subscribe({
      next: (response: ApiResponse<BranchDropdownDTO[]>) => {
        if (response.status === 'success' && response.data) {
          this.branches = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.snackBar.open('Failed to load branches', 'Close', {
          duration: 5000
        });
      }
    });
  }

  openAssignBranchesDialog(): void {
    const dialogRef = this.dialog.open(AssignBranchesDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: {
        users: this.users,
        branches: this.branches
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadUserBranchAccess(); // Reload the list
      }
    });
  }

  openDeleteDialog(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser || !currentUser.id) {
      this.snackBar.open('User not found. Please login again.', 'Close', {
        duration: 5000
      });
      return;
    }

    const userName = currentUser.fullName || currentUser.username || 'this user';
    const branchCount = this.branchAccessData.length;

    if (branchCount === 0) {
      this.snackBar.open('No branch access to delete', 'Close', {
        duration: 3000
      });
      return;
    }

    const dialogRef = this.dialog.open(DeleteBranchAccessDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        userName: userName,
        branchCount: branchCount
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteAllBranches(currentUser.id);
      }
    });
  }

  private deleteAllBranches(userId: number): void {
    this.isSubmitting = true;
    this.userBranchAccessService.removeAllBranches(userId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'All branch access removed successfully',
            'Close',
            { duration: 3000 }
          );
          this.loadUserBranchAccess(); // Reload the list
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting branch access:', error);
        let errorMessage = 'Failed to delete branch access. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

