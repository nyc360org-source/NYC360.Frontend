// src/app/core/services/roles.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RolesResponse } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  // Base URL: https://nyc360.runasp.net/api/roles-dashboard
  private baseUrl = `${environment.apiBaseUrl}/roles-dashboard`;

  // --- Get All Roles ---
  getAllRoles(): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(`${this.baseUrl}/all`);
  }

  // --- Delete Role ---
  // API requires ID in the path: /delete/{roleId}
  deleteRole(roleId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${roleId}`);
  }
}