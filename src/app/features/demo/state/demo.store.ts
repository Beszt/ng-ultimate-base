import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import type { DemoPost } from '../models/demo-post.model';
import { DemoApiService } from '../services/demo-api.service';

type DemoState = {
  posts: DemoPost[];
  loading: boolean;
  loadSuccessTick: number;
};

export const DemoStore = signalStore(
  { providedIn: 'root' },

  withState<DemoState>({
    posts: [],
    loading: false,
    loadSuccessTick: 0,
  }),

  withMethods((store) => {
    const api = inject(DemoApiService);

    const load = rxMethod<number>((limit$) =>
      limit$.pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((limit) =>
          api.fetchPosts(limit).pipe(
            tap((data) =>
              patchState(store, {
                posts: data,
                loadSuccessTick: store.loadSuccessTick() + 1,
              }),
            ),
            catchError(() => {
              patchState(store, { posts: [] });
              return EMPTY;
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
      ),
    );

    return { load };
  }),
);
