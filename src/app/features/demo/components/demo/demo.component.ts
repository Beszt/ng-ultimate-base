import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, effect, inject, Injector } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DemoStore } from '../../state/demo.store';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent implements OnInit {
  readonly store = inject(DemoStore);
  private readonly injector = inject(Injector);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.initEffects();
    this.store.load(5);
  }

  onLoadMore(): void {
    this.store.load(10);
  }

  private initEffects(): void {
    effect(
      () => {
        const tick = this.store.loadSuccessTick();
        if (tick > 1) {
          this.toast.showSuccess('DEMO.loadedNposts', { count: this.store.posts().length });
        }
      },
      { injector: this.injector },
    );
  }
}
