import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-client-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 z-0">
        <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(14,165,233,0.1)_0%,_rgba(0,0,0,1)_70%)]"></div>
        <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent opacity-30"></div>
        <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent opacity-30"></div>
      </div>

      <div class="max-w-md w-full relative z-10">
        <div class="text-center mb-10">
          <div class="w-16 h-16 bg-cyan-500/10 rounded-xl border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <span class="text-3xl">🔒</span>
          </div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">Client Portal</h1>
          <p class="text-gray-400 mt-2">Secure access for Bharat Security clients</p>
        </div>

        <div class="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Email -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-400">Email Address</label>
              <input 
                type="email" 
                formControlName="email"
                class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                placeholder="name@company.com"
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              >
              <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-400 text-xs">
                Valid email is required
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-400">Password</label>
              <input 
                type="password" 
                formControlName="password"
                class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                placeholder="••••••••"
                [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              >
              <div class="flex justify-between items-center">
                <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-400 text-xs">
                  Password is required
                </p>
                <!-- <a href="#" class="text-xs text-cyan-400 hover:text-cyan-300">Forgot password?</a> -->
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="error" class="bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {{ error }}
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading"
              class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span *ngIf="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>
        </div>

        <div class="text-center mt-8 text-sm text-gray-500">
          <p>Don't have an account? It's created automatically when you <a routerLink="/contact" class="text-cyan-500 hover:text-cyan-400">book a service</a>.</p>
        </div>
      </div>
    </div>
  `
})
export class ClientLoginComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private http = inject(HttpClient);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    isLoading = false;
    error = '';

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        this.error = '';

        const { email, password } = this.loginForm.value;

        this.http.post<any>(`${environment.apiUrl}/client/auth/login`, { email, password }).subscribe({
            next: (res) => {
                localStorage.setItem('client_token', res.token);
                localStorage.setItem('client_user', JSON.stringify(res.client));
                this.router.navigate(['/client/dashboard']);
            },
            error: (err) => {
                this.error = err.error?.error || 'Login failed. Please check credentials.';
                this.isLoading = false;
            }
        });
    }
}
