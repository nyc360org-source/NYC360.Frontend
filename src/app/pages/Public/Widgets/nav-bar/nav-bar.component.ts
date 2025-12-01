import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // مهم للتاريخ والـ Classes
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  providers: [DatePipe] // عشان نستخدم التاريخ في الـ HTML
})
export class NavBarComponent {
  isMenuOpen: boolean = false;
  currentDate: Date = new Date();

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleSubscribeClick() {
    console.log('Subscribe clicked');
  }
}