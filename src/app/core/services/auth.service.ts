import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.apiUrl;

    currentUser = signal<User | null>(null);

    constructor() {
        this.restoreSession();
    }

    private restoreSession() {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user_data');
        if (token && user) {
            this.currentUser.set(JSON.parse(user));
        }
    }

    login(email: string, password: string) {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
            .pipe(
                tap(response => {
                    localStorage.setItem('access_token', response.token);
                    localStorage.setItem('user_data', JSON.stringify(response.user));
                    this.currentUser.set(response.user);
                })
            );
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
