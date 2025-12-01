// src/app/core/models/role.models.ts

export interface Role {
  id: number; // Required for deletion
  name: string;
  permissions: string[];
}

// Generic API Response Wrapper
export interface RolesResponse {
  isSuccess: boolean;
  data: Role[];
  error: {
    code: string;
    message: string;
  } | null;
}