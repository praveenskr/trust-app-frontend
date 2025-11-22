import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SubscriptionPlanDTO, SubscriptionPlanCreateDTO, SubscriptionPlanUpdateDTO } from '../models/subscription-plan.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private apiUrl = `${environment.apiUrl}/master/subscription-plans`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllSubscriptionPlans(planType?: string, includeInactive: boolean = false): Observable<ApiResponse<SubscriptionPlanDTO[]>> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (planType) {
      params = params.set('planType', planType);
    }
    return this.http.get<ApiResponse<SubscriptionPlanDTO[]>>(this.apiUrl, { params });
  }

  getSubscriptionPlanById(id: number): Observable<ApiResponse<SubscriptionPlanDTO>> {
    return this.http.get<ApiResponse<SubscriptionPlanDTO>>(`${this.apiUrl}/${id}`);
  }

  createSubscriptionPlan(createDTO: SubscriptionPlanCreateDTO): Observable<ApiResponse<SubscriptionPlanDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<SubscriptionPlanDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateSubscriptionPlan(id: number, updateDTO: SubscriptionPlanUpdateDTO): Observable<ApiResponse<SubscriptionPlanDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<SubscriptionPlanDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteSubscriptionPlan(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }
}

