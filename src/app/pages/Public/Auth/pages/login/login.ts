import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Service/auth';
import { LoginRequest } from '../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] 
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage: string | null = null;
onSubmit() {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.isSuccess) {
          // CASE A: 2FA is Required
          if (response.data.twoFactorRequired) {
            // Navigate to OTP Page (passing email as query param)
            this.router.navigate(['/verify-otp'], { 
              queryParams: { email: this.loginData.email } 
            });
          } 
          // CASE B: Normal Login Success
          else {
            this.router.navigate(['/']); 
          }
        } else {
          this.errorMessage = response.error?.message || 'Login failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network error.';
      }
    });
  }
}