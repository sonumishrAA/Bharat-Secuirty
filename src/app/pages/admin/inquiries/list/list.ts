import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../../../core/services/content.service';

@Component({
    selector: 'app-inquiry-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './list.html',
    styleUrl: './list.scss'
})
export class InquiryListComponent {
    private contentService = inject(ContentService);
    inquiries = this.contentService.inquiries;

    markContacted(id: string) {
        this.contentService.updateBookingStatus(id, 'contacted');
    }
}
