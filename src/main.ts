import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideToastr } from 'ngx-toastr';

import { ThemeService } from './app/core/services/theme.service';
import { LanguageService } from './app/core/services/language.service';
import { AppComponent } from './app/app.component';
import { routes } from './routes';
import { httpErrorInterceptor } from './app/core/interceptors/http-error.interceptor';
import { ConfigService } from './app/core/services/config.service';

function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideAnimations(),
    provideToastr(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    provideAppInitializer(() => inject(ConfigService).load()),
    provideAppInitializer(() => inject(ThemeService).init()),
    provideAppInitializer(() => inject(LanguageService).init()),
  ],
}).catch((err) => console.error(err));
