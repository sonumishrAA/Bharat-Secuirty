import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './layout.html',
    styleUrl: './layout.scss'
})
export class AdminLayoutComponent {
    private router = inject(Router);

    logout() {
        // Clear tokens (Mock)
        localStorage.removeItem('admin_token');
        this.router.navigate(['/admin/login']);
    }
}
