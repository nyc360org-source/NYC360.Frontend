import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../Auth/Service/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  providers: [DatePipe]
})
export class NavBarComponent implements OnInit, OnDestroy {
  
  // حقن السيرفس public عشان ممكن نحتاجها في الـ HTML
  public authService = inject(AuthService);
  
  isMenuOpen = false;
  currentDate = new Date();
  
  // متغيرات الحالة
  isLoggedIn = false;
  isAdmin = false;

  private userSub!: Subscription;

  ngOnInit() {
    // الاشتراك في حالة المستخدم
    // أي تغيير في السيرفس هيسمع هنا فوراً
    this.userSub = this.authService.currentUser$.subscribe(user => {
      console.log('👤 Current User in Navbar:', user); // للتأكد إن الداتا وصلت
      
      this.isLoggedIn = !!user; // لو فيه يوزر يبقى true
      
      if (user) {
        // التحقق من صلاحية الأدمن
        this.isAdmin = this.authService.hasRole('SuperAdmin');
        console.log('Is Admin?', this.isAdmin);
      } else {
        this.isAdmin = false;
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false; // اقفل القائمة لو مفتوحة
  }

  ngOnDestroy() {
    // تنظيف الاشتراك عشان الميموري
    if (this.userSub) this.userSub.unsubscribe();
  }
}