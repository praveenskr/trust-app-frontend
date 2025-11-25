import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SerialNumberConfigDTO, SerialNumberConfigCreateDTO, SerialNumberConfigUpdateDTO, SerialNumberNextResponseDTO } from '../models/serial-number-config.model';

@Injectable({
  providedIn: 'root'
})
export class SerialNumberConfigService {
  private apiUrl = `${environment.apiUrl}/master/serial-config`;

  constructor(private http: HttpClient) { }

  getAllConfigurations(): Observable<ApiResponse<SerialNumberConfigDTO[]>> {
    return this.http.get<ApiResponse<SerialNumberConfigDTO[]>>(this.apiUrl);
  }

  getConfigurationByEntityType(entityType: string): Observable<ApiResponse<SerialNumberConfigDTO>> {
    return this.http.get<ApiResponse<SerialNumberConfigDTO>>(`${this.apiUrl}/${entityType}`);
  }

  createConfiguration(createDTO: SerialNumberConfigCreateDTO): Observable<ApiResponse<SerialNumberConfigDTO>> {
    return this.http.post<ApiResponse<SerialNumberConfigDTO>>(this.apiUrl, createDTO);
  }

  updateConfiguration(id: number, updateDTO: SerialNumberConfigUpdateDTO): Observable<ApiResponse<SerialNumberConfigDTO>> {
    return this.http.put<ApiResponse<SerialNumberConfigDTO>>(`${this.apiUrl}/${id}`, updateDTO);
  }

  getNextSerialNumber(entity: string): Observable<ApiResponse<SerialNumberNextResponseDTO>> {
    return this.http.get<ApiResponse<SerialNumberNextResponseDTO>>(`${this.apiUrl}/next/${entity}`);
  }
}

