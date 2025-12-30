import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import gsap from 'gsap';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatOptionModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  dialogRef = inject(MatDialogRef<ContactFormComponent>);

  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  formError = '';
  referenceId = '';
  isNewAccount = false;
  selectedFile: File | null = null;

  // Service types loaded from API
  serviceTypes: any[] = [];

  // Priority levels
  priorities = [
    { id: 'low', name: 'Low Priority', color: '#10b981' },
    { id: 'medium', name: 'Medium Priority', color: '#f59e0b' },
    { id: 'high', name: 'High Priority', color: '#ef4444' },
    { id: 'critical', name: 'Critical', color: '#dc2626' },
  ];

  // Budget ranges
  budgetRanges = [
    { id: '5k-10k', name: '$5,000 - $10,000' },
    { id: '10k-25k', name: '$10,000 - $25,000' },
    { id: '25k-50k', name: '$25,000 - $50,000' },
    { id: '50k-100k', name: '$50,000 - $100,000' },
    { id: '100k+', name: '$100,000+' },
    { id: 'custom', name: 'Custom Budget' },
  ];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      phone: ['', Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)],
      serviceType: ['', Validators.required],
      priority: ['medium', Validators.required],
      budget: ['', Validators.required],
      projectScope: ['', [Validators.required, Validators.minLength(50)]],
      timeline: [''],
      additionalInfo: [''],
      agreeToTerms: [false, Validators.requiredTrue],
      marketingEmails: [false],
    });

    // Generate reference ID
    const timestamp = Date.now().toString().slice(-6);
    const serviceType = this.contactForm.get('serviceType')?.value || 'WEB';
    this.referenceId = `SEC-${serviceType.toUpperCase()}-${timestamp}`;
  }

  ngOnInit(): void {
    this.animateFormEntrance();
    this.loadServices();
  }

  loadServices(): void {
    this.http.get<any[]>(`${environment.apiUrl}/services?active=true`).subscribe({
      next: (services) => {
        this.serviceTypes = services.map(s => ({
          id: s.id,
          name: s.title,
          icon: s.icon || 'security'
        }));
      },
      error: () => {
        // Fallback to static list if API fails
        this.serviceTypes = [
          { id: 1, name: 'Web Application Security', icon: 'language' },
          { id: 2, name: 'Mobile Security Testing', icon: 'smartphone' },
          { id: 3, name: 'Cloud Security Audit', icon: 'cloud' },
          { id: 4, name: 'Red Teaming', icon: 'security' },
        ];
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      this.selectedFile = file;
    } else if (file) {
      this.formError = 'File too large. Maximum size is 10MB.';
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  ngOnDestroy(): void {
    // Cleanup animations if needed
  }

  private animateFormEntrance(): void {
    gsap.from('.contact-dialog-container', {
      duration: 0.5,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
    });

    gsap.from('.form-header', {
      duration: 0.6,
      y: 20,
      opacity: 0,
      delay: 0.2,
      ease: 'power2.out',
    });

    gsap.from('.form-group', {
      duration: 0.4,
      y: 15,
      opacity: 0,
      stagger: 0.05,
      delay: 0.3,
      ease: 'power2.out',
    });

    gsap.from('.form-actions', {
      duration: 0.5,
      y: 20,
      opacity: 0,
      delay: 0.8,
      ease: 'power2.out',
    });
  }

  get formControls() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      this.animateFormError();
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('name', this.contactForm.value.name);
    formData.append('email', this.contactForm.value.email);
    formData.append('company', this.contactForm.value.company || '');
    formData.append('phone', this.contactForm.value.phone || '');
    formData.append('serviceId', this.contactForm.value.serviceType);
    formData.append('priority', this.contactForm.value.priority);
    formData.append('budget', this.contactForm.value.budget);
    formData.append('projectScope', this.contactForm.value.projectScope);
    formData.append('timeline', this.contactForm.value.timeline || '');
    formData.append('additionalInfo', this.contactForm.value.additionalInfo || '');

    if (this.selectedFile) {
      formData.append('document', this.selectedFile);
    }

    this.http.post<any>(`${environment.apiUrl}/bookings`, formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.referenceId = response.referenceCode;
        this.isNewAccount = response.isNewAccount;
        this.cdRef.detectChanges();

        this.animateSuccess();

        // Auto close after 5 seconds (longer to read account info)
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 5000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError = err.error?.error?.[0]?.message || err.error?.error || 'Failed to submit. Please try again.';
        this.cdRef.detectChanges();
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private animateFormError(): void {
    gsap.from('.error-message', {
      duration: 0.4,
      scale: 0.9,
      opacity: 0,
      stagger: 0.1,
      ease: 'back.out(1.7)',
    });

    const invalidFields = document.querySelectorAll('.ng-invalid');
    gsap.to(invalidFields, {
      duration: 0.1,
      x: 10,
      ease: 'power1.inOut',
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        gsap.to(invalidFields, {
          duration: 0.2,
          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)',
          repeat: 3,
          yoyo: true,
        });
      },
    });
  }

  private animateSuccess(): void {
    const successElement = document.querySelector('.success-animation');
    if (successElement) {
      gsap.fromTo(
        successElement,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
        }
      );
    }

    // Confetti effect
    this.createConfetti();
  }

  private createConfetti(): void {
    const colors = ['#22d3ee', '#0ea5e9', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 2px;
        top: 50%;
        left: 50%;
        opacity: 0;
        z-index: 9999;
      `;
      document.body.appendChild(confetti);

      gsap.to(confetti, {
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        rotation: Math.random() * 360,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(confetti, {
            opacity: 0,
            duration: 0.5,
            delay: 0.5,
            onComplete: () => confetti.remove(),
          });
        },
      });
    }
  }

  onCancel(): void {
    gsap.to('.contact-dialog-container', {
      duration: 0.3,
      y: -30,
      opacity: 0,
      ease: 'power2.in',
      onComplete: () => this.dialogRef.close(false),
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.formControls[controlName];

    if (control?.errors?.['required']) {
      return 'This field is required';
    }

    if (control?.errors?.['email']) {
      return 'Please enter a valid email address';
    }

    if (control?.errors?.['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }

    if (control?.errors?.['pattern']) {
      return 'Please enter a valid phone number';
    }

    return 'Invalid value';
  }

  // Character counter for project scope
  get projectScopeLength(): number {
    return this.contactForm.get('projectScope')?.value?.length || 0;
  }

  // Update character counter color
  get counterColor(): string {
    const length = this.projectScopeLength;
    if (length < 50) return '#ef4444'; // red
    if (length < 100) return '#f59e0b'; // yellow
    return '#10b981'; // green
  }

  // Get service icon
  getServiceIcon(serviceId: string): string {
    const service = this.serviceTypes.find((s) => s.id === serviceId);
    return service?.icon || 'help';
  }
}
