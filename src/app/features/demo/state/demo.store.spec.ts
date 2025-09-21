import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DemoStore } from './demo.store';
import { DemoApiService } from '../services/demo-api.service';
import type { DemoPost } from '../models/demo-post.model';

type DemoStoreContract = {
  posts: () => DemoPost[];
  loading: () => boolean;
  loadSuccessTick: () => number;
  loadPosts: (limit: number) => void;
};

describe('DemoStore', () => {
  let store: DemoStoreContract;
  let api: jasmine.SpyObj<DemoApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<DemoApiService>('DemoApiService', ['fetchPosts']);

    TestBed.configureTestingModule({
      providers: [DemoStore, { provide: DemoApiService, useValue: api }],
    });

    store = TestBed.runInInjectionContext(() => inject(DemoStore));
  });

  it('loads posts and updates the state flags', () => {
    const posts: DemoPost[] = [
      { id: 1, userId: 1, title: 'One', body: 'First' },
      { id: 2, userId: 1, title: 'Two', body: 'Second' },
    ];

    api.fetchPosts.and.callFake((limit: number) => {
      expect(limit).toBe(5);
      expect(store.loading()).toBeTrue();
      return of(posts);
    });

    store.loadPosts(5);

    expect(api.fetchPosts.calls.mostRecent().args).toEqual([5]);
    expect(store.posts()).toEqual(posts);
    expect(store.loading()).toBeFalse();
    expect(store.loadSuccessTick()).toBe(1);
  });

  it('increments the success tick on consecutive loads', () => {
    api.fetchPosts.and.returnValue(of([{ id: 1, userId: 1, title: 'One', body: 'Body' }]));

    store.loadPosts(3);
    store.loadPosts(6);

    expect(api.fetchPosts.calls.count()).toBe(2);
    expect(store.loadSuccessTick()).toBe(2);
  });

  it('clears posts but keeps the success tick unchanged when the API errors', () => {
    const posts: DemoPost[] = [{ id: 1, userId: 1, title: 'One', body: 'Body' }];

    api.fetchPosts.and.returnValue(of(posts));
    store.loadPosts(2);

    expect(store.posts()).toEqual(posts);
    expect(store.loadSuccessTick()).toBe(1);

    api.fetchPosts.and.returnValue(throwError(() => new Error('failed')));
    store.loadPosts(2);

    expect(store.posts()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.loadSuccessTick()).toBe(1);
  });
});
