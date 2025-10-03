# ng-ultimate-base

A template Angular 20 project with Material UI, Tailwind CSS, Signals, i18n, ESLint, Prettier, Husky, and CI/CD. Designed to kickstart new apps with a clean architecture and ready-to-go developer experience.

---

## Highlights

- Angular 20 with standalone APIs and Angular Material
- Tailwind CSS with Prettier powered class sorting
- Signals and Signal Store pattern for state management
- ngx-translate integration (assets/i18n + translate pipe)
- Toast service with translation support
- Local/session storage service with safe fallbacks
- Runtime configuration loaded from `/assets/settings.json`
- ESLint, Prettier, Husky pre-commit checks
- Ready-to-use VS Code setup (`.vscode/`)
- CI/CD workflows for PR validation, releases, and Docker pushes

---

## Getting Started

1. Run `npm ci`.
2. Start the dev server with `npm start` and open `http://localhost:4200`.
3. Walk through [CHECKLIST.md](./CHECKLIST.md) to align tooling, runtime configuration, and CI.
4. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for the folder structure and conventions.

---

## Core Building Blocks

### Services

- `ConfigService`    Loads `/assets/settings.json` during bootstrap through an `APP_INITIALIZER`, exposes the values via the `APP_CONFIG` injection token, and provides helpers like `storageKey('suffix')` that respect the configured namespace.

- `ThemeService`    Provides light/dark themes, system preference detection, and persists the last choice. It is initialized through `provideAppInitializer` in `main.ts`, so the theme is ready before the first paint.

  ```ts
  // Toggle or force a theme inside any component
  this.themeService.toggleTheme();
  this.themeService.setTheme('dark');
  this.themeService.useSystemPreference();
  ```

- `StorageService`    Wrapper around `localStorage` and `sessionStorage` with JSON serialization, graceful fallback when storage is blocked, and helpers for scoped clearing.

  ```ts
  this.storage.setLocal('auth-user', user);
  const profile = this.storage.getLocal<User>('auth-user');
  this.storage.clearSession();
  ```

- `LanguageService`    Bootstraps the active language based on the browser locale and keeps `document.documentElement.lang` in sync. Extend translations under `src/assets/i18n`.

- `ToastService`    Simplifies translated toast notifications. Provide translation keys and optional interpolation params.

  ```ts
  this.toast.showSuccess('demo.fetch.success', { count });
  this.toast.showError('demo.fetch.error');
  ```

### Theming

- Theme styles live in `src/styles/themes/light.scss` and `dark.scss`.    Extend design tokens or CSS variables there. Both files target `[data-theme="<name>"]` so additions work for light and dark variants.
- Global base styles are gathered in `src/styles/styles.scss`. Tailwind utilities are available through `tailwind.css`.
- When adding a new theme name, update `ThemeService.availableThemes` and create a matching stylesheet.

### Base Core

- Application level providers, interceptors, and config live under `src/app/core`.
- Shared UI building blocks are under `src/app/shared` and should stay framework agnostic (no feature-specific logic).
- Feature modules sit in `src/app/features/<feature-name>` and can be lazy loaded or standalone. The `demo` feature shows API fetching, toast usage, theme reactions, and storage helpers working together.

---

## Runtime Configuration

Runtime settings are loaded at startup from `/assets/settings.json` (copied from `src/assets/settings.json` during build). `ConfigService` merges the JSON with sane defaults and normalizes values such as the storage namespace.

```json
{
  "app": {
    "name": "Demo Playground",
    "storageNamespace": "demo"
  }
}
```

- Access configuration anywhere by injecting the `APP_CONFIG` token or the `ConfigService`.
- Use `configService.storageKey('suffix')` to build namespaced keys that match the runtime namespace.
- Override settings in containerized deployments by providing environment variables (see the Docker section) or mount a custom `settings.json`.

---

## Docker Deployment

The repository ships a multi-stage `Dockerfile` (`node:20-alpine` -> `nginx:alpine`) that builds the Angular app and serves it through Nginx. At container start the entrypoint script rewrites `/usr/share/nginx/html/assets/settings.json` from environment variables so you can *build once, run anywhere*.

### Runtime environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `APP_NAME` | `Demo Playground` | Display name exposed via `ConfigService.appConfig.name`. |
| `APP_STORAGE_NAMESPACE` | `demo` | Prefix used for storage keys. Normalized (trimmed & trailing dot removed). |
| `CONFIG_PATH` | `/usr/share/nginx/html/assets/settings.json` | Override only if the app is hosted from a different root. |

### Build and run locally

```bash
# Build image
DOCKER_BUILDKIT=1 docker build -t your-org/ng-ultimate-base:local .

# Run container with custom runtime config
docker run --rm -p 8080:80 \
  -e APP_NAME="My Awesome App" \
  -e APP_STORAGE_NAMESPACE="myapp" \
  your-org/ng-ultimate-base:local
```

### Docker Compose snippet

```yaml
services:
  ng-ultimate-base:
    image: your-org/ng-ultimate-base:latest
    ports:
      - "8080:80"
    environment:
      APP_NAME: "Compose Demo"
      APP_STORAGE_NAMESPACE: "compose"
```

### Release workflow & Docker Hub

The `release` GitHub Action can optionally build and push the Docker image after the Angular build. Toggle the *Build and push Docker image* prompt (`publish_docker`) when you dispatch the workflow. Configure the following repository secrets before triggering a release if you plan to publish the container:

- `DOCKERHUB_USERNAME` – Docker Hub account used for pushes.
- `DOCKERHUB_TOKEN` – Access token or password for that account.
- `DOCKERHUB_REPOSITORY` – Target repository in `user/image` format (e.g. `acme/ng-ultimate-base`).

Tags published when enabled:

- `user/image:X.Y.Z` (from the workflow input)
- `user/image:latest`

If the secrets are missing **or** the Docker option is left unchecked the workflow skips container publishing and still produces the ZIP artifact and GitHub Release.

---

## What's Next

- Replace the demo feature with your domain feature set and keep the same folder conventions.
- Tailor `src/assets/settings.json` (or runtime env vars) with your product name, storage namespace, and other config values.
- Harden CI by adding test coverage thresholds or integration tests that reflect your stack.
- Extend the release workflow if you need to publish to additional targets (e.g. Firebase Hosting, Vercel).
- Add more languages by dropping new JSON files into `assets/i18n` and extending the language selector UI.

---

## Pro Tips

- Keep shared services stateless where possible; prefer Signal Stores inside features for business data.
- Use `ConfigService.storageKey()` for any persisted state so runtime namespaces stay in sync.
- Call `ThemeService.toggleTheme()` from UI controls instead of manipulating classes manually.
- Group Tailwind utility classes logically; Prettier with the Tailwind plugin keeps them sorted for you.
- Treat `develop` as the integration branch and protect it with required status checks provided by the existing GitHub Actions workflows.
- For quick pimp-up code you can use `npx prettier --write .` and `ng lint --fix` in root folder to automatic format code and fix minor eslint problems in all files.

---

## Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - folder layout, layers, and extension guidance.
- [CHECKLIST.md](./CHECKLIST.md) - one-time setup steps after cloning.
- `.github/workflows/` - CI/CD definitions for pull requests, releases, and Docker pushes.
