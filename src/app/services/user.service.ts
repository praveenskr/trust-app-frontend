import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isActive: boolean;
}

export interface UserDropdownDTO {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(includeInactive: boolean = false): Observable<ApiResponse<UserDTO[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<UserDTO[]>>(this.apiUrl, { params });
  }

  getAllActiveUsersForDropdown(): Observable<ApiResponse<UserDropdownDTO[]>> {
    return this.http.get<ApiResponse<UserDropdownDTO[]>>(`${this.apiUrl}/dropdown`);
  }
}

