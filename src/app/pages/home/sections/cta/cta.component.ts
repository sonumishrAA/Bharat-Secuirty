import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss'],
})
export class CtaComponent implements AfterViewInit, OnDestroy {
  title = 'Take the Next Step Towards Resilience';
  paragraph =
    "An adversary only needs to be right once. Let's work together to find and fix the vulnerabilities that matter before they do.";
  actions = {
    primary: 'Schedule a Consultation',
    secondary: 'Discuss Your Needs',
  };
  note = 'Confidentiality Assured • Expert-Led • Impact-Focused';

  private ctx!: gsap.Context;

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      gsap.from('.cta-card', {
        y: 120,
        opacity: 0,
        scale: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cta',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.cta-actions button', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.cta',
          start: 'top 70%',
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
