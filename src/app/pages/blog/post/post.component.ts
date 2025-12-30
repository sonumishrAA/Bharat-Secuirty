import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    @if (loading()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading article...</p>
    </div>
    } @else if (post()) {
    <article class="blog-post">
      <!-- Hero -->
      <header class="post-hero">
        @if (post()?.coverImageUrl) {
        <img [src]="apiUrl + post()?.coverImageUrl" [alt]="post()?.title" class="hero-image">
        <div class="hero-overlay"></div>
        }
        <div class="container hero-content">
          <a routerLink="/blog" class="back-link">← Back to Blog</a>
          <div class="meta">
            <span class="date">{{ post()?.publishedAt | date:'longDate' }}</span>
            <span class="views">👁️ {{ post()?.viewCount }} views</span>
          </div>
          <h1>{{ post()?.title }}</h1>
          <div class="author">
            <div class="author-avatar">{{ post()?.author?.name?.charAt(0) || 'A' }}</div>
            <span>By {{ post()?.author?.name || 'Admin' }}</span>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="container post-content">
        <div class="content-wrapper">
          <div class="excerpt" *ngIf="post()?.excerpt">
            {{ post()?.excerpt }}
          </div>
          
          <div class="content" [innerHTML]="formattedContent"></div>

          <!-- Tags -->
          <div class="post-tags" *ngIf="post()?.tags?.length">
            <span class="label">Tags:</span>
            @for (tag of post()?.tags; track tag.id) {
            <span class="tag">{{ tag.name }}</span>
            }
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="sidebar">
          <!-- Categories -->
          <div class="sidebar-card" *ngIf="post()?.categories?.length">
            <h3>Categories</h3>
            <div class="category-list">
              @for (cat of post()?.categories; track cat.id) {
              <a [routerLink]="['/blog']" [queryParams]="{category: cat.slug}" class="category">
                {{ cat.name }}
              </a>
              }
            </div>
          </div>

          <!-- Share -->
          <div class="sidebar-card">
            <h3>Share This Post</h3>
            <div class="share-buttons">
              <button (click)="share('twitter')" class="share-btn twitter">𝕏</button>
              <button (click)="share('linkedin')" class="share-btn linkedin">in</button>
              <button (click)="copyLink()" class="share-btn copy">🔗</button>
            </div>
          </div>
        </aside>
      </div>
    </article>
    } @else {
    <div class="error-state">
      <div class="icon">📰</div>
      <h2>Post Not Found</h2>
      <p>The article you're looking for doesn't exist or has been removed.</p>
      <a routerLink="/blog" class="btn-primary">Back to Blog</a>
    </div>
    }
  `,
    styles: [`
    .loading-state, .error-state {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0,255,255,0.2);
      border-top-color: #0ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-state .icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .blog-post {
      min-height: 100vh;
      background: #0a0a0a;
    }

    .post-hero {
      position: relative;
      min-height: 450px;
      display: flex;
      align-items: flex-end;
      padding-bottom: 60px;
      background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%);
    }

    .hero-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, #0a0a0a 0%, transparent 60%);
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .back-link {
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 24px;
      display: inline-block;
      transition: color 0.3s ease;
    }

    .back-link:hover {
      color: #0ff;
    }

    .meta {
      display: flex;
      gap: 20px;
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 24px;
      line-height: 1.3;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,0.8);
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0ff 0%, #00a0a0 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #000;
    }

    .post-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 48px;
      padding: 60px 20px 100px;
    }

    .content-wrapper {
      max-width: 100%;
    }

    .excerpt {
      font-size: 1.2rem;
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      padding: 24px;
      background: rgba(0,255,255,0.05);
      border-left: 3px solid #0ff;
      border-radius: 0 8px 8px 0;
      margin-bottom: 32px;
    }

    .content {
      font-size: 1.05rem;
      line-height: 1.8;
      color: rgba(255,255,255,0.85);
    }

    .content :deep(h2) {
      font-size: 1.75rem;
      margin: 40px 0 16px;
    }

    .content :deep(h3) {
      font-size: 1.4rem;
      margin: 32px 0 12px;
    }

    .content :deep(p) {
      margin-bottom: 20px;
    }

    .content :deep(pre) {
      background: #1a1a2e;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 24px 0;
    }

    .content :deep(code) {
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .content :deep(blockquote) {
      border-left: 3px solid #0ff;
      padding-left: 20px;
      margin: 24px 0;
      font-style: italic;
      color: rgba(255,255,255,0.7);
    }

    .post-tags {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .post-tags .label {
      color: rgba(255,255,255,0.6);
    }

    .tag {
      font-size: 0.8rem;
      padding: 6px 14px;
      background: rgba(0,255,255,0.1);
      border: 1px solid rgba(0,255,255,0.2);
      border-radius: 20px;
      color: #0ff;
    }

    .sidebar {
      position: sticky;
      top: 100px;
      height: fit-content;
    }

    .sidebar-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .sidebar-card h3 {
      font-size: 1rem;
      margin-bottom: 16px;
      color: rgba(255,255,255,0.9);
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category {
      color: #0ff;
      text-decoration: none;
      font-size: 0.9rem;
      transition: opacity 0.3s ease;
    }

    .category:hover { opacity: 0.7; }

    .share-buttons {
      display: flex;
      gap: 12px;
    }

    .share-btn {
      width: 40px;
      height: 40px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .share-btn:hover {
      background: #0ff;
      color: #000;
      border-color: #0ff;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0ff 0%, #00a0a0 100%);
      color: #000;
      padding: 14px 32px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
    }

    @media (max-width: 900px) {
      .post-content {
        grid-template-columns: 1fr;
      }
      .sidebar {
        position: static;
      }
      h1 { font-size: 1.8rem; }
    }
  `]
})
export class BlogPostComponent implements OnInit {
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private sanitizer = inject(DomSanitizer);

    apiUrl = environment.apiUrl;

    post = signal<any>(null);
    loading = signal(true);
    formattedContent: SafeHtml = '';

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.loadPost(params['slug']);
        });
    }

    loadPost(slug: string) {
        this.loading.set(true);
        this.http.get<any>(`${this.apiUrl}/blog/posts/${slug}`).subscribe({
            next: (post) => {
                this.post.set(post);
                this.formattedContent = this.sanitizer.bypassSecurityTrustHtml(
                    this.formatMarkdown(post.content)
                );
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load post', err);
                this.loading.set(false);
            }
        });
    }

    formatMarkdown(content: string): string {
        if (!content) return '';

        // Basic markdown to HTML conversion
        return content
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '');
    }

    share(platform: string) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.post()?.title || '');

        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    copyLink() {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}
