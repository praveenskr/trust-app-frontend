import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PaymentModeDTO, PaymentModeCreateDTO, PaymentModeUpdateDTO, PaymentModeDropdownDTO } from '../models/payment-mode.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentModeService {
  private apiUrl = `${environment.apiUrl}/master/payment-modes`;

  constructor(private http: HttpClient) { }

  getAllPaymentModes(includeInactive: boolean = false): Observable<ApiResponse<PaymentModeDTO[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<PaymentModeDTO[]>>(this.apiUrl, { params });
  }

  getPaymentModeById(id: number): Observable<ApiResponse<PaymentModeDTO>> {
    return this.http.get<ApiResponse<PaymentModeDTO>>(`${this.apiUrl}/${id}`);
  }

  createPaymentMode(createDTO: PaymentModeCreateDTO): Observable<ApiResponse<PaymentModeDTO>> {
    return this.http.post<ApiResponse<PaymentModeDTO>>(this.apiUrl, createDTO);
  }

  updatePaymentMode(id: number, updateDTO: PaymentModeUpdateDTO): Observable<ApiResponse<PaymentModeDTO>> {
    return this.http.put<ApiResponse<PaymentModeDTO>>(`${this.apiUrl}/${id}`, updateDTO);
  }

  deletePaymentMode(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }

  getAllPaymentModesForDropdown(): Observable<ApiResponse<PaymentModeDropdownDTO[]>> {
    return this.http.get<ApiResponse<PaymentModeDropdownDTO[]>>(`${this.apiUrl}/dropdown`);
  }
}

