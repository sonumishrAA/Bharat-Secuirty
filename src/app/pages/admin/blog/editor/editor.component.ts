import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-blog-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <a routerLink="/admin/blog" class="text-gray-400 hover:text-white text-sm mb-2 inline-block">← Back to Blog</a>
          <h1 class="text-2xl font-bold">{{ isNew ? 'New Post' : 'Edit Post' }}</h1>
        </div>
        <div class="flex gap-3">
          <button (click)="saveDraft()" class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
            Save Draft
          </button>
          <button (click)="publish()" class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition">
            {{ post?.isPublished ? 'Update' : 'Publish' }}
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="grid grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="col-span-2 space-y-6">
          <!-- Title -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-6">
            <input type="text" formControlName="title" placeholder="Post title..." 
              class="w-full bg-transparent text-2xl font-bold outline-none border-none placeholder:text-gray-600">
          </div>

          <!-- Slug -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-1">URL Slug</label>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 text-sm">/blog/</span>
              <input type="text" formControlName="slug" 
                class="flex-1 bg-gray-800 border border-white/10 rounded px-3 py-1 text-sm">
              <button type="button" (click)="generateSlug()" class="text-cyan-400 text-sm hover:text-cyan-300">Generate</button>
            </div>
          </div>

          <!-- Excerpt -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">Excerpt</label>
            <textarea formControlName="excerpt" rows="3" placeholder="Brief summary of the post..."
              class="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-sm resize-none"></textarea>
          </div>

          <!-- Content -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">Content (Markdown supported)</label>
            <textarea formControlName="content" rows="20" placeholder="Write your blog post content here..."
              class="w-full bg-gray-800 border border-white/10 rounded-lg p-4 font-mono text-sm resize-none"></textarea>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">Cover Image</label>
            @if (coverImagePreview || post?.coverImageUrl) {
            <div class="relative mb-3">
              <img [src]="coverImagePreview || (apiUrl + post?.coverImageUrl)" class="w-full aspect-video object-cover rounded-lg">
              <button type="button" (click)="removeCoverImage()" 
                class="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full hover:bg-red-500 transition">×</button>
            </div>
            }
            <input type="file" #coverInput (change)="onCoverImageSelect($event)" accept="image/*" class="hidden">
            <button type="button" (click)="coverInput.click()" 
              class="w-full bg-gray-800 border border-white/10 rounded-lg p-3 text-sm text-center hover:bg-gray-700 transition">
              {{ (coverImagePreview || post?.coverImageUrl) ? 'Change Image' : 'Upload Cover Image' }}
            </button>
          </div>

          <!-- Status -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">Status</label>
            <select formControlName="status" class="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <!-- Categories -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">Categories</label>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              @for (cat of categories(); track cat.id) {
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" [checked]="selectedCategories.includes(cat.id)" 
                  (change)="toggleCategory(cat.id)"
                  class="bg-gray-800 border-white/10 rounded">
                {{ cat.name }}
              </label>
              }
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">Tags (comma separated)</label>
            <input type="text" [(ngModel)]="tagsInput" [ngModelOptions]="{standalone: true}"
              placeholder="security, web, tips"
              class="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
          </div>

          <!-- SEO -->
          <div class="bg-gray-900/50 border border-white/10 rounded-xl p-4">
            <label class="text-xs text-gray-500 block mb-2">SEO Settings</label>
            <div class="space-y-3">
              <input type="text" formControlName="metaTitle" placeholder="Meta Title"
                class="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <textarea formControlName="metaDescription" rows="3" placeholder="Meta Description"
                class="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"></textarea>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class BlogEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  apiUrl = environment.apiUrl;

  isNew = true;
  postId: number | null = null;
  post: any = null;

  categories = signal<any[]>([]);
  selectedCategories: number[] = [];
  tagsInput = '';

  coverImage: File | null = null;
  coverImagePreview: string | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    slug: [''],
    excerpt: [''],
    content: ['', Validators.required],
    status: ['draft'],
    metaTitle: [''],
    metaDescription: ['']
  });

  ngOnInit() {
    this.loadCategories();

    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isNew = false;
        this.postId = parseInt(params['id']);
        this.loadPost();
      }
    });
  }

  loadCategories() {
    this.http.get<any[]>(`${this.apiUrl}/blog/categories`).subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadPost() {
    this.http.get<any>(`${this.apiUrl}/blog/posts/${this.postId}`).subscribe({
      next: (post) => {
        this.post = post;
        this.form.patchValue({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          status: post.status,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription
        });
        this.selectedCategories = post.categories?.map((c: any) => c.id) || [];
        this.tagsInput = post.tags?.map((t: any) => t.name).join(', ') || '';
      },
      error: (err) => console.error('Failed to load post', err)
    });
  }

  generateSlug() {
    const title = this.form.get('title')?.value || '';
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    this.form.patchValue({ slug });
  }

  onCoverImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.coverImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeCoverImage() {
    this.coverImage = null;
    this.coverImagePreview = null;
  }

  toggleCategory(id: number) {
    const index = this.selectedCategories.indexOf(id);
    if (index === -1) {
      this.selectedCategories.push(id);
    } else {
      this.selectedCategories.splice(index, 1);
    }
  }

  saveDraft() {
    this.form.patchValue({ status: 'draft' });
    this.save();
  }

  publish() {
    this.form.patchValue({ status: 'published' });
    this.save();
  }

  save() {
    if (!this.form.valid) {
      alert('Please fill in required fields');
      return;
    }

    const formData = new FormData();
    const values = this.form.value;

    Object.keys(values).forEach(key => {
      if ((values as any)[key]) {
        formData.append(key, (values as any)[key]);
      }
    });

    if (this.coverImage) {
      formData.append('coverImage', this.coverImage);
    }

    // Tags
    if (this.tagsInput) {
      const tags = this.tagsInput.split(',').map(t => t.trim()).filter(t => t);
      formData.append('tags', JSON.stringify(tags));
    }

    // Categories
    if (this.selectedCategories.length > 0) {
      formData.append('categoryIds', JSON.stringify(this.selectedCategories));
    }

    const request = this.isNew
      ? this.http.post(`${this.apiUrl}/blog/posts`, formData)
      : this.http.put(`${this.apiUrl}/blog/posts/${this.postId}`, formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/blog']);
      },
      error: (err) => console.error('Save failed', err)
    });
  }
}
