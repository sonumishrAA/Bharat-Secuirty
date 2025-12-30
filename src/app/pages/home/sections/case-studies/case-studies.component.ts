import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-studies.component.html',
  styleUrls: ['./case-studies.component.scss'],
})
export class CaseStudiesComponent implements AfterViewInit, OnDestroy {
  private ctx!: gsap.Context;

  title = 'From the Field: Real-World Findings';
  note =
    'All case studies are anonymized and disclosed with client permission, reflecting our commitment to responsible and ethical security practices.';
  cases = [
    {
      title: 'E-Commerce Payment Bypass',
      issue:
        'A subtle logic flaw in the checkout process allowed for order completion without payment verification, leading to significant potential revenue loss.',
      impact: 'Critical Financial',
      severity: 'Critical',
    },
    {
      title: 'Multi-Factor Authentication Bypass',
      issue:
        'Chaining an Insecure Direct Object Reference (IDOR) with a weak OTP implementation allowed for complete account takeover, even for MFA-protected accounts.',
      impact: 'Widespread Account Compromise',
      severity: 'Critical',
    },
    {
      title: 'Cloud Infrastructure Privilege Escalation',
      issue:
        'A misconfigured IAM policy, combined with an instance metadata leak, allowed an attacker to escalate from a low-privilege user to full administrative control over the cloud environment.',
      impact: 'Full Infrastructure Compromise',
      severity: 'Critical',
    },
  ];

  ngAfterViewInit(): void {
    // A small delay to allow for rendering of *ngFor
    setTimeout(() => {
      this.ctx = gsap.context(() => {
        const pages = gsap.utils.toArray<HTMLElement>('.case-page');

        if (pages.length === 0) return;

        pages.forEach((page, i) => {
          gsap.fromTo(
            page,
            {
              rotateY: 0,
              z: 0,
            },
            {
              rotateY: -120,
              z: -200,
              ease: 'power2.inOut', // Smoother ease
              scrollTrigger: {
                trigger: page,
                start: 'top center',
                end: 'bottom top',
                scrub: 1, // Smoother scrub
              },
            }
          );

          const content = page.querySelector('.content');
          if (content) {
            gsap.from(content.children, {
              y: 40,
              opacity: 0,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: page,
                start: 'top 50%',
                toggleActions: 'play none none reverse',
              },
            });
          }
        });

        // Also animate the main heading and note
        gsap.from(['.heading', '.note'], {
          y: 50,
          opacity: 0,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.case-studies',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, 100);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
