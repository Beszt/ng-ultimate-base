import { Injectable, computed, signal, type Signal, type WritableSignal } from '@angular/core';
import { defer, type Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  readonly isVisible: Signal<boolean>;
  readonly message: Signal<string | null>;

  private readonly activeCountSignal: WritableSignal<number>;
  private readonly messageSignal: WritableSignal<string | null>;

  constructor() {
    this.activeCountSignal = signal(0);
    this.messageSignal = signal<string | null>(null);

    this.isVisible = computed(() => this.activeCountSignal() > 0);
    this.message = this.messageSignal.asReadonly();
  }

  show(message?: string): void {
    this.activeCountSignal.update((value) => value + 1);

    if (message) {
      this.messageSignal.set(message);
    }
  }

  hide(): void {
    this.activeCountSignal.update((value) => (value > 0 ? value - 1 : 0));

    if (this.activeCountSignal() === 0) {
      this.messageSignal.set(null);
    }
  }

  trackObservable<T>(source: Observable<T>, message?: string): Observable<T> {
    return defer(() => {
      this.show(message);
      return source.pipe(finalize(() => this.hide()));
    });
  }

  trackPromise<T>(promise: Promise<T>, message?: string): Promise<T> {
    this.show(message);

    return promise.finally(() => this.hide());
  }
}
