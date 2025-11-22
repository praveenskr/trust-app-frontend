import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { VendorDTO, VendorCreateDTO, VendorUpdateDTO } from '../models/vendor.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/master/vendors`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllVendors(includeInactive: boolean = false): Observable<ApiResponse<VendorDTO[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<VendorDTO[]>>(this.apiUrl, { params });
  }

  getVendorById(id: number): Observable<ApiResponse<VendorDTO>> {
    return this.http.get<ApiResponse<VendorDTO>>(`${this.apiUrl}/${id}`);
  }

  createVendor(createDTO: VendorCreateDTO): Observable<ApiResponse<VendorDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<VendorDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateVendor(id: number, updateDTO: VendorUpdateDTO): Observable<ApiResponse<VendorDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<VendorDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteVendor(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }
}

