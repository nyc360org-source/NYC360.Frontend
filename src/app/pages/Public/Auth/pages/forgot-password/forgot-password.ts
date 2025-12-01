import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Service/auth';
import { ForgotPasswordRequest } from '../../models/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email: string = '';
  isLoading = false;
  
  // State for feedback messages
  successMessage: string = '';
  errorMessage: string = '';

  onSubmit() {
    // Basic validation
    if (!this.email) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const requestData: ForgotPasswordRequest = { email: this.email };

    this.authService.forgotPassword(requestData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.successMessage = 'Password reset link has been sent to your email.';
          this.email = ''; // Clear input
        } else {
          this.errorMessage = res.error?.message || 'Something went wrong.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error. Please try again.';
        console.error(err);
      }
    });
  }
}