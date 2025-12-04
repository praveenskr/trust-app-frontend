import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { DonationDTO, DonationCreateDTO, DonationUpdateDTO, PageResponse } from '../models/donation.model';
import { DonorDropdownDTO } from '../models/donor.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}/donations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllDonations(
    branchId?: number,
    purposeId?: number,
    eventId?: number,
    paymentModeId?: number,
    fromDate?: string,
    toDate?: string,
    donorName?: string,
    panNumber?: string,
    receiptNumber?: string,
    includeInactive: boolean = false,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'donationDate',
    sortDir: string = 'DESC'
  ): Observable<ApiResponse<PageResponse<DonationDTO>>> {
    let params = new HttpParams()
      .set('includeInactive', includeInactive.toString())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (branchId) params = params.set('branchId', branchId.toString());
    if (purposeId) params = params.set('purposeId', purposeId.toString());
    if (eventId) params = params.set('eventId', eventId.toString());
    if (paymentModeId) params = params.set('paymentModeId', paymentModeId.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (donorName) params = params.set('donorName', donorName);
    if (panNumber) params = params.set('panNumber', panNumber);
    if (receiptNumber) params = params.set('receiptNumber', receiptNumber);

    return this.http.get<ApiResponse<PageResponse<DonationDTO>>>(this.apiUrl, { params });
  }

  getDonationById(id: number): Observable<ApiResponse<DonationDTO>> {
    return this.http.get<ApiResponse<DonationDTO>>(`${this.apiUrl}/${id}`);
  }

  createDonation(createDTO: DonationCreateDTO): Observable<ApiResponse<DonationDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1;
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<DonationDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateDonation(id: number, updateDTO: DonationUpdateDTO): Observable<ApiResponse<DonationDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<DonationDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteDonation(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }

  getAllActiveDonorNames(): Observable<ApiResponse<DonorDropdownDTO[]>> {
    return this.http.get<ApiResponse<DonorDropdownDTO[]>>(
      `${this.apiUrl}/donor-names`
    );
  }
}

