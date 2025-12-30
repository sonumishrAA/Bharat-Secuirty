import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-us.component.html',
  styleUrls: ['./why-us.component.scss'],
})
export class WhyUsComponent implements AfterViewInit, OnDestroy {
  title = "The Attacker's Mindset Advantage";
  paragraph =
    'We are an extension of your team, providing the adversarial perspective necessary to build truly resilient systems.';
  row1 = [
    'Deep Business Logic Analysis',
    'Vulnerability Chaining & Exploitation',
    'Impact-Driven Prioritization',
    'Deep Business Logic Analysis',
    'Vulnerability Chaining & Exploitation',
    'Impact-Driven Prioritization',
  ];
  row2 = [
    'Actionable Intelligence Reporting',
    'Engineering-Focused Remediation',
    'Long-Term Security Partnership',
    'Actionable Intelligence Reporting',
    'Engineering-Focused Remediation',
    'Long-Term Security Partnership',
  ];

  private ctx!: gsap.Context;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    // A small delay to allow for rendering of *ngFor
    setTimeout(() => {
      this.ctx = gsap.context(() => {
        const intro = this.el.nativeElement.querySelector('.intro');
        if (intro) {
          gsap.from(intro.children, {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: intro,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });
        }

        const rows = gsap.utils.toArray<HTMLElement>('.marquee-row');

        rows.forEach((row, i) => {
          gsap.to(row, {
            xPercent: i % 2 === 0 ? -50 : 50,
            ease: 'none',
            scrollTrigger: {
              trigger: '.why-us',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.4,
            },
          });
        });
      }, this.el);
    }, 100);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
