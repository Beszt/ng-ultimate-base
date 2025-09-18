import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  init(): void {
    const browser = this.translate.getBrowserLang();
    const defaultLang = browser ?? 'en';

    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
    document.documentElement.lang = defaultLang;
  }
}
