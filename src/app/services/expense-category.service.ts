import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ExpenseCategoryDTO, ExpenseCategoryCreateDTO, ExpenseCategoryUpdateDTO, ExpenseCategoryDropdownDTO } from '../models/expense-category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {
  private apiUrl = `${environment.apiUrl}/master/expense-categories`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllExpenseCategories(includeInactive: boolean = false): Observable<ApiResponse<ExpenseCategoryDTO[]>> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ApiResponse<ExpenseCategoryDTO[]>>(this.apiUrl, { params });
  }

  getExpenseCategoryById(id: number): Observable<ApiResponse<ExpenseCategoryDTO>> {
    return this.http.get<ApiResponse<ExpenseCategoryDTO>>(`${this.apiUrl}/${id}`);
  }

  createExpenseCategory(createDTO: ExpenseCategoryCreateDTO): Observable<ApiResponse<ExpenseCategoryDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<ExpenseCategoryDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateExpenseCategory(id: number, updateDTO: ExpenseCategoryUpdateDTO): Observable<ApiResponse<ExpenseCategoryDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<ExpenseCategoryDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteExpenseCategory(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }

  getAllExpenseCategoriesForDropdown(): Observable<ApiResponse<ExpenseCategoryDropdownDTO[]>> {
    return this.http.get<ApiResponse<ExpenseCategoryDropdownDTO[]>>(`${this.apiUrl}/dropdown`);
  }
}

