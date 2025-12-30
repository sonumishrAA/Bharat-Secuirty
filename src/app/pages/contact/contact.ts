import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService } from '../../core/services/content.service';
import { Inquiry } from '../../core/models/content.models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);

  services = this.contentService.services;
  submitted = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    serviceInterest: [''],
    message: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;

    const val = this.form.value;
    const inquiry: Inquiry = {
      id: Date.now().toString(),
      name: val.name!,
      email: val.email!,
      company: val.company || undefined,
      serviceInterest: val.serviceInterest || undefined,
      message: val.message!,
      status: 'New',
      date: new Date()
    };

    this.contentService.addInquiry(inquiry);
    this.submitted = true;
  }

  reset() {
    this.submitted = false;
    this.form.reset();
  }
}
