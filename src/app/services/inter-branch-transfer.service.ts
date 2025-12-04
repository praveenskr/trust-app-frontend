import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { InterBranchTransferDTO, InterBranchTransferCreateDTO, PageResponse } from '../models/inter-branch-transfer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InterBranchTransferService {
  private apiUrl = `${environment.apiUrl}/branches/transfers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllTransfers(
    fromBranchId?: number,
    toBranchId?: number,
    status?: string,
    fromDate?: string,
    toDate?: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'transferDate',
    sortDir: string = 'DESC'
  ): Observable<ApiResponse<PageResponse<InterBranchTransferDTO>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (fromBranchId) params = params.set('fromBranchId', fromBranchId.toString());
    if (toBranchId) params = params.set('toBranchId', toBranchId.toString());
    if (status) params = params.set('status', status);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<ApiResponse<PageResponse<InterBranchTransferDTO>>>(this.apiUrl, { params });
  }

  createTransfer(createDTO: InterBranchTransferCreateDTO): Observable<ApiResponse<InterBranchTransferDTO>> {
    const user = this.authService.getUser();
    const createdBy = user?.id || 1;
    
    const params = new HttpParams().set('createdBy', createdBy.toString());
    return this.http.post<ApiResponse<InterBranchTransferDTO>>(
      this.apiUrl,
      createDTO,
      { params }
    );
  }
}

