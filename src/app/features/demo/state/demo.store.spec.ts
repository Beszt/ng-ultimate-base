import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DemoStore } from './demo.store';
import { DemoApiService } from '../services/demo-api.service';
import type { DemoProduct } from '../models/demo-product.model';

type DemoStoreContract = {
  products: () => DemoProduct[];
  loading: () => boolean;
  loadSuccessTick: () => number;
  loadRandomProducts: (params: { count: number; append?: boolean }) => void;
};

describe('DemoStore', () => {
  let store: DemoStoreContract;
  let api: jasmine.SpyObj<DemoApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<DemoApiService>('DemoApiService', ['fetchRandomProducts']);

    TestBed.configureTestingModule({
      providers: [DemoStore, { provide: DemoApiService, useValue: api }],
    });

    store = TestBed.runInInjectionContext(() => inject(DemoStore));
  });

  it('loads products and updates the state flags', () => {
    const products: DemoProduct[] = [
      {
        barcode: 1,
        name: 'Alpha',
        description: 'First',
        weight: 100,
        energy: 10,
        protein: 1,
        fat: 1,
        carbohydrates: 1,
      },
      {
        barcode: 2,
        name: 'Beta',
        description: 'Second',
        weight: 200,
        energy: 20,
        protein: 2,
        fat: 2,
        carbohydrates: 2,
      },
    ];

    api.fetchRandomProducts.and.callFake((count: number) => {
      expect(count).toBe(3);
      expect(store.loading()).toBeTrue();
      return of(products);
    });

    store.loadRandomProducts({ count: 3 });

    expect(api.fetchRandomProducts.calls.mostRecent().args).toEqual([3]);
    expect(store.products()).toEqual(products);
    expect(store.loading()).toBeFalse();
    expect(store.loadSuccessTick()).toBe(1);
  });

  it('increments the success tick on consecutive loads', () => {
    const firstBatch: DemoProduct[] = [
      {
        barcode: 1,
        name: 'Alpha',
        description: 'One',
        weight: 100,
        energy: 10,
        protein: 1,
        fat: 1,
        carbohydrates: 1,
      },
    ];
    const secondBatch: DemoProduct[] = [
      {
        barcode: 2,
        name: 'Beta',
        description: 'Two',
        weight: 200,
        energy: 20,
        protein: 2,
        fat: 2,
        carbohydrates: 2,
      },
    ];

    api.fetchRandomProducts.and.returnValues(of(firstBatch), of(secondBatch));

    store.loadRandomProducts({ count: 2 });
    store.loadRandomProducts({ count: 1, append: true });

    expect(api.fetchRandomProducts.calls.count()).toBe(2);
    expect(store.products()).toEqual([...secondBatch, ...firstBatch]);
    expect(store.loadSuccessTick()).toBe(2);
  });

  it('preserves already fetched products when an append fails', () => {
    const products: DemoProduct[] = [
      {
        barcode: 1,
        name: 'Alpha',
        description: 'First',
        weight: 100,
        energy: 10,
        protein: 1,
        fat: 1,
        carbohydrates: 1,
      },
    ];

    api.fetchRandomProducts.and.returnValue(of(products));
    store.loadRandomProducts({ count: 1 });

    expect(store.products()).toEqual(products);
    expect(store.loadSuccessTick()).toBe(1);

    api.fetchRandomProducts.and.returnValue(throwError(() => new Error('failed')));
    store.loadRandomProducts({ count: 1, append: true });

    expect(store.products()).toEqual(products);
    expect(store.loading()).toBeFalse();
    expect(store.loadSuccessTick()).toBe(1);
  });
});
