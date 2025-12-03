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
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  
  // Expose environment to the template (HTML)
  protected readonly environment = environment;
  
  // --- Dependency Injection ---
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // --- State Variables ---
  profile: UserProfile | null = null;
  isLoading = true;
  isSaving = false;
  isEditMode = false; // Controls Read-Only vs Edit state
  errorMessage = '';
  
  // --- Form & File Handling ---
  profileForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor() {
    // Initialize the form with validators
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
    this.resolveUsernameAndLoad();
  }

  /**
   * Determines which user profile to load.
   * 1. Checks the URL for a username parameter.
   * 2. If empty, falls back to the currently logged-in user's details.
   */
  resolveUsernameAndLoad() {
    // 1. Try to get 'username' from the Route (e.g., /profile/john_doe)
    let identifier = this.route.snapshot.paramMap.get('username');

    // 2. If no route param, get it from the Authenticated User
    if (!identifier) {
      const currentUser = this.authService.currentUser$.value;
      if (currentUser) {
        // 🛠️ FIX: Fallback Logic to ensure we get a valid ID
        // Prioritize username, then email, then unique_name
        identifier = currentUser.username ;
      }
    }
console.log(this.resolveUsernameAndLoad)
    // 3. Load data or show error
    if (identifier) {
      this.loadProfileData(identifier);
    } else {
      this.errorMessage = "Please log in to view your profile.";
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Fetches profile data from the API
   * @param identifier Username or Email
   */
  loadProfileData(identifier: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.profileService.getProfile(identifier).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.profile = res.data;
          this.initForm(this.profile); // Populate form with fetched data
          this.cdr.detectChanges(); // Force UI update
        } else {
          this.errorMessage = "Profile not found.";
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Handle 404 specifically for better UX
        if (err.status === 404) {
          this.errorMessage = "User not found.";
        } else {
          this.errorMessage = "Network error loading profile.";
        }
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Populates the Reactive Form with user data
   */
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

  /**
   * Toggles between View Mode and Edit Mode
   */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    // If cancelling edit, reset form to original state
    if (!this.isEditMode && this.profile) {
      this.initForm(this.profile);
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }

  /**
   * Handles file input change for Avatar upload
   */
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      
      // Create a local preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Submits the updated profile data
   */
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
            this.resolveUsernameAndLoad(); // Reload to reflect changes
          } else {
            alert(res.error?.message || 'Update failed.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          alert('Network Error during update.');
          // console.error(err);
        }
      });
  }

  /**
   * Toggles Two-Factor Authentication (2FA)
   */
  toggle2FA() {
    if (!this.profile) return;
    
    // Determine the NEW state (if enabled, we want to disable, and vice versa)
    const newState = !this.profile.twoFactorEnabled;
    const action = newState ? 'Enable' : 'Disable';

    if (!confirm(`Are you sure you want to ${action} Two-Factor Authentication?`)) return;

    // Send the boolean value
    this.profileService.toggle2FA(newState).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.profile!.twoFactorEnabled = newState; // Update UI
          alert(`2FA has been ${action}d successfully.`);
          this.cdr.detectChanges();
        } else {
          alert(res.error?.message || 'Failed to update 2FA settings.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error updating 2FA.');
      }
    });
  }
  /**
   * Helper to generate initials from name (e.g. "John Doe" -> "JD")
   */
  getInitials(first: string, last: string): string {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  }
}