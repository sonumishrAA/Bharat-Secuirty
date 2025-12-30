import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-client-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen bg-black text-white p-6">
      <div class="max-w-2xl mx-auto">
        
        <!-- Header -->
        <div class="mb-8">
          <a routerLink="/client/dashboard" class="text-gray-400 hover:text-white text-sm mb-2 inline-block">← Back to Dashboard</a>
          <h1 class="text-3xl font-bold">Profile Settings</h1>
        </div>

        <!-- Profile Form -->
        <div class="bg-gray-900/50 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">
            <span>👤</span> Personal Information
          </h2>

          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Full Name</label>
                <input type="text" formControlName="name" 
                  class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Email (readonly)</label>
                <input type="email" [value]="profile?.email" disabled
                  class="w-full bg-black/30 border border-white/5 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed">
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Company</label>
                <input type="text" formControlName="company" 
                  class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Phone</label>
                <input type="tel" formControlName="phone" 
                  class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              </div>
            </div>

            <div *ngIf="profileSuccess" class="text-green-400 text-sm">✓ Profile updated successfully!</div>
            <div *ngIf="profileError" class="text-red-400 text-sm">{{ profileError }}</div>

            <button type="submit" [disabled]="profileForm.invalid || profileLoading"
              class="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">
              {{ profileLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Password Change -->
        <div class="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
          <h2 class="text-lg font-semibold mb-6 flex items-center gap-2">
            <span>🔒</span> Change Password
          </h2>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Current Password</label>
              <input type="password" formControlName="currentPassword" 
                class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">New Password</label>
              <input type="password" formControlName="newPassword" 
                class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
              <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input type="password" formControlName="confirmPassword" 
                class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none transition">
            </div>

            <div *ngIf="passwordSuccess" class="text-green-400 text-sm">✓ Password changed successfully!</div>
            <div *ngIf="passwordError" class="text-red-400 text-sm">{{ passwordError }}</div>

            <button type="submit" [disabled]="passwordForm.invalid || passwordLoading"
              class="bg-gray-800 hover:bg-gray-700 border border-white/10 px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">
              {{ passwordLoading ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </div>

      </div>
    </div>
  `
})
export class ClientProfileComponent implements OnInit {
    private http = inject(HttpClient);
    private fb = inject(FormBuilder);

    profile: any;

    profileForm = this.fb.group({
        name: ['', Validators.required],
        company: [''],
        phone: ['']
    });

    passwordForm = this.fb.group({
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
    });

    profileLoading = false;
    profileSuccess = false;
    profileError = '';

    passwordLoading = false;
    passwordSuccess = false;
    passwordError = '';

    ngOnInit() {
        this.loadProfile();
    }

    loadProfile() {
        this.http.get<any>(`${environment.apiUrl}/client/auth/profile`).subscribe({
            next: (data) => {
                this.profile = data;
                this.profileForm.patchValue({
                    name: data.name,
                    company: data.company,
                    phone: data.phone
                });
            }
        });
    }

    updateProfile() {
        this.profileLoading = true;
        this.profileSuccess = false;
        this.profileError = '';

        this.http.put(`${environment.apiUrl}/client/auth/profile`, this.profileForm.value).subscribe({
            next: () => {
                this.profileSuccess = true;
                this.profileLoading = false;
                // Update local storage
                const user = JSON.parse(localStorage.getItem('client_user') || '{}');
                Object.assign(user, this.profileForm.value);
                localStorage.setItem('client_user', JSON.stringify(user));
            },
            error: (err) => {
                this.profileError = err.error?.error || 'Failed to update profile';
                this.profileLoading = false;
            }
        });
    }

    changePassword() {
        if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
            this.passwordError = 'Passwords do not match';
            return;
        }

        this.passwordLoading = true;
        this.passwordSuccess = false;
        this.passwordError = '';

        this.http.put(`${environment.apiUrl}/client/auth/change-password`, {
            currentPassword: this.passwordForm.value.currentPassword,
            newPassword: this.passwordForm.value.newPassword
        }).subscribe({
            next: () => {
                this.passwordSuccess = true;
                this.passwordLoading = false;
                this.passwordForm.reset();
            },
            error: (err) => {
                this.passwordError = err.error?.error || 'Failed to change password';
                this.passwordLoading = false;
            }
        });
    }
}
