import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-client-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen bg-black text-white p-6">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-10">
          <div>
            <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              My Security Projects
            </h1>
            <p class="text-gray-400 mt-1">Track progress and manage your bookings</p>
          </div>
          <div class="flex items-center gap-4">
            <a routerLink="/client/profile" class="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition">Profile</a>
            <button (click)="logout()" class="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition">Logout</button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-20">
          <div class="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && bookings.length === 0" class="bg-gray-900/50 border border-white/10 rounded-2xl p-10 text-center">
          <div class="text-4xl mb-4">📂</div>
          <h3 class="text-xl font-semibold mb-2">No active projects</h3>
          <p class="text-gray-400 mb-6">You haven't booked any security services yet.</p>
          <a routerLink="/contact" class="px-6 py-3 bg-cyan-600 rounded-lg text-white font-medium hover:bg-cyan-500 transition">Book a Service</a>
        </div>

        <!-- Bookings Grid -->
        <div *ngIf="!isLoading && bookings.length > 0" class="grid gap-6">
          
          <div *ngFor="let booking of bookings" class="bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all hover:bg-gray-900/80 group">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <!-- Left: Info -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                  {{ getServiceIcon(booking.service?.icon) }}
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-lg font-semibold">{{ booking.service?.title || 'Security Service' }}</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">{{ booking.referenceCode }}</span>
                  </div>
                  <p class="text-sm text-gray-400 line-clamp-1">{{ booking.projectScope }}</p>
                  <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>📅 {{ booking.createdAt | date:'mediumDate' }}</span>
                    <span>💰 {{ booking.budget || 'Custom' }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Status & Action -->
              <div class="flex items-center gap-6">
                
                <div class="bg-black/30 px-4 py-2 rounded-lg border border-white/5">
                  <div class="text-xs text-gray-500 mb-1">Status</div>
                  <div class="flex items-center gap-2 font-medium" [class]="getStatusColor(booking.status)">
                    <span class="w-2 h-2 rounded-full" [class.animate-pulse]="booking.status === 'in_progress'" [style.background-color]="getStatusDotColor(booking.status)"></span>
                    {{ getStatusLabel(booking.status) }}
                  </div>
                </div>

                <a [routerLink]="['/client/booking', booking.id]" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition group-hover:scale-110">
                  →
                </a>
              </div>
            </div>
            
            <!-- Message Badge -->
            <div *ngIf="booking._count?.messages > 0" class="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-cyan-400 text-sm animate-pulse">
              <span>💬</span> {{ booking._count.messages }} new message(s) from admin
            </div>

          </div>

        </div>

      </div>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
    private http = inject(HttpClient);

    bookings: any[] = [];
    isLoading = true;

    ngOnInit() {
        this.fetchBookings();
    }

    fetchBookings() {
        this.http.get<any[]>(`${environment.apiUrl}/bookings/client/list`).subscribe({
            next: (data) => {
                this.bookings = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
            }
        });
    }

    getServiceIcon(icon: string | undefined): string {
        return icon || '🛡️';
    }

    getStatusLabel(status: string): string {
        const map: any = {
            'new': 'New Request',
            'contacted': 'Contacted',
            'in_progress': 'In Progress',
            'testing': 'Testing Active',
            'report_ready': 'Report Ready',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return map[status] || status;
    }

    getStatusColor(status: string): string {
        const map: any = {
            'new': 'text-blue-400',
            'contacted': 'text-yellow-400',
            'in_progress': 'text-cyan-400',
            'testing': 'text-purple-400',
            'report_ready': 'text-green-400',
            'completed': 'text-green-500',
            'cancelled': 'text-red-400'
        };
        return map[status] || 'text-gray-400';
    }

    getStatusDotColor(status: string): string {
        const map: any = {
            'new': '#60a5fa',
            'contacted': '#facc15',
            'in_progress': '#22d3ee',
            'testing': '#c084fc',
            'report_ready': '#4ade80',
            'completed': '#22c55e',
            'cancelled': '#f87171'
        };
        return map[status] || '#9ca3af';
    }

    logout() {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_user');
        window.location.href = '/client/login';
    }
}
