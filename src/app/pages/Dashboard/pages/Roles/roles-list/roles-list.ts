import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RolesService } from '../Service/role';
import { Role } from '../models/role';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './roles-list.html',
  styleUrls: ['./roles-list.scss']
})
export class RolesListComponent implements OnInit {
  
  // --- Dependency Injection ---
  private rolesService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // --- State Variables ---
  roles: Role[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadRoles();
  }

  /**
   * Fetch all roles from the API.
   */
  loadRoles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.rolesService.getAllRoles().subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Roles API Response:', res); // Check Console to see if 'id' exists

        if (res.isSuccess) {
          this.roles = res.data || [];
          this.cdr.detectChanges(); 
        } else {
          this.errorMessage = res.error?.message || 'Failed to load roles.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network Error: Could not fetch roles.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Delete Role Logic
   * 1. Validates ID presence.
   * 2. Confirms action.
   * 3. Calls API.
   */
  onDelete(role: Role) {
    // SECURITY CHECK: If ID is missing, we cannot delete.
    if (!role.id) {
      alert(`Error: Role ID is missing for "${role.name}". Please check the Backend API response.`);
      console.error('Missing ID for role:', role);
      return;
    }

    // Confirmation
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    this.isLoading = true; // Show loading
    this.rolesService.deleteRole(role.id).subscribe({
      next: (res) => {
        // Handle Success
        if (res.isSuccess) {
          alert('Role deleted successfully!');
          this.loadRoles(); // Refresh the list
        } else {
          this.isLoading = false;
          // Show backend specific error (e.g. "Role in use")
          alert(res.error?.message || 'Failed to delete role.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        alert('An unexpected error occurred while deleting.');
      }
    });
  }
}