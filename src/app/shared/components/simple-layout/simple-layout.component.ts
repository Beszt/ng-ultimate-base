import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ConfigService } from '../../../core/services/config.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-simple-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './simple-layout.component.html',
  styleUrls: ['./simple-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleLayoutComponent {
  protected readonly config = inject(ConfigService);
  protected readonly themeService = inject(ThemeService);

  protected readonly appConfig = this.config.appConfig;
  protected readonly isDark = this.themeService.isDark;
  protected readonly themeLabelKey = computed(() =>
    this.themeService.theme() === 'dark' ? 'LAYOUT.themeToggle.dark' : 'LAYOUT.themeToggle.light',
  );

  protected readonly toggleAriaKey = computed(() =>
    this.themeService.theme() === 'dark'
      ? 'LAYOUT.themeToggle.switchTo.light'
      : 'LAYOUT.themeToggle.switchTo.dark',
  );

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
