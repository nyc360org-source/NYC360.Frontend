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
  
  public authService = inject(AuthService);
  
  isMenuOpen = false;
  currentDate = new Date();
  isLoggedIn = false;
  currentUsername: string | null = null;

  // Permissions Flags for HTML

  canViewDashboard = false;
  
  private userSub!: Subscription;

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      
      if (user) {
        this.currentUsername = user.username || user.unique_name || user.email;

        // Check Permissions Dynamically
        this.canViewDashboard = this.authService.hasPermission('Permissions.Dashboard.View')
      } else {
        this.resetPermissions();
      }
    });
  }

  resetPermissions() {

    this.currentUsername = null;
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  
  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }
}