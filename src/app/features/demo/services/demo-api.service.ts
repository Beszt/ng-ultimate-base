import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DemoProduct } from '../models/demo-product.model';

// Use the dev-server proxy (proxy.conf.json) to avoid CORS issues in local dev.
const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class DemoApiService {
  private readonly http = inject(HttpClient);

  fetchRandomProducts(count: number): Observable<DemoProduct[]> {
    return this.http.get<DemoProduct[]>(`${API_BASE_URL}/products/random/${count}`);
  }
}
