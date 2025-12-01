import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Service/auth';

/**
 * ConfirmEmailComponent
 * Handles the email verification process.
 * Features:
 * - Auto-detects URL parameters.
 * - Fixes broken tokens (URL decoding issues).
 * - Displays success (Green) or failure states.
 */
@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.html',
  styleUrls: ['./confirm-email.scss']
})
export class ConfirmEmailComponent implements OnInit {
  
  // --- Dependencies ---
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  // --- UI State ---
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  ngOnInit() {
    this.processConfirmation();
  }

  processConfirmation() {
    // 1. Extract params
    const email = this.route.snapshot.queryParamMap.get('email');
    let token = this.route.snapshot.queryParamMap.get('token');

    // 2. Validate params existence
    if (!email || !token) {
      this.handleError('Invalid Link. Missing email or token.');
      return;
    }

    // 🔴 CRITICAL FIX: 
    // Browsers often convert the '+' inside the token to a 'space' when reading from URL.
    // We must convert spaces back to '+' for the backend to accept the signature.
    token = token.replace(/ /g, '+');

    // 3. Call API
    this.authService.confirmEmail({ email, token }).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (res.isSuccess) {
          this.isSuccess = true;
          // Optional: Auto-redirect after 5 seconds
          setTimeout(() => this.router.navigate(['/login']), 5000);
        } else {
          // Backend returned 200 but logic failed (e.g., user already confirmed)
          this.handleError(res.error?.message || 'Verification failed. Please try logging in.');
        }
      },
      error: (err) => {
        // Network error or 400/500 status
        console.error('Confirmation Error:', err);
        this.handleError('Link expired or invalid. Please login to request a new one.');
      }
    });
  }

  // Helper to set error state
  private handleError(msg: string) {
    this.isLoading = false;
    this.isSuccess = false;
    this.errorMessage = msg;
  }
}