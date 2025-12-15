import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, effect, inject, Injector } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DemoStore } from '../../state/demo.store';
import { ToastService } from '../../../../core/services/toast.service';
import { ApiPromoCardComponent } from '../promo-card/api-promo-card.component';

@Component({
  selector: 'app-fetch-api-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule, ApiPromoCardComponent],
  templateUrl: './fetch-api-demo.component.html',
  styleUrls: ['./fetch-api-demo.component.scss'],
})
export class FetchApiDemoComponent implements OnInit {
  readonly store = inject(DemoStore);
  private readonly injector = inject(Injector);
  private readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.initEffects();
    this.store.loadRandomProducts({ count: 3 });
  }

  onLoadMore(): void {
    this.store.loadRandomProducts({ count: 1, append: true });
  }

  private initEffects(): void {
    effect(
      () => {
        const tick = this.store.loadSuccessTick();
        if (tick > 1) {
          this.toast.showSuccess('DEMO.loadedNproducts', { count: this.store.products().length });
        }
      },
      { injector: this.injector },
    );
  }
}
