import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-media-library',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Media Library</h1>
        <div class="flex gap-3">
          <input type="file" #fileInput (change)="onFilesSelect($event)" multiple accept="image/*,video/*,.pdf,.doc,.docx" class="hidden">
          <button (click)="fileInput.click()" class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition">
            + Upload Files
          </button>
        </div>
      </div>

      <!-- Upload Progress -->
      @if (uploading()) {
      <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4 mb-6">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="text-sm mb-2">Uploading {{ uploadingCount }} file(s)...</div>
            <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-cyan-500 transition-all" [style.width.%]="uploadProgress"></div>
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Filters -->
      <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4 mb-6">
        <div class="flex gap-4 flex-wrap">
          <select [(ngModel)]="filterType" (change)="loadMedia()"
            class="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-sm">
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()" 
            placeholder="Search files..."
            class="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-sm flex-1">

          <div class="flex gap-2">
            <button (click)="viewMode = 'grid'" 
              class="p-2 rounded-lg transition"
              [class.bg-cyan-600]="viewMode === 'grid'"
              [class.bg-gray-800]="viewMode !== 'grid'">
              🔲
            </button>
            <button (click)="viewMode = 'list'" 
              class="p-2 rounded-lg transition"
              [class.bg-cyan-600]="viewMode === 'list'"
              [class.bg-gray-800]="viewMode !== 'list'">
              📋
            </button>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      @if (viewMode === 'grid') {
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        @for (file of files(); track file.id) {
        <div class="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden group relative"
          [class.ring-2]="selectedFiles.includes(file.id)"
          [class.ring-cyan-500]="selectedFiles.includes(file.id)">
          
          <!-- Preview -->
          <div class="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
            @if (file.fileType === 'image') {
            <img [src]="apiUrl + file.fileUrl" [alt]="file.alt || file.originalName" class="w-full h-full object-cover">
            } @else if (file.fileType === 'video') {
            <div class="text-4xl">🎬</div>
            } @else {
            <div class="text-4xl">📄</div>
            }
          </div>

          <!-- Info -->
          <div class="p-2">
            <div class="text-xs truncate">{{ file.originalName }}</div>
            <div class="text-xs text-gray-500">{{ formatSize(file.fileSize) }}</div>
          </div>

          <!-- Hover Actions -->
          <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button (click)="copyUrl(file)" class="bg-cyan-600 text-white px-3 py-1 rounded text-xs hover:bg-cyan-500">
              Copy URL
            </button>
            <button (click)="deleteFile(file.id)" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500">
              Delete
            </button>
          </div>

          <!-- Checkbox -->
          <input type="checkbox" [checked]="selectedFiles.includes(file.id)" 
            (change)="toggleSelect(file.id)"
            class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
        </div>
        }
        @if (files().length === 0) {
        <div class="col-span-full text-center py-16 text-gray-500">
          <div class="text-6xl mb-4">📁</div>
          <div>No files uploaded yet</div>
        </div>
        }
      </div>
      }

      <!-- List View -->
      @if (viewMode === 'list') {
      <div class="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-black/30">
            <tr>
              <th class="w-10 p-4"></th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">File</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Type</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Size</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Uploaded</th>
              <th class="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (file of files(); track file.id) {
            <tr class="border-t border-white/5 hover:bg-white/5">
              <td class="p-4">
                <input type="checkbox" [checked]="selectedFiles.includes(file.id)" 
                  (change)="toggleSelect(file.id)">
              </td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  @if (file.fileType === 'image') {
                  <img [src]="apiUrl + file.fileUrl" class="w-10 h-10 rounded object-cover">
                  } @else {
                  <div class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-xl">
                    {{ file.fileType === 'video' ? '🎬' : '📄' }}
                  </div>
                  }
                  <span class="text-sm">{{ file.originalName }}</span>
                </div>
              </td>
              <td class="p-4 text-sm text-gray-400 capitalize">{{ file.fileType }}</td>
              <td class="p-4 text-sm text-gray-400">{{ formatSize(file.fileSize) }}</td>
              <td class="p-4 text-sm text-gray-400">{{ file.createdAt | date:'mediumDate' }}</td>
              <td class="p-4 text-right">
                <button (click)="copyUrl(file)" class="text-cyan-400 hover:text-cyan-300 text-sm mr-3">Copy URL</button>
                <button (click)="deleteFile(file.id)" class="text-red-400 hover:text-red-300 text-sm">Delete</button>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }

      <!-- Bulk Actions -->
      @if (selectedFiles.length > 0) {
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 rounded-xl p-4 shadow-2xl flex items-center gap-4">
        <span class="text-sm">{{ selectedFiles.length }} selected</span>
        <button (click)="deleteSelected()" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-500">
          Delete Selected
        </button>
        <button (click)="clearSelection()" class="text-gray-400 hover:text-white text-sm">
          Cancel
        </button>
      </div>
      }

      <!-- Pagination -->
      @if (pagination.pages > 1) {
      <div class="flex justify-center gap-2 mt-6">
        @for (page of [].constructor(pagination.pages); track $index) {
        <button (click)="goToPage($index + 1)" 
          class="px-3 py-1 rounded-lg text-sm"
          [class.bg-cyan-600]="pagination.page === $index + 1"
          [class.bg-gray-800]="pagination.page !== $index + 1">
          {{ $index + 1 }}
        </button>
        }
      </div>
      }
    </div>
  `
})
export class MediaLibraryComponent implements OnInit {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl;

    files = signal<any[]>([]);
    filterType = '';
    searchQuery = '';
    viewMode: 'grid' | 'list' = 'grid';

    selectedFiles: number[] = [];

    uploading = signal(false);
    uploadingCount = 0;
    uploadProgress = 0;

    pagination = { page: 1, limit: 24, total: 0, pages: 0 };
    private searchTimeout: any;

    ngOnInit() {
        this.loadMedia();
    }

    loadMedia() {
        const params = new URLSearchParams();
        params.set('page', String(this.pagination.page));
        params.set('limit', String(this.pagination.limit));
        if (this.filterType) params.set('type', this.filterType);
        if (this.searchQuery) params.set('search', this.searchQuery);

        this.http.get<any>(`${this.apiUrl}/media?${params.toString()}`).subscribe({
            next: (data) => {
                this.files.set(data.files || data);
                if (data.pagination) {
                    this.pagination = data.pagination;
                }
            },
            error: (err) => console.error('Failed to load media', err)
        });
    }

    onSearchChange() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.pagination.page = 1;
            this.loadMedia();
        }, 300);
    }

    goToPage(page: number) {
        this.pagination.page = page;
        this.loadMedia();
    }

    onFilesSelect(event: any) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        this.uploading.set(true);
        this.uploadingCount = files.length;
        this.uploadProgress = 0;

        let completed = 0;
        const totalFiles = files.length;

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            this.http.post(`${this.apiUrl}/media/upload`, formData).subscribe({
                next: () => {
                    completed++;
                    this.uploadProgress = (completed / totalFiles) * 100;
                    if (completed === totalFiles) {
                        this.uploading.set(false);
                        this.loadMedia();
                    }
                },
                error: (err) => {
                    console.error('Upload failed', err);
                    completed++;
                    if (completed === totalFiles) {
                        this.uploading.set(false);
                        this.loadMedia();
                    }
                }
            });
        }

        event.target.value = '';
    }

    toggleSelect(id: number) {
        const index = this.selectedFiles.indexOf(id);
        if (index === -1) {
            this.selectedFiles.push(id);
        } else {
            this.selectedFiles.splice(index, 1);
        }
    }

    clearSelection() {
        this.selectedFiles = [];
    }

    copyUrl(file: any) {
        const url = `${this.apiUrl}${file.fileUrl}`;
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    }

    deleteFile(id: number) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.http.delete(`${this.apiUrl}/media/${id}`).subscribe({
                next: () => this.loadMedia(),
                error: (err) => console.error('Delete failed', err)
            });
        }
    }

    deleteSelected() {
        if (confirm(`Are you sure you want to delete ${this.selectedFiles.length} file(s)?`)) {
            const deletePromises = this.selectedFiles.map(id =>
                this.http.delete(`${this.apiUrl}/media/${id}`).toPromise()
            );

            Promise.all(deletePromises).then(() => {
                this.selectedFiles = [];
                this.loadMedia();
            });
        }
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}
