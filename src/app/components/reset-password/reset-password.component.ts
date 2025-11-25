import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { PasswordResetDTO } from '../../models/password-reset.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  token: string = '';
  isValidatingToken = true;
  isTokenValid = false;
  isSubmitting = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get token from route params
    this.route.params.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      } else {
        this.snackBar.open('Invalid reset link. Token is missing.', 'Close', {
          duration: 5000
        });
        this.router.navigate(['/login']);
      }
    });
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private validateToken(): void {
    this.isValidatingToken = true;
    this.authService.validateResetToken(this.token).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data === true) {
          this.isTokenValid = true;
        } else {
          this.handleInvalidToken();
        }
        this.isValidatingToken = false;
      },
      error: (error) => {
        console.error('Token validation error:', error);
        this.handleInvalidToken();
        this.isValidatingToken = false;
      }
    });
  }

  private handleInvalidToken(): void {
    this.isTokenValid = false;
    this.snackBar.open(
      'Invalid or expired reset token. Please request a new password reset link.',
      'Close',
      { duration: 7000 }
    );
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.resetPasswordForm.value;
    const resetData: PasswordResetDTO = {
      token: this.token,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.snackBar.open(
            response.message || 'Password reset successfully. Please login with your new password.',
            'Close',
            { duration: 5000 }
          );
          // Redirect to login page after successful reset
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Reset password error:', error);
        let errorMessage = 'Failed to reset password. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            const fieldErrors = error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 7000
        });
        this.isSubmitting = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.resetPasswordForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
    }
    if (this.resetPasswordForm.hasError('passwordMismatch') && fieldName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.resetPasswordForm.get(fieldName);
    const isMismatch = fieldName === 'confirmPassword' && this.resetPasswordForm.hasError('passwordMismatch');
    return !!(control && (control.invalid || isMismatch) && (control.dirty || control.touched));
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}

