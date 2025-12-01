// src/app/pages/public/auth/reset-password/reset-password.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Service/auth';
import { ResetPasswordRequest } from '../../models/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  
  // --- Dependencies ---
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // --- State ---
  resetForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  
  // Hidden fields from URL
  emailParam: string | null = null;
  tokenParam: string | null = null;

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // 1. Capture Email & Token from URL
    this.emailParam = this.route.snapshot.queryParamMap.get('email');
    this.tokenParam = this.route.snapshot.queryParamMap.get('token');

    // 2. Fix Token Encoding (Replace spaces with +)
    if (this.tokenParam) {
      this.tokenParam = this.tokenParam.replace(/ /g, '+');
    }

    // 3. Validation: If missing params, show error immediately
    if (!this.emailParam || !this.tokenParam) {
      this.errorMessage = 'Invalid link. Email or Token is missing.';
      this.resetForm.disable(); // Disable form
    }
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    // Check matching passwords
    const { newPassword, confirmPassword } = this.resetForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Prepare Request
    const requestData: ResetPasswordRequest = {
      email: this.emailParam!,
      token: this.tokenParam!,
      newPassword: newPassword
    };

    // Call API
    this.authService.resetPassword(requestData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.successMessage = 'Password reset successful! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/Login']), 3000);
        } else {
          this.errorMessage = res.error?.message || 'Failed to reset password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Network error or expired token.';
      }
    });
  }
}