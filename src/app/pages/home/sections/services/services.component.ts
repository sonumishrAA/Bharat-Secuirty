import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ✅ Extend ScrollTrigger to allow runtime props */
interface ScrollTriggerExtended extends ScrollTrigger {
  wrapping?: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements AfterViewInit, OnDestroy {
  title = 'Our Core Services';
  paragraph =
    'Each service is a bespoke engagement designed to deliver maximum impact and provide a clear roadmap for remediation.';
  services = [
    {
      title: 'Web Application & API Penetration Testing',
      description: [
        'In-depth manual testing of web applications and APIs to identify, exploit, and chain vulnerabilities in authentication, authorization, business logic, and overall application architecture.',
      ],
    },
    {
      title: 'Mobile Application Security Assessment',
      description: [
        'Comprehensive security analysis of iOS and Android applications, focusing on API vulnerabilities, insecure data storage, cryptographic weaknesses, and platform-specific logic flaws.',
      ],
    },
    {
      title: 'Cloud & Backend Infrastructure Review',
      description: [
        'A thorough review of your cloud configuration (AWS, GCP, Azure) and backend systems to identify misconfigurations, access control weaknesses, and opportunities for privilege escalation.',
      ],
    },
    {
      title: 'Threat Modeling & Secure Design Review',
      description: [
        'Collaborative workshops to identify and mitigate security risks in the design phase, ensuring a secure foundation before a single line of code is written.',
      ],
    },
    {
      title: 'Red Team & Adversary Simulation',
      description: [
        "Goal-oriented campaigns that simulate real-world adversaries to test your organization's detection and response capabilities across people, process, and technology.",
      ],
    },
  ];

  private ctx!: gsap.Context;
  private iteration = 0;
  private scrub!: gsap.core.Tween;
  private trigger!: ScrollTriggerExtended;
  private seamlessLoop!: gsap.core.Timeline;

  ngAfterViewInit(): void {
    // A little delay to ensure templates are rendered
    setTimeout(() => {
      this.ctx = gsap.context(() => {
        const spacing = 0.1;
        const snap = gsap.utils.snap(spacing);
        const cards = gsap.utils.toArray<HTMLElement>('.cards li');

        if (cards.length === 0) return;

        /* fade in images */
        gsap.to(
          cards, // fade in whole card
          {
            opacity: 1,
            delay: 0.1,
          }
        );

        this.seamlessLoop = this.buildSeamlessLoop(cards, spacing);

        this.scrub = gsap.to(this.seamlessLoop, {
          totalTime: 0,
          duration: 0.5,
          ease: 'power3',
          paused: true,
        });

        this.trigger = ScrollTrigger.create({
          start: 0,
          end: '+=3000',
          pin: '.gallery',

          onUpdate: (self: ScrollTriggerExtended) => {
            if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
              this.wrapForward(self);
            } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
              this.wrapBackward(self);
            } else {
              this.scrub.vars['totalTime'] = snap(
                (this.iteration + self.progress) * this.seamlessLoop.duration()
              );
              this.scrub.invalidate().restart();
              self.wrapping = false;
            }
          },
        }) as ScrollTriggerExtended;
      });
    }, 100);
  }

  /* ---------- CONTROLS ---------- */

  next(): void {
    this.scrubTo(this.scrub.vars['totalTime'] + 0.1);
  }

  prev(): void {
    this.scrubTo(this.scrub.vars['totalTime'] - 0.1);
  }

  /* ---------- LOOP HELPERS ---------- */

  private wrapForward(trigger: ScrollTriggerExtended): void {
    this.iteration++;
    trigger.wrapping = true;
    trigger.scroll(trigger.start + 1);
  }

  private wrapBackward(trigger: ScrollTriggerExtended): void {
    this.iteration--;
    if (this.iteration < 0) {
      this.iteration = 9;
      this.seamlessLoop.totalTime(
        this.seamlessLoop.totalTime() + this.seamlessLoop.duration() * 10
      );
      this.scrub.pause();
    }
    trigger.wrapping = true;
    trigger.scroll(trigger.end - 1);
  }

  private scrubTo(totalTime: number): void {
    const progress =
      (totalTime - this.seamlessLoop.duration() * this.iteration) / this.seamlessLoop.duration();

    if (progress > 1) {
      this.wrapForward(this.trigger);
    } else if (progress < 0) {
      this.wrapBackward(this.trigger);
    } else {
      this.trigger.scroll(this.trigger.start + progress * (this.trigger.end - this.trigger.start));
    }
  }

  /* ---------- SEAMLESS LOOP ---------- */

  private buildSeamlessLoop(items: HTMLElement[], spacing: number): gsap.core.Timeline {
    const overlap = Math.ceil(1 / spacing);
    const startTime = items.length * spacing + 0.5;
    const loopTime = (items.length + overlap) * spacing + 1;

    const raw = gsap.timeline({ paused: true });
    const loop = gsap.timeline({ paused: true, repeat: -1 });

    gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

    const total = items.length + overlap * 2;

    for (let i = 0; i < total; i++) {
      const item = items[i % items.length];
      const time = i * spacing;
      const content = item.querySelector('.service-card');

      raw
        .fromTo(
          item,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            zIndex: 100,
            duration: 0.8, // increased duration
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut', // smoother ease
            immediateRender: false,
          },
          time
        )
        .fromTo(
          item,
          { xPercent: 400 },
          {
            xPercent: -400,
            duration: 1.5, // increased duration
            ease: 'none',
            immediateRender: false,
          },
          time
        );

      if (content) {
        raw.from(
          content.children,
          {
            y: 40,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power3.out',
          },
          time + 0.1
        );
      }
    }

    raw.time(startTime);

    loop
      .to(raw, {
        time: loopTime,
        duration: loopTime - startTime,
        ease: 'none',
      })
      .fromTo(
        raw,
        { time: overlap * spacing + 1 },
        {
          time: startTime,
          duration: startTime - (overlap * spacing + 1),
          immediateRender: false,
          ease: 'none',
        }
      );

    return loop;
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
