import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../../core/services/content.service';

@Component({
    selector: 'app-case-study-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './list.html',
    styleUrl: './list.scss'
})
export class CaseStudyListComponent {
    contentService = inject(ContentService);

    deleteStudy(id: string) {
        if (confirm('Are you sure you want to delete this case study?')) {
            this.contentService.deleteCaseStudy(id);
        }
    }
}
