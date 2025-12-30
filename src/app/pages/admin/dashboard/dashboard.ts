import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { RouterLink } from '@angular/router';
import { Service, Inquiry } from '../../../core/models/content.models';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class AdminDashboardComponent {
    private contentService = inject(ContentService);

    // Derived Signals or Computed when available, utilizing signals directly in template
    services = this.contentService.services;
    caseStudies = this.contentService.caseStudies;
    inquiries = this.contentService.inquiries;

    get activeServicesCount() {
        return this.services().filter((s: Service) => s.isActive).length;
    }

    get newInquiriesCount() {
        return this.inquiries().filter((i: Inquiry) => i.status === 'New').length;
    }

    get recentInquiries() {
        return this.inquiries().slice(0, 5);
    }
}
