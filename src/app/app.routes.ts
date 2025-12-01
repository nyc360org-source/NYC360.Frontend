import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './pages/Layout/public-layout/public-layout.component';
import { AdminLayoutComponent } from './pages/Layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  //  (Public Layout)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/Public/pages/home/home').then(m => m.Home)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/Public/pages/about/about').then(m => m.About)
      },
      {
        path: 'Login',
        loadComponent: () => import('./pages/Public/Auth/pages/login/login').then(m => m.LoginComponent)
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
        path: 'auth/confirm-email', // This must match the link sent to email
        loadComponent: () => import('./pages/Public/Auth/pages/confirm-email/confirm-email')
          .then(m => m.ConfirmEmailComponent)
      },
    ]
  },

  // 2 (Admin Layout)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [

      {
        path: 'dashboard',
        loadComponent: () => import('./pages/Dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
      ,
      {
        path: 'User',
        loadComponent: () => import('./pages/Dashboard/pages/users/userlist/userlist').then(m => m.UserList)
      },

      //  route of role
      {
        path: 'Role',
        loadComponent: () => import('./pages/Dashboard/pages/Roles/roles-list/roles-list').then(m => m.RolesListComponent)
      }      
      ,
      { path: 'roles/edit/:id',
         loadComponent: () => import('./pages/Dashboard/pages/Roles/edit-role/edit-role').then(m => m.EditRoleComponent)
      }
      ,
      { path: 'roles/create',
         loadComponent: () => import('./pages/Dashboard/pages/Roles/role-form/role-form').then(m => m.RoleFormComponent)
      }
    ]
  },


  {
    path: '**',
    loadComponent: () => import('./pages/Public/Widgets/not-found/not-found').then(m => m.NotFoundComponent)
  }

];