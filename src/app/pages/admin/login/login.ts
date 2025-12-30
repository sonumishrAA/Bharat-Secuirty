import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class AdminLoginComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService);

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

        if (!email || !password) return;

        this.authService.login(email, password).subscribe({
            next: () => {
                this.router.navigate(['/admin/dashboard']);
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Invalid credentials or server error.';
                this.isLoading = false;
            }
        });
    }
}
