import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; // Essential for SSR safety
import { jwtDecode } from 'jwt-decode'; // Import the real library

// Models and Environment
import { 
  AuthResponse, 
  ConfirmEmailRequest, 
  ForgotPasswordRequest, 
  GoogleLoginRequest, 
  LoginRequest, 
  LoginResponseData, 
  RefreshTokenRequest, 
  RegisterRequest, 
  ResetPasswordRequest
} from '../models/auth';
import { environment } from '../../../../environments/environment';

/**
 * AuthService
 * ----------------------------------------------------------------------
 * Central service for handling Authentication.
 * Features:
 * - Login (Standard & Google)
 * - Registration & Password Management
 * - JWT Token Management (Access & Refresh Tokens)
 * - State Management (User Roles & Login Status)
 * ----------------------------------------------------------------------
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // --- Dependencies ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); 
  
  // --- Configuration ---
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private oauthUrl = `${environment.apiBaseUrl}/oauth`; 
  
  // LocalStorage Keys
  private tokenKey = 'nyc360_token'; 
  private refreshTokenKey = 'nyc360_refresh_token'; 

  // --- State Management ---
  // Stores current user info (email, role) for the app to use
  public currentUser$ = new BehaviorSubject<any>(null);

  constructor() {
    // Initialize state on app start
    this.loadUserFromToken();
  }


  // ============================================================
  // SECTION 1: LOGIN & AUTHENTICATION API
  // ============================================================

  /**
   * Google Backend Login
   * Sends the Google ID Token to backend to exchange for our App Tokens.
   */
  loginWithGoogleBackend(idToken: string): Observable<AuthResponse<LoginResponseData>> {
    const payload: GoogleLoginRequest = { idToken: idToken };
    
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.oauthUrl}/google`, payload)
      .pipe(
        tap(res => {
          if (res.isSuccess && res.data) {
            // Save Access AND Refresh Tokens
            this.saveTokens(res.data.accessToken, res.data.refreshToken || '');
            this.loadUserFromToken();
          }
        })
      );
  }


  /**
   * Standard Login Request
   * Posts email/password to backend.
   */
  login(data: LoginRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.isSuccess && res.data) {
            // Save Access AND Refresh Tokens
            this.saveTokens(res.data.accessToken, res.data.refreshToken);
            this.loadUserFromToken();
          }
        })
      );
  }


  /**
   * Refresh Token API
   * Called by Interceptor when Access Token expires (401).
   */
  refreshToken(data: RefreshTokenRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/refresh-token`, data)
      .pipe(
        tap(res => {
          if (res.isSuccess && res.data) {
            // Update tokens in storage
            this.saveTokens(res.data.accessToken, res.data.refreshToken);
          }
        })
      );
  }


  /**
   * Helper to get Google Redirect URL (for direct redirects)
   */
  getGoogleAuthUrl(): string {
    return `${this.apiUrl}/google-login`; 
  }


  // ============================================================
  // SECTION 2: ACCOUNT MANAGEMENT API
  // ============================================================

  /**
   * Register Request
   * Creates a new user account.
   */
  register(data: RegisterRequest): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/register`, data);
  }


  /**
   * Confirm Email
   * Verifies user email via token sent to email.
   */
  confirmEmail(data: ConfirmEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/confirm-email`, {
      email: data.email, 
      token: data.token
    });
  }


  /**
   * Forgot Password
   * Initiates the password recovery process.
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, data);
  }


  /**
   * Reset Password
   * Sets a new password using the recovery token.
   */
  resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/password-reset`, data);
  }


  // ============================================================
  // SECTION 3: STATE & ROLE MANAGEMENT
  // ============================================================

  /**
   * Logout
   * Clears tokens and redirects to login.
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
    this.currentUser$.next(null);
    this.router.navigate(['/Login']); 
  }


  /**
   * Check if User is Logged In
   */
  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }


  /**
   * Check Role
   * Verifies if the current user has a specific role (e.g. 'SuperAdmin').
   */
  hasRole(targetRole: string): boolean {
    const user = this.currentUser$.value;
    if (!user || !user.role) return false;

    if (Array.isArray(user.role)) {
      return user.role.includes(targetRole);
    }
    return user.role === targetRole;
  }


  // ============================================================
  // SECTION 4: TOKEN HELPERS (Storage & Decoding)
  // ============================================================

  /**
   * Save Tokens
   * Stores both Access and Refresh tokens in LocalStorage.
   */
  private saveTokens(accessToken: string, refreshToken: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    }
  }


  /**
   * Get Access Token (Public for Interceptor)
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }


  /**
   * Get Refresh Token (Public for Interceptor)
   */
  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }


  /**
   * Load User From Token
   * Decodes JWT and updates the behavior subject.
   */
  private loadUserFromToken() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.getToken();
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // Map ASP.NET Identity Claims to simple keys
        const user = {
          email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        };

        this.currentUser$.next(user);
      } catch (e) {
        console.error('Invalid Token:', e);
        this.logout();
      }
    } else {
      this.currentUser$.next(null);
    }
  }
}