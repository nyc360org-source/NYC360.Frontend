import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../pages/Public/Auth/Service/auth';

export const authGuard: CanActivateFn = (route, state) => {
  
  // --- 1. Dependencies ---
  const authService = inject(AuthService); // To check login status & roles
  const router = inject(Router);           // To redirect users

  // --- 2. Check Login Status ---
  if (!authService.isLoggedIn()) {
    console.warn('Access Denied: User is not logged in.');
    
    // Redirect to Login page
    router.navigate(['/Login']); 
    return false;
  }

  // --- 3. Check Admin Permissions (Role Based) ---
  // If the user is trying to access any URL containing '/admin'
  if (state.url.includes('/admin')) {
    
    // Check if user has 'SuperAdmin' role (Assuming you have this method in AuthService)
    const isSuperAdmin = authService.hasRole('SuperAdmin');

    if (!isSuperAdmin) {
      alert('Access Denied: You do not have permission to view this page.');
      
      // Redirect to Home Page
      router.navigate(['/']); 
      return false;
    }
  }

  // --- 4. Allow Access ---
  return true; 
};