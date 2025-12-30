import {
  Component,
  AfterViewInit,
  OnDestroy,
  HostListener,
  NgZone,
  inject,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { ContentService } from '../../core/services/content.service';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private dialog = inject(MatDialog);
  private ngZone = inject(NgZone);
  private contentService = inject(ContentService);
  private ctx!: gsap.Context;

  scrollProgress = signal(0);
  isLoading = signal(true); // Start with loading state

  // Dynamic Content Signals with Defaults
  hero = signal<any>({}); // Empty default, fetch from DB

  // Dynamic Content from ContentService
  services = this.contentService.services;
  caseStudies = this.contentService.caseStudies;
  clientLogos = this.contentService.clientLogos;
  technologies = this.contentService.technologies;
  processSteps = this.contentService.processSteps;
  statistics = this.contentService.statistics;
  testimonials = this.contentService.testimonials;

  // Legacy stats signal for backward compatibility
  stats = signal<any[]>([]);

  private isAnimationInit = false;

  constructor() {
    this.loadHomepageData();
    this.loadDynamicCaseStudies();
  }

  private initCounterAnimation(): void {
    if (this.isAnimationInit || !this.ctx) return;

    this.isAnimationInit = true; // Mark as initialized

    this.ctx.add(() => {
      gsap.utils.toArray('.stat-value').forEach((el: any) => {
        const text = el.innerText;
        const valueMatch = text.match(/[\d,.]+/);
        if (!valueMatch) return;

        const rawValue = valueMatch[0].replace(/,/g, '');
        const value = parseFloat(rawValue);
        const suffix = text.replace(/[\d,.]/g, '');

        if (!isNaN(value)) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: value,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              toggleActions: 'play none none none',
              once: true
            },
            onUpdate: () => {
              el.innerText = Math.floor(obj.val) + suffix;
            }
          });
        }
      });
    });
  }

  loadHomepageData() {
    this.contentService.getHomepageContent().subscribe({
      next: (data) => {
        if (data.hero) this.hero.set(data.hero);
        if (data.stats) {
          const s = data.stats;
          this.stats.set([
            { id: 1, value: s.clients, suffix: '+', label: 'Security Audits', icon: '🛡️' },
            { id: 2, value: s.projects, suffix: '+', label: 'Vulnerabilities', icon: '🐛' },
            { id: 3, value: s.years, suffix: '+', label: 'Years Experience', icon: '❤️' },
            { id: 4, value: s.team, suffix: '', label: 'Team Members', icon: '👥' },
            { id: 5, value: s.successRate, suffix: '%', label: 'Success Rate', icon: '🏆' },
          ]);
  }

  if(data.trustedBy && Array.isArray(data.trustedBy)) {
  this.contentService.clientLogos.set(data.trustedBy);
}

// Ensure loader stays for a moment, then animate
setTimeout(() => {
  this.isLoading.set(false);
  // Refresh ScrollTrigger and animate
  setTimeout(() => {
    ScrollTrigger.refresh();
    this.initCounterAnimation();
  }, 100);
}, 1500);
      },
error: (err) => {
  console.error('Failed to load homepage content', err);
  this.isLoading.set(false);
}
    });
  }

  get displayStats() {
  // Priority 1: Use "Home Content" Editor values (Legacy) as User is editing there
  const legacyStats = this.stats();
  if (legacyStats.length > 0) {
    return legacyStats;
  }

  // Priority 2: Dynamic Statistics (if Home Content is empty or failed)
  const cmsStats = this.statistics();
  if (cmsStats.length > 0) {
    return cmsStats.map((s, i) => ({
      id: s.id || i + 1,
      value: s.value,
      suffix: s.suffix || '',
      label: s.label,
      icon: s.icon || '🛡️'
    }));
  }
  return [];
}

loadDynamicCaseStudies() {
  this.contentService.loadCaseStudies();
}

  get featuredCaseStudies() {
  return this.contentService.caseStudies;
}

ngAfterViewInit(): void {
  this.ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      this.initAnimations();

      // If data is already ready and loader somehow skipped (shouldn't happen with current logic but for safety)
      if (this.statistics().length > 0 && !this.isLoading()) {
        this.initCounterAnimation();
      }
    }, 100);
  });
}

ngOnDestroy(): void {
  if(this.ctx) {
  this.ctx.revert();
}
ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  private initAnimations(): void {
  this.ctx = gsap.context(() => {
    // ======= HERO ANIMATIONS =======
    // Hero title entrance
    gsap.fromTo('.hero-title span',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.2 }
    );

    // Hero eyebrow
    gsap.fromTo('.hero-eyebrow',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 }
    );

    // Hero subtext
    gsap.fromTo('.hero-subtext',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.5 }
    );

    // Hero buttons
    gsap.fromTo('.hero-actions button',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)', delay: 0.7 }
    );

    // Hero stats
    gsap.fromTo('.stat-item',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.9 }
    );

    // Hero background parallax on scroll
    gsap.to('.hero-bg', {
      yPercent: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Hero content fades on scroll
    gsap.to('.hero-content', {
      y: 100,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '60% top',
        scrub: 0.5,
      },
    });

    // ======= SECTION REVEALS =======
    const sections = [
      '.clients-section',
      '.services-section',
      '.tech-section',
      '.case-studies-section',
      '.methodology-section',
      '.testimonials-section',
      '.cta-section',
    ];

    sections.forEach((section) => {
      // Section headers reveal
      gsap.fromTo(`${section} .section-header`,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ======= SERVICE CARDS =======
    gsap.fromTo('.service-card',
      { y: 80, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ======= CLIENT LOGOS =======
    gsap.fromTo('.client-logo',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.clients-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ======= TECH CARDS =======
    gsap.fromTo('.tech-card',
      { y: 40, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: { each: 0.08, from: 'random' },
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.tech-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Tech cards floating animation
    document.querySelectorAll('.tech-card').forEach((card, i) => {
      gsap.to(card, {
        y: -8,
        duration: 2 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.15,
      });
    });

    // ======= CASE STUDIES =======
    gsap.fromTo('.case-card',
      { x: -60, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.case-studies-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ======= METHODOLOGY STEPS =======
    gsap.fromTo('.process-step',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.process-steps',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    gsap.fromTo('.process-line',
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '.process-steps',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ======= TESTIMONIALS =======
    gsap.fromTo('.testimonial-card',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.testimonials-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    // ======= CTA SECTION =======
    gsap.fromTo('.cta-content',
      { y: 60, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    // CTA background parallax
    gsap.to('.cta-gradient', {
      backgroundPosition: '100% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // ======= SCROLL PROGRESS =======
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.ngZone.run(() => {
          this.scrollProgress.set(self.progress);
        });
        const progressBar = document.querySelector('.scroll-progress') as HTMLElement;
        if (progressBar) {
          progressBar.style.width = `${self.progress * 100}%`;
        }
      },
    });

    // ======= 3D CARD HOVER EFFECTS =======
    this.setup3DCardHover('.service-card');
    this.setup3DCardHover('.tech-card');
    this.setup3DCardHover('.case-card');
  });
}

  private setup3DCardHover(selector: string): void {
  document.querySelectorAll(selector).forEach((card) => {
    const cardEl = card as HTMLElement;

    cardEl.addEventListener('mouseenter', () => {
      gsap.to(cardEl, {
        y: -12,
        scale: 1.02,
        boxShadow: '0 25px 50px rgba(74, 222, 128, 0.2)',
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    cardEl.addEventListener('mouseleave', () => {
      gsap.to(cardEl, {
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    cardEl.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = cardEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y - rect.height / 2) / 25;
      const rotateY = (rect.width / 2 - x) / 25;

      gsap.to(cardEl, {
        rotateX,
        rotateY,
        duration: 0.2,
        ease: 'power1.out',
      });
    });
  });
}

openContactForm(): void {
  this.dialog.open(ContactFormComponent, {
    width: window.innerWidth < 768 ? '95%' : '600px',
    maxWidth: '95vw',
    panelClass: 'contact-dialog',
  });
}

scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

  get currentYear(): number {
  return new Date().getFullYear();
}

@HostListener('window:resize')
onWindowResize(): void {
  ScrollTrigger.refresh();
}
}
