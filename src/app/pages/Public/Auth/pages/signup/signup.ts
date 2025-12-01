import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Service/auth';
import { RegisterRequest } from '../../models/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  // حقن السيرفس والراوتر
  private authService = inject(AuthService);
  private router = inject(Router);

  // استخدام الموديل لضمان تطابق البيانات
  registerData: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    isOrganization: false
  };

  isLoading = false;
  errorMessage: string | null = null; // لعرض رسالة خطأ في الـ HTML

  onSubmit() {
    // 1. تفعيل وضع التحميل
    this.isLoading = true;
    this.errorMessage = null;

    // 2. استدعاء السيرفس
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.isSuccess) {
          console.log('Registration Successful');
          // توجيه المستخدم لصفحة تسجيل الدخول
          this.router.navigate(['/Login']);
        } else {
          // التعامل مع خطأ راجع من الباك إند (مثلاً الإيميل موجود مسبقاً)
          this.errorMessage = response.error?.message || 'Registration failed';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('HTTP Error:', err);
        this.errorMessage = 'A network error occurred. Please try again later.';
      }
    });
  }
}