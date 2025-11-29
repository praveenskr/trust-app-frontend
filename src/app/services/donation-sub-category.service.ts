import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { DonationSubCategoryDTO, DonationSubCategoryCreateDTO, DonationSubCategoryUpdateDTO, DonationSubCategoryDropdownDTO } from '../models/donation-sub-category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DonationSubCategoryService {
  private apiUrl = `${environment.apiUrl}/master/donation-sub-categories`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllDonationSubCategories(purposeId?: number, includeInactive: boolean = false): Observable<ApiResponse<DonationSubCategoryDTO[]>> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (purposeId) {
      params = params.set('purposeId', purposeId.toString());
    }
    return this.http.get<ApiResponse<DonationSubCategoryDTO[]>>(this.apiUrl, { params });
  }

  getDonationSubCategoryById(id: number): Observable<ApiResponse<DonationSubCategoryDTO>> {
    return this.http.get<ApiResponse<DonationSubCategoryDTO>>(`${this.apiUrl}/${id}`);
  }

  createDonationSubCategory(createDTO: DonationSubCategoryCreateDTO): Observable<ApiResponse<DonationSubCategoryDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<DonationSubCategoryDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateDonationSubCategory(id: number, updateDTO: DonationSubCategoryUpdateDTO): Observable<ApiResponse<DonationSubCategoryDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<DonationSubCategoryDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteDonationSubCategory(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }

  getAllDonationSubCategoriesForDropdown(purposeId?: number): Observable<ApiResponse<DonationSubCategoryDropdownDTO[]>> {
    let params = new HttpParams();
    if (purposeId) {
      params = params.set('purposeId', purposeId.toString());
    }
    return this.http.get<ApiResponse<DonationSubCategoryDropdownDTO[]>>(`${this.apiUrl}/dropdown`, { params });
  }
}

