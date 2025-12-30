import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './primary-button.html',
  styleUrl: './primary-button.scss',
})
export class PrimaryButtonComponent {
  @Input() label = 'Button';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
}
