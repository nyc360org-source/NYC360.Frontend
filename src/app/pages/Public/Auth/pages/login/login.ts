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
    // 1. Reset
    this.isLoading = true;
    this.errorMessage = null;

    // 2. Call Service
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.isSuccess) {
          console.log('Login Success', response.data);
          this.router.navigate(['']); 
        } else {
          this.errorMessage = response.error?.message || 'Login failed. Please check your credentials.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login Error:', err);
        this.errorMessage = 'Network error. Please try again later.';
      }
    });
  }
}