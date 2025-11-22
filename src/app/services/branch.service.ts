import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BranchDTO, BranchCreateDTO, BranchUpdateDTO } from '../models/branch.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = `${environment.apiUrl}/branches`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllBranches(includeInactive: boolean = false): Observable<ApiResponse<BranchDTO[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<BranchDTO[]>>(this.apiUrl, { params });
  }

  getBranchById(id: number): Observable<ApiResponse<BranchDTO>> {
    return this.http.get<ApiResponse<BranchDTO>>(`${this.apiUrl}/${id}`);
  }

  createBranch(createDTO: BranchCreateDTO): Observable<ApiResponse<BranchDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<BranchDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateBranch(id: number, updateDTO: BranchUpdateDTO): Observable<ApiResponse<BranchDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<BranchDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteBranch(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }
}

