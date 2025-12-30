import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trust-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trust-strip.html',
  styleUrl: './trust-strip.scss',
})
export class TrustStripComponent {
  items = ['Manual-first testing', 'NDA ready', 'OWASP aligned', 'Fast turnaround'];
}
