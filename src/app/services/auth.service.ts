import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RegisterUserDTO, RegisterUserResponseDTO } from '../models/register-user.model';
import { LoginUserDTO, LoginResponseDTO } from '../models/login-user.model';
import { PasswordResetRequestDTO, PasswordResetDTO } from '../models/password-reset.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient) { }

  register(userData: RegisterUserDTO): Observable<ApiResponse<RegisterUserResponseDTO>> {
    return this.http.post<ApiResponse<RegisterUserResponseDTO>>(
      `${this.apiUrl}/register`,
      userData
    );
  }

  login(loginData: LoginUserDTO): Observable<ApiResponse<LoginResponseDTO>> {
    return this.http.post<ApiResponse<LoginResponseDTO>>(
      `${this.apiUrl}/login`,
      loginData
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
          // Store tokens and user info
          localStorage.setItem(this.ACCESS_TOKEN_KEY, response.data.tokens.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.tokens.refreshToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): LoginResponseDTO['user'] | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  forgotPassword(request: PasswordResetRequestDTO): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.apiUrl}/forgot-password`,
      request
    );
  }

  resetPassword(resetData: PasswordResetDTO): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.apiUrl}/reset-password`,
      resetData
    );
  }

  validateResetToken(token: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/password-reset/validate/${token}`
    );
  }
}

