import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';

@Component({
    selector: 'app-case-study-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './detail.html',
    styleUrl: './detail.scss'
})
export class CaseStudyDetailComponent {
    private route = inject(ActivatedRoute);
    private contentService = inject(ContentService);

    study = computed(() => {
        const id = this.route.snapshot.paramMap.get('id');
        return this.contentService.caseStudies().find(s => s.id === id);
    });
}
