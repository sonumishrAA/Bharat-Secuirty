import { Component, signal, AfterViewInit, OnDestroy, HostListener, NgZone, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  animations: [
    trigger('mobileMenuAnimation', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', animate('400ms cubic-bezier(0.16, 1, 0.3, 1)')),
      transition('* => void', animate('300ms ease-in')),
    ]),
  ],
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);
  private ctx!: gsap.Context;

  mobileOpen = signal(false);
  servicesOpen = signal(false);
  isScrolled = signal(false);

  ngAfterViewInit(): void {
    // Wait for DOM
    setTimeout(() => {
      this.initAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.ctx) this.ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  private initAnimations(): void {
    const navbar = document.querySelector('.command-bar') as HTMLElement;
    if (!navbar) return;

    this.ctx = gsap.context(() => {
      // 1. Scroll Effect (Class Toggle only - let CSS handle styles)
      ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 100, // Trigger early
        onUpdate: (self) => {
          const isScrolled = self.scroll() > 50;
          if (isScrolled !== this.isScrolled()) {
            this.ngZone.run(() => this.isScrolled.set(isScrolled));
            if (isScrolled) {
              navbar.classList.add('scrolled');
            } else {
              navbar.classList.remove('scrolled');
            }
          }
        }
      });

      // 2. Entrance Animations (Explicit fromTo to ensure visibility)
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.brand',
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )
        .fromTo('.nav-link',
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          '-=0.4'
        )
        .fromTo('.client-btn',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        );

    });
  }

  /* MOBILE MENU */
  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  /* DESKTOP SERVICES (HOVER) */
  openServices() {
    this.servicesOpen.set(true);
  }

  closeServices() {
    this.servicesOpen.set(false);
  }

  /* MOBILE SERVICES (CLICK) */
  toggleServices() {
    this.servicesOpen.update((v) => !v);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    // handled by ScrollTrigger
  }
}
