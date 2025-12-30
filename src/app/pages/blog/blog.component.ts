import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <section class="blog-page">
      <!-- Hero -->
      <div class="blog-hero">
        <div class="container">
          <div class="eyebrow">📝 SECURITY INSIGHTS</div>
          <h1>Blog & Resources</h1>
          <p class="subtitle">Stay informed with the latest cybersecurity trends, tips, and insights from our security experts.</p>
        </div>
      </div>

      <!-- Blog Grid -->
      <div class="container blog-content">
        <div class="blog-grid">
          @for (post of posts(); track post.id) {
          <article class="blog-card" [routerLink]="['/blog', post.slug]">
            <div class="card-image">
              @if (post.coverImageUrl) {
              <img [src]="apiUrl + post.coverImageUrl" [alt]="post.title">
              } @else {
              <div class="placeholder-image">
                <span>🔐</span>
              </div>
              }
            </div>
            <div class="card-content">
              <div class="card-meta">
                <span class="date">{{ post.publishedAt | date:'mediumDate' }}</span>
                <span class="views">👁️ {{ post.viewCount }}</span>
              </div>
              <h2>{{ post.title }}</h2>
              <p>{{ post.excerpt }}</p>
              <div class="card-tags">
                @for (tag of post.tags?.slice(0, 3); track tag.id) {
                <span class="tag">{{ tag.name }}</span>
                }
              </div>
              <div class="read-more">
                Read More <span class="arrow">→</span>
              </div>
            </div>
          </article>
          }
        </div>

        @if (posts().length === 0) {
        <div class="empty-state">
          <div class="icon">📰</div>
          <h3>No Posts Yet</h3>
          <p>Check back soon for security insights and updates!</p>
        </div>
        }

        <!-- Load More -->
        @if (hasMore) {
        <div class="load-more">
          <button (click)="loadMore()" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Loading...' : 'Load More Articles' }}
          </button>
        </div>
        }
      </div>
    </section>
  `,
    styles: [`
    .blog-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
    }

    .blog-hero {
      padding: 120px 0 80px;
      text-align: center;
      background: linear-gradient(180deg, rgba(0,255,255,0.05) 0%, transparent 100%);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .eyebrow {
      font-size: 0.75rem;
      letter-spacing: 2px;
      color: #0ff;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #fff 0%, #0ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .blog-content {
      padding: 60px 20px 100px;
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 32px;
    }

    .blog-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .blog-card:hover {
      transform: translateY(-8px);
      border-color: rgba(0,255,255,0.3);
      box-shadow: 0 20px 40px rgba(0,255,255,0.1);
    }

    .card-image {
      aspect-ratio: 16/9;
      overflow: hidden;
      background: rgba(0,0,0,0.3);
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .blog-card:hover .card-image img {
      transform: scale(1.05);
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      background: linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,100,150,0.1) 100%);
    }

    .card-content {
      padding: 24px;
    }

    .card-meta {
      display: flex;
      gap: 16px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.5);
      margin-bottom: 12px;
    }

    .card-content h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .card-content p {
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .tag {
      font-size: 0.7rem;
      padding: 4px 10px;
      background: rgba(0,255,255,0.1);
      border: 1px solid rgba(0,255,255,0.2);
      border-radius: 20px;
      color: #0ff;
    }

    .read-more {
      font-size: 0.9rem;
      color: #0ff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .arrow {
      transition: transform 0.3s ease;
    }

    .blog-card:hover .arrow {
      transform: translateX(4px);
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: rgba(255,255,255,0.5);
    }

    .empty-state .icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    .load-more {
      text-align: center;
      margin-top: 48px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0ff 0%, #00a0a0 100%);
      color: #000;
      padding: 14px 32px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(0,255,255,0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .blog-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BlogPageComponent implements OnInit {
    private http = inject(HttpClient);
    apiUrl = environment.apiUrl;

    posts = signal<any[]>([]);
    loading = signal(false);
    page = 1;
    hasMore = false;

    ngOnInit() {
        this.loadPosts();
    }

    loadPosts() {
        this.loading.set(true);
        this.http.get<any>(`${this.apiUrl}/blog/posts?status=published&page=${this.page}&limit=9`).subscribe({
            next: (data) => {
                if (this.page === 1) {
                    this.posts.set(data.posts);
                } else {
                    this.posts.update(p => [...p, ...data.posts]);
                }
                this.hasMore = data.pagination.page < data.pagination.pages;
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load posts', err);
                this.loading.set(false);
            }
        });
    }

    loadMore() {
        this.page++;
        this.loadPosts();
    }
}
