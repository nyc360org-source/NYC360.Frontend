import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersResponse } from '../models/userlist';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users-dashboard`;

  // --- Get All Users ---
  getAllUsers(page: number = 1, pageSize: number = 10, search: string = ''): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UsersResponse>(`${this.baseUrl}/all`);
  }

deleteUser(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/delete/${id}`);
}


}