import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, Injector, effect, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { StorageStore } from '../../../../core/store/storage.store';

@Component({
  selector: 'app-storage-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './storage-demo.component.html',
  styleUrls: ['./storage-demo.component.scss'],
})
export class StorageDemoComponent implements OnInit {
  readonly localDraft = signal('');
  readonly sessionDraft = signal('');

  readonly store = inject(StorageStore);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    this.store.hydrate();
    this.syncDraftsWithStore();
  }

  onLocalInput(value: string): void {
    this.localDraft.set(value);
  }

  onSessionInput(value: string): void {
    this.sessionDraft.set(value);
  }

  saveLocal(): void {
    this.store.saveLocal(this.localDraft());
  }

  saveSession(): void {
    this.store.saveSession(this.sessionDraft());
  }

  clearLocal(): void {
    this.store.clearLocal();
  }

  clearSession(): void {
    this.store.clearSession();
  }

  private syncDraftsWithStore(): void {
    effect(
      () => {
        const value = this.store.localValue();
        this.localDraft.set(value ?? '');
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const value = this.store.sessionValue();
        this.sessionDraft.set(value ?? '');
      },
      { injector: this.injector },
    );
  }
}
