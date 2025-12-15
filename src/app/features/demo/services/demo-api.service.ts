import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DemoProduct } from '../models/demo-product.model';

const API_BASE_URL = 'https://aspnet-ultimate-base.obisoft.pl';

@Injectable({ providedIn: 'root' })
export class DemoApiService {
  private readonly http = inject(HttpClient);

  fetchRandomProducts(count: number): Observable<DemoProduct[]> {
    return this.http.get<DemoProduct[]>(`${API_BASE_URL}/products/random/${count}`);
  }
}
