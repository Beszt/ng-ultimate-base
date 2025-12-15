import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import type { DemoProduct } from '../models/demo-product.model';
import { DemoApiService } from '../services/demo-api.service';
import { SpinnerService } from '../../../core/services/spinner.service';

type DemoState = {
  products: DemoProduct[];
  loading: boolean;
  loadSuccessTick: number;
};

type LoadProductsParams = {
  count: number;
  append?: boolean;
};

export const DemoStore = signalStore(
  { providedIn: 'root' },

  withState<DemoState>({
    products: [],
    loading: false,
    loadSuccessTick: 0,
  }),

  withMethods((store) => {
    const api = inject(DemoApiService);
    const spinner = inject(SpinnerService);

    const loadRandomProducts = rxMethod<LoadProductsParams>((params$) =>
      params$.pipe(
        tap(() => {
          spinner.show('DEMO.loading');
          patchState(store, { loading: true });
        }),
        switchMap(({ count, append = false }) =>
          api.fetchRandomProducts(count).pipe(
            tap((data) =>
              patchState(store, {
                products: append ? [...data, ...store.products()] : data,
                loadSuccessTick: store.loadSuccessTick() + 1,
              }),
            ),
            catchError(() => {
              if (!append) {
                patchState(store, { products: [] });
              }
              return EMPTY;
            }),
            finalize(() => {
              patchState(store, { loading: false });
              spinner.hide();
            }),
          ),
        ),
      ),
    );

    return { loadRandomProducts };
  }),
);
