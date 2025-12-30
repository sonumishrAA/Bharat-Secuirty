import { HttpInterceptorFn } from '@angular/common/http';

export const clientAuthInterceptor: HttpInterceptorFn = (req, next) => {
    // Only add token for client API routes
    if (req.url.includes('/client/') || req.url.includes('/messages/client/') || req.url.includes('/bookings/client/')) {
        const token = localStorage.getItem('client_token');

        if (token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    return next(req);
};
