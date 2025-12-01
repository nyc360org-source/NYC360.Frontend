// src/app/pages/admin/role-form/role-form.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RolesService } from '../Service/role';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './role-form.html',
  styleUrls: ['./role-form.scss']
})
export class RoleFormComponent implements OnInit {
  
  // --- Dependencies ---
  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);
  private router = inject(Router);

  // --- Form & State ---
  roleForm!: FormGroup;
  allPermissions: string[] = []; // List of all available permissions
  isLoading = true;
  errorMessage = '';

  constructor() {
    // Initialize form with name and empty permissions array
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(3)]],
      permissions: this.fb.array([]) 
    });
  }

  // Helper to access the FormArray in HTML
  get permissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  ngOnInit(): void {
    // 1. Fetch all available system permissions
    this.rolesService.getAllPermissions().subscribe({
      next: (perms) => {
        this.allPermissions = perms;
        // 2. Create a checkbox control for each permission (initially false)
        this.allPermissions.forEach(() => {
          this.permissionsArray.push(new FormControl(false));
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Failed to load permissions.";
        this.isLoading = false;
      }
    });
  }

  // --- Submit ---
  onSubmit() {
    if (this.roleForm.invalid) return;

    this.isLoading = true;
    const name = this.roleForm.value.roleName;

    // 1. Map selected booleans to actual permission strings
    const selectedPermissions = this.roleForm.value.permissions
      .map((checked: boolean, i: number) => checked ? this.allPermissions[i] : null)
      .filter((v: string | null) => v !== null);

    // 2. Call API
    this.rolesService.createRole(name, selectedPermissions).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          alert('Role created successfully');
          this.router.navigate(['/admin/Role']);
        } else {
          this.errorMessage = res.error?.message || 'Failed to create role';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Network error occurred.';
      }
    });
  }
}