export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isOrganization: boolean;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  twoFactorRequired: boolean;
}

export interface AuthResponse<T = any> {
  isSuccess: boolean;
  data: T; 
  error?: {
    code: string;
    message: string;
  } | null;

}

export interface ForgotPasswordRequest {
  email: string;
}