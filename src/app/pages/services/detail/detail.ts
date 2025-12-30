import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Service } from '../../../core/models/content.models';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class DetailComponent {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);

  private params = toSignal(this.route.params);

  service = computed(() => {
    const slug = this.params()?.['slug'];
    return slug ? this.contentService.getServiceBySlug(slug) : undefined;
  });
}
