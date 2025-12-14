<p align="center">
  <img src="./logo.png" alt="ng-ultimate-base logo" width="160">
</p>

<h1 align="center">⚡ ng-ultimate-base ⚡</h1>

<p align="center">
  <a href="https://github.com/Beszt/ng-ultimate-base/actions/workflows/ci.yml">
    <img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/Beszt/ng-ultimate-base/ci.yml?label=CI%20Build&logo=githubactions&logoColor=white&color=22c55e">
  </a>
  <a href="https://github.com/Beszt/ng-ultimate-base/actions/workflows/release.yml">
    <img alt="Release" src="https://img.shields.io/github/actions/workflow/status/Beszt/ng-ultimate-base/release.yml?label=Release&logo=semanticrelease&logoColor=white&color=0ea5e9">
  </a>
  <a href="https://github.com/Beszt/ng-ultimate-base/deployments">
    <img alt="Deploys" src="https://img.shields.io/github/deployments/Beszt/ng-ultimate-base/production?label=Deploys&logo=vercel&logoColor=white&color=8b5cf6">
  </a>
  <img alt="Angular" src="https://img.shields.io/badge/Angular-20-EA1E63?logo=angular&logoColor=white">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white">
  <img alt="License" src="https://img.shields.io/github/license/Beszt/ng-ultimate-base?color=f97316&logo=open-source-initiative&logoColor=white">
</p>

> A template Angular 20 project with Material UI, Tailwind CSS, Signals, i18n, ESLint, Prettier, Husky, and CI/CD.  
> Designed to kickstart new apps with a clean architecture and ready-to-go developer experience.

---

## ✨ Highlights

🚀 **Angular 20** + standalone APIs + Angular Material  
🎨 **Tailwind CSS** with Prettier-powered class sorting  
🧠 **Signals + Signal Store** for reactive state management  
🌐 **ngx-translate** with runtime `/assets/settings.json`  
📜 **Toast & Storage Services** with smart fallback logic  
🧰 **ESLint, Prettier, Husky** for consistent commits  
🗂️ **Ready-to-use VS Code workspace**  
🐳 **GitHub Actions & Docker** for CI/CD and release pipelines

---

## 🚀 Getting Started

1. Run `npm ci`.
2. Start the dev server with `npm start` and open `http://localhost:4200`.
3. Walk through [CHECKLIST.md](./documentation/CHECKLIST.md) to align tooling, runtime configuration, and CI.
4. Review [ARCHITECTURE.md](./documentation/ARCHITECTURE.md) for the folder structure and conventions.

---

## 🧩 Core Building Blocks

### Services

- `ConfigService` Loads `/assets/settings.json` during bootstrap through an `APP_INITIALIZER`, exposes the values via the `APP_CONFIG` injection token, and provides helpers like `storageKey('suffix')` that respect the configured namespace.

- `ThemeService` Provides light/dark themes, system preference detection, and persists the last choice. It is initialized through `provideAppInitializer` in `main.ts`, so the theme is ready before the first paint.

  ```ts
  this.themeService.toggleTheme();
  this.themeService.setTheme('dark');
  this.themeService.useSystemPreference();
  ```

- `StorageService` Wrapper around `localStorage` and `sessionStorage` with JSON serialization, graceful fallback when storage is blocked, and helpers for scoped clearing.

  ```ts
  this.storage.setLocal('auth-user', user);
  const profile = this.storage.getLocal<User>('auth-user');
  this.storage.clearSession();
  ```

- `LanguageService` Bootstraps the active language based on the browser locale and keeps `document.documentElement.lang` in sync. Extend translations under `src/assets/i18n`.

- `ToastService` Simplifies translated toast notifications. Provide translation keys and optional interpolation params.

  ```ts
  this.toast.showSuccess('demo.fetch.success', { count });
  this.toast.showError('demo.fetch.error');
  ```

- `SpinnerService` provides a global loading overlay driven by signals. Call `show()`/`hide()` directly or wrap async flows with `trackObservable`/`trackPromise` to keep UX consistent.

### Theming

- Theme styles live in `src/styles/themes/light.scss` and `dark.scss`. Extend design tokens or CSS variables there. Both files target `[data-theme="<name>"]` so additions work for light and dark variants.
- Global base styles are gathered in `src/styles/styles.scss`. Tailwind utilities are available through `tailwind.css`.
- When adding a new theme name, update `ThemeService.availableThemes` and create a matching stylesheet.

### Base Core

- Application level providers, interceptors, and config live under `src/app/core`.
- Shared UI building blocks are under `src/app/shared` and should stay framework agnostic (no feature-specific logic).
- Feature modules sit in `src/app/features/<feature-name>` and can be lazy loaded or standalone. The `demo` feature shows API fetching, toast usage, theme reactions, and storage helpers working together.

---

## ⚙️ Runtime Configuration

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

## 🐳 Docker Deployment

The repository ships a multi-stage `Dockerfile` (`node:20-alpine` -> `nginx:alpine`) that builds the Angular app and serves it through Nginx. At container start the entrypoint script rewrites `/usr/share/nginx/html/assets/settings.json` from environment variables so you can _build once, run anywhere_.

### Runtime environment variables

| Variable                | Default                                      | Description                                                                |
| ----------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `APP_NAME`              | `Demo Playground`                            | Display name exposed via `ConfigService.appConfig.name`.                   |
| `APP_STORAGE_NAMESPACE` | `demo`                                       | Prefix used for storage keys. Normalized (trimmed & trailing dot removed). |
| `CONFIG_PATH`           | `/usr/share/nginx/html/assets/settings.json` | Override only if the app is hosted from a different root.                  |

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
      - '8080:80'
    environment:
      APP_NAME: 'Compose Demo'
      APP_STORAGE_NAMESPACE: 'compose'
```

### Release workflow & Docker Hub

The `release` GitHub Action can optionally build and push the Docker image after the Angular build. Toggle the _Build and push Docker image_ prompt (`publish_docker`) when you dispatch the workflow. Configure the `Production` environment before triggering a release if you plan to publish the container:

- `DOCKERHUB_USERNAME` (environment variable) - Docker Hub account used for pushes.
- `DOCKERHUB_REPOSITORY` (environment variable) - Target repository in `user/image` format (e.g. `acme/ng-ultimate-base`).
- `DOCKERHUB_TOKEN` (environment secret) - Access token or password for that account.

Tags published when enabled:

- `user/image:X.Y.Z` (from the workflow input)
- `user/image:latest`

If the Docker option is left unchecked the workflow skips container publishing and still produces the ZIP artifact and GitHub Release. When the option is enabled the workflow requires the Docker Hub credentials (variables + token secret) and aborts the release if building/pushing the image fails.

---

## GitHub Settings & Rulesets

- Default branch: `develop`; allow only squash merges, and enable automatic deletion of head branches after merges.
- Import ruleset exports from `documentation/rulesets/Develop.json`, `documentation/rulesets/Release.json`, and `documentation/rulesets/Tag.json` via GitHub Settings to enforce branch/tag protections (Develop requires 1 approving review with resolved threads; Release/Tag block deletions and force pushes).
- Set Actions workflow permissions to **Read and write** and allow GitHub Actions to create and approve pull requests so release helpers can commit back safely.
- Create the `Production` environment with required reviewers plus variables `DOCKERHUB_USERNAME`, `DOCKERHUB_REPOSITORY` and secret `DOCKERHUB_TOKEN`; the release workflow reads them when Docker publishing is enabled.
- See `documentation/GITHUB_SETTINGS.md` for a full walkthrough of the recommended repository configuration.

---

## 🧠 What's Next

- Replace the demo feature with your domain feature set and keep the same folder conventions.
- Tailor `src/assets/settings.json` (or runtime env vars) with your product name, storage namespace, and other config values.
- Harden CI by adding test coverage thresholds or integration tests that reflect your stack.
- Extend the release workflow if you need to publish to additional targets (e.g. Firebase Hosting, Vercel).
- Add more languages by dropping new JSON files into `assets/i18n` and extending the language selector UI.

---

## 💡 Pro Tips

- Keep shared services stateless where possible; prefer Signal Stores inside features for business data.
- Use `ConfigService.storageKey()` for any persisted state so runtime namespaces stay in sync.
- Call `ThemeService.toggleTheme()` from UI controls instead of manipulating classes manually.
- Group Tailwind utility classes logically; Prettier with the Tailwind plugin keeps them sorted for you.
- Treat `develop` as the integration branch and protect it with required status checks provided by the existing GitHub Actions workflows.
- For quick pimp-up code you can use `npx prettier --write .` and `ng lint --fix` in root folder to automatic format code and fix minor eslint problems in all files.

---

## 📚 Additional Documentation

- [CHANGELOG.md](./documentation/CHANGELOG.md) - releases history.
- [ARCHITECTURE.md](./documentation/ARCHITECTURE.md) - folder layout, layers, and extension guidance.
- [CHECKLIST.md](./documentation/CHECKLIST.md) - one-time setup steps after cloning.
- [GITHUB_SETTINGS.md](./documentation/GITHUB_SETTINGS.md) - GitHub repository settings, rulesets, and environment configuration.
- `.github/workflows/` - CI/CD definitions for pull requests, releases, and Docker pushes.
