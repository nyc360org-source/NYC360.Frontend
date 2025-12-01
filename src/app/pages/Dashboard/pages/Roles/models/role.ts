// src/app/core/models/role.models.ts

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

/**
 * FIXED: Payload must include 'id' and 'name' to satisfy backend validation.
 */
export interface UpdateRolePermissionsRequest {
  id: number;    // <--- Added
  name: string;  // <--- Added (Crucial to fix the error)
  permissions: string[];
}

export interface RolesResponse<T = any> {
  isSuccess: boolean;
  data: T; 
  error: {
    code: string;
    message: string;
  } | null;
}