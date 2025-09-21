/* eslint-disable @typescript-eslint/member-ordering */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import type { ThemeName } from '../../../../core/models/theme-name.model';
import { ThemeService } from '../../../../core/services/theme.service';

type PaletteToken = {
  token: string;
  labelKey: string;
  contrastToken: string;
};

@Component({
  selector: 'app-theme-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './theme-demo.component.html',
  styleUrls: ['./theme-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDemoComponent {
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;
  readonly isDark = this.themeService.isDark;
  readonly isSystemPreferenceActive = this.themeService.isSystemPreferenceActive;

  readonly themeLabelKey = computed(() => `DEMO.themeDemo.mode.${this.theme()}`);
  readonly systemLabelKey = computed(() =>
    this.isSystemPreferenceActive()
      ? 'DEMO.themeDemo.system.active'
      : 'DEMO.themeDemo.system.inactive',
  );

  readonly palette: ReadonlyArray<PaletteToken> = [
    {
      token: '--var-background',
      labelKey: 'DEMO.themeDemo.tokens.background',
      contrastToken: '--var-text-primary',
    },
    {
      token: '--var-surface',
      labelKey: 'DEMO.themeDemo.tokens.surface',
      contrastToken: '--var-text-primary',
    },
    {
      token: '--var-primary',
      labelKey: 'DEMO.themeDemo.tokens.primary',
      contrastToken: '--var-primary-contrast',
    },
    {
      token: '--var-accent',
      labelKey: 'DEMO.themeDemo.tokens.accent',
      contrastToken: '--var-text-primary',
    },
  ];

  setTheme(theme: ThemeName): void {
    this.themeService.setTheme(theme);
  }

  useSystemPreference(): void {
    this.themeService.useSystemPreference();
  }
}
