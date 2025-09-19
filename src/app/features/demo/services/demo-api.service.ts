import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DemoPost } from '../models/demo-post.model';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

@Injectable({ providedIn: 'root' })
export class DemoApiService {
  private readonly http = inject(HttpClient);

  fetchPosts(limit: number): Observable<DemoPost[]> {
    const params = new HttpParams().set('_limit', limit);
    return this.http.get<DemoPost[]>(`${API_BASE_URL}/posts`, { params });
  }
}
