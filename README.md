# ng-ultimate-base

A template Angular 20 project with Material UI, Tailwind CSS, Signals, i18n, ESLint, Prettier, Husky, and CI/CD. Designed to kickstart new apps with a clean architecture and ready-to-go developer experience.

---

## Highlights

- Angular 20 with standalone APIs and Angular Material
- Tailwind CSS with Prettier powered class sorting
- Signals and Signal Store pattern for state management
- ngx-translate integration (assets/i18n + translate pipe)
- Toast service with translation support
- Local and session storage service with safe fallbacks
- Configured dev and prod environments
- ESLint, Prettier, Husky pre-commit checks
- Ready-to-use VS Code setup (`.vscode/`)
- CI/CD workflows for PR validation and tagged releases

---

## Getting Started

1. Run `npm ci`.
2. Start the dev server with `npm start` and open `http://localhost:4200`.
3. Walk through [CHECKLIST.md](./CHECKLIST.md) to align tooling, environments, and CI.
4. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for the folder structure and conventions.

---

## Core Building Blocks

### Services

- `ThemeService`  
  Provides light/dark themes, system preference detection, and persists the last choice. It is initialized through `provideAppInitializer` in `main.ts`, so the theme is ready before the first paint.

  ```ts
  // Toggle or force a theme inside any component
  this.themeService.toggleTheme();
  this.themeService.setTheme('dark');
  this.themeService.useSystemPreference();
  ```

- `StorageService`  
  Wrapper around `localStorage` and `sessionStorage` with JSON serialization, graceful fallback when storage is blocked, and helpers for scoped clearing.

  ```ts
  this.storage.setLocal('auth-user', user);
  const profile = this.storage.getLocal<User>('auth-user');
  this.storage.clearSession();
  ```

- `LanguageService`  
  Bootstraps the active language based on the browser locale and keeps `document.documentElement.lang` in sync. Extend translations under `src/assets/i18n`.

- `ToastService`  
  Simplifies translated toast notifications. Provide translation keys and optional interpolation params.

  ```ts
  this.toast.showSuccess('demo.fetch.success', { count });
  this.toast.showError('demo.fetch.error');
  ```

### Theming

- Theme styles live in `src/styles/themes/light.scss` and `dark.scss`.  
  Extend design tokens or CSS variables there. Both files target `[data-theme="<name>"]` so additions work for light and dark variants.
- Global base styles are gathered in `src/styles/styles.scss`. Tailwind utilities are available through `tailwind.css`.
- When adding a new theme name, update `ThemeService.availableThemes` and create a matching stylesheet.

### Base Core

- Application level providers, interceptors, and config live under `src/app/core`.
- Shared UI building blocks are under `src/app/shared` and should stay framework agnostic (no feature-specific logic).
- Feature modules sit in `src/app/features/<feature-name>` and can be lazy loaded or standalone. The `demo` feature shows API fetching, toast usage, theme reactions, and storage helpers working together.

---

## What's Next

- Replace the demo feature with your domain feature set and keep the same folder conventions.
- Define environment specific values in `src/environments` (API URLs, feature flags).
- Harden CI by adding test coverage thresholds or integration tests that reflect your stack.
- Configure deployment tasks in the release workflow (deploy to hosting of choice, publish npm package, etc.).
- Add more languages by dropping new JSON files into `assets/i18n` and extending the language selector UI.

---

## Pro Tips

- Keep shared services stateless where possible; prefer Signal Stores inside features for business data.
- Use `StorageService` for any persisted state so that server-side rendering or private browsing continues to work.
- Call `ThemeService.toggleTheme()` from UI controls instead of manipulating classes manually.
- Group Tailwind utility classes logically; Prettier with the Tailwind plugin keeps them sorted for you.
- Treat `develop` as the integration branch and protect it with required status checks provided by the existing GitHub Actions workflows.
- For quick pimp-up code you can use `npx prettier --write .` and `ng lint --fix` in root folder to automatic format code and fix minor eslint problems in all files

---

## Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - folder layout, layers, and extension guidance.
- [CHECKLIST.md](./CHECKLIST.md) - one-time setup steps after cloning.
- `.github/workflows/` - CI/CD definitions for pull requests and releases.
