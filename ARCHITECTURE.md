# ARCHITECTURE.md

## 1. Overview

This repository (**ng-ultimate-base**) is a template Angular project that provides a ready-to-use foundation for new applications.
It contains a preconfigured architecture, opinionated folder structure, and tooling (linting, formatting, CI/CD, VS Code setup).

Goal: reduce project setup time -- clone, install, and start building features.

---

## 2. Folder Structure

```text
src/
  app/
    core/              # cross-cutting concerns (services, interceptors, config)
      interceptors/
      constants/
      models/
      services/
      store/
    shared/            # reusable building blocks
      components/      # e.g. common-button, common-card
      directives/
      pipes/
      models/
    features/          # domain-specific areas
      demo/            # example feature
    app.component.*    # root bootstrap component
```

Other important folders:

- `src/assets/i18n/` -- language JSON files (`en.json`, `pl.json`, etc.)
- `src/environments/` -- environment configs (`environment.ts`, `environment.prod.ts`)
- `dist/` -- build output (ignored in Git)

---

## 3. Core Layer

Contains functionality shared across the whole app:

- Configuration and bootstrap providers
- `ThemeService` for light/dark theme switching via CSS variables
- `StorageService` for local and session storage with fallbacks
- `LanguageService` for ngx-translate initialization
- `ToastService` for translated toast notifications

---

## 4. Shared Layer

Reusable utilities and UI elements:

- Components -- small building blocks (`common-button`, `common-card`)
- Directives -- cross-cutting DOM logic (for example an autofocus directive)
- Pipes -- formatters (dates, currency, transforms)
- Models -- shared TypeScript interfaces and DTOs

---

## 5. Feature Layer

Each feature lives in its own folder:

- Contains components, feature-specific Signal Store, services, and models
- Designed to be self-contained and lazy load friendly

The template includes a `demo/` feature that demonstrates:

- Fetching data from a public API
- Managing state with a Signal Store
- Saving to local and session storage
- Reacting to theme changes and showing translated toasts

---

## 6. Internationalization (i18n)

- Language files live under `src/assets/i18n/{lang}.json`
- Auto-detects a language via `navigator.language`
- English is the fallback locale
- Integrated with Angular pipes for use inside templates

---

## 7. Styling and UI

- Angular Material provides the component library and design tokens
- Tailwind CSS supplies utility-first styling
- Light and dark modes are powered by CSS variables (`--var`) and `ThemeService`

---

## 8. Testing

- Unit tests use Karma and Jasmine by default (swap to Jest or Vitest if preferred)
- Template includes examples for a component and a service test

---

## 9. Configuration

- Environments: `dev` and `prod` via Angular CLI file replacements
- ESLint and Prettier aligned for linting and formatting
- Husky and lint-staged enforce checks before each commit
- `.vscode` folder ships workspace settings, tasks, launch config, and recommended extensions

---

## 10. CI/CD

### Continuous Integration

- Trigger: pull request to `develop`
- Runs lint, unit tests, and production build
- Uploads build artifact for review

### Continuous Delivery / Release

- Trigger: manual (`workflow_dispatch`) with version input `X.Y.Z`
- Creates release branch `release/X.Y.Z`
- Tags commit `vX.Y.Z`
- Builds production bundle
- Publishes GitHub Release with the artifact `.zip`

---

## 11. Contribution Workflow

- Development happens on the `develop` branch
- Create feature branches from `develop` and open PRs back into `develop`
- Run the release workflow to cut a `release/*` branch and publish a tag
- Protect `develop` and `release/*` with PR reviews and required status checks

---

## 12. How to Extend

- Add new features under `src/app/features/`
- Add cross-cutting services in `core/services/`
- Expand reusable UI under `shared/components/`
- Extend i18n by adding `{lang}.json` files in `assets/i18n/`
- Extend CI/CD pipelines if you deploy to hosting platforms such as Vercel, Netlify, or Firebase
