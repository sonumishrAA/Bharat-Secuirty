import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../../core/services/content.service';
import { Service } from '../../../../core/models/content.models';

@Component({
    selector: 'app-service-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './editor.html',
    styleUrl: './editor.scss'
})
export class ServiceEditorComponent {
    private fb = inject(FormBuilder);
    private contentService = inject(ContentService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEdit = false;
    serviceId: string | null = null;

    // Form
    form = this.fb.group({
        title: ['', Validators.required],
        slug: ['', Validators.required],
        type: ['web_pentest', Validators.required],
        icon: [''],
        shortDescription: ['', Validators.required],
        fullDescription: ['', Validators.required],
        isActive: [true],
        features: this.fb.array([]),
        benefits: this.fb.array([])
    });

    get features() { return this.form.get('features') as FormArray; }
    get benefits() { return this.form.get('benefits') as FormArray; }

    constructor() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEdit = true;
            this.serviceId = id;
            this.loadService(id);
        } else {
            this.addFeature();
            this.addBenefit();
        }
    }

    loadService(id: string) {
        // In a real app we might fetch by ID from API if not in signal
        // For now relying on signal being loaded
        effect(() => {
            const service = this.contentService.services().find((s: Service) => s.id === id);
            if (service) {
                this.patchForm(service);
            }
        });
    }

    patchForm(service: Service) {
        this.form.patchValue({
            title: service.title,
            slug: service.slug,
            type: service.type,
            icon: service.icon,
            shortDescription: service.shortDescription,
            fullDescription: service.fullDescription,
            isActive: service.isActive
        });

        this.features.clear();
        service.features.forEach(f => this.features.push(this.fb.control(f)));

        this.benefits.clear();
        service.benefits.forEach(b => this.benefits.push(this.fb.control(b)));
    }

    addFeature() { this.features.push(this.fb.control('')); }
    removeFeature(i: number) { this.features.removeAt(i); }

    addBenefit() { this.benefits.push(this.fb.control('')); }
    removeBenefit(i: number) { this.benefits.removeAt(i); }

    onSubmit() {
        if (this.form.invalid) return;

        const val = this.form.value;
        const serviceData: any = {
            ...val,
            features: val.features as string[],
            benefits: val.benefits as string[]
        };

        if (this.isEdit && this.serviceId) {
            this.contentService.updateService({ ...serviceData, id: this.serviceId });
        } else {
            this.contentService.addService(serviceData);
        }

        this.router.navigate(['/admin/services']);
    }
}
