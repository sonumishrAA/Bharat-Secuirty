import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService } from '../../../../core/services/content.service';

@Component({
    selector: 'app-homepage-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './editor.html',
    styleUrl: './editor.scss'
})
export class HomepageEditorComponent {
    private fb = inject(FormBuilder);
    private contentService = inject(ContentService);

    activeTab = 'stats';
    successMessage: string | null = null;

    heroForm = this.fb.group({
        title: ['', Validators.required],
        subtitle: ['', Validators.required],
        ctaText: [''],
        ctaLink: ['']
    });

    statsForm = this.fb.group({
        clients: [0, Validators.required],
        projects: [0, Validators.required],
        years: [0, Validators.required],
        team: [0, Validators.required],
        successRate: [0, Validators.required]
    });

    trustedForm = this.fb.group({
        industries: ['', Validators.required] // Comma separated
    });

    arsenalForm = this.fb.group({
        tools: ['', Validators.required] // Comma separated
    });

    testimonialsForm = this.fb.group({
        items: this.fb.array([])
    });

    get testimonialControls() {
        return (this.testimonialsForm.get('items') as any).controls;
    }

    constructor() {
        this.loadContent();
    }

    loadContent() {
        this.contentService.getHomepageContent().subscribe({
            next: (data) => {
                if (data.hero) this.heroForm.patchValue(data.hero);
                if (data.stats) this.statsForm.patchValue(data.stats);
                if (data.trustedBy && Array.isArray(data.trustedBy)) this.trustedForm.patchValue({ industries: data.trustedBy.join(', ') });
                if (data.arsenal && Array.isArray(data.arsenal)) this.arsenalForm.patchValue({ tools: data.arsenal.join(', ') });

                if (data.testimonials && Array.isArray(data.testimonials)) {
                    const items = this.testimonialsForm.get('items') as any;
                    items.clear();
                    data.testimonials.forEach((t: any) => items.push(this.createTestimonialGroup(t)));
                } else {
                    this.addTestimonial();
                }
            },
            error: (err) => console.error('Failed to load homepage content', err)
        });
    }

    createTestimonialGroup(data?: any) {
        return this.fb.group({
            name: [data?.name || '', Validators.required],
            role: [data?.role || '', Validators.required],
            company: [data?.company || '', Validators.required],
            review: [data?.review || '', Validators.required],
            rating: [data?.rating || 5, Validators.required]
        });
    }

    addTestimonial() {
        const items = this.testimonialsForm.get('items') as any;
        items.push(this.createTestimonialGroup());
    }

    removeTestimonial(index: number) {
        const items = this.testimonialsForm.get('items') as any;
        items.removeAt(index);
    }

    saveHero() {
        if (this.heroForm.invalid) return;
        this.contentService.updateHomepageContent('hero', this.heroForm.value).subscribe({
            next: () => this.showSuccess('Hero section updated!'),
            error: (err) => console.error('Failed to update hero', err)
        });
    }

    saveStats() {
        if (this.statsForm.invalid) return;
        this.contentService.updateHomepageContent('stats', this.statsForm.value).subscribe({
            next: () => this.showSuccess('Stats updated!'),
            error: (err) => console.error('Failed to update stats', err)
        });
    }

    saveTrusted() {
        if (this.trustedForm.invalid) return;
        const industries = this.trustedForm.value.industries?.split(',').map(s => s.trim()).filter(s => s) || [];
        this.contentService.updateHomepageContent('trustedBy', industries).subscribe({
            next: () => this.showSuccess('Trusted By section updated!'),
            error: (err) => console.error('Failed to update trusted by', err)
        });
    }

    saveArsenal() {
        if (this.arsenalForm.invalid) return;
        const tools = this.arsenalForm.value.tools?.split(',').map(s => s.trim()).filter(s => s) || [];
        this.contentService.updateHomepageContent('arsenal', tools).subscribe({
            next: () => this.showSuccess('Arsenal section updated!'),
            error: (err) => console.error('Failed to update arsenal', err)
        });
    }

    saveTestimonials() {
        if (this.testimonialsForm.invalid) return;
        this.contentService.updateHomepageContent('testimonials', this.testimonialsForm.value.items).subscribe({
            next: () => this.showSuccess('Testimonials updated!'),
            error: (err) => console.error('Failed to update testimonials', err)
        });
    }

    showSuccess(msg: string) {
        this.successMessage = msg;
        setTimeout(() => this.successMessage = null, 3000);
    }
}
