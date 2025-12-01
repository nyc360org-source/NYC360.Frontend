// src/app/pages/Public/Auth/models/auth.ts

// Request model for Registration
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string; // Added username field
  email: string;
  password: string;
  isOrganization: boolean;
}

// Request model for Login
export interface LoginRequest {
  email: string;
  password: string;
}

// Data received inside "data" property on successful login
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  twoFactorRequired: boolean;
}

// Request model for Forgot Password
export interface ForgotPasswordRequest {
  email: string;
}

// Generic API Response Wrapper
// <T> allows us to specify what kind of data is returned (e.g., LoginData or null)
export interface AuthResponse<T = any> {
  isSuccess: boolean;
  data: T; 
  error?: {
    code: string;
    message: string;
  } | null;
}

export interface ConfirmEmailRequest {
  email: string; // القيمة القادمة من الرابط
  token: string; // التوكن القادم من الرابط
}