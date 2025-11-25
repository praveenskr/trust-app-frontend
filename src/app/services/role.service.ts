import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RoleDTO } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/users/roles`;

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<ApiResponse<RoleDTO[]>> {
    return this.http.get<ApiResponse<RoleDTO[]>>(this.apiUrl);
  }
}

