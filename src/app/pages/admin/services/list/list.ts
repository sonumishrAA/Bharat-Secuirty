import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../../../core/services/content.service';

@Component({
    selector: 'app-admin-service-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './list.html',
    styleUrl: './list.scss'
})
export class AdminServiceListComponent {
    private contentService = inject(ContentService);
    services = this.contentService.services;

    deleteService(id: string) {
        if (confirm('Are you sure you want to delete this service?')) {
            this.contentService.deleteService(id);
        }
    }
}
