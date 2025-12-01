import { Component, signal, ChangeDetectionStrategy, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly MOBILE_BREAKPOINT = 992;

  // --- Logic Signals ---
  sidebarOpen = signal(false);
  activeMenu = signal('dashboard');
  public searchTerm = signal('');

  private currentWindowWidth = signal(window.innerWidth);
  isMobileView = computed(() => this.currentWindowWidth() < this.MOBILE_BREAKPOINT);

  private resizeSub?: Subscription;

  ngOnInit(): void {
    // Logic: Open sidebar by default on large screens
    if (typeof window !== 'undefined' && window.innerWidth >= this.MOBILE_BREAKPOINT) {
      this.sidebarOpen.set(true);
    }

    if (typeof window !== 'undefined') {
      this.resizeSub = fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => {
          const w = window.innerWidth;
          this.currentWindowWidth.set(w);
          if (w < this.MOBILE_BREAKPOINT) {
            this.sidebarOpen.set(false);
          } else {
            this.sidebarOpen.set(true);
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  setSidebarOpen(open: boolean) {
    this.sidebarOpen.set(open);
  }

  setActiveMenu(menu: string) {
    this.activeMenu.set(menu);
  }
}