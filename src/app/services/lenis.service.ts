import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LenisService implements OnDestroy {
  private lenis: any = null;

  async init(): Promise<void> {
    try {
      // Dynamically import Lenis
      const LenisModule = await import('@studio-freight/lenis');
      const Lenis = LenisModule.default || LenisModule;
      
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });

      const raf = (time: number) => {
        this.lenis?.raf(time);
        requestAnimationFrame(raf);
      };

      requestAnimationFrame(raf);
    } catch (error) {
      console.warn('Lenis smooth scroll not available, falling back to native scroll');
    }
  }

  scrollTo(target: Element | string | number): void {
    if (!this.lenis) {
      // Fallback to native scroll
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) this.lenis.scrollTo(element);
    } else if (typeof target === 'number') {
      this.lenis.scrollTo(target);
    } else {
      this.lenis.scrollTo(target);
    }
  }

  destroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}