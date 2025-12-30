import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Service, CaseStudy, Inquiry } from '../models/content.models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ContentService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    // Signals for Reactive UI
    services = signal<Service[]>([]);
    caseStudies = signal<CaseStudy[]>([]);
    inquiries = signal<Inquiry[]>([]);

    // New CMS Signals
    clientLogos = signal<any[]>([]);
    technologies = signal<any[]>([]);
    processSteps = signal<any[]>([]);
    statistics = signal<any[]>([]);
    testimonials = signal<any[]>([]);

    constructor() {
        this.loadServices();
        this.loadCaseStudies();

        this.loadClientLogos();
        this.loadTechnologies();
        this.loadProcessSteps();
        this.loadStatistics();
        this.loadTestimonials();
    }

    private loadServices() {
        this.http.get<any[]>(`${this.apiUrl}/services`).subscribe({
            next: (data) => {
                const mappedServices: Service[] = data.map(s => ({
                    id: s.id.toString(),
                    title: s.title,
                    slug: s.slug,
                    icon: s.icon,
                    shortDescription: s.shortDescription,
                    fullDescription: s.fullDescription,
                    features: typeof s.features === 'string' ? JSON.parse(s.features) : s.features,
                    benefits: typeof s.benefits === 'string' ? JSON.parse(s.benefits) : s.benefits,
                    isActive: s.isActive
                }));
                this.services.set(mappedServices);
            },
            error: (err) => console.error('Failed to load services', err)
        });
    }

    loadInquiries() {
        this.http.get<any[]>(`${this.apiUrl}/bookings`).subscribe({
            next: (data) => {
                const mappedInquiries: Inquiry[] = data.map(i => ({
                    id: i.id.toString(),
                    name: i.clientName,
                    email: i.email,
                    company: i.company,
                    message: i.message,
                    serviceInterest: i.serviceId ? i.serviceId.toString() : 'Other',
                    status: i.status || 'New',
                    date: new Date(i.createdAt)
                }));
                this.inquiries.set(mappedInquiries);
            },
            error: (err) => console.error('Failed to load inquiries', err)
        });
    }

    // ================= CMS CONTENT LOADERS =================
    private loadClientLogos() {
        this.http.get<any[]>(`${this.apiUrl}/cms/client-logos`).subscribe({
            next: (data) => this.clientLogos.set(data),
            error: (err) => console.error('Failed to load client logos', err)
        });
    }

    private loadTechnologies() {
        this.http.get<any[]>(`${this.apiUrl}/cms/technologies`).subscribe({
            next: (data) => this.technologies.set(data),
            error: (err) => console.error('Failed to load technologies', err)
        });
    }

    private loadProcessSteps() {
        this.http.get<any[]>(`${this.apiUrl}/cms/process-steps`).subscribe({
            next: (data) => this.processSteps.set(data.sort((a, b) => a.stepNumber - b.stepNumber)),
            error: (err) => console.error('Failed to load process steps', err)
        });
    }

    private loadStatistics() {
        this.http.get<any[]>(`${this.apiUrl}/statistics`).subscribe({
            next: (data) => this.statistics.set(data.filter(s => s.isActive)),
            error: (err) => console.error('Failed to load statistics', err)
        });
    }

    private loadTestimonials() {
        this.http.get<any[]>(`${this.apiUrl}/testimonials`).subscribe({
            next: (data) => this.testimonials.set(data.filter(t => t.isActive && t.isFeatured)),
            error: (err) => console.error('Failed to load testimonials', err)
        });
    }

    // ================= CRUD: SERVICES =================
    getServiceBySlug(slug: string): Service | undefined {
        return this.services().find(s => s.slug === slug);
    }

    addService(service: Service) {
        this.http.post<Service>(`${this.apiUrl}/services`, service).subscribe({
            next: (newService) => {
                this.services.update(list => [...list, newService]);
            },
            error: (err) => console.error('Create service failed', err)
        });
    }

    updateService(updated: Service) {
        this.http.put<Service>(`${this.apiUrl}/services/${updated.id}`, updated).subscribe({
            next: (res) => {
                this.services.update(list => list.map(s => s.id === updated.id ? res : s));
            },
            error: (err) => console.error('Update service failed', err)
        });
    }

    deleteService(id: string) {
        this.http.delete(`${this.apiUrl}/services/${id}`).subscribe({
            next: () => {
                this.services.update(list => list.filter(s => s.id !== id));
            },
            error: (err) => console.error('Delete service failed', err)
        });
    }

    // ================= CRUD: INQUIRIES =================
    addInquiry(inquiry: Inquiry) {
        this.inquiries.update(list => [inquiry, ...list]);
        // localStorage.setItem('bs_inquiries', JSON.stringify(this.inquiries()));

        const formData = new FormData();
        formData.append('clientName', inquiry.name);
        formData.append('email', inquiry.email);
        if (inquiry.company) formData.append('company', inquiry.company);
        if (inquiry.message) formData.append('message', inquiry.message);
        if (inquiry.serviceInterest && inquiry.serviceInterest !== 'Other') {
            formData.append('serviceId', inquiry.serviceInterest);
        }

        this.http.post(`${this.apiUrl}/bookings`, formData).subscribe({
            next: (res: any) => console.log('Booking submitted', res),
            error: (err) => console.error('Booking failed', err)
        });
    }

    updateBookingStatus(id: string, status: string) {
        this.http.patch(`${this.apiUrl}/bookings/${id}/status`, { status }).subscribe({
            next: () => {
                this.inquiries.update(list => list.map(i => i.id.toString() === id.toString() ? { ...i, status: status as any } : i));
            },
            error: (err) => console.error('Status update failed', err)
        });
    }
    // ================= CRUD: CASE STUDIES =================
    loadCaseStudies() {
        this.http.get<any[]>(`${this.apiUrl}/case-studies`).subscribe({
            next: (data) => {
                const mappedStudies: any[] = data.map(s => ({
                    id: s.id.toString(),
                    title: s.title,
                    client: s.clientName,
                    category: s.category || 'Security',
                    logo: s.logo || '🛡️',
                    date: s.createdAt,
                    description: s.summary || s.excerpt || '',
                    content: s.content,
                    image: s.coverImageUrl,
                    impact: s.impactMetric || '100% Secure'
                }));
                this.caseStudies.set(mappedStudies);
            },
            error: (err) => console.error('Failed to load case studies', err)
        });
    }

    addCaseStudy(study: any, imageFile?: File) {
        const formData = new FormData();
        formData.append('title', study.title);
        formData.append('client', study.client);
        formData.append('date', study.date);
        formData.append('excerpt', study.excerpt);
        formData.append('content', study.content);
        formData.append('result', study.result);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        this.http.post<CaseStudy>(`${this.apiUrl}/case-studies`, formData).subscribe({
            next: (newStudy) => {
                this.caseStudies.update(list => [...list, newStudy]);
            },
            error: (err) => console.error('Create case study failed', err)
        });
    }

    updateCaseStudy(id: string, study: any, imageFile?: File) {
        const formData = new FormData();
        formData.append('title', study.title);
        formData.append('client', study.client);
        formData.append('date', study.date);
        formData.append('excerpt', study.excerpt);
        formData.append('content', study.content);
        formData.append('result', study.result);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        this.http.put<CaseStudy>(`${this.apiUrl}/case-studies/${id}`, formData).subscribe({
            next: (updatedStudy) => {
                this.caseStudies.update(list => list.map(s => s.id.toString() === id ? updatedStudy : s));
            },
            error: (err) => console.error('Update case study failed', err)
        });
    }

    deleteCaseStudy(id: string) {
        this.http.delete(`${this.apiUrl}/case-studies/${id}`).subscribe({
            next: () => {
                this.caseStudies.update(list => list.filter(s => s.id.toString() !== id));
            },
            error: (err) => console.error('Delete case study failed', err)
        });
    }
    // ================= HOMEPAGE CONTENT =================
    getHomepageContent() {
        return this.http.get<any>(`${this.apiUrl}/homepage`);
    }

    updateHomepageContent(section: string, content: any) {
        return this.http.put(`${this.apiUrl}/homepage/${section}`, content);
    }

    // ================= REFRESH METHODS =================
    refreshClientLogos() { this.loadClientLogos(); }
    refreshTechnologies() { this.loadTechnologies(); }
    refreshProcessSteps() { this.loadProcessSteps(); }
    refreshStatistics() { this.loadStatistics(); }
    refreshTestimonials() { this.loadTestimonials(); }
}

