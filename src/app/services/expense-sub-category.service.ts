import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ExpenseSubCategoryDTO, ExpenseSubCategoryCreateDTO, ExpenseSubCategoryUpdateDTO } from '../models/expense-sub-category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseSubCategoryService {
  private apiUrl = `${environment.apiUrl}/master/expense-sub-categories`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllExpenseSubCategories(categoryId?: number, includeInactive: boolean = false): Observable<ApiResponse<ExpenseSubCategoryDTO[]>> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<ApiResponse<ExpenseSubCategoryDTO[]>>(this.apiUrl, { params });
  }

  getExpenseSubCategoryById(id: number): Observable<ApiResponse<ExpenseSubCategoryDTO>> {
    return this.http.get<ApiResponse<ExpenseSubCategoryDTO>>(`${this.apiUrl}/${id}`);
  }

  createExpenseSubCategory(createDTO: ExpenseSubCategoryCreateDTO): Observable<ApiResponse<ExpenseSubCategoryDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<ExpenseSubCategoryDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateExpenseSubCategory(id: number, updateDTO: ExpenseSubCategoryUpdateDTO): Observable<ApiResponse<ExpenseSubCategoryDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<ExpenseSubCategoryDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteExpenseSubCategory(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }
}

