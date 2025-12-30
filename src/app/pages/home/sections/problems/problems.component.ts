import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-problems',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './problems.component.html',
  styleUrls: ['./problems.component.scss'],
})
export class ProblemsComponent implements AfterViewInit, OnDestroy {
  intro = {
    title: 'The Real Gaps in Your Defense',
    paragraph:
      'Catastrophic breaches often stem from subtle logic flaws, misplaced trust, and sophisticated abuse scenarios—blind spots that automated tools and routine audits consistently miss.',
  };

  problems = [
    {
      title: 'The Illusion of "All Clear"',
      description:
        'When your scanners and dashboards show green, adversaries are often exploiting the gaps in your business logic and authorization models.',
      solution: "We find the vulnerabilities that don't show up on a dashboard.",
      class: 'green',
    },
    {
      title: 'High-Impact Business Logic Flaws',
      description:
        'Complex vulnerabilities like race conditions, payment manipulation, and chained authorization bypasses that lead to direct financial or reputational damage.',
      solution: 'We model for impact, not just for CVEs.',
      class: 'solid',
    },
    {
      title: 'Actionable Intelligence vs. Noise',
      description:
        'A "High Risk" finding without a "Why" is just noise. We deliver clear, reproducible proof-of-concept exploits that demonstrate tangible business impact.',
      solution: 'Our reports are roadmaps to resilience, not just lists of findings.',
      class: 'purple',
    },
    {
      title: 'The Compliance-Security Gap',
      description:
        'Achieving compliance with standards like ISO 27001 or SOC 2 is not a guarantee of security. We test your resilience against a real-world adversary, not just a checklist.',
      solution: 'We validate your security posture, not just your paperwork.',
      class: 'orange',
    },
  ];

  private ctx!: gsap.Context;

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      // A small delay to allow for rendering of *ngFor
      setTimeout(() => {
        const panels = gsap.utils.toArray<HTMLElement>('.problem-panel');

        // Stack order (topmost last)
        gsap.set(panels, {
          zIndex: (i, _, arr) => arr.length - i,
        });

        gsap.to(panels.slice(0, -1), {
          yPercent: -100,
          ease: 'power2.inOut',
          stagger: 0.5,
          scrollTrigger: {
            trigger: '.problems-container',
            start: 'top top',
            end: `+=${(panels.length - 1) * 100}%`,
            scrub: 1,
            pin: true,
          },
        });

        // Animate content of each panel
        panels.forEach((panel, i) => {
          const content = panel.querySelector('.content');
          if (content) {
            gsap.from(content.children, {
              y: 50,
              opacity: 0,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 60%',
                toggleActions: 'play none none reverse',
              },
            });
          }
        });
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
