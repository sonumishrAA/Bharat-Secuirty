import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
})
export class ProcessComponent implements AfterViewInit, OnDestroy {
  title = 'Our Adversarial Approach';
  paragraph =
    'We emulate the tactics, techniques, and procedures of sophisticated attackers to provide a true measure of your security posture.';
  steps = [
    {
      title: 'Phase 1: Discovery & Reconnaissance',
      description:
        'We begin by mapping your external and internal attack surface, identifying assets, and defining the boundaries of your digital environment.',
      class: 'recon',
    },
    {
      title: 'Phase 2: Threat Modeling & Hypothesis',
      description:
        'We analyze your systems through the lens of an attacker, identifying likely targets, potential misuse cases, and developing hypotheses for exploitation.',
      class: 'model',
    },
    {
      title: 'Phase 3: Adversarial Simulation & Exploitation',
      description:
        'We manually execute our attack hypotheses, chaining together vulnerabilities to simulate a realistic breach scenario and demonstrate tangible business impact.',
      class: 'exploit',
    },
    {
      title: 'Phase 4: Intelligence Reporting & Analysis',
      description:
        'We deliver a detailed intelligence report with clear, reproducible findings, contextualized risk analysis, and actionable recommendations for remediation.',
      class: 'report',
    },
    {
      title: 'Phase 5: Collaborative Remediation & Retesting',
      description:
        'We partner with your engineering teams to provide guidance on fixes, and then retest to ensure the vulnerabilities are fully resolved.',
      class: 'fix',
    },
  ];

  private ctx!: gsap.Context;

  ngAfterViewInit(): void {
    // A little delay to ensure templates are rendered
    setTimeout(() => {
      this.ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>('.process-panel');

        if (panels.length === 0) return;

        // Animate content of each panel
        panels.forEach((panel, i) => {
          const content = panel.querySelector('.process-content') || panel.querySelector('.content');
          if (content) {
            gsap.from(content.children, {
              y: 60,
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

        // Duplicate first panel for seamless looping illusion
        const clone = panels[0].cloneNode(true) as HTMLElement;
        panels[0].parentNode?.appendChild(clone);
        const allPanels = [...panels, clone]; // use a new array for all panels

        allPanels.forEach((panel) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top top',
            pin: true,
            pinSpacing: false,
          });
        });

        let maxScroll = 0;

        const pageTrigger = ScrollTrigger.create({
          snap: (value) => {
            const snapped = gsap.utils.snap(1 / allPanels.length, value);
            if (snapped <= 0) return 1.05 / maxScroll;
            if (snapped >= 1) return maxScroll / (maxScroll + 1.05);
            return snapped;
          },
        });

        const onResize = () => {
          maxScroll = ScrollTrigger.maxScroll(window) - 1;
        };

        onResize();
        window.addEventListener('resize', onResize);

        window.addEventListener(
          'scroll',
          (e) => {
            const scroll = pageTrigger.scroll();
            if (scroll > maxScroll) {
              pageTrigger.scroll(1);
              e.preventDefault();
            } else if (scroll < 1) {
              pageTrigger.scroll(maxScroll - 1);
              e.preventDefault();
            }
          },
          { passive: false }
        );
      });
    }, 100);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
