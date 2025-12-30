import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-inquiry-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="p-6 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <a routerLink="/admin/inquiries" class="text-gray-400 hover:text-white text-sm mb-2 inline-block">← Back to Inquiries</a>
          <h1 class="text-2xl font-bold flex items-center gap-3">
            Booking #{{ booking?.id }}
            <span class="text-sm font-mono bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded">{{ booking?.referenceCode }}</span>
          </h1>
        </div>
        
        <!-- Status Dropdown -->
        <div class="flex items-center gap-4">
          <select [(ngModel)]="selectedStatus" (change)="updateStatus()" 
            class="bg-gray-800 border border-white/10 text-white rounded-lg px-4 py-2 focus:border-cyan-500 outline-none">
            <option value="new">🔵 New</option>
            <option value="contacted">🟡 Contacted</option>
            <option value="in_progress">🔄 In Progress</option>
            <option value="testing">🔬 Testing</option>
            <option value="report_ready">📄 Report Ready</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Client & Booking Info -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Client Info -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>👤</span> Client Information
            </h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Name</span>
                <p class="font-medium">{{ booking?.client?.name }}</p>
              </div>
              <div>
                <span class="text-gray-500">Email</span>
                <p class="font-medium">{{ booking?.client?.email }}</p>
              </div>
              <div>
                <span class="text-gray-500">Company</span>
                <p class="font-medium">{{ booking?.client?.company || 'N/A' }}</p>
              </div>
              <div>
                <span class="text-gray-500">Phone</span>
                <p class="font-medium">{{ booking?.client?.phone || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Booking Details -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📋</span> Booking Details
            </h3>
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span class="text-gray-500">Service</span>
                <p class="font-medium">{{ booking?.service?.title }}</p>
              </div>
              <div>
                <span class="text-gray-500">Priority</span>
                <p class="font-medium capitalize">{{ booking?.priority }}</p>
              </div>
              <div>
                <span class="text-gray-500">Budget</span>
                <p class="font-medium">{{ booking?.budget || 'Custom' }}</p>
              </div>
              <div>
                <span class="text-gray-500">Timeline</span>
                <p class="font-medium">{{ booking?.timeline || 'Flexible' }}</p>
              </div>
              <div>
                <span class="text-gray-500">Submitted</span>
                <p class="font-medium">{{ booking?.createdAt | date:'medium' }}</p>
              </div>
            </div>
            
            <div class="border-t border-white/10 pt-4 mt-4">
              <span class="text-gray-500 text-sm">Project Scope</span>
              <p class="mt-1 text-gray-300 whitespace-pre-wrap">{{ booking?.projectScope }}</p>
            </div>

            <div *ngIf="booking?.additionalInfo" class="border-t border-white/10 pt-4 mt-4">
              <span class="text-gray-500 text-sm">Additional Information</span>
              <p class="mt-1 text-gray-300">{{ booking?.additionalInfo }}</p>
            </div>
          </div>

          <!-- Files -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📁</span> Attached Files
            </h3>

            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let file of booking?.files" class="bg-black/30 border border-white/5 rounded-lg p-4 flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                  {{ getFileIcon(file.fileType) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ file.originalName }}</p>
                  <p class="text-xs text-gray-500">{{ file.createdAt | date }} - {{ file.uploadedBy }}</p>
                </div>
                <a [href]="apiUrl + file.fileUrl" target="_blank" class="text-cyan-400 hover:text-cyan-300">⬇️</a>
              </div>
              
              <div *ngIf="!booking?.files?.length" class="col-span-2 text-center py-6 text-gray-500">
                No files attached
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Chat -->
        <div class="lg:col-span-1 h-[600px] flex flex-col bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
          <div class="p-4 border-b border-white/10 bg-black/20">
            <h3 class="font-semibold flex items-center gap-2">
              <span>💬</span> Chat with Client
            </h3>
          </div>

          <!-- Messages -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4">
            
            <div *ngFor="let msg of booking?.messages" class="flex gap-3" [class.flex-row-reverse]="msg.senderType === 'admin'">
              <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs border border-white/10"
                   [class.bg-cyan-900]="msg.senderType === 'admin'"
                   [class.bg-gray-800]="msg.senderType === 'client'">
                {{ msg.senderType === 'admin' ? 'AD' : 'CL' }}
              </div>

              <div class="max-w-[80%]">
                <div class="p-3 rounded-2xl text-sm"
                     [class.bg-cyan-900]="msg.senderType === 'admin'"
                     [class.rounded-tr-none]="msg.senderType === 'admin'"
                     [class.bg-gray-800]="msg.senderType === 'client'"
                     [class.rounded-tl-none]="msg.senderType === 'client'">
                  {{ msg.content }}
                </div>
                
                <div *ngIf="msg.attachments?.length" class="mt-1">
                  <div *ngFor="let att of msg.attachments" class="bg-black/20 p-2 rounded text-xs flex items-center gap-2 border border-white/5">
                    <span>📎</span>
                    <a [href]="apiUrl + att.fileUrl" target="_blank" class="hover:underline truncate">{{ att.originalName }}</a>
                  </div>
                </div>

                <div class="text-[10px] text-gray-500 mt-1 px-1" [class.text-right]="msg.senderType === 'admin'">
                  {{ msg.createdAt | date:'shortTime' }}
                </div>
              </div>
            </div>

            <div *ngIf="!booking?.messages?.length" class="text-center text-gray-500 text-sm py-10">
              No messages yet
            </div>

          </div>

          <!-- Input -->
          <div class="p-3 border-t border-white/10 bg-black/20">
            <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="flex gap-2">
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
                [disabled]="!messageForm.value.content && !selectedFile"
                class="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition"
              >
                ➤
              </button>
            </form>
            
            <!-- File Preview -->
            <div *ngIf="selectedFile" class="mt-2 bg-gray-800 p-2 rounded text-xs flex items-center gap-2 justify-between">
              <span>📎 {{ selectedFile.name }}</span>
              <button type="button" (click)="removeFile()" class="text-red-400 hover:text-red-300">×</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminInquiryDetailComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);
    private fb = inject(FormBuilder);

    apiUrl = environment.apiUrl;
    bookingId = 0;
    booking: any;
    selectedStatus = 'new';

    messageForm = this.fb.group({
        content: ['']
    });

    selectedFile: File | null = null;
    private shouldScroll = true;
    private pollSub!: Subscription;

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.bookingId = params['id'];
            this.loadBooking();

            this.pollSub = interval(10000).subscribe(() => this.loadBooking(true));
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
        this.http.get<any>(`${this.apiUrl}/bookings/${this.bookingId}`).subscribe(data => {
            const prevMsgCount = this.booking?.messages?.length || 0;
            this.booking = data;
            this.selectedStatus = data.status;

            if (!isPoll || data.messages.length > prevMsgCount) {
                this.shouldScroll = true;
                this.markAsRead();
            } else {
                this.shouldScroll = false;
            }
        });
    }

    markAsRead() {
        this.http.put(`${this.apiUrl}/messages/admin/${this.bookingId}/read`, {}).subscribe();
    }

    updateStatus() {
        this.http.patch(`${this.apiUrl}/bookings/${this.bookingId}/status`, {
            status: this.selectedStatus,
            note: 'Status updated by admin'
        }).subscribe();
    }

    sendMessage() {
        if (!this.messageForm.value.content && !this.selectedFile) return;

        const formData = new FormData();
        formData.append('content', this.messageForm.value.content || 'Sent a file');

        if (this.selectedFile) {
            formData.append('attachment', this.selectedFile);
        }

        this.http.post(`${this.apiUrl}/messages/admin/${this.bookingId}`, formData).subscribe({
            next: (msg) => {
                this.booking.messages.push(msg);
                this.messageForm.reset();
                this.selectedFile = null;
                this.shouldScroll = true;
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file && file.size < 10 * 1024 * 1024) {
            this.selectedFile = file;
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

    getFileIcon(type: string): string {
        if (type?.includes('pdf')) return '📄';
        if (type?.includes('image')) return '🖼️';
        return '📎';
    }
}
