import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { APP_CONFIG } from '../../../core/config/app-config.token';

@Component({
  selector: 'app-simple-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './simple-layout.component.html',
  styleUrls: ['./simple-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleLayoutComponent {
  protected readonly appConfig = inject(APP_CONFIG);
}
