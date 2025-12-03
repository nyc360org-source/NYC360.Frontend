import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Service/auth';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.scss']
})
export class VerifyOtpComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  otpCode = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.router.navigate(['/Login']);
    }
  }

  onVerify() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login2FA(this.email, this.otpCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = res.error?.message || 'Invalid Code';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Verification failed.';
      }
    });
  }
}