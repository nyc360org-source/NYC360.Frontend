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
  LoginRequest, 
  LoginResponseData, 
  RegisterRequest 
} from '../models/auth';
import { environment } from '../../../../environments/environment';

/**
 * AuthService
 * ----------------------------------------------------------------------
 * This service acts as the central hub for:
 * 1. Communicating with the Backend Auth API.
 * 2. Managing the User's Login State (currentUser$).
 * 3. Handling JWT Token storage and decoding.
 * ----------------------------------------------------------------------
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // --- Dependencies ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // To check if we are in Browser or Server
  
  // --- Configuration ---
  private apiUrl = `${environment.apiBaseUrl}/auth`;
  private tokenKey = 'nyc360_token'; 

  // --- State Management ---
  // BehaviorSubject holds the current value and emits it to new subscribers.
  public currentUser$ = new BehaviorSubject<any>(null);

  constructor() {
    // Attempt to load the user from storage when the app starts
    this.loadUserFromToken();
  }

  // ============================================================
  // SECTION 1: API CALLS (HTTP)
  // ============================================================

  /**
   * Login Request
   * Posts credentials to the server. If successful, saves the token
   * and updates the application state.
   */
  login(data: LoginRequest): Observable<AuthResponse<LoginResponseData>> {
    return this.http.post<AuthResponse<LoginResponseData>>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          if (res.isSuccess && res.data) {
            // 1. Save Token to LocalStorage
            this.saveToken(res.data.accessToken);
            // 2. Decode Token and update currentUser$
            this.loadUserFromToken();
          }
        })
      );
  }

  /**
   * Register Request
   * Creates a new account (User or Organization).
   */
  register(data: RegisterRequest): Observable<AuthResponse<any>> {
    return this.http.post<AuthResponse<any>>(`${this.apiUrl}/register`, data);
  }

  /**
   * Email Confirmation
   * Maps the 'email' from the URL to 'userId' as required by Swagger.
   */
  confirmEmail(data: ConfirmEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/confirm-email`, {
      email: data.email, 
      token: data.token
    });
  }

  /**
   * Forgot Password
   * Sends a reset link to the user's email.
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, data);
  }

  // ============================================================
  // SECTION 2: STATE MANAGEMENT (Logout & Roles)
  // ============================================================

  /**
   * Logout
   * Clears the token from storage, resets the state, and redirects to login.
   */
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUser$.next(null);
    this.router.navigate(['/Login']);
  }

  /**
   * Check if User is Logged In
   * Returns true if a user object exists in the state.
   */
  isLoggedIn(): boolean {
    return !!this.currentUser$.value;
  }

  /**
   * Check Role
   * Checks if the current user possesses a specific role (e.g., 'SuperAdmin').
   * Handles cases where roles might be a string or an array.
   */
  hasRole(targetRole: string): boolean {
    const user = this.currentUser$.value;
    if (!user || !user.role) return false;

    // Check if user.role is an array or a single string
    if (Array.isArray(user.role)) {
      return user.role.includes(targetRole);
    }
    return user.role === targetRole;
  }

  // ============================================================
  // SECTION 3: HELPERS (Token Handling)
  // ============================================================

  /**
   * Save Token
   * Safely saves the token to LocalStorage (Browser only).
   */
  private saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Load User From Token
   * 1. Retrieves token from storage.
   * 2. Decodes the JWT.
   * 3. Maps ASP.NET specific claim names to simple names (email, role).
   * 4. Updates the currentUser$ BehaviorSubject.
   */
  private loadUserFromToken() {
    // Guard: Do not run this on the Server (SSR)
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(this.tokenKey);
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        // Map Claims: ASP.NET Identity uses long URLs for claim keys
        const user = {
          email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        };

        // Emit new user state
        this.currentUser$.next(user);
      } catch (e) {
        console.error('Invalid Token:', e);
        this.logout(); // If token is corrupted, logout
      }
    } else {
      this.currentUser$.next(null);
    }
  }
}