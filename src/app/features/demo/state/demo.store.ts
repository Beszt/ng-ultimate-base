import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import type { DemoPost } from '../models/demo-post.model';
import { DemoApiService } from '../services/demo-api.service';

type DemoState = {
  posts: DemoPost[];
  loading: boolean;
};

export const DemoStore = signalStore(
  { providedIn: 'root' },

  withState<DemoState>({
    posts: [],
    loading: false,
  }),

  withMethods((store) => {
    const api = inject(DemoApiService);

    function load(limit = 5): void {
      patchState(store, { loading: true });

      api
        .fetchPosts(limit)
        .pipe(finalize(() => patchState(store, { loading: false })))
        .subscribe({
          next: (data) => patchState(store, { posts: data }),
          error: () => {
            patchState(store, { posts: [] });
          },
        });
    }

    return { load };
  }),

  withHooks({
    onInit(store) {
      store.load();
    },
  }),
);
