import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const clientAuthGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // check for client token
    const token = localStorage.getItem('client_token');

    if (token) {
        return true;
    }

    // Store the attempted URL for redirecting
    return router.createUrlTree(['/client/login']);
};
