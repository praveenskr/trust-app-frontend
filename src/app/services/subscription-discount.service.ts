import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SubscriptionDiscountDTO, SubscriptionDiscountCreateDTO, SubscriptionDiscountUpdateDTO } from '../models/subscription-discount.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionDiscountService {
  private apiUrl = `${environment.apiUrl}/master/subscription-discounts`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllSubscriptionDiscounts(
    planId?: number, 
    isActive?: boolean, 
    validFrom?: string, 
    validTo?: string
  ): Observable<ApiResponse<SubscriptionDiscountDTO[]>> {
    let params = new HttpParams();
    if (planId) {
      params = params.set('planId', planId.toString());
    }
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }
    if (validFrom) {
      params = params.set('validFrom', validFrom);
    }
    if (validTo) {
      params = params.set('validTo', validTo);
    }
    return this.http.get<ApiResponse<SubscriptionDiscountDTO[]>>(this.apiUrl, { params });
  }

  getSubscriptionDiscountById(id: number): Observable<ApiResponse<SubscriptionDiscountDTO>> {
    return this.http.get<ApiResponse<SubscriptionDiscountDTO>>(`${this.apiUrl}/${id}`);
  }

  createSubscriptionDiscount(createDTO: SubscriptionDiscountCreateDTO): Observable<ApiResponse<SubscriptionDiscountDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<SubscriptionDiscountDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateSubscriptionDiscount(id: number, updateDTO: SubscriptionDiscountUpdateDTO): Observable<ApiResponse<SubscriptionDiscountDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<SubscriptionDiscountDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteSubscriptionDiscount(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }
}

