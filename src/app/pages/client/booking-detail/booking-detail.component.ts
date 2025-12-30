import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-client-booking-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-black text-white p-4 md:p-6 pb-24">
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left Column: Project Info -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Header Card -->
          <div class="bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <span class="text-9xl">🛡️</span>
            </div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-2">
                <a routerLink="/client/dashboard" class="text-gray-400 hover:text-white transition">← Back</a>
                <span class="text-gray-600">|</span>
                <span class="text-cyan-400 font-mono">{{ booking?.referenceCode }}</span>
              </div>
              
              <h1 class="text-3xl font-bold mb-2">{{ booking?.service?.title || 'Security Service' }}</h1>
              
              <div class="flex flex-wrap items-center gap-4 mt-4">
                <div class="bg-black/40 px-3 py-1 rounded text-sm text-gray-300 border border-white/5">
                  📅 {{ booking?.createdAt | date }}
                </div>
                <div class="bg-black/40 px-3 py-1 rounded text-sm text-gray-300 border border-white/5">
                  💰 {{ booking?.budget || 'Custom' }}
                </div>
                <div [class]="'px-3 py-1 rounded text-sm font-medium ' + getStatusColor(booking?.status)">
                  {{ getStatusLabel(booking?.status) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
            <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
              <span>📊</span> Project Progress
            </h3>
            
            <div class="relative">
              <!-- Line -->
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>

              <!-- Steps -->
              <div *ngFor="let step of steps" class="relative pl-12 mb-6 last:mb-0">
                <div 
                  class="absolute left-0 w-8 h-8 rounded-full border-4 text-xs flex items-center justify-center z-10 transition-all duration-500"
                  [class.border-cyan-500]="step.active || step.completed"
                  [class.bg-cyan-900]="step.active"
                  [class.bg-cyan-500]="step.completed"
                  [class.bg-gray-900]="!step.active && !step.completed"
                  [class.border-gray-700]="!step.active && !step.completed"
                >
                  <span *ngIf="step.completed">✓</span>
                </div>
                
                <h4 class="font-medium" [class.text-cyan-400]="step.active" [class.text-gray-500]="!step.active && !step.completed">
                  {{ step.label }}
                </h4>
                <p class="text-sm text-gray-500">{{ step.description }}</p>
              </div>
            </div>
          </div>

          <!-- Files -->
          <div class="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
            <h3 class="text-lg font-semibold mb-6 flex items-center gap-2">
              <span>📁</span> Project Files
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Uploaded Files -->
              <div *ngFor="let file of booking?.files" class="bg-black/40 border border-white/5 rounded-lg p-4 flex items-center gap-3 group hover:border-cyan-500/30 transition">
                <div class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">
                  {{ getFileIcon(file.fileType) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ file.originalName }}</div>
                  <div class="text-xs text-gray-500">{{ file.createdAt | date }} • {{ file.uploadedBy }}</div>
                </div>
                <a [href]="apiUrl + file.fileUrl" target="_blank" class="text-gray-500 hover:text-cyan-400">⬇️</a>
              </div>

              <!-- Empty State -->
              <div *ngIf="!booking?.files?.length" class="col-span-2 text-center py-8 text-gray-500 italic">
                No files uploaded yet.
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Chat -->
        <div class="lg:col-span-1 h-[600px] flex flex-col bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div class="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <h3 class="font-semibold flex items-center gap-2">
              <span>💬</span> Messages
            </h3>
            <span class="text-xs text-cyan-400 flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
            </span>
          </div>

          <!-- Messages Area -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
            
            <div *ngFor="let msg of booking?.messages" [class.flex-row-reverse]="msg.senderType === 'client'" class="flex gap-3">
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs border border-white/10"
                   [class.bg-cyan-900]="msg.senderType === 'client'"
                   [class.bg-gray-800]="msg.senderType === 'admin'">
                {{ msg.senderType === 'client' ? 'ME' : 'AD' }}
              </div>

              <!-- Bubble -->
              <div class="max-w-[80%]">
                <div class="p-3 rounded-2xl text-sm"
                     [class.bg-cyan-900]="msg.senderType === 'client'"
                     [class.text-cyan-50]="msg.senderType === 'client'"
                     [class.rounded-tr-none]="msg.senderType === 'client'"
                     [class.bg-gray-800]="msg.senderType === 'admin'"
                     [class.text-gray-200]="msg.senderType === 'admin'"
                     [class.rounded-tl-none]="msg.senderType === 'admin'">
                  {{ msg.content }}
                </div>
                
                <!-- Attachment -->
                <div *ngIf="msg.attachments?.length" class="mt-1">
                  <div *ngFor="let att of msg.attachments" class="bg-black/20 p-2 rounded text-xs flex items-center gap-2 border border-white/5">
                    <span>📎</span>
                    <a [href]="apiUrl + att.fileUrl" target="_blank" class="hover:underline truncate">{{ att.originalName }}</a>
                  </div>
                </div>

                <div class="text-[10px] text-gray-500 mt-1 px-1" [class.text-right]="msg.senderType === 'client'">
                  {{ msg.createdAt | date:'shortTime' }}
                </div>
              </div>
            </div>

            <div *ngIf="!booking?.messages?.length" class="text-center text-gray-500 text-sm py-10">
              Start the conversation...
            </div>

          </div>

          <!-- Input Area -->
          <div class="p-3 border-t border-white/10 bg-black/20">
            <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="relative">
              
              <!-- File Preview -->
              <div *ngIf="selectedFile" class="absolute bottom-full left-0 mb-2 bg-gray-800 p-2 rounded text-xs flex items-center gap-2 border border-white/10 shadow-lg">
                <span>📎 {{ selectedFile.name }}</span>
                <button type="button" (click)="removeFile()" class="text-red-400 hover:text-red-300">×</button>
              </div>

              <div class="flex gap-2">
                <button type="button" (click)="fileInput.click()" class="text-gray-400 hover:text-white p-2">
                  📎
                </button>
                <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)">
                
                <input 
                  type="text" 
                  formControlName="content"
                  placeholder="Type a message..."
                  class="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-cyan-500 outline-none transition"
                >
                
                <button 
                  type="submit" 
                  [disabled]="(!messageForm.value.content && !selectedFile) || isSending"
                  class="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition"
                >
                  ➤
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ClientBookingDetailComponent implements OnInit, AfterViewChecked, OnDestroy {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private fb = inject(FormBuilder);

    apiUrl = environment.apiUrl;
    bookingId = 0;
    booking: any;

    messageForm = this.fb.group({
        content: ['']
    });

    selectedFile: File | null = null;
    isSending = false;

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
    private shouldScroll = true;
    private pollSub!: Subscription;

    // Timeline definition
    steps = [
        { id: 'new', label: 'Submitted', description: 'Booking received', active: false, completed: false },
        { id: 'contacted', label: 'Reviewing', description: 'Team is reviewing', active: false, completed: false },
        { id: 'in_progress', label: 'In Progress', description: 'Work started', active: false, completed: false },
        { id: 'testing', label: 'Testing', description: 'Security testing active', active: false, completed: false },
        { id: 'report_ready', label: 'Report Ready', description: 'Finalizing report', active: false, completed: false },
        { id: 'completed', label: 'Completed', description: 'Project delivered', active: false, completed: false }
    ];

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.bookingId = params['id'];
            this.loadBooking();

            // Poll for messages every 10 seconds
            this.pollSub = interval(10000).subscribe(() => {
                this.loadBooking(true);
            });
        });
    }

    ngOnDestroy() {
        if (this.pollSub) this.pollSub.unsubscribe();
    }

    ngAfterViewChecked() {
        if (this.shouldScroll) {
            this.scrollToBottom();
        }
    }

    loadBooking(isPoll = false) {
        this.http.get<any>(`${this.apiUrl}/bookings/client/${this.bookingId}`).subscribe(data => {
            const prevMsgCount = this.booking?.messages?.length || 0;
            this.booking = data;
            this.updateTimeline();

            if (!isPoll || data.messages.length > prevMsgCount) {
                this.shouldScroll = true;
                this.markAsRead();
            } else {
                this.shouldScroll = false;
            }
        });
    }

    updateTimeline() {
        const statusOrder = ['new', 'contacted', 'in_progress', 'testing', 'report_ready', 'completed'];
        const currentIdx = statusOrder.indexOf(this.booking.status);

        this.steps.forEach((step, idx) => {
            // Map step IDs to index
            const stepIdx = statusOrder.indexOf(step.id);

            step.completed = stepIdx < currentIdx;
            step.active = step.id === this.booking.status;
        });
    }

    markAsRead() {
        this.http.put(`${this.apiUrl}/messages/client/${this.bookingId}/read`, {}).subscribe();
    }

    sendMessage() {
        if ((!this.messageForm.value.content && !this.selectedFile) || this.isSending) return;

        this.isSending = true;
        const formData = new FormData();
        formData.append('content', this.messageForm.value.content || 'Sent a file');

        if (this.selectedFile) {
            formData.append('attachment', this.selectedFile);
        }

        this.http.post(`${this.apiUrl}/messages/client/${this.bookingId}`, formData).subscribe({
            next: (msg) => {
                this.booking.messages.push(msg);
                this.messageForm.reset();
                this.selectedFile = null;
                this.isSending = false;
                this.shouldScroll = true;
            },
            error: () => this.isSending = false
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file && file.size < 10 * 1024 * 1024) { // 10MB
            this.selectedFile = file;
        } else {
            alert('File too large (Max 10MB)');
        }
    }

    removeFile() {
        this.selectedFile = null;
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            this.shouldScroll = false;
        } catch (err) { }
    }

    getStatusLabel(status: string): string {
        return status?.replace('_', ' ').toUpperCase();
    }

    getStatusColor(status: string): string {
        const map: any = {
            'new': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
            'in_progress': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
            'completed': 'bg-green-500/20 text-green-400 border border-green-500/30',
        };
        return map[status] || 'bg-gray-800 text-gray-400';
    }

    getFileIcon(type: string): string {
        if (type?.includes('pdf')) return '📄';
        if (type?.includes('image')) return '🖼️';
        return '📎';
    }
}
