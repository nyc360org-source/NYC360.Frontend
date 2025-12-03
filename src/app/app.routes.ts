import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './pages/Layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './pages/Layout/admin-layout/admin-layout.component';
import { authGuard } from './guard/auth-guard'; // Ensure correct path to your Guard

export const routes: Routes = [
  
  // ============================================================
  // 1. PUBLIC LAYOUT (Accessible to everyone)
  // ============================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      // --- General Pages ---
      {
        path: '',
        loadComponent: () => import('./pages/Public/pages/home/home').then(m => m.Home)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/Public/pages/about/about').then(m => m.About)
      },

      // --- Authentication Pages ---
      {
        path: 'Login',
        loadComponent: () => import('./pages/Public/Auth/pages/login/login').then(m => m.LoginComponent)
      },
      { 
        path: 'verify-otp', 
        loadComponent: () => import('./pages/Public/Auth/pages/verify-otp/verify-otp').then(m => m.VerifyOtpComponent) 
      },
      {
        path: 'Signup',
        loadComponent: () => import('./pages/Public/Auth/pages/signup/signup').then(m => m.SignupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/Public/Auth/pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'auth/confirm-email', // Handles the email verification link
        loadComponent: () => import('./pages/Public/Auth/pages/confirm-email/confirm-email').then(m => m.ConfirmEmailComponent)
      },
      {
       path: 'reset-password', // Handles the password reset link
       loadComponent: () => import('./pages/Public/Auth/pages/reset-password/reset-password').then(m => m.ResetPasswordComponent)
      },

      // --- User Profile Pages ---
      {
        // View specific user profile (e.g., /profile/john_doe)
        path: 'profile/:username', 
        loadComponent: () => import('./pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent)
      },
      {
        // View own profile (fallback if username is missing)
        path: 'profile', 
        loadComponent: () => import('./pages/Public/pages/profile/profile/profile').then(m => m.ProfileComponent)
      },
    ]
  },

  // ============================================================
  // 2. ADMIN LAYOUT (Protected by AuthGuard)
  // ============================================================
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard], // 🔒 Security Guard
    children: [
      
      // --- Dashboard ---
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/Dashboard/pages/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // --- User Management ---
      {
        path: 'User',
        loadComponent: () => import('./pages/Dashboard/pages/users/userlist/userlist').then(m => m.UserList)
      },
      
      // --- Role Management Routes ---
      {
        path: 'Role',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/roles-list/roles-list').then(m => m.RolesListComponent)
      },      
      { 
        path: 'roles/edit/:id',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/edit-role/edit-role').then(m => m.EditRoleComponent)
      },
      { 
        path: 'roles/create',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/role-form/role-form').then(m => m.RoleFormComponent)
      },

      // --- RSS Feed Management ---
      {
        path: 'rss',
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-list/rss-list').then(m => m.RssListComponent)
      },
      {
        path: 'rss/create',
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent)
      },
      {
        // We rely on history.state for data here
        path: 'rss/edit', 
        loadComponent: () => import('./pages/Dashboard/pages/RssLinks/pages/rss-form/rss-form').then(m => m.RssFormComponent)
      }
    ]
  },

  // ============================================================
  // 3. WILDCARD ROUTE (404 Not Found)
  // ============================================================
  {
    path: '**',
    loadComponent: () => import('./pages/Public/Widgets/not-found/not-found').then(m => m.NotFoundComponent)
  }

];