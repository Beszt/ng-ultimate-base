import { CommonModule } from '@angular/common';
import type { OnInit, Signal, WritableSignal } from '@angular/core';
import { Component, Injector, effect, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import type { StorageScope } from '../../../../core/models/storage-scope.model';
import { ConfigService } from '../../../../core/services/config.service';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-storage-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './storage-demo.component.html',
  styleUrls: ['./storage-demo.component.scss'],
})
export class StorageDemoComponent implements OnInit {
  readonly availability: Signal<Record<StorageScope, boolean>>;
  readonly localValue: Signal<string | null>;
  readonly sessionValue: Signal<string | null>;
  readonly lastUpdatedScope: Signal<StorageScope | null>;
  readonly lastUpdatedAt: Signal<number | null>;
  readonly localDraft: WritableSignal<string>;
  readonly sessionDraft: WritableSignal<string>;

  private readonly availabilitySignal: WritableSignal<Record<StorageScope, boolean>>;
  private readonly localValueSignal: WritableSignal<string | null>;
  private readonly sessionValueSignal: WritableSignal<string | null>;
  private readonly lastUpdatedScopeSignal: WritableSignal<StorageScope | null>;
  private readonly lastUpdatedAtSignal: WritableSignal<number | null>;

  private readonly storage: StorageService;
  private readonly injector: Injector;
  private readonly config = inject(ConfigService);
  private readonly localNoteKey = this.config.storageKey('localNote');
  private readonly sessionNoteKey = this.config.storageKey('sessionNote');

  constructor() {
    this.storage = inject(StorageService);
    this.injector = inject(Injector);

    this.availabilitySignal = signal<Record<StorageScope, boolean>>({
      local: false,
      session: false,
    });
    this.localValueSignal = signal<string | null>(null);
    this.sessionValueSignal = signal<string | null>(null);
    this.lastUpdatedScopeSignal = signal<StorageScope | null>(null);
    this.lastUpdatedAtSignal = signal<number | null>(null);

    this.localDraft = signal('');
    this.sessionDraft = signal('');

    this.availability = this.availabilitySignal.asReadonly();
    this.localValue = this.localValueSignal.asReadonly();
    this.sessionValue = this.sessionValueSignal.asReadonly();
    this.lastUpdatedScope = this.lastUpdatedScopeSignal.asReadonly();
    this.lastUpdatedAt = this.lastUpdatedAtSignal.asReadonly();
  }

  ngOnInit(): void {
    this.hydrate();
    this.syncDraftsWithStorage();
  }

  onLocalInput(value: string): void {
    this.localDraft.set(value);
  }

  onSessionInput(value: string): void {
    this.sessionDraft.set(value);
  }

  saveLocal(): void {
    this.persistValue('local', this.localDraft());
  }

  saveSession(): void {
    this.persistValue('session', this.sessionDraft());
  }

  clearLocal(): void {
    this.clearValue('local');
  }

  clearSession(): void {
    this.clearValue('session');
  }

  private hydrate(): void {
    const localAvailable = this.storage.isAvailable('local');
    const sessionAvailable = this.storage.isAvailable('session');

    this.availabilitySignal.set({ local: localAvailable, session: sessionAvailable });
    this.localValueSignal.set(
      localAvailable ? this.storage.getLocal<string>(this.localNoteKey) : null,
    );
    this.sessionValueSignal.set(
      sessionAvailable ? this.storage.getSession<string>(this.sessionNoteKey) : null,
    );
    this.lastUpdatedScopeSignal.set(null);
    this.lastUpdatedAtSignal.set(null);
  }

  private persistValue(scope: StorageScope, value: string): void {
    const key = this.resolveKey(scope);

    if (scope === 'local') {
      this.storage.setLocal(key, value);
    } else {
      this.storage.setSession(key, value);
    }

    this.setValue(scope, value);
    this.updateAvailability(scope);
    this.stamp(scope);
  }

  private clearValue(scope: StorageScope): void {
    const key = this.resolveKey(scope);

    if (scope === 'local') {
      this.storage.removeLocal(key);
    } else {
      this.storage.removeSession(key);
    }

    this.setValue(scope, null);
    this.updateAvailability(scope);
    this.stamp(scope);
  }

  private syncDraftsWithStorage(): void {
    effect(
      () => {
        const value = this.localValue();
        this.localDraft.set(value ?? '');
      },
      { injector: this.injector },
    );

    effect(
      () => {
        const value = this.sessionValue();
        this.sessionDraft.set(value ?? '');
      },
      { injector: this.injector },
    );
  }

  private setValue(scope: StorageScope, value: string | null): void {
    if (scope === 'local') {
      this.localValueSignal.set(value);
    } else {
      this.sessionValueSignal.set(value);
    }
  }

  private updateAvailability(scope: StorageScope): void {
    this.availabilitySignal.update((current) => ({
      ...current,
      [scope]: this.storage.isAvailable(scope),
    }));
  }

  private stamp(scope: StorageScope): void {
    this.lastUpdatedScopeSignal.set(scope);
    this.lastUpdatedAtSignal.set(Date.now());
  }

  private resolveKey(scope: StorageScope): string {
    return scope === 'local' ? this.localNoteKey : this.sessionNoteKey;
  }
}
