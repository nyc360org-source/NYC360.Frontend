// src/app/core/models/user.models.ts

export interface User {
  id: number;
  email: string;
  fullName: string;
  emailConfirmed: boolean;
  roles: string[];
}

export interface UsersResponse {
  isSuccess: boolean;
  data: User[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  error: any;
}