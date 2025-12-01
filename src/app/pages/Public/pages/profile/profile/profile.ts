import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ProfileService } from '../service/profile';
import { AuthService } from '../../../Auth/Service/auth';
import { UserProfile } from '../models/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  
  protected readonly environment = environment;
  
  // --- Dependencies ---
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- State ---
  profile: UserProfile | null = null;
  isLoading = true;
  isSaving = false;
  isEditMode = false; // Controls View vs Edit Mode
  errorMessage = '';
  
  // --- Form ---
  profileForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: [''],
      phoneNumber: [''],
      websiteUrl: [''],
      facebookUrl: [''],
      twitterUrl: [''],
      instagramUrl: [''],
      linkedInUrl: [''],
      githubUrl: ['']
    });
  }

  ngOnInit() {
    this.loadProfileData();
  }

  // --- Load Data ---
  loadProfileData() {
    this.isLoading = true;
    
    // Get logged-in user email
    const currentUser = this.authService.currentUser$.value;
    const email = currentUser?.email;

    if (!email) {
      this.errorMessage = "Please log in to view your profile.";
      this.isLoading = false;
      return;
    }

    this.profileService.getProfile(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          this.profile = res.data;
          this.initForm(this.profile); // Populate form
          this.cdr.detectChanges();
        } else {
          this.errorMessage = "Failed to load profile.";
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Network error.";
        console.error(err);
      }
    });
  }

  // --- Initialize Form ---
  initForm(user: UserProfile) {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      websiteUrl: user.websiteUrl,
      facebookUrl: user.facebookUrl,
      twitterUrl: user.twitterUrl,
      instagramUrl: user.instagramUrl,
      linkedInUrl: user.linkedInUrl,
      githubUrl: user.githubUrl
    });
  }

  // --- Toggle Edit Mode ---
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode && this.profile) {
      this.initForm(this.profile); // Reset form if cancelled
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }

  // --- Handle File Select ---
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Save Changes ---
  saveChanges() {
    if (this.profileForm.invalid) return;
    this.isSaving = true;

    this.profileService.updateMyProfile(this.profileForm.value, this.selectedFile || undefined)
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.isSuccess) {
            alert('Profile updated successfully!');
            this.isEditMode = false;
            this.loadProfileData(); // Refresh data
          } else {
            alert(res.error?.message || 'Update failed.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          alert('Network Error');
          console.error(err);
        }
      });
  }

  // --- Toggle 2FA ---
  toggle2FA() {
    if (!this.profile) return;
    
    const action = this.profile.twoFactorEnabled ? 'Disable' : 'Enable';
    if (!confirm(`Are you sure you want to ${action} Two-Factor Authentication?`)) return;

    this.profileService.toggle2FA().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.profile!.twoFactorEnabled = !this.profile!.twoFactorEnabled; // Optimistic update
          alert(`2FA has been ${action}d successfully.`);
          this.cdr.detectChanges();
        } else {
          alert('Failed to update 2FA settings.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error updating 2FA.');
      }
    });
  }

  getInitials(first: string, last: string): string {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  }
}