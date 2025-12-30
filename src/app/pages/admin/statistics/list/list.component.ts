import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-statistics-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Statistics Manager</h1>
        <button (click)="openModal()" class="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg">
          + Add Statistic
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let s of statistics" class="bg-gray-900/50 border border-white/10 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-3xl">{{ s.icon }}</span>
            <div class="flex gap-2">
              <button (click)="edit(s)" class="text-gray-400 hover:text-cyan-400">✏️</button>
              <button (click)="delete(s.id)" class="text-gray-400 hover:text-red-400">🗑️</button>
            </div>
          </div>
          <div class="text-3xl font-bold text-cyan-400">{{ s.value }}{{ s.suffix }}</div>
          <div class="text-gray-400 mt-1">{{ s.label }}</div>
          <div class="mt-3 flex items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded" [class.bg-green-900]="s.isActive" [class.bg-gray-800]="!s.isActive">
              {{ s.isActive ? 'Active' : 'Inactive' }}
            </span>
            <span class="text-gray-500">Order: {{ s.order }}</span>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold mb-4">{{ editingId ? 'Edit' : 'Add' }} Statistic</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <input [(ngModel)]="form.value" placeholder="Value (e.g., 200)" class="bg-black/50 border border-white/10 rounded-lg px-4 py-2">
              <input [(ngModel)]="form.suffix" placeholder="Suffix (e.g., +, %)" class="bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            </div>
            <input [(ngModel)]="form.label" placeholder="Label (e.g., Security Audits)" class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            <div class="grid grid-cols-2 gap-4">
              <input [(ngModel)]="form.icon" placeholder="Icon emoji" class="bg-black/50 border border-white/10 rounded-lg px-4 py-2">
              <input [(ngModel)]="form.order" type="number" placeholder="Order" class="bg-black/50 border border-white/10 rounded-lg px-4 py-2">
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [(ngModel)]="form.isActive"> Active
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
export class StatisticsListComponent implements OnInit {
    private http = inject(HttpClient);

    statistics: any[] = [];
    showModal = false;
    editingId: number | null = null;
    form = { value: '', suffix: '', label: '', icon: '🛡️', order: 0, isActive: true };

    ngOnInit() {
        this.load();
    }

    load() {
        this.http.get<any[]>(`${environment.apiUrl}/statistics`).subscribe(data => this.statistics = data);
    }

    openModal() {
        this.form = { value: '', suffix: '', label: '', icon: '🛡️', order: this.statistics.length + 1, isActive: true };
        this.editingId = null;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    edit(s: any) {
        this.form = { ...s };
        this.editingId = s.id;
        this.showModal = true;
    }

    save() {
        if (this.editingId) {
            this.http.put(`${environment.apiUrl}/statistics/${this.editingId}`, this.form).subscribe(() => {
                this.load();
                this.closeModal();
            });
        } else {
            this.http.post(`${environment.apiUrl}/statistics`, this.form).subscribe(() => {
                this.load();
                this.closeModal();
            });
        }
    }

    delete(id: number) {
        if (confirm('Delete this statistic?')) {
            this.http.delete(`${environment.apiUrl}/statistics/${id}`).subscribe(() => this.load());
        }
    }
}
