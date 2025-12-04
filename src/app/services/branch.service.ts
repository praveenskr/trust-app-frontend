import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BranchDTO, BranchCreateDTO, BranchUpdateDTO, BranchDropdownDTO, PageResponse } from '../models/branch.model';
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

  getAllBranches(
    includeInactive?: boolean,
    city?: string,
    state?: string,
    search?: string,
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir?: string
  ): Observable<ApiResponse<PageResponse<BranchDTO>>> {
    let params = new HttpParams();
    
    if (includeInactive !== undefined) {
      params = params.set('includeInactive', includeInactive.toString());
    }
    if (city) {
      params = params.set('city', city);
    }
    if (state) {
      params = params.set('state', state);
    }
    if (search) {
      params = params.set('search', search);
    }
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (size !== undefined) {
      params = params.set('size', size.toString());
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    if (sortDir) {
      params = params.set('sortDir', sortDir);
    }
    
    return this.http.get<ApiResponse<PageResponse<BranchDTO>>>(this.apiUrl, { params });
  }

  getAllBranchesForDropdown(): Observable<ApiResponse<BranchDropdownDTO[]>> {
    return this.http.get<ApiResponse<BranchDropdownDTO[]>>(`${this.apiUrl}/dropdown`);
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

