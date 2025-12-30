import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-testimonial-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Testimonials Manager</h1>
        <button (click)="openModal()" class="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg">
          + Add Testimonial
        </button>
      </div>

      <div class="grid gap-4">
        <div *ngFor="let t of testimonials" class="bg-gray-900/50 border border-white/10 rounded-xl p-6 flex items-start gap-4">
          <div class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-2xl">
            {{ t.avatar || '👤' }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold">{{ t.clientName }}</span>
              <span class="text-gray-500 text-sm">{{ t.role }} @ {{ t.company }}</span>
              <span *ngIf="t.isFeatured" class="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded">Featured</span>
            </div>
            <p class="text-gray-300 text-sm">"{{ t.content }}"</p>
            <div class="mt-2 text-yellow-400 text-sm">
              <span *ngFor="let star of [1,2,3,4,5]" [class.opacity-30]="star > (t.rating || 5)">⭐</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button (click)="toggleFeatured(t)" class="text-gray-400 hover:text-cyan-400">
              {{ t.isFeatured ? '★' : '☆' }}
            </button>
            <button (click)="delete(t.id)" class="text-gray-400 hover:text-red-400">🗑️</button>
          </div>
        </div>

        <div *ngIf="!testimonials.length" class="text-center py-10 text-gray-500">
          No testimonials yet
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold mb-4">Add Testimonial</h2>
          <div class="space-y-4">
            <input [(ngModel)]="form.clientName" placeholder="Client Name" class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            <input [(ngModel)]="form.company" placeholder="Company" class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            <input [(ngModel)]="form.role" placeholder="Role" class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            <textarea [(ngModel)]="form.content" placeholder="Testimonial content" rows="3" class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2"></textarea>
            <div class="flex gap-4">
              <input [(ngModel)]="form.rating" type="number" min="1" max="5" placeholder="Rating (1-5)" class="w-24 bg-black/50 border border-white/10 rounded-lg px-4 py-2">
              <input [(ngModel)]="form.avatar" placeholder="Avatar emoji" class="w-24 bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [(ngModel)]="form.isFeatured"> Featured on homepage
            </label>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="closeModal()" class="px-4 py-2 border border-white/10 rounded-lg hover:bg-gray-800">Cancel</button>
            <button (click)="save()" class="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500">Save</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TestimonialListComponent implements OnInit {
  private http = inject(HttpClient);

  testimonials: any[] = [];
  showModal = false;
  form = { clientName: '', company: '', role: '', content: '', rating: 5, avatar: '👤', isFeatured: false };

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<any[]>(`${environment.apiUrl}/testimonials`).subscribe(data => this.testimonials = data);
  }

  openModal() {
    this.form = { clientName: '', company: '', role: '', content: '', rating: 5, avatar: '👤', isFeatured: false };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    this.http.post(`${environment.apiUrl}/testimonials`, this.form).subscribe({
      next: () => {
        this.load();
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to create testimonial:', err);
        alert('Failed to create testimonial: ' + (err.error?.error || err.message || 'Unknown error'));
      }
    });
  }

  toggleFeatured(t: any) {
    this.http.put(`${environment.apiUrl}/testimonials/${t.id}/toggle-featured`, {}).subscribe(() => this.load());
  }

  delete(id: number) {
    if (confirm('Delete this testimonial?')) {
      this.http.delete(`${environment.apiUrl}/testimonials/${id}`).subscribe(() => this.load());
    }
  }
}
