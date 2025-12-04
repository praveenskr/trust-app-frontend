import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BranchAccessDTO } from '../models/branch-access.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserBranchAccessService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getUserBranchAccess(userId: number): Observable<ApiResponse<BranchAccessDTO[]>> {
    return this.http.get<ApiResponse<BranchAccessDTO[]>>(`${this.apiUrl}/${userId}/branches`);
  }

  assignBranches(userId: number, branchIds: number[]): Observable<ApiResponse<BranchAccessDTO[]>> {
    const user = this.authService.getUser();
    const grantedBy = user?.id || 1;
    
    const params = new HttpParams().set('grantedBy', grantedBy.toString());
    return this.http.put<ApiResponse<BranchAccessDTO[]>>(
      `${this.apiUrl}/${userId}/branches`,
      branchIds,
      { params }
    );
  }

  removeAllBranches(userId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${userId}/branches`);
  }
}

