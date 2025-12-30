import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Blog Posts</h1>
        <a routerLink="/admin/blog/new" class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition">
          + New Post
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4 mb-6">
        <div class="flex gap-4 flex-wrap">
          <select [(ngModel)]="filterStatus" (change)="loadPosts()" 
            class="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-sm">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()" 
            placeholder="Search posts..."
            class="bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-sm flex-1">
        </div>
      </div>

      <!-- Posts Table -->
      <div class="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-black/30">
            <tr>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Title</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Author</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Status</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Views</th>
              <th class="text-left p-4 text-sm font-medium text-gray-400">Date</th>
              <th class="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (post of posts(); track post.id) {
            <tr class="border-t border-white/5 hover:bg-white/5 transition">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  @if (post.coverImageUrl) {
                  <img [src]="apiUrl + post.coverImageUrl" class="w-12 h-12 rounded object-cover">
                  } @else {
                  <div class="w-12 h-12 rounded bg-gray-800 flex items-center justify-center text-xl">📝</div>
                  }
                  <div>
                    <div class="font-medium">{{ post.title }}</div>
                    <div class="text-xs text-gray-500">/blog/{{ post.slug }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 text-sm text-gray-400">{{ post.author?.name }}</td>
              <td class="p-4">
                <span class="text-xs px-2 py-1 rounded-full" 
                  [class.bg-green-900/50]="post.status === 'published'"
                  [class.text-green-400]="post.status === 'published'"
                  [class.bg-yellow-900/50]="post.status === 'draft'"
                  [class.text-yellow-400]="post.status === 'draft'"
                  [class.bg-gray-900/50]="post.status === 'archived'"
                  [class.text-gray-400]="post.status === 'archived'">
                  {{ post.status }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-400">{{ post.viewCount }}</td>
              <td class="p-4 text-sm text-gray-400">{{ post.createdAt | date:'mediumDate' }}</td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                  @if (post.status === 'draft') {
                  <button (click)="publishPost(post.id)" class="text-green-400 hover:text-green-300 text-sm">Publish</button>
                  } @else if (post.status === 'published') {
                  <button (click)="unpublishPost(post.id)" class="text-yellow-400 hover:text-yellow-300 text-sm">Unpublish</button>
                  }
                  <a [routerLink]="['/admin/blog', post.id]" class="text-cyan-400 hover:text-cyan-300 text-sm">Edit</a>
                  <button (click)="deletePost(post.id)" class="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
              </td>
            </tr>
            }
            @if (posts().length === 0) {
            <tr>
              <td colspan="6" class="p-8 text-center text-gray-500">
                No posts found. Create your first blog post!
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>

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
export class BlogListComponent implements OnInit {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl;

  posts = signal<any[]>([]);
  filterStatus = '';
  searchQuery = '';

  pagination = { page: 1, limit: 10, total: 0, pages: 0 };
  private searchTimeout: any;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    const params = new URLSearchParams();
    params.set('page', String(this.pagination.page));
    params.set('limit', String(this.pagination.limit));
    if (this.filterStatus) params.set('status', this.filterStatus);
    if (this.searchQuery) params.set('search', this.searchQuery);

    this.http.get<any>(`${this.apiUrl}/blog/posts?${params.toString()}`).subscribe({
      next: (data) => {
        this.posts.set(data.posts);
        this.pagination = data.pagination;
      },
      error: (err) => console.error('Failed to load posts', err)
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.pagination.page = 1;
      this.loadPosts();
    }, 300);
  }

  goToPage(page: number) {
    this.pagination.page = page;
    this.loadPosts();
  }

  publishPost(id: number) {
    this.http.patch(`${this.apiUrl}/blog/posts/${id}/publish`, {}).subscribe({
      next: () => this.loadPosts(),
      error: (err) => console.error('Publish failed', err)
    });
  }

  unpublishPost(id: number) {
    this.http.patch(`${this.apiUrl}/blog/posts/${id}/unpublish`, {}).subscribe({
      next: () => this.loadPosts(),
      error: (err) => console.error('Unpublish failed', err)
    });
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.http.delete(`${this.apiUrl}/blog/posts/${id}`).subscribe({
        next: () => this.loadPosts(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}
