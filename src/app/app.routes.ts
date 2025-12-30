import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/list/list').then((m) => m.ListComponent),
  },
  {
    path: 'services/:slug',
    loadComponent: () => import('./pages/services/detail/detail').then((m) => m.DetailComponent),
  },
  {
    path: 'case-studies',
    loadComponent: () =>
      import('./pages/case-studies/case-studies').then((m) => m.CaseStudiesComponent),
  },
  {
    path: 'case-studies/:id',
    loadComponent: () => import('./pages/case-studies/detail/detail').then((m) => m.CaseStudyDetailComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog.component').then((m) => m.BlogPageComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/post/post.component').then((m) => m.BlogPostComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'client',
    loadChildren: () => import('./pages/client/client.routes').then(m => m.CLIENT_ROUTES)
  },
  {
    path: '**',
    redirectTo: '',
  },
];

