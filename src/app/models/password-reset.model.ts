export interface PasswordResetRequestDTO {
  email: string;
}

export interface PasswordResetDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

