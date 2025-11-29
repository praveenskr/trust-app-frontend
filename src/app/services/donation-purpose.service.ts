import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { DonationPurposeDTO, DonationPurposeCreateDTO, DonationPurposeUpdateDTO, DonationPurposeDropdownDTO } from '../models/donation-purpose.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DonationPurposeService {
  private apiUrl = `${environment.apiUrl}/master/donation-purposes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllDonationPurposes(includeInactive: boolean = false): Observable<ApiResponse<DonationPurposeDTO[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<DonationPurposeDTO[]>>(this.apiUrl, { params });
  }

  getDonationPurposeById(id: number): Observable<ApiResponse<DonationPurposeDTO>> {
    return this.http.get<ApiResponse<DonationPurposeDTO>>(`${this.apiUrl}/${id}`);
  }

  createDonationPurpose(createDTO: DonationPurposeCreateDTO): Observable<ApiResponse<DonationPurposeDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<DonationPurposeDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateDonationPurpose(id: number, updateDTO: DonationPurposeUpdateDTO): Observable<ApiResponse<DonationPurposeDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<DonationPurposeDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteDonationPurpose(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }

  getAllDonationPurposesForDropdown(): Observable<ApiResponse<DonationPurposeDropdownDTO[]>> {
    return this.http.get<ApiResponse<DonationPurposeDropdownDTO[]>>(`${this.apiUrl}/dropdown`);
  }
}

