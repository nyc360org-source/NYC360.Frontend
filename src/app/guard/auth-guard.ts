import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../pages/Public/Auth/Service/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check Login
  if (!authService.isLoggedIn()) {
    router.navigate(['/Login']);
    return false;
  }

  // 2. Check Permissions (Dynamic)
  // Reads the 'permission' data property from app.routes.ts
  const requiredPermission = route.data['permission'] as string;

  if (requiredPermission) {
    // If user does NOT have permission, block access
    if (!authService.hasPermission(requiredPermission)) {
      alert('Access Denied: You do not have the required permission.');
      return false;
    }
  }

  return true;
};