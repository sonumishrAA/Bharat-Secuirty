import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../../../core/services/content.service';
import { CaseStudy } from '../../../../core/models/content.models';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
    selector: 'app-case-study-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillEditorComponent],
    templateUrl: './editor.html',
    styleUrl: './editor.scss'
})
export class CaseStudyEditorComponent {
    private fb = inject(FormBuilder);
    private contentService = inject(ContentService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    isEdit = false;
    caseStudyId: string | null = null;
    selectedImage: File | undefined;
    previewImage: string | null = null;
    selectedFileName: string | null = null;

    form = this.fb.group({
        title: ['', Validators.required],
        client: ['', Validators.required],
        date: ['', Validators.required],
        excerpt: ['', Validators.required],
        content: ['', Validators.required],
        result: ['', Validators.required],
    });

    constructor() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEdit = true;
            this.caseStudyId = id;
            this.loadCaseStudy(id);
        }
    }

    loadCaseStudy(id: string) {
        effect(() => {
            const study = this.contentService.caseStudies().find((s: CaseStudy) => s.id === id);
            if (study) {
                this.patchForm(study);
            }
        });
    }

    patchForm(study: CaseStudy) {
        this.form.patchValue({
            title: study.title,
            client: study.client,
            date: new Date(study.date).toISOString().split('T')[0],
            excerpt: study.excerpt,
            content: study.content,
            result: study.result
        });
        this.previewImage = study.image || null;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedImage = file;
            this.selectedFileName = file.name;
            const reader = new FileReader();
            reader.onload = () => {
                this.previewImage = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            alert('Please check all fields. Title, Client, Date, Excerpt, Content, and Result are required.');
            this.form.markAllAsTouched();
            return;
        }

        const val = this.form.value;
        const studyData: any = {
            ...val
        };

        if (this.isEdit && this.caseStudyId) {
            this.contentService.updateCaseStudy(this.caseStudyId, studyData, this.selectedImage);
        } else {
            this.contentService.addCaseStudy(studyData, this.selectedImage);
        }

        this.router.navigate(['/admin/case-studies']);
    }
}
