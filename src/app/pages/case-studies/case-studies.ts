import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../core/services/content.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './case-studies.html',
  styleUrl: './case-studies.scss',
})
export class CaseStudiesComponent {
  contentService = inject(ContentService);
  router = inject(Router);

  // Use the signal from content service
  caseStudies = this.contentService.caseStudies;

  navigateToDetail(id: string) {
    this.router.navigate(['/case-studies', id]);
  }
}
