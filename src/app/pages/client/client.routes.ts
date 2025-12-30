import { Routes } from '@angular/router';
import { ClientLoginComponent } from './login/login.component';
import { clientAuthGuard } from '../../core/guards/client-auth.guard';

export const CLIENT_ROUTES: Routes = [
    {
        path: 'login',
        component: ClientLoginComponent
    },
    {
        path: '',
        canActivate: [clientAuthGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard.component').then(m => m.ClientDashboardComponent)
            },
            {
                path: 'booking/:id',
                loadComponent: () => import('./booking-detail/booking-detail.component').then(m => m.ClientBookingDetailComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./profile/profile.component').then(m => m.ClientProfileComponent)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];
