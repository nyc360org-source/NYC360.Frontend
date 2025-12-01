import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService } from '../Service/role';
import { Role } from '../models/role';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles-list.html',
  styleUrls: ['./roles-list.scss']
})
export class RolesListComponent implements OnInit {
  
  // Dependency Injection
  private rolesService = inject(RolesService);
  private cdr = inject(ChangeDetectorRef);

  // State Variables
  roles: Role[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadRoles();
  }

  // --- Fetch Roles from API ---
  loadRoles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.rolesService.getAllRoles().subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Roles API Response:', res);

        if (res.isSuccess) {
          this.roles = res.data || [];
          this.cdr.detectChanges(); // Force UI update
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

  // --- Delete Role Logic ---
  onDelete(role: Role) {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    this.isLoading = true; // Show loading indicator
    this.rolesService.deleteRole(role.id).subscribe({
      next: (res) => {
        // Check "isSuccess" because API returns 200 OK even on logical error (like role assigned)
        if (res.isSuccess) {
          alert('Role deleted successfully!');
          this.loadRoles(); // Refresh the list
        } else {
          this.isLoading = false;
          // Show the specific error from backend (e.g., "Cannot delete role. Users are assigned...")
          alert(res.error?.message || 'Failed to delete role.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        alert('An unexpected error occurred.');
      }
    });
  }
}