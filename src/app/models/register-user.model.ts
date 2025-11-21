export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleIds: number[];
}

export interface RegisterUserResponseDTO {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  createdAt: string;
}

