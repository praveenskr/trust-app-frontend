import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { EventDTO, EventCreateDTO, EventUpdateDTO, EventDropdownDTO } from '../models/event.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/master/events`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllEvents(branchId?: number, status?: string, includeInactive: boolean = false): Observable<ApiResponse<EventDTO[]>> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<EventDTO[]>>(this.apiUrl, { params });
  }

  getEventById(id: number): Observable<ApiResponse<EventDTO>> {
    return this.http.get<ApiResponse<EventDTO>>(`${this.apiUrl}/${id}`);
  }

  createEvent(createDTO: EventCreateDTO): Observable<ApiResponse<EventDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1; // Use logged-in user ID or default to 1
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<EventDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }

  updateEvent(id: number, updateDTO: EventUpdateDTO): Observable<ApiResponse<EventDTO>> {
    const user = this.authService.getUser();
    const updatedBy = user?.id || 1;
    
    const params = new HttpParams().set('updatedBy', updatedBy.toString());
    return this.http.put<ApiResponse<EventDTO>>(
      `${this.apiUrl}/${id}`,
      updateDTO,
      { params }
    );
  }

  deleteEvent(id: number): Observable<ApiResponse<null>> {
    const user = this.authService.getUser();
    const deletedBy = user?.id || 1;
    
    const params = new HttpParams().set('deletedBy', deletedBy.toString());
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { params });
  }

  getAllEventsForDropdown(branchId?: number): Observable<ApiResponse<EventDropdownDTO[]>> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    return this.http.get<ApiResponse<EventDropdownDTO[]>>(`${this.apiUrl}/dropdown`, { params });
  }
}

