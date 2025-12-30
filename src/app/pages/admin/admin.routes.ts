import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/layout';
import { AdminLoginComponent } from './login/login';
import { AdminDashboardComponent } from './dashboard/dashboard';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'login',
        component: AdminLoginComponent
    },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            {
                path: 'services',
                loadComponent: () => import('./services/list/list').then(m => m.AdminServiceListComponent)
            },
            {
                path: 'services/:id',
                loadComponent: () => import('./services/editor/editor').then(m => m.ServiceEditorComponent)
            },
            {
                path: 'inquiries',
                loadComponent: () => import('./inquiries/list/list').then(m => m.InquiryListComponent)
            },
            {
                path: 'inquiries/:id',
                loadComponent: () => import('./inquiries/detail/detail.component').then(m => m.AdminInquiryDetailComponent)
            },
            {
                path: 'case-studies',
                loadComponent: () => import('./case-studies/list/list').then(m => m.CaseStudyListComponent)
            },
            {
                path: 'case-studies/:id',
                loadComponent: () => import('./case-studies/editor/editor').then(m => m.CaseStudyEditorComponent)
            },
            {
                path: 'blog',
                loadComponent: () => import('./blog/list/list.component').then(m => m.BlogListComponent)
            },
            {
                path: 'blog/:id',
                loadComponent: () => import('./blog/editor/editor.component').then(m => m.BlogEditorComponent)
            },
            {
                path: 'media',
                loadComponent: () => import('./media/library/library.component').then(m => m.MediaLibraryComponent)
            },
            {
                path: 'homepage',
                loadComponent: () => import('./homepage/editor/editor').then(m => m.HomepageEditorComponent)
            },
            {
                path: 'testimonials',
                loadComponent: () => import('./testimonials/list/list.component').then(m => m.TestimonialListComponent)
            },
            {
                path: 'statistics',
                loadComponent: () => import('./statistics/list/list.component').then(m => m.StatisticsListComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];

