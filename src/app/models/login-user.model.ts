export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    isActive: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
}

