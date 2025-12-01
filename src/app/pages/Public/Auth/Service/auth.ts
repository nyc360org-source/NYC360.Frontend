import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; // tap بنستخدمها عشان نعمل Side Effect زي الحفظ
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthResponse, ForgotPasswordRequest, LoginRequest, LoginResponseData, RegisterRequest } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private tokenKey = 'nyc360_token'; // مفتاح التخزين

// --- Forgot Password ---
  forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, data);
  }



  // --- Register (زي ما هي) ---
  register(data: RegisterRequest): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/register`, data);
  }

  // --- Login ---
  login(data: LoginRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/login`, data)
      .pipe(
        // tap بتسمح لنا ننفذ كود لما الرد يوصل وقبل ما يروح للكومبوننت
        tap(response => {
          if (response.isSuccess && response.data) {
            this.saveToken(response.data.accessToken);
          }
        })
      );
  }

  // --- Token Management ---
  
  // حفظ التوكن
  private saveToken(token: string) {
    // تأكد إننا في المتصفح (عشان الـ SSR ميزعلش)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  // تسجيل الخروج
  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']);
  }

  // هل المستخدم مسجل دخول؟ (للتحقق البسيط)
  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }
}