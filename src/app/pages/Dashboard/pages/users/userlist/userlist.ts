import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { UsersService } from '../Service/list'; // Check your path
import { User } from '../models/userlist';     // Check your path

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './userlist.html',
  styleUrls: ['./userlist.scss']
})
export class UserList implements OnInit {
  
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination & Search
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  searchTerm = '';

  ngOnInit() {
    this.loadUsers();
  }

  // --- Load Users ---
  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.usersService.getAllUsers(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.isSuccess) {
            this.users = res.data || []; 
            this.totalCount = res.totalCount;
            this.totalPages = res.totalPages;
            this.cdr.detectChanges(); // Force UI Update
          } else {
            this.errorMessage = 'Data returned with error flag.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load users.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  // --- Delete User Function ---
  onDelete(user: User) {
    // 1. Confirmation Dialog
    const confirmDelete = confirm(`Are you sure you want to delete user: ${user.fullName}?`);
    
    if (confirmDelete) {
      this.isLoading = true; // Show loading while deleting
      
      this.usersService.deleteUser(user.id).subscribe({
        next: (res) => {
          // 2. Refresh list on success
          if (res.isSuccess) {
            alert('User deleted successfully');
            this.loadUsers(); // Reload data
          } else {
            alert(res.error?.message || 'Failed to delete user');
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error occurred while deleting');
          this.isLoading = false;
        }
      });
    }
  }



  // --- Pagination ---
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.loadUsers();
    }
  }

  // --- Helper: Get Initials ---
  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}